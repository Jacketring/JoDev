<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_the_crm_api(): void
    {
        $this->getJson('/api/dashboard')
            ->assertUnauthorized();
    }

    public function test_guest_can_call_logout_without_breaking_the_session_flow(): void
    {
        $this->postJson('/api/auth/logout')
            ->assertNoContent();
    }

    public function test_user_can_login_fetch_profile_and_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@jodev.es',
            'password' => 'JoDev2026!',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'JoDev2026!',
            'remember' => true,
        ])->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('data.email', $user->email);

        $this->postJson('/api/auth/logout')
            ->assertNoContent();

        $this->getJson('/api/auth/user')
            ->assertUnauthorized();
    }

    public function test_login_returns_validation_error_for_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'admin@jodev.es',
            'password' => 'JoDev2026!',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'admin@jodev.es',
            'password' => 'incorrecta',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
