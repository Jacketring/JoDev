<?php

namespace App\Support;

use Illuminate\Validation\Rule;

class VisualPreferences
{
    public const OPTIONS = [
        'theme_mode' => ['original', 'claro', 'oscuro', 'cyberpunk'],
        'navigation_density' => ['compact', 'balanced', 'expanded'],
        'content_width' => ['full', 'wide', 'focused'],
        'interface_density' => ['compact', 'balanced', 'comfortable'],
        'panel_style' => ['glass', 'solid', 'elevated'],
        'panel_contrast' => ['soft', 'balanced', 'defined'],
        'corner_style' => ['rounded', 'balanced', 'refined'],
        'shadow_depth' => ['subtle', 'balanced', 'defined'],
        'accent_tone' => ['sereno', 'oceano', 'profundo'],
        'background_scene' => ['clean', 'mist', 'aurora'],
        'motion_level' => ['reduced', 'balanced', 'expressive'],
    ];

    public static function defaults(): array
    {
        return [
            'theme_mode' => 'original',
            'navigation_density' => 'balanced',
            'content_width' => 'wide',
            'interface_density' => 'balanced',
            'panel_style' => 'glass',
            'panel_contrast' => 'balanced',
            'corner_style' => 'balanced',
            'shadow_depth' => 'balanced',
            'accent_tone' => 'sereno',
            'background_scene' => 'mist',
            'motion_level' => 'balanced',
        ];
    }

    public static function rules(): array
    {
        return collect(self::OPTIONS)
            ->mapWithKeys(fn (array $values, string $key) => [
                $key => ['sometimes', 'string', Rule::in($values)],
            ])
            ->all();
    }

    public static function normalize(?array $preferences): array
    {
        $preferences ??= [];

        return collect(self::defaults())
            ->mapWithKeys(function (string $default, string $key) use ($preferences) {
                $value = $preferences[$key] ?? $default;

                if (! in_array($value, self::OPTIONS[$key], true)) {
                    $value = $default;
                }

                return [$key => $value];
            })
            ->all();
    }
}
