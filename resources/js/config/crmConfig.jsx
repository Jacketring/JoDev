import {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelationLabel,
    titleize,
} from '../utils/formatters';

const archiveFilter = {
    name: 'archived',
    label: 'Vista',
    type: 'select',
    emptyLabel: 'Activos',
    options: [
        { value: '1', label: 'Archivados' },
    ],
};

const yesNoFilter = [
    { value: '1', label: 'Sí' },
    { value: '0', label: 'No' },
];

function getCatalogOptions(options, key) {
    return (options?.catalogos?.[key] ?? []).map((value) => ({
        value,
        label: titleize(value),
    }));
}

function getClienteOptions(options) {
    return (options?.clientes ?? []).map((cliente) => ({
        value: String(cliente.id),
        label: formatRelationLabel(cliente.empresa, cliente.nombre_completo),
    }));
}

function getContactoOptions(options, clienteId) {
    return (options?.contactos ?? [])
        .filter((contacto) => !clienteId || contacto.cliente_id === Number(clienteId))
        .map((contacto) => ({
            value: String(contacto.id),
            label: formatRelationLabel(contacto.nombre_completo, contacto.cliente),
        }));
}

function getOportunidadOptions(options, clienteId) {
    return (options?.oportunidades ?? [])
        .filter((oportunidad) => !clienteId || oportunidad.cliente_id === Number(clienteId))
        .map((oportunidad) => ({
            value: String(oportunidad.id),
            label: formatRelationLabel(oportunidad.titulo, oportunidad.cliente),
        }));
}

export const moduleOrder = ['clientes', 'contactos', 'oportunidades', 'actividades', 'tareas'];

export const moduleConfigs = {
    clientes: {
        key: 'clientes',
        title: 'Clientes',
        eyebrow: 'Core comercial',
        description: 'Empresas y personas con las que trabajas. Desde aquí nace el resto del pipeline.',
        endpoint: '/api/clientes',
        emptyState: 'Todavía no hay clientes creados.',
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
                placeholder: 'Nombre, empresa, email o teléfono',
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
                header: 'Actividad',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {item.contactos_count ?? 0} contactos · {item.oportunidades_count ?? 0} oportunidades
                    </p>
                ),
            },
        ],
        fields: [
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellidos', label: 'Apellidos', type: 'text' },
            { name: 'empresa', label: 'Empresa', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'movil', label: 'Móvil', type: 'text' },
            { name: 'direccion', label: 'Dirección', type: 'text', gridClass: 'md:col-span-2' },
            { name: 'ciudad', label: 'Ciudad', type: 'text' },
            { name: 'provincia', label: 'Provincia', type: 'text' },
            { name: 'codigo_postal', label: 'Código postal', type: 'text' },
            { name: 'pais', label: 'País', type: 'text' },
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
        detailSections: [
            { key: 'contactos', label: 'Contactos vinculados', getItemLabel: (item) => item.nombre_completo },
            { key: 'oportunidades', label: 'Oportunidades', getItemLabel: (item) => item.titulo },
            { key: 'actividades', label: 'Actividad reciente', getItemLabel: (item) => formatRelationLabel(item.tipo, item.asunto) },
            { key: 'tareas', label: 'Tareas', getItemLabel: (item) => formatRelationLabel(item.prioridad, item.titulo) },
        ],
        getRecordTitle: (item) => item.nombre_completo,
        getRecordSubtitle: (item) => formatRelationLabel(item.empresa, item.estado),
    },
    contactos: {
        key: 'contactos',
        title: 'Contactos',
        eyebrow: 'Relaciones clave',
        description: 'Personas dentro de cada cliente para no depender de una sola conversación.',
        endpoint: '/api/contactos',
        emptyState: 'Todavía no hay contactos creados.',
        defaultFilters: {
            search: '',
            cliente_id: '',
            es_principal: '',
            archived: '',
            page: 1,
            per_page: 10,
        },
        filters: [
            {
                name: 'search',
                label: 'Buscar',
                type: 'search',
                placeholder: 'Nombre, cargo o email',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: getClienteOptions,
            },
            {
                name: 'es_principal',
                label: 'Principal',
                type: 'select',
                options: yesNoFilter,
            },
            archiveFilter,
        ],
        columns: [
            {
                header: 'Contacto',
                render: (item) => (
                    <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.nombre_completo}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                            {formatRelationLabel(item.cargo, item.email)}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Cliente',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">{item.cliente?.empresa ?? item.cliente?.nombre_completo}</p>
                ),
            },
            {
                header: 'Canal',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{formatRelationLabel(item.telefono, item.movil)}</p>,
            },
            {
                header: 'Rol',
                render: (item) => <span className="soft-badge">{item.es_principal ? 'Principal' : 'Secundario'}</span>,
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                required: true,
                numeric: true,
                getOptions: getClienteOptions,
            },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellidos', label: 'Apellidos', type: 'text' },
            { name: 'cargo', label: 'Cargo', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Teléfono', type: 'text' },
            { name: 'movil', label: 'Móvil', type: 'text' },
            { name: 'es_principal', label: 'Contacto principal', type: 'checkbox' },
            { name: 'notas', label: 'Notas', type: 'textarea', gridClass: 'md:col-span-2' },
        ],
        detailSections: [
            { key: 'actividades', label: 'Actividades', getItemLabel: (item) => formatRelationLabel(item.tipo, item.asunto) },
            { key: 'tareas', label: 'Tareas', getItemLabel: (item) => formatRelationLabel(item.prioridad, item.titulo) },
        ],
        getRecordTitle: (item) => item.nombre_completo,
        getRecordSubtitle: (item) => item.cliente?.empresa ?? item.cliente?.nombre_completo,
    },
    oportunidades: {
        key: 'oportunidades',
        title: 'Oportunidades',
        eyebrow: 'Pipeline',
        description: 'Negociaciones activas o cerradas con valor estimado y probabilidad.',
        endpoint: '/api/oportunidades',
        emptyState: 'Todavía no hay oportunidades registradas.',
        defaultFilters: {
            search: '',
            cliente_id: '',
            fase: '',
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
                placeholder: 'Título o descripción',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: getClienteOptions,
            },
            {
                name: 'fase',
                label: 'Fase',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'oportunidad_fases'),
            },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'oportunidad_estados'),
            },
            archiveFilter,
        ],
        columns: [
            {
                header: 'Oportunidad',
                render: (item) => (
                    <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.titulo}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                            {item.cliente?.empresa ?? item.cliente?.nombre_completo}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Pipeline',
                render: (item) => <span className="soft-badge">{titleize(item.fase)}</span>,
            },
            {
                header: 'Valor',
                render: (item) => <p className="text-sm font-semibold text-[var(--color-ink)]">{formatCurrency(item.valor_estimado)}</p>,
            },
            {
                header: 'Cierre',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{item.probabilidad}% · {formatDate(item.fecha_cierre_estimada)}</p>,
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                required: true,
                numeric: true,
                getOptions: getClienteOptions,
            },
            { name: 'titulo', label: 'Título', type: 'text', required: true, gridClass: 'md:col-span-2' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea', gridClass: 'md:col-span-2' },
            { name: 'valor_estimado', label: 'Valor estimado', type: 'number', defaultValue: 0 },
            {
                name: 'fase',
                label: 'Fase',
                type: 'select',
                required: true,
                defaultValue: 'nuevo',
                getOptions: (options) => getCatalogOptions(options, 'oportunidad_fases'),
            },
            { name: 'probabilidad', label: 'Probabilidad %', type: 'number', defaultValue: 0 },
            { name: 'fecha_cierre_estimada', label: 'Cierre estimado', type: 'date' },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                required: true,
                defaultValue: 'abierta',
                getOptions: (options) => getCatalogOptions(options, 'oportunidad_estados'),
            },
        ],
        detailSections: [
            { key: 'actividades', label: 'Actividades', getItemLabel: (item) => formatRelationLabel(item.tipo, item.asunto) },
            { key: 'tareas', label: 'Tareas', getItemLabel: (item) => formatRelationLabel(item.prioridad, item.titulo) },
        ],
        getRecordTitle: (item) => item.titulo,
        getRecordSubtitle: (item) => formatRelationLabel(item.cliente?.empresa ?? item.cliente?.nombre_completo, item.estado),
    },
    actividades: {
        key: 'actividades',
        title: 'Actividades',
        eyebrow: 'Seguimiento',
        description: 'Llamadas, reuniones, correos o notas con fecha y contexto comercial.',
        endpoint: '/api/actividades',
        emptyState: 'Todavía no hay actividades registradas.',
        defaultFilters: {
            search: '',
            cliente_id: '',
            tipo: '',
            completada: '',
            archived: '',
            page: 1,
            per_page: 10,
        },
        filters: [
            {
                name: 'search',
                label: 'Buscar',
                type: 'search',
                placeholder: 'Asunto o descripción',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: getClienteOptions,
            },
            {
                name: 'tipo',
                label: 'Tipo',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'actividad_tipos'),
            },
            {
                name: 'completada',
                label: 'Completada',
                type: 'select',
                options: yesNoFilter,
            },
            archiveFilter,
        ],
        columns: [
            {
                header: 'Actividad',
                render: (item) => (
                    <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.asunto}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                            {formatRelationLabel(item.tipo, item.cliente?.empresa ?? item.cliente?.nombre_completo)}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Contacto',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{item.contacto?.nombre_completo ?? 'Sin contacto'}</p>,
            },
            {
                header: 'Oportunidad',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{item.oportunidad?.titulo ?? 'Sin oportunidad'}</p>,
            },
            {
                header: 'Fecha',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{formatDateTime(item.fecha_actividad)} · {item.completada ? 'Hecha' : 'Pendiente'}</p>,
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                numeric: true,
                getOptions: getClienteOptions,
            },
            {
                name: 'contacto_id',
                label: 'Contacto',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getContactoOptions(options, values.cliente_id),
            },
            {
                name: 'oportunidad_id',
                label: 'Oportunidad',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getOportunidadOptions(options, values.cliente_id),
            },
            {
                name: 'tipo',
                label: 'Tipo',
                type: 'select',
                required: true,
                defaultValue: 'llamada',
                getOptions: (options) => getCatalogOptions(options, 'actividad_tipos'),
            },
            { name: 'asunto', label: 'Asunto', type: 'text', required: true, gridClass: 'md:col-span-2' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea', gridClass: 'md:col-span-2' },
            { name: 'fecha_actividad', label: 'Fecha de actividad', type: 'datetime-local', required: true },
            { name: 'completada', label: 'Completada', type: 'checkbox' },
        ],
        getRecordTitle: (item) => item.asunto,
        getRecordSubtitle: (item) => formatRelationLabel(item.tipo, item.contacto?.nombre_completo),
    },
    tareas: {
        key: 'tareas',
        title: 'Tareas',
        eyebrow: 'Operativa diaria',
        description: 'Recordatorios accionables ligados al cliente, al contacto o a una oportunidad.',
        endpoint: '/api/tareas',
        emptyState: 'Todavía no hay tareas creadas.',
        defaultFilters: {
            search: '',
            cliente_id: '',
            prioridad: '',
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
                placeholder: 'Título o descripción',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: getClienteOptions,
            },
            {
                name: 'prioridad',
                label: 'Prioridad',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'tarea_prioridades'),
            },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'tarea_estados'),
            },
            archiveFilter,
        ],
        columns: [
            {
                header: 'Tarea',
                render: (item) => (
                    <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.titulo}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                            {formatRelationLabel(item.cliente?.empresa ?? item.cliente?.nombre_completo, item.contacto?.nombre_completo)}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Prioridad',
                render: (item) => <span className="soft-badge">{titleize(item.prioridad)}</span>,
            },
            {
                header: 'Estado',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{titleize(item.estado)}</p>,
            },
            {
                header: 'Vence',
                render: (item) => <p className="text-sm text-[var(--color-muted)]">{formatDateTime(item.fecha_vencimiento)}</p>,
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                numeric: true,
                getOptions: getClienteOptions,
            },
            {
                name: 'contacto_id',
                label: 'Contacto',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getContactoOptions(options, values.cliente_id),
            },
            {
                name: 'oportunidad_id',
                label: 'Oportunidad',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getOportunidadOptions(options, values.cliente_id),
            },
            { name: 'titulo', label: 'Título', type: 'text', required: true, gridClass: 'md:col-span-2' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea', gridClass: 'md:col-span-2' },
            {
                name: 'prioridad',
                label: 'Prioridad',
                type: 'select',
                required: true,
                defaultValue: 'media',
                getOptions: (options) => getCatalogOptions(options, 'tarea_prioridades'),
            },
            {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                required: true,
                defaultValue: 'pendiente',
                getOptions: (options) => getCatalogOptions(options, 'tarea_estados'),
            },
            { name: 'fecha_vencimiento', label: 'Fecha de vencimiento', type: 'datetime-local' },
        ],
        getRecordTitle: (item) => item.titulo,
        getRecordSubtitle: (item) => formatRelationLabel(item.prioridad, item.estado),
    },
};
