import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startTransition, useState } from 'react';
import { DetailPanelSkeleton, LoadingTableRows } from '../components/LoadingSkeletons';
import { createRecord, fetchCollection, fetchOptions, fetchRecord, updateRecord } from '../services/crmApi';
import { formatDateTime, titleize } from '../utils/formatters';

const defaultFilters = {
    search: '',
    role: '',
    page: 1,
    per_page: 10,
};

const defaultForm = {
    name: '',
    email: '',
    role: 'administrador',
    cliente_id: '',
    password: '',
};

export default function UserManagementPage({ currentUser }) {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState(defaultFilters);
    const [selectedId, setSelectedId] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formValues, setFormValues] = useState(defaultForm);
    const [formErrors, setFormErrors] = useState({});

    const usersQuery = useQuery({
        queryKey: ['usuarios', 'list', filters],
        queryFn: () => fetchCollection('/api/usuarios', filters),
        placeholderData: keepPreviousData,
    });

    const optionsQuery = useQuery({
        queryKey: ['crm-options'],
        queryFn: fetchOptions,
        staleTime: 60_000,
    });

    const detailQuery = useQuery({
        enabled: Boolean(selectedId),
        queryKey: ['usuarios', 'detail', selectedId],
        queryFn: () => fetchRecord('/api/usuarios', selectedId),
    });

    const saveMutation = useMutation({
        mutationFn: ({ id, payload }) =>
            id ? updateRecord('/api/usuarios', id, payload) : createRecord('/api/usuarios', payload),
        onSuccess: async (user) => {
            setFormErrors({});
            setEditingUser(null);
            setFormOpen(false);
            setSelectedId(user.id);

            await queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        },
        onError: (error) => {
            setFormErrors(error.response?.data?.errors ?? {});
        },
    });

    const users = usersQuery.data?.data ?? [];
    const meta = usersQuery.data?.meta;
    const clientOptions = (optionsQuery.data?.clientes ?? []).map((cliente) => ({
        value: String(cliente.id),
        label: cliente.empresa ?? cliente.nombre_completo,
    }));
    const selectedUser = detailQuery.data ?? users.find((item) => item.id === selectedId) ?? null;
    const showInitialUsersLoad = usersQuery.isPending && !usersQuery.data;
    const showUserDetailLoad = selectedId && detailQuery.isPending && !detailQuery.data;

    function updateFilter(name, value) {
        startTransition(() => {
            setFilters((current) => ({
                ...current,
                [name]: value,
                page: 1,
            }));
        });
    }

    function changePage(page) {
        startTransition(() => {
            setFilters((current) => ({
                ...current,
                page,
            }));
        });
    }

    function openCreateForm() {
        setEditingUser(null);
        setFormErrors({});
        setFormValues(defaultForm);
        setFormOpen(true);
    }

    function openEditForm(user) {
        setEditingUser(user);
        setFormErrors({});
        setFormValues({
            name: user.name ?? '',
            email: user.email ?? '',
            role: user.role ?? 'administrador',
            cliente_id: user.cliente_id ? String(user.cliente_id) : '',
            password: '',
        });
        setFormOpen(true);
    }

    function updateField(name, value) {
        setFormValues((current) => {
            const next = {
                ...current,
                [name]: value,
            };

            if (name === 'role' && value !== 'cliente') {
                next.cliente_id = '';
            }

            return next;
        });

        setFormErrors((current) => ({ ...current, [name]: undefined }));
    }

    function submitForm(event) {
        event.preventDefault();

        saveMutation.mutate({
            id: editingUser?.id,
            payload: {
                name: formValues.name,
                email: formValues.email,
                role: formValues.role,
                cliente_id: formValues.role === 'cliente' && formValues.cliente_id !== '' ? Number(formValues.cliente_id) : null,
                password: formValues.password || null,
            },
        });
    }

    return (
        <section className="panel-enter space-y-5">
            <div className="panel-surface overflow-hidden p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                            <label htmlFor="user-search" className="field-label">
                                Buscar
                            </label>
                            <input
                                id="user-search"
                                value={filters.search}
                                onChange={(event) => updateFilter('search', event.target.value)}
                                placeholder="Nombre o email"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="user-role" className="field-label">
                                Rol
                            </label>
                            <select
                                id="user-role"
                                value={filters.role}
                                onChange={(event) => updateFilter('role', event.target.value)}
                                className="form-input"
                            >
                                <option value="">Todos</option>
                                <option value="administrador">Administradores</option>
                                <option value="cliente">Clientes</option>
                            </select>
                        </div>
                    </div>

                    <button type="button" onClick={openCreateForm} className="primary-button">
                        Nuevo usuario
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="soft-badge">{meta ? `${meta.total} cuentas` : 'Cargando cuentas'}</span>
                    <span className="soft-badge">Roles administrados desde JoDev</span>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="panel-surface overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface)] text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Usuario</th>
                                    <th className="px-5 py-4 font-semibold">Rol</th>
                                    <th className="px-5 py-4 font-semibold">Cliente vinculado</th>
                                    <th className="px-5 py-4 font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {showInitialUsersLoad ? (
                                    <LoadingTableRows columns={4} />
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--color-muted)]">
                                            No hay usuarios que coincidan con la vista actual.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-[var(--color-line)]/60 align-top last:border-b-0 hover:bg-[var(--panel-secondary-bg)]"
                                        >
                                            <td className="px-5 py-4">
                                                <div>
                                                    <p className="font-semibold text-[var(--color-ink)]">{user.name}</p>
                                                    <p className="mt-1 text-xs text-[var(--color-muted)]">{user.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="soft-badge">{titleize(user.role)}</span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-[var(--color-muted)]">
                                                {user.cliente?.empresa ?? user.cliente?.nombre_completo ?? 'Sin vincular'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedId(user.id)}
                                                        className="table-action"
                                                    >
                                                        Ver
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditForm(user)}
                                                        className="table-action"
                                                    >
                                                        Editar
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
                                    onClick={() => changePage(meta.current_page - 1)}
                                    disabled={meta.current_page <= 1}
                                    className="table-action disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changePage(meta.current_page + 1)}
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
                    {showUserDetailLoad ? (
                        <DetailPanelSkeleton blocks={4} />
                    ) : selectedUser ? (
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                    Identidad
                                </p>
                                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                    {selectedUser.name}
                                </h3>
                                <p className="mt-2 text-sm text-[var(--color-muted)]">{selectedUser.email}</p>
                            </div>

                            <div className="grid gap-4">
                                <InfoBlock label="Rol" value={titleize(selectedUser.role)} />
                                <InfoBlock
                                    label="Cliente vinculado"
                                    value={selectedUser.cliente?.empresa ?? selectedUser.cliente?.nombre_completo ?? 'Sin vincular'}
                                />
                                <InfoBlock label="Alta" value={formatDateTime(selectedUser.created_at)} />
                                <InfoBlock
                                    label="Estado interno"
                                    value={selectedUser.id === currentUser.id ? 'Tu cuenta actual' : 'Cuenta gestionada'}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full flex-col justify-center text-center">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                Gestion de accesos
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                                Selecciona una cuenta para revisar el rol y la empresa vinculada.
                            </p>
                        </div>
                    )}
                </aside>
            </div>

            {formOpen ? (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 p-4 backdrop-blur-sm md:items-center">
                    <div className="panel-surface panel-enter max-h-[88vh] w-full max-w-3xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-6 py-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                    {editingUser ? 'Editar cuenta' : 'Nueva cuenta'}
                                </p>
                                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                    {editingUser ? editingUser.name : 'Crear usuario'}
                                </h3>
                            </div>
                            <button type="button" className="table-action" onClick={() => setFormOpen(false)}>
                                Cerrar
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="max-h-[72vh] overflow-y-auto px-6 py-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field
                                    id="user-name"
                                    label="Nombre"
                                    error={formErrors.name?.[0]}
                                    control={
                                        <input
                                            id="user-name"
                                            value={formValues.name}
                                            onChange={(event) => updateField('name', event.target.value)}
                                            className="form-input"
                                        />
                                    }
                                />
                                <Field
                                    id="user-email"
                                    label="Email"
                                    error={formErrors.email?.[0]}
                                    control={
                                        <input
                                            id="user-email"
                                            type="email"
                                            value={formValues.email}
                                            onChange={(event) => updateField('email', event.target.value)}
                                            className="form-input"
                                        />
                                    }
                                />
                                <Field
                                    id="user-role-select"
                                    label="Rol"
                                    error={formErrors.role?.[0]}
                                    control={
                                        <select
                                            id="user-role-select"
                                            value={formValues.role}
                                            onChange={(event) => updateField('role', event.target.value)}
                                            className="form-input"
                                        >
                                            <option value="administrador">Administrador</option>
                                            <option value="cliente">Cliente</option>
                                        </select>
                                    }
                                />
                                <Field
                                    id="user-cliente"
                                    label="Cliente vinculado"
                                    error={formErrors.cliente_id?.[0]}
                                    control={
                                        <select
                                            id="user-cliente"
                                            value={formValues.cliente_id}
                                            onChange={(event) => updateField('cliente_id', event.target.value)}
                                            className="form-input"
                                            disabled={formValues.role !== 'cliente'}
                                        >
                                            <option value="">
                                                {formValues.role === 'cliente' ? 'Selecciona un cliente' : 'No aplica'}
                                            </option>
                                            {clientOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    }
                                />
                                <Field
                                    id="user-password"
                                    label={editingUser ? 'Nueva contrasena' : 'Contrasena'}
                                    error={formErrors.password?.[0]}
                                    className="md:col-span-2"
                                    control={
                                        <input
                                            id="user-password"
                                            type="password"
                                            value={formValues.password}
                                            onChange={(event) => updateField('password', event.target.value)}
                                            className="form-input"
                                            placeholder={editingUser ? 'Solo si quieres cambiarla' : 'Minimo 8 caracteres'}
                                        />
                                    }
                                />
                            </div>

                            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[var(--color-line)] pt-5">
                                <button type="button" onClick={() => setFormOpen(false)} className="table-action">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saveMutation.isPending} className="primary-button disabled:opacity-50">
                                    {saveMutation.isPending ? 'Guardando...' : 'Guardar usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </section>
    );
}

function Field({ label, error, control, className = '' }) {
    return (
        <div className={className}>
            <label className="field-label">{label}</label>
            {control}
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </div>
    );
}

function InfoBlock({ label, value }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--color-line)] bg-[var(--panel-secondary-bg)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">{value}</p>
        </div>
    );
}
