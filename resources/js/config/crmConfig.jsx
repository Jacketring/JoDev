import { formatRelationLabel, titleize } from '../utils/formatters';

const archiveFilter = {
    name: 'archived',
    label: 'Vista',
    type: 'select',
    emptyLabel: 'Activos',
    options: [{ value: '1', label: 'Archivados' }],
};

function getCatalogOptions(options, key) {
    return (options?.catalogos?.[key] ?? []).map((value) => ({
        value,
        label: titleize(value),
    }));
}

export const moduleOrder = ['clientes'];

export const moduleConfigs = {
    clientes: {
        key: 'clientes',
        title: 'Clientes',
        eyebrow: 'Base comercial',
        description: 'Directorio principal de empresas y personas vinculadas al CRM.',
        endpoint: '/api/clientes',
        emptyState: 'Todavia no hay clientes creados.',
        defaultFilters: {
            search: '',
            estado: '',
            archived: '',
            page: 1,
            per_page: 10,
        },
        filters: [
            {
                name: 'search',
                label: 'Buscar',
                type: 'search',
                placeholder: 'Nombre, empresa, email o telefono',
            },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'cliente_estados'),
            },
            archiveFilter,
        ],
        columns: [
            {
                header: 'Cliente',
                render: (item) => (
                    <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.nombre_completo}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                            {formatRelationLabel(item.empresa, item.email)}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Estado',
                render: (item) => <span className="soft-badge">{titleize(item.estado)}</span>,
            },
            {
                header: 'Contacto',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {formatRelationLabel(item.telefono, item.ciudad)}
                    </p>
                ),
            },
            {
                header: 'Origen',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">{titleize(item.origen ?? 'directo')}</p>
                ),
            },
        ],
        fields: [
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellidos', label: 'Apellidos', type: 'text' },
            { name: 'empresa', label: 'Empresa', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Telefono', type: 'text' },
            { name: 'movil', label: 'Movil', type: 'text' },
            { name: 'direccion', label: 'Direccion', type: 'text', gridClass: 'md:col-span-2' },
            { name: 'ciudad', label: 'Ciudad', type: 'text' },
            { name: 'provincia', label: 'Provincia', type: 'text' },
            { name: 'codigo_postal', label: 'Codigo postal', type: 'text' },
            { name: 'pais', label: 'Pais', type: 'text' },
            { name: 'web', label: 'Web', type: 'url' },
            { name: 'origen', label: 'Origen', type: 'text' },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                required: true,
                defaultValue: 'activo',
                getOptions: (options) => getCatalogOptions(options, 'cliente_estados'),
            },
            { name: 'notas', label: 'Notas', type: 'textarea', gridClass: 'md:col-span-2' },
        ],
        getRecordTitle: (item) => item.nombre_completo,
        getRecordSubtitle: (item) => formatRelationLabel(item.empresa, item.estado),
    },
};
