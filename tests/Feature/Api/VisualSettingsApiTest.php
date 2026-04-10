<?php

namespace Tests\Feature\Api;

use App\Support\VisualPreferences;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\ApiTestCase;

class VisualSettingsApiTest extends ApiTestCase
{
    use RefreshDatabase;

    public function test_it_returns_safe_defaults_when_the_user_has_no_preferences(): void
    {
        $this->getJson('/api/ajustes-visuales')
            ->assertOk()
            ->assertExactJson([
                'data' => VisualPreferences::defaults(),
            ]);
    }

    public function test_it_updates_and_persists_visual_settings(): void
    {
        $payload = [
            'theme_mode' => 'cyberpunk',
            'navigation_density' => 'expanded',
            'content_width' => 'focused',
            'interface_density' => 'comfortable',
            'panel_style' => 'solid',
            'panel_contrast' => 'defined',
            'corner_style' => 'refined',
            'shadow_depth' => 'defined',
            'accent_tone' => 'profundo',
            'background_scene' => 'aurora',
            'motion_level' => 'reduced',
        ];

        $this->putJson('/api/ajustes-visuales', $payload)
            ->assertOk()
            ->assertExactJson([
                'data' => $payload,
            ]);

        $this->assertSame($payload, $this->user->fresh()->visual_preferences);
    }

    public function test_it_rejects_invalid_visual_settings(): void
    {
        $this->putJson('/api/ajustes-visuales', [
            'theme_mode' => 'retro',
            'accent_tone' => 'rojo',
            'motion_level' => 'ultra',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['theme_mode', 'accent_tone', 'motion_level']);
    }
}
