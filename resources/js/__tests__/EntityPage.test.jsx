import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EntityPage from '../components/EntityPage';
import { moduleConfigs } from '../config/crmConfig';

vi.mock('../services/crmApi', () => ({
    fetchCollection: vi.fn(),
    fetchOptions: vi.fn(),
    fetchRecord: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    archiveRecord: vi.fn(),
}));

const crmApi = await import('../services/crmApi');

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <EntityPage config={moduleConfigs.clientes} />
        </QueryClientProvider>,
    );
}

describe('EntityPage', () => {
    beforeEach(() => {
        window.confirm = vi.fn(() => true);

        crmApi.fetchOptions.mockResolvedValue({
            catalogos: {
                cliente_estados: ['activo', 'inactivo'],
            },
            clientes: [],
            contactos: [],
            oportunidades: [],
        });

        crmApi.fetchCollection.mockResolvedValue({
            data: [
                {
                    id: 1,
                    nombre: 'Ana',
                    apellidos: 'Lopez',
                    nombre_completo: 'Ana Lopez',
                    empresa: 'Acme Solar',
                    email: 'ana@example.com',
                    telefono: '600111222',
                    ciudad: 'Madrid',
                    estado: 'activo',
                    contactos_count: 1,
                    oportunidades_count: 2,
                },
            ],
            meta: { total: 1, current_page: 1, last_page: 1 },
        });

        crmApi.fetchRecord.mockResolvedValue({
            id: 1,
            nombre: 'Ana',
            apellidos: 'Lopez',
            nombre_completo: 'Ana Lopez',
            empresa: 'Acme Solar',
            email: 'ana@example.com',
            telefono: '600111222',
            ciudad: 'Madrid',
            estado: 'activo',
            contactos: [],
            oportunidades: [],
            actividades: [],
            tareas: [],
        });

        crmApi.createRecord.mockResolvedValue({
            id: 2,
            nombre: 'Lucia',
            nombre_completo: 'Lucia',
            estado: 'activo',
        });
        crmApi.updateRecord.mockResolvedValue({});
        crmApi.archiveRecord.mockResolvedValue({});
    });

    it('loads data, applies filters, creates and archives records', async () => {
        renderPage();

        expect(await screen.findByText('Ana Lopez')).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText('Nombre, empresa, email o teléfono'), {
            target: { value: 'Acme' },
        });

        await waitFor(() => {
            expect(crmApi.fetchCollection).toHaveBeenLastCalledWith(
                '/api/clientes',
                expect.objectContaining({ search: 'Acme' }),
            );
        });

        fireEvent.click(screen.getByRole('button', { name: /Nuevo cliente/i }));

        fireEvent.change(screen.getByLabelText('Nombre'), {
            target: { value: 'Lucia' },
        });

        fireEvent.change(screen.getByLabelText('Estado'), {
            target: { value: 'activo' },
        });

        fireEvent.click(screen.getByRole('button', { name: /^Guardar$/i }));

        await waitFor(() => {
            expect(crmApi.createRecord).toHaveBeenCalledWith(
                '/api/clientes',
                expect.objectContaining({ nombre: 'Lucia', estado: 'activo' }),
            );
        });

        fireEvent.click(screen.getAllByRole('button', { name: 'Archivar' })[0]);

        await waitFor(() => {
            expect(crmApi.archiveRecord).toHaveBeenCalledWith('/api/clientes', 1);
        });
    });
});
