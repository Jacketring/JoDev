import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ClientShell from '../components/ClientShell';

vi.mock('../services/crmApi', () => ({
    fetchDashboard: vi.fn(),
    fetchCollection: vi.fn(),
    fetchVisualSettings: vi.fn(),
    fetchRecord: vi.fn(),
    updateRecord: vi.fn(),
    updateVisualSettings: vi.fn(),
}));

const crmApi = await import('../services/crmApi');

function renderShell(initialEntry = '/dashboard') {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[initialEntry]}>
                <ClientShell
                    user={{
                        id: 2,
                        name: 'Cliente JoDev',
                        email: 'cliente@jodev.es',
                        role: 'cliente',
                        cliente_id: 12,
                        cliente: {
                            id: 12,
                            empresa: 'Cliente JoDev',
                            nombre_completo: 'Cliente JoDev',
                            estado: 'activo',
                        },
                        visual_preferences: undefined,
                    }}
                    onLogout={() => {}}
                    logoutPending={false}
                />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('ClientShell', () => {
    beforeEach(() => {
        crmApi.fetchVisualSettings.mockResolvedValue({
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
        });
        crmApi.updateVisualSettings.mockResolvedValue({
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
        });
        crmApi.fetchDashboard.mockResolvedValue({
            metricas: {
                clientes_activos: 1,
                oportunidades_abiertas: 2,
                valor_pipeline: 18000,
                tareas_pendientes: 1,
                actividades_proximas: 1,
            },
            actividades_proximas: [],
            tareas_vencidas: [],
            clientes_recientes: [],
            oportunidades_recientes: [],
            embudo: [],
        });
        crmApi.fetchCollection.mockResolvedValue({
            data: [],
            meta: { total: 0, current_page: 1, last_page: 1 },
        });
        crmApi.fetchRecord.mockResolvedValue({
            id: 12,
            nombre: 'Cliente',
            apellidos: 'JoDev',
            nombre_completo: 'Cliente JoDev',
            empresa: 'Cliente JoDev',
            email: 'cliente@jodev.es',
            telefono: '911111111',
            movil: '611111111',
            direccion: '',
            ciudad: '',
            provincia: '',
            codigo_postal: '',
            pais: 'Espana',
            web: 'https://cliente.jodev.es',
            origen: 'web',
            estado: 'activo',
            notas: '',
        });
        crmApi.updateRecord.mockResolvedValue({});
    });

    it('renders a client-specific portal', async () => {
        renderShell('/dashboard');

        expect(await screen.findByRole('heading', { name: 'Portal cliente' })).toBeInTheDocument();
        expect(screen.getByText('Portal de cliente')).toBeInTheDocument();
        expect(screen.getByText('Mi equipo')).toBeInTheDocument();
        expect(screen.getAllByText('Cliente JoDev').length).toBeGreaterThan(0);
    });
});
