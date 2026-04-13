<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthenticatedSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.google.client_id' => 'google-client-id',
            'services.google.client_secret' => 'google-client-secret',
            'services.google.redirect' => '/auth/google/callback',
        ]);
    }

    public function test_google_redirect_route_redirects_to_the_provider(): void
    {
        Socialite::fake('google');

        $this->get('/auth/google/redirect')
            ->assertRedirect();
    }

    public function test_google_callback_logs_in_an_existing_user(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@jodev.es',
        ]);

        Socialite::fake('google', (new SocialiteUser())->map([
            'id' => 'google-123',
            'name' => 'JoDev Admin',
            'email' => 'admin@jodev.es',
            'avatar' => 'https://example.com/avatar.png',
        ]));

        $this->get('/auth/google/callback')
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_google_callback_rejects_unknown_accounts(): void
    {
        Socialite::fake('google', (new SocialiteUser())->map([
            'id' => 'google-404',
            'name' => 'No Autorizado',
            'email' => 'otro@jodev.es',
        ]));

        $this->get('/auth/google/callback')
            ->assertRedirect('/login?auth_error=google_account_missing');

        $this->assertGuest();
    }
}
