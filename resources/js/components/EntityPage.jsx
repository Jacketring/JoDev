import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    archiveRecord,
    createRecord,
    fetchCollection,
    fetchOptions,
    fetchRecord,
    updateRecord,
} from '../services/crmApi';
import {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatRelationLabel,
    titleize,
    toDateInputValue,
    toDateTimeInputValue,
} from '../utils/formatters';
import { DetailPanelSkeleton, LoadingTableRows } from './LoadingSkeletons';

export default function EntityPage({ config }) {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState(config.defaultFilters);
    const [formOpen, setFormOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [formValues, setFormValues] = useState(createFormState(config));
    const [formErrors, setFormErrors] = useState({});
    const deferredSearch = useDeferredValue(filters.search);
    const singularLabel = getSingularLabel(config.key);

    const listQuery = useQuery({
        queryKey: [config.key, 'list', { ...filters, search: deferredSearch }],
        queryFn: () => fetchCollection(config.endpoint, { ...filters, search: deferredSearch }),
        placeholderData: keepPreviousData,
    });

    const optionsQuery = useQuery({
        queryKey: ['crm-options'],
        queryFn: fetchOptions,
        staleTime: 60_000,
    });

    const detailQuery = useQuery({
        enabled: Boolean(selectedId),
        queryKey: [config.key, 'detail', selectedId],
        queryFn: () => fetchRecord(config.endpoint, selectedId),
    });

    const saveMutation = useMutation({
        mutationFn: ({ id, payload }) =>
            id ? updateRecord(config.endpoint, id, payload) : createRecord(config.endpoint, payload),
        onSuccess: async (record) => {
            setFormErrors({});
            setFormOpen(false);
            setEditingRecord(null);
            setSelectedId(record.id);

            await queryClient.invalidateQueries({ queryKey: [config.key, 'list'] });
            await queryClient.invalidateQueries({ queryKey: [config.key, 'detail', record.id] });

            if (['clientes', 'contactos', 'oportunidades'].includes(config.key)) {
                await queryClient.invalidateQueries({ queryKey: ['crm-options'] });
            }
        },
        onError: (error) => {
            setFormErrors(error.response?.data?.errors ?? {});
        },
    });

    const archiveMutation = useMutation({
        mutationFn: (id) => archiveRecord(config.endpoint, id),
        onSuccess: async () => {
            setSelectedId(null);
            await queryClient.invalidateQueries({ queryKey: [config.key, 'list'] });

            if (['clientes', 'contactos', 'oportunidades'].includes(config.key)) {
                await queryClient.invalidateQueries({ queryKey: ['crm-options'] });
            }
        },
    });

    const items = listQuery.data?.data ?? [];
    const meta = listQuery.data?.meta;
    const options = optionsQuery.data;
    const selectedRecord = detailQuery.data ?? items.find((item) => item.id === selectedId) ?? null;
    const showInitialListLoad = listQuery.isPending && !listQuery.data;
    const showDetailLoad = selectedId && detailQuery.isPending && !detailQuery.data;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const routeSearch = params.get('search');
        const recordValue = params.get('record');
        const nextSelectedId = recordValue ? Number(recordValue) : null;

        startTransition(() => {
            setFilters({
                ...config.defaultFilters,
                search: routeSearch ?? config.defaultFilters.search,
                page: 1,
            });
        });

        setSelectedId(Number.isInteger(nextSelectedId) ? nextSelectedId : null);
    }, [config.defaultFilters, location.search]);

    function updateFilter(name, value) {
        startTransition(() => {
            setFilters((current) => ({
                ...current,
                [name]: value,
                page: 1,
            }));
        });
    }

    function updatePage(nextPage) {
        startTransition(() => {
            setFilters((current) => ({
                ...current,
                page: nextPage,
            }));
        });
    }

    function openCreateForm() {
        setEditingRecord(null);
        setFormErrors({});
        setFormValues(createFormState(config));
        setFormOpen(true);
    }

    function openEditForm(record) {
        setEditingRecord(record);
        setFormErrors({});
        setFormValues(createFormState(config, record));
        setFormOpen(true);
    }

    function updateField(fieldName, value) {
        setFormValues((current) => {
            const next = {
                ...current,
                [fieldName]: value,
            };

            if (fieldName === 'cliente_id') {
                if ('contacto_id' in next) {
                    next.contacto_id = '';
                }

                if ('oportunidad_id' in next) {
                    next.oportunidad_id = '';
                }
            }

            return next;
        });

        setFormErrors((current) => ({ ...current, [fieldName]: undefined }));
    }

    function submitForm(event) {
        event.preventDefault();

        saveMutation.mutate({
            id: editingRecord?.id,
            payload: serializePayload(config, formValues),
        });
    }

    async function handleArchive(record) {
        if (!window.confirm(`Archivar ${config.getRecordTitle(record)}?`)) {
            return;
        }

        await archiveMutation.mutateAsync(record.id);
    }

    return (
        <section className="panel-enter space-y-5">
            <div className="panel-surface overflow-hidden p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {config.filters.map((filter) => (
                            <div key={filter.name}>
                                <label className="field-label">{filter.label}</label>
                                {renderFilterControl({
                                    filter,
                                    value: filters[filter.name],
                                    options,
                                    formValues,
                                    onChange: updateFilter,
                                })}
                            </div>
                        ))}
                    </div>

                    <button type="button" onClick={openCreateForm} className="primary-button">
                        Nuevo {singularLabel}
                    </button>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-muted)]">
                    <span>{meta ? `${meta.total} registros en esta vista` : 'Cargando registros...'}</span>
                    <span>
                        {optionsQuery.isFetching
                            ? 'Cargando catalogos...'
                            : listQuery.isFetching
                              ? 'Actualizando por bloques...'
                              : 'Sincronizado con la API'}
                    </span>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="panel-surface overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface)] text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                <tr>
                                    {config.columns.map((column) => (
                                        <th key={column.header} className="px-5 py-4 font-semibold">
                                            {column.header}
                                        </th>
                                    ))}
                                    <th className="px-5 py-4 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {showInitialListLoad ? (
                                    <LoadingTableRows columns={config.columns.length + 1} />
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={config.columns.length + 1}
                                            className="px-5 py-12 text-center text-sm text-[var(--color-muted)]"
                                        >
                                            {config.emptyState}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="border-b border-[var(--color-line)]/60 align-top last:border-b-0 hover:bg-[var(--panel-secondary-bg)]"
                                        >
                                            {config.columns.map((column) => (
                                                <td key={column.header} className="px-5 py-4">
                                                    {column.render(item)}
                                                </td>
                                            ))}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedId(item.id)}
                                                        className="table-action"
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditForm(item)}
                                                        className="table-action"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleArchive(item)}
                                                        className="table-action"
                                                    >
                                                        Archivar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {meta ? (
                        <div className="flex items-center justify-between border-t border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4 text-sm text-[var(--color-muted)]">
                            <span>
                                Pagina {meta.current_page} de {meta.last_page}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => updatePage(meta.current_page - 1)}
                                    disabled={meta.current_page <= 1}
                                    className="table-action disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updatePage(meta.current_page + 1)}
                                    disabled={meta.current_page >= meta.last_page}
                                    className="table-action disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>

                <aside className="panel-surface min-h-[320px] p-5">
                    {showDetailLoad ? (
                        <DetailPanelSkeleton />
                    ) : selectedRecord ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                    Vista detalle
                                </p>
                                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                    {config.getRecordTitle(selectedRecord)}
                                </h3>
                                <p className="mt-2 text-sm text-[var(--color-muted)]">
                                    {config.getRecordSubtitle(selectedRecord)}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                                {config.fields.map((field) => (
                                    <div
                                        key={field.name}
                                        className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3"
                                    >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                            {field.label}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                                            {formatDetailValue(field, selectedRecord)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {(config.detailSections ?? []).map((section) => (
                                <div key={section.key}>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                        {section.label}
                                    </p>
                                    <div className="space-y-2">
                                        {(selectedRecord[section.key] ?? []).slice(0, 5).map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="rounded-2xl border border-[var(--color-line)] bg-[var(--panel-secondary-bg)] px-4 py-3 text-sm text-[var(--color-muted)]"
                                            >
                                                {section.getItemLabel(entry)}
                                            </div>
                                        ))}
                                        {(selectedRecord[section.key] ?? []).length === 0 ? (
                                            <p className="text-sm text-[var(--color-muted)]">
                                                Sin elementos vinculados.
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full flex-col justify-center text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                Panel lateral
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                                Selecciona una fila para ver el detalle completo sin salir del modulo.
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            {formOpen ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-4 backdrop-blur-sm md:items-center">
                    <div className="panel-surface panel-enter max-h-[88vh] w-full max-w-4xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                    {editingRecord ? 'Edicion' : 'Alta'}
                                </p>
                                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                    {editingRecord
                                        ? config.getRecordTitle(editingRecord)
                                        : `Nuevo ${singularLabel}`}
                                </h3>
                            </div>
                            <button
                                type="button"
                                className="table-action"
                                onClick={() => setFormOpen(false)}
                            >
                                Cerrar
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="max-h-[72vh] overflow-y-auto px-6 py-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                {config.fields.map((field) => (
                                    <div key={field.name} className={field.gridClass ?? ''}>
                                        {field.type !== 'checkbox' ? (
                                            <label className="field-label" htmlFor={field.name}>
                                                {field.label}
                                            </label>
                                        ) : null}
                                        {renderFieldControl({
                                            field,
                                            options,
                                            values: formValues,
                                            onChange: updateField,
                                        })}
                                        {formErrors[field.name] ? (
                                            <p className="mt-2 text-sm text-red-600">
                                                {formErrors[field.name][0]}
                                            </p>
                                        ) : null}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[var(--color-line)] pt-5">
                                <button
                                    type="button"
                                    onClick={() => setFormOpen(false)}
                                    className="table-action"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="primary-button disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function createFormState(config, record = null) {
    return Object.fromEntries(
        config.fields.map((field) => {
            const rawValue = record?.[field.name];
            const defaultValue = resolveFieldDefaultValue(field);

            if (field.type === 'checkbox') {
                return [field.name, Boolean(rawValue ?? defaultValue ?? false)];
            }

            if (field.type === 'date') {
                return [field.name, record ? toDateInputValue(rawValue) : defaultValue ?? ''];
            }

            if (field.type === 'datetime-local') {
                return [field.name, record ? toDateTimeInputValue(rawValue) : defaultValue ?? ''];
            }

            if (field.type === 'select' && field.numeric) {
                return [field.name, rawValue != null ? String(rawValue) : defaultValue ?? ''];
            }

            if (field.type === 'number') {
                return [field.name, rawValue ?? defaultValue ?? ''];
            }

            return [field.name, rawValue ?? defaultValue ?? ''];
        }),
    );
}

function resolveFieldDefaultValue(field) {
    if (field.defaultValue === '__now__' && field.type === 'datetime-local') {
        return toDateTimeInputValue(new Date().toISOString());
    }

    return field.defaultValue;
}

function serializePayload(config, values) {
    return Object.fromEntries(
        config.fields.map((field) => {
            const value = values[field.name];

            if (field.type === 'checkbox') {
                return [field.name, Boolean(value)];
            }

            if (value === '' || value === null || value === undefined) {
                return [field.name, null];
            }

            if (field.type === 'number') {
                return [field.name, Number(value)];
            }

            if (field.type === 'select' && field.numeric) {
                return [field.name, Number(value)];
            }

            return [field.name, value];
        }),
    );
}

function renderFilterControl({ filter, value, options, formValues, onChange }) {
    if (filter.type === 'search') {
        return (
            <input
                id={filter.name}
                value={value ?? ''}
                onChange={(event) => onChange(filter.name, event.target.value)}
                className="form-input"
                placeholder={filter.placeholder}
            />
        );
    }

    const choices = filter.getOptions ? filter.getOptions(options, formValues) : filter.options;

    return (
        <select
            id={filter.name}
            value={value ?? ''}
            onChange={(event) => onChange(filter.name, event.target.value)}
            className="form-input"
        >
            <option value="">{filter.emptyLabel ?? 'Todos'}</option>
            {choices.map((choice) => (
                <option key={`${filter.name}-${choice.value}`} value={choice.value}>
                    {choice.label}
                </option>
            ))}
        </select>
    );
}

function renderFieldControl({ field, options, values, onChange }) {
    if (field.type === 'textarea') {
        return (
            <textarea
                id={field.name}
                value={values[field.name] ?? ''}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="form-input min-h-28"
            />
        );
    }

    if (field.type === 'checkbox') {
        return (
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)]">
                <input
                    type="checkbox"
                    id={field.name}
                    checked={Boolean(values[field.name])}
                    onChange={(event) => onChange(field.name, event.target.checked)}
                />
                <span>{field.label}</span>
            </label>
        );
    }

    if (field.type === 'select') {
        const choices = field.getOptions ? field.getOptions(options, values) : field.options ?? [];

        return (
            <select
                id={field.name}
                value={values[field.name] ?? ''}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="form-input"
            >
                <option value="">{field.required ? 'Selecciona una opcion' : 'Sin asignar'}</option>
                {choices.map((choice) => (
                    <option key={`${field.name}-${choice.value}`} value={choice.value}>
                        {choice.label}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <input
            type={field.type}
            id={field.name}
            value={values[field.name] ?? ''}
            onChange={(event) => onChange(field.name, event.target.value)}
            className="form-input"
        />
    );
}

function formatDetailValue(field, record) {
    if (field.type === 'checkbox') {
        return record[field.name] ? 'Si' : 'No';
    }

    if (field.name === 'cliente_id') {
        return record.cliente
            ? formatRelationLabel(record.cliente.empresa, record.cliente.nombre_completo)
            : 'Sin asignar';
    }

    if (field.name === 'contacto_id') {
        return record.contacto ? record.contacto.nombre_completo : 'Sin asignar';
    }

    if (field.name === 'oportunidad_id') {
        return record.oportunidad ? record.oportunidad.titulo : 'Sin asignar';
    }

    if (field.name === 'assigned_user_id') {
        return record.assigned_user
            ? formatRelationLabel(record.assigned_user.name, titleize(record.assigned_user.role))
            : 'Sin asignar';
    }

    if (field.type === 'date') {
        return formatDate(record[field.name]);
    }

    if (field.type === 'datetime-local') {
        return formatDateTime(record[field.name]);
    }

    if (field.type === 'select') {
        return titleize(record[field.name]);
    }

    if (field.name === 'probabilidad') {
        return `${record[field.name] ?? 0}%`;
    }

    if (field.name === 'valor_estimado') {
        return formatCurrency(record[field.name]);
    }

    return record[field.name] || 'Sin dato';
}

function getSingularLabel(key) {
    if (key === 'clientes') {
        return 'cliente';
    }

    if (key === 'contactos') {
        return 'contacto';
    }

    if (key === 'oportunidades') {
        return 'oportunidad';
    }

    if (key === 'actividades') {
        return 'actividad';
    }

    return 'tarea';
}
