import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AppShell from '../components/AppShell';

vi.mock('../services/crmApi', () => ({
    fetchDashboard: vi.fn(),
    fetchCollection: vi.fn(),
    fetchGlobalSearch: vi.fn(),
    fetchOptions: vi.fn(),
    fetchVisualSettings: vi.fn(),
    fetchRecord: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    updateVisualSettings: vi.fn(),
    archiveRecord: vi.fn(),
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
                <AppShell
                    user={{
                        name: 'JoDev Admin',
                        email: 'admin@jodev.es',
                        role: 'administrador',
                        cliente_id: null,
                        cliente: null,
                        visual_preferences: undefined,
                    }}
                    onLogout={() => {}}
                    logoutPending={false}
                />
            </MemoryRouter>
        </QueryClientProvider>,
    );
}

describe('AppShell', () => {
    beforeEach(() => {
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
            embudo: [
                { fase: 'nuevo', total: 1, valor: 2000 },
                { fase: 'propuesta', total: 3, valor: 10000 },
            ],
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
        crmApi.fetchGlobalSearch.mockResolvedValue({
            total: 1,
            results: [
                {
                    entity: 'contactos',
                    label: 'Contactos',
                    items: [
                        {
                            id: 7,
                            entity: 'contactos',
                            title: 'Ana Lopez',
                            subtitle: 'Acme Solar / Directora',
                            meta: 'Principal',
                            url: '/contactos?search=Ana&record=7',
                        },
                    ],
                },
            ],
        });
        crmApi.updateVisualSettings.mockResolvedValue({
            theme_mode: 'original',
            navigation_density: 'expanded',
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

    it('navigates between dashboard and modules', async () => {
        renderShell();

        expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
        expect(await screen.findByText('Clientes activos')).toBeInTheDocument();
        expect(await screen.findByText('Clientes por estado')).toBeInTheDocument();
        expect(await screen.findByText('Pipeline por fase')).toBeInTheDocument();
        expect(screen.getByText('Jose Development CRM')).toBeInTheDocument();

        fireEvent.click(
            within(screen.getByRole('navigation')).getByRole('link', {
                name: /ClientesBase comercial/i,
            }),
        );

        await waitFor(() => {
            expect(screen.getByText(/Todav/i)).toBeInTheDocument();
        });
    });

    it('runs a global search and navigates to the matching entity', async () => {
        renderShell();

        fireEvent.change(screen.getByLabelText('Buscador global'), {
            target: { value: 'Ana' },
        });

        await waitFor(() => {
            expect(crmApi.fetchGlobalSearch).toHaveBeenCalledWith({ q: 'Ana', limit: 4 });
        });

        fireEvent.click(await screen.findByRole('button', { name: /Ana Lopez/i }));

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Contactos' })).toBeInTheDocument();
        });
    });

    it('opens visual settings and saves a safe preset', async () => {
        renderShell('/ajustes');

        expect(await screen.findByRole('heading', { name: 'Ajustes visuales' })).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'Guardar ajustes' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Amplio/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Guardar ajustes' }));

        await waitFor(() => {
            expect(crmApi.updateVisualSettings).toHaveBeenCalled();
        });

        expect(crmApi.updateVisualSettings.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                navigation_density: 'expanded',
                theme_mode: 'original',
            }),
        );
    });

    it('shows the user management module for administrators', async () => {
        renderShell('/usuarios');

        expect(await screen.findByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
        expect(await screen.findByRole('button', { name: 'Nuevo usuario' })).toBeInTheDocument();
        expect(screen.getByText('Gestion de accesos')).toBeInTheDocument();
    });
});
