import { formatCurrency, formatDateTime, formatRelationLabel, titleize } from '../utils/formatters';

const archiveFilter = {
    name: 'archived',
    label: 'Vista',
    type: 'select',
    emptyLabel: 'Activos',
    options: [{ value: '1', label: 'Archivados' }],
};

const completionFilter = {
    name: 'completada',
    label: 'Estado',
    type: 'select',
    options: [
        { value: '0', label: 'Pendientes' },
        { value: '1', label: 'Completadas' },
    ],
};

function getCatalogOptions(options, key) {
    return (options?.catalogos?.[key] ?? []).map((value) => ({
        value,
        label: titleize(value),
    }));
}

function getClienteOptions(options) {
    return (options?.clientes ?? []).map((cliente) => ({
        value: cliente.id,
        label: formatRelationLabel(cliente.empresa, cliente.nombre_completo),
    }));
}

function getContactoOptions(options, values = {}) {
    const clienteId = Number(values.cliente_id || 0);

    return (options?.contactos ?? [])
        .filter((contacto) => !clienteId || contacto.cliente_id === clienteId)
        .map((contacto) => ({
            value: contacto.id,
            label: formatRelationLabel(contacto.nombre_completo, contacto.cargo ?? contacto.email),
        }));
}

function getOportunidadOptions(options, values = {}) {
    const clienteId = Number(values.cliente_id || 0);

    return (options?.oportunidades ?? [])
        .filter((oportunidad) => !clienteId || oportunidad.cliente_id === clienteId)
        .map((oportunidad) => ({
            value: oportunidad.id,
            label: formatRelationLabel(oportunidad.titulo, titleize(oportunidad.fase)),
        }));
}

function getAssignableUserOptions(options, values = {}) {
    const clienteId = Number(values.cliente_id || 0);

    return (options?.usuarios_asignables ?? [])
        .filter((user) => {
            if (!clienteId) {
                return true;
            }

            return user.role === 'administrador' || user.cliente_id === clienteId;
        })
        .map((user) => ({
            value: user.id,
            label: formatRelationLabel(
                user.name,
                user.role === 'administrador'
                    ? 'Administrador'
                    : (user.cliente?.empresa ?? user.email),
            ),
        }));
}

export const moduleOrder = ['clientes', 'contactos', 'oportunidades', 'actividades', 'tareas'];

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
                header: 'Red',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {item.contactos_count ?? 0} contactos / {item.oportunidades_count ?? 0} oportunidades
                    </p>
                ),
            },
            {
                header: 'Seguimiento',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {item.actividades_count ?? 0} actividades / {item.tareas_count ?? 0} tareas
                    </p>
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
        detailSections: [
            {
                key: 'contactos',
                label: 'Contactos',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.nombre_completo, entry.cargo ?? entry.email),
            },
            {
                key: 'oportunidades',
                label: 'Oportunidades',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.titulo, `${titleize(entry.fase)} / ${titleize(entry.estado)}`),
            },
            {
                key: 'actividades',
                label: 'Actividades',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.asunto, `${titleize(entry.tipo)} / ${formatDateTime(entry.fecha_actividad)}`),
            },
            {
                key: 'tareas',
                label: 'Tareas',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.titulo, `${titleize(entry.estado)} / ${formatDateTime(entry.fecha_vencimiento)}`),
            },
        ],
        getRecordTitle: (item) => item.nombre_completo,
        getRecordSubtitle: (item) => formatRelationLabel(item.empresa, item.estado),
    },
    contactos: {
        key: 'contactos',
        title: 'Contactos',
        eyebrow: 'Red de decision',
        description: 'Interlocutores asociados a cada cliente con sus canales de contacto.',
        endpoint: '/api/contactos',
        emptyState: 'Todavia no hay contactos creados.',
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
                placeholder: 'Nombre, cargo, email o empresa',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: (options) => getClienteOptions(options),
            },
            {
                name: 'es_principal',
                label: 'Rol',
                type: 'select',
                options: [
                    { value: '1', label: 'Principal' },
                    { value: '0', label: 'Secundario' },
                ],
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
                    <p className="text-sm text-[var(--color-muted)]">
                        {formatRelationLabel(item.cliente?.empresa, item.cliente?.nombre_completo)}
                    </p>
                ),
            },
            {
                header: 'Principal',
                render: (item) => <span className="soft-badge">{item.es_principal ? 'Si' : 'No'}</span>,
            },
            {
                header: 'Actividad',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {item.actividades_count ?? 0} actividades / {item.tareas_count ?? 0} tareas
                    </p>
                ),
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                required: true,
                numeric: true,
                getOptions: (options) => getClienteOptions(options),
            },
            { name: 'nombre', label: 'Nombre', type: 'text', required: true },
            { name: 'apellidos', label: 'Apellidos', type: 'text' },
            { name: 'cargo', label: 'Cargo', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'telefono', label: 'Telefono', type: 'text' },
            { name: 'movil', label: 'Movil', type: 'text' },
            { name: 'es_principal', label: 'Contacto principal', type: 'checkbox' },
            { name: 'notas', label: 'Notas', type: 'textarea', gridClass: 'md:col-span-2' },
        ],
        detailSections: [
            {
                key: 'actividades',
                label: 'Actividades',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.asunto, `${titleize(entry.tipo)} / ${formatDateTime(entry.fecha_actividad)}`),
            },
            {
                key: 'tareas',
                label: 'Tareas',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.titulo, `${titleize(entry.estado)} / ${formatDateTime(entry.fecha_vencimiento)}`),
            },
        ],
        getRecordTitle: (item) => item.nombre_completo,
        getRecordSubtitle: (item) =>
            formatRelationLabel(item.cliente?.empresa, item.cargo ?? (item.es_principal ? 'Principal' : 'Contacto')),
    },
    oportunidades: {
        key: 'oportunidades',
        title: 'Oportunidades',
        eyebrow: 'Pipeline comercial',
        description: 'Negocio potencial ordenado por fase, valor y estado actual.',
        endpoint: '/api/oportunidades',
        emptyState: 'Todavia no hay oportunidades creadas.',
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
                placeholder: 'Titulo, fase, estado o cliente',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: (options) => getClienteOptions(options),
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
                            {formatRelationLabel(item.cliente?.empresa, titleize(item.fase))}
                        </p>
                    </div>
                ),
            },
            {
                header: 'Estado',
                render: (item) => <span className="soft-badge">{titleize(item.estado)}</span>,
            },
            {
                header: 'Probabilidad',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">{item.probabilidad ?? 0}%</p>
                ),
            },
            {
                header: 'Valor',
                render: (item) => (
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                        {formatCurrency(item.valor_estimado)}
                    </p>
                ),
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                required: true,
                numeric: true,
                getOptions: (options) => getClienteOptions(options),
            },
            { name: 'titulo', label: 'Titulo', type: 'text', required: true },
            { name: 'descripcion', label: 'Descripcion', type: 'textarea', gridClass: 'md:col-span-2' },
            { name: 'valor_estimado', label: 'Valor estimado', type: 'number', defaultValue: 0 },
            {
                name: 'fase',
                label: 'Fase',
                type: 'select',
                required: true,
                defaultValue: 'nuevo',
                getOptions: (options) => getCatalogOptions(options, 'oportunidad_fases'),
            },
            { name: 'probabilidad', label: 'Probabilidad (%)', type: 'number', required: true, defaultValue: 0 },
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
            {
                key: 'actividades',
                label: 'Actividades',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.asunto, `${titleize(entry.tipo)} / ${formatDateTime(entry.fecha_actividad)}`),
            },
            {
                key: 'tareas',
                label: 'Tareas',
                getItemLabel: (entry) =>
                    formatRelationLabel(entry.titulo, `${titleize(entry.estado)} / ${formatDateTime(entry.fecha_vencimiento)}`),
            },
        ],
        getRecordTitle: (item) => item.titulo,
        getRecordSubtitle: (item) =>
            formatRelationLabel(item.cliente?.empresa, `${titleize(item.fase)} / ${titleize(item.estado)}`),
    },
    actividades: {
        key: 'actividades',
        title: 'Actividades',
        eyebrow: 'Seguimiento',
        description: 'Llamadas, reuniones, emails y notas vinculadas a cada cuenta.',
        endpoint: '/api/actividades',
        emptyState: 'Todavia no hay actividades creadas.',
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
                placeholder: 'Asunto, tipo, contacto o cliente',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: (options) => getClienteOptions(options),
            },
            {
                name: 'tipo',
                label: 'Tipo',
                type: 'select',
                getOptions: (options) => getCatalogOptions(options, 'actividad_tipos'),
            },
            completionFilter,
            archiveFilter,
        ],
        columns: [
            {
                header: 'Actividad',
                render: (item) => (
                    <div>
                        <p className="font-semibold text-[var(--color-ink)]">{item.asunto}</p>
                        <p className="text-xs text-[var(--color-muted)]">{titleize(item.tipo)}</p>
                    </div>
                ),
            },
            {
                header: 'Cliente',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {formatRelationLabel(item.cliente?.empresa, item.contacto?.nombre_completo)}
                    </p>
                ),
            },
            {
                header: 'Fecha',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">{formatDateTime(item.fecha_actividad)}</p>
                ),
            },
            {
                header: 'Estado',
                render: (item) => <span className="soft-badge">{item.completada ? 'Completada' : 'Pendiente'}</span>,
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                numeric: true,
                getOptions: (options) => getClienteOptions(options),
            },
            {
                name: 'contacto_id',
                label: 'Contacto',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getContactoOptions(options, values),
            },
            {
                name: 'oportunidad_id',
                label: 'Oportunidad',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getOportunidadOptions(options, values),
            },
            {
                name: 'tipo',
                label: 'Tipo',
                type: 'select',
                defaultValue: 'nota',
                getOptions: (options) => getCatalogOptions(options, 'actividad_tipos'),
            },
            { name: 'asunto', label: 'Asunto', type: 'text', required: true },
            { name: 'fecha_actividad', label: 'Fecha actividad', type: 'datetime-local', defaultValue: '__now__' },
            { name: 'descripcion', label: 'Descripcion', type: 'textarea', gridClass: 'md:col-span-2' },
            { name: 'completada', label: 'Actividad completada', type: 'checkbox' },
        ],
        getRecordTitle: (item) => item.asunto,
        getRecordSubtitle: (item) =>
            formatRelationLabel(item.cliente?.empresa, item.contacto?.nombre_completo ?? item.oportunidad?.titulo),
    },
    tareas: {
        key: 'tareas',
        title: 'Tareas',
        eyebrow: 'Ejecucion',
        description: 'Pendientes operativos con prioridad, estado y vencimiento.',
        endpoint: '/api/tareas',
        emptyState: 'Todavia no hay tareas creadas.',
        defaultFilters: {
            search: '',
            cliente_id: '',
            assigned_user_id: '',
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
                placeholder: 'Titulo, prioridad, estado o cliente',
            },
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                getOptions: (options) => getClienteOptions(options),
            },
            {
                name: 'assigned_user_id',
                label: 'Responsable',
                type: 'select',
                getOptions: (options) => getAssignableUserOptions(options),
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
                            {formatRelationLabel(item.cliente?.empresa, item.assigned_user?.name ?? item.contacto?.nombre_completo)}
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
                render: (item) => <span className="soft-badge">{titleize(item.estado)}</span>,
            },
            {
                header: 'Responsable',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">
                        {item.assigned_user?.name ?? 'Sin asignar'}
                    </p>
                ),
            },
            {
                header: 'Vencimiento',
                render: (item) => (
                    <p className="text-sm text-[var(--color-muted)]">{formatDateTime(item.fecha_vencimiento)}</p>
                ),
            },
        ],
        fields: [
            {
                name: 'cliente_id',
                label: 'Cliente',
                type: 'select',
                required: true,
                numeric: true,
                getOptions: (options) => getClienteOptions(options),
            },
            {
                name: 'contacto_id',
                label: 'Contacto',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getContactoOptions(options, values),
            },
            {
                name: 'oportunidad_id',
                label: 'Oportunidad',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getOportunidadOptions(options, values),
            },
            {
                name: 'assigned_user_id',
                label: 'Responsable',
                type: 'select',
                numeric: true,
                getOptions: (options, values) => getAssignableUserOptions(options, values),
            },
            { name: 'titulo', label: 'Titulo', type: 'text', required: true },
            { name: 'descripcion', label: 'Descripcion', type: 'textarea', gridClass: 'md:col-span-2' },
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
            { name: 'fecha_vencimiento', label: 'Fecha vencimiento', type: 'datetime-local' },
        ],
        getRecordTitle: (item) => item.titulo,
        getRecordSubtitle: (item) =>
            formatRelationLabel(
                item.assigned_user?.name ?? item.cliente?.empresa,
                `${titleize(item.prioridad)} / ${titleize(item.estado)}`,
            ),
    },
};
