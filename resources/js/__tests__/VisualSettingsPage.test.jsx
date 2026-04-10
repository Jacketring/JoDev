import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import VisualSettingsPage from '../pages/VisualSettingsPage';

describe('VisualSettingsPage', () => {
    it('lets the user change a visual preset and submit it', () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        render(
            <VisualSettingsPage
                settings={{
                    theme_mode: 'original',
                    navigation_density: 'balanced',
                    content_width: 'wide',
                    interface_density: 'balanced',
                    panel_style: 'glass',
                    panel_contrast: 'balanced',
                    corner_style: 'balanced',
                    shadow_depth: 'balanced',
                    accent_tone: 'sereno',
                    background_scene: 'mist',
                    motion_level: 'balanced',
                }}
                onSave={onSave}
                isSaving={false}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /Cyberpunk/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Guardar ajustes' }));

        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                theme_mode: 'cyberpunk',
            }),
        );
    });
});
