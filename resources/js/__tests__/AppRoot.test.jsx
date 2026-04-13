import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppRoot from '../components/AppRoot';

vi.mock('../services/crmApi', () => ({
    fetchCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    fetchDashboard: vi.fn(),
    fetchCollection: vi.fn(),
    fetchOptions: vi.fn(),
    fetchVisualSettings: vi.fn(),
    fetchRecord: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    updateVisualSettings: vi.fn(),
    archiveRecord: vi.fn(),
}));

const crmApi = await import('../services/crmApi');

function renderRoot(initialEntry = '/dashboard') {
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
                <AppRoot />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('AppRoot', () => {
    beforeEach(() => {
        crmApi.fetchCurrentUser.mockResolvedValue(null);
        crmApi.login.mockResolvedValue({
            id: 1,
            name: 'JoDev Admin',
            email: 'admin@jodev.es',
            role: 'administrador',
            cliente_id: null,
            cliente: null,
            visual_preferences: undefined,
        });
        crmApi.logout.mockResolvedValue(undefined);
        crmApi.fetchDashboard.mockResolvedValue({
            metricas: {
                clientes_activos: 3,
                oportunidades_abiertas: 4,
                valor_pipeline: 12000,
                tareas_pendientes: 5,
                actividades_proximas: 2,
            },
            actividades_proximas: [],
            tareas_vencidas: [],
            clientes_recientes: [],
            oportunidades_recientes: [],
            embudo: [],
            distribuciones: {
                clientes_estado: {
                    total: 3,
                    items: [
                        { clave: 'activo', total: 2 },
                        { clave: 'inactivo', total: 1 },
                    ],
                },
                tareas_estado: {
                    total: 5,
                    items: [
                        { clave: 'pendiente', total: 2 },
                        { clave: 'en_progreso', total: 2 },
                        { clave: 'completada', total: 1 },
                    ],
                },
            },
        });
        crmApi.fetchOptions.mockResolvedValue({
            catalogos: {
                cliente_estados: ['activo', 'inactivo'],
                oportunidad_fases: ['nuevo'],
                oportunidad_estados: ['abierta'],
                actividad_tipos: ['llamada'],
                tarea_prioridades: ['media'],
                tarea_estados: ['pendiente'],
            },
            clientes: [],
            contactos: [],
            oportunidades: [],
        });
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
        crmApi.fetchCollection.mockResolvedValue({
            data: [],
            meta: { total: 0, current_page: 1, last_page: 1 },
        });
        crmApi.fetchRecord.mockResolvedValue(null);
    });

    it('redirects guests to login and allows access after sign in', async () => {
        renderRoot('/dashboard');

        expect(await screen.findByRole('heading', { name: 'Accede a JoDev' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Continuar con Google' })).toHaveAttribute(
            'href',
            '/auth/google/redirect',
        );

        fireEvent.change(screen.getByLabelText('Email corporativo'), {
            target: { value: 'admin@jodev.es' },
        });

        fireEvent.change(screen.getByLabelText('Contrasena'), {
            target: { value: 'JoDev2026!' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(crmApi.login).toHaveBeenCalled();
        });

        expect(crmApi.login.mock.calls[0][0]).toEqual({
            email: 'admin@jodev.es',
            password: 'JoDev2026!',
            remember: true,
        });

        expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    });

    it('renders the client portal for client accounts', async () => {
        crmApi.fetchCurrentUser.mockResolvedValue({
            id: 2,
            name: 'Cliente JoDev',
            email: 'cliente@jodev.es',
            role: 'cliente',
            cliente_id: 15,
            cliente: {
                id: 15,
                empresa: 'Cliente JoDev',
                nombre_completo: 'Cliente JoDev',
                estado: 'activo',
            },
            visual_preferences: undefined,
        });

        renderRoot('/dashboard');

        expect(await screen.findByRole('heading', { name: 'Portal cliente' })).toBeInTheDocument();
        expect(screen.getByText('Mi empresa')).toBeInTheDocument();
        expect(screen.getAllByText('Cliente JoDev').length).toBeGreaterThan(0);
    });
});
