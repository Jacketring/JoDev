import { Suspense, lazy, useDeferredValue, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { moduleConfigs, moduleOrder } from '../config/crmConfig';
import { buildVisualTheme, normalizeVisualSettings } from '../config/visualSettingsConfig';
import {
    fetchGlobalSearch,
    fetchVisualSettings,
    updateVisualSettings,
} from '../services/crmApi';
import BrandSignature from './BrandSignature';
import {
    DashboardSkeleton,
    EntityRouteSkeleton,
    SettingsRouteSkeleton,
} from './LoadingSkeletons';

const EntityPage = lazy(() => import('./EntityPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const UserManagementPage = lazy(() => import('../pages/UserManagementPage'));
const VisualSettingsPage = lazy(() => import('../pages/VisualSettingsPage'));

const sectionMeta = {
    dashboard: {
        title: 'Dashboard',
        eyebrow: 'JoDev CRM',
        description: 'Vista transversal del pipeline, seguimiento operativo y acceso rapido a cada entidad del CRM.',
    },
    ajustes: {
        title: 'Ajustes visuales',
        eyebrow: 'Workspace seguro',
        description: 'Personaliza densidad, superficies y ambiente con presets cerrados que respetan marca y legibilidad.',
    },
    usuarios: {
        title: 'Usuarios',
        eyebrow: 'Accesos y roles',
        description: 'Controla administradores, cuentas cliente y la vinculacion de cada acceso con su empresa.',
    },
};

export default function AppShell({ user, onLogout, logoutPending }) {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [globalSearch, setGlobalSearch] = useState('');
    const deferredGlobalSearch = useDeferredValue(globalSearch.trim());

    const visualSettingsQuery = useQuery({
        queryKey: ['visual-settings'],
        queryFn: fetchVisualSettings,
        initialData: normalizeVisualSettings(user.visual_preferences),
        staleTime: 300_000,
    });

    const visualSettingsMutation = useMutation({
        mutationFn: updateVisualSettings,
        onSuccess: (settings) => {
            const normalizedSettings = normalizeVisualSettings(settings);

            queryClient.setQueryData(['visual-settings'], normalizedSettings);
            queryClient.setQueryData(['auth', 'user'], (currentUser) =>
                currentUser
                    ? {
                          ...currentUser,
                          visual_preferences: normalizedSettings,
                      }
                    : currentUser,
            );
        },
    });

    const globalSearchQuery = useQuery({
        enabled: deferredGlobalSearch.length >= 2,
        queryKey: ['global-search', deferredGlobalSearch],
        queryFn: () => fetchGlobalSearch({ q: deferredGlobalSearch, limit: 4 }),
        staleTime: 30_000,
    });

    useEffect(() => {
        setGlobalSearch('');
    }, [location.pathname, location.search]);

    const visualSettings = normalizeVisualSettings(visualSettingsQuery.data);
    const sectionKey = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
    const section = sectionMeta[sectionKey] ?? moduleConfigs[sectionKey] ?? sectionMeta.dashboard;
    const searchReady = globalSearch.trim().length >= 2;

    function handleGlobalResultSelect(url) {
        navigate(url);
        setGlobalSearch('');
    }

    return (
        <div className="workspace-theme" style={buildVisualTheme(visualSettings)}>
            <div className="workspace-shell">
                <div className="workspace-grid">
                    <aside className="panel-side workspace-side">
                        <BrandSignature />

                        <div className="mt-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                Navegacion
                            </p>

                            <nav className="mt-3 flex flex-col gap-[var(--nav-gap)]">
                                <NavigationLink to="/dashboard" label="Dashboard" hint="Vista general" />
                                {moduleOrder.map((key) => (
                                    <NavigationLink
                                        key={key}
                                        to={`/${key}`}
                                        label={moduleConfigs[key].title}
                                        hint={moduleConfigs[key].eyebrow}
                                    />
                                ))}
                                {user.role === 'administrador' ? (
                                    <NavigationLink to="/usuarios" label="Usuarios" hint="Accesos" />
                                ) : null}
                                <NavigationLink to="/ajustes" label="Ajustes" hint="Visuales" />
                            </nav>
                        </div>

                        <div className="mt-auto border-t border-[var(--panel-line)] pt-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                Sesion
                            </p>
                            <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">{user.name}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted)]">{user.email}</p>
                            <p className="mt-3">
                                <span className="soft-badge">
                                    {user.role === 'administrador' ? 'Administrador' : 'Cliente'}
                                </span>
                            </p>

                            <button
                                type="button"
                                onClick={onLogout}
                                disabled={logoutPending}
                                className="ghost-button mt-4 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {logoutPending ? 'Cerrando...' : 'Cerrar sesion'}
                            </button>
                        </div>
                    </aside>

                    <main className="workspace-main">
                        <div className="panel-surface workspace-header">
                            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                        {section.eyebrow}
                                    </p>
                                    <h1 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
                                        {section.title}
                                    </h1>
                                    <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                                        {section.description}
                                    </p>
                                </div>

                                <div className="relative w-full max-w-2xl">
                                    <label
                                        htmlFor="global-search"
                                        className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]"
                                    >
                                        Buscador global
                                    </label>

                                    <div className="mt-3 flex items-center gap-3 rounded-[26px] border border-[var(--color-line)] bg-[var(--panel-secondary-bg)] px-4 py-3">
                                        <input
                                            id="global-search"
                                            value={globalSearch}
                                            onChange={(event) => setGlobalSearch(event.target.value)}
                                            placeholder="Busca en clientes, contactos, oportunidades, actividades y tareas"
                                            className="w-full bg-transparent text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
                                        />
                                        {globalSearch ? (
                                            <button
                                                type="button"
                                                onClick={() => setGlobalSearch('')}
                                                className="table-action"
                                            >
                                                Limpiar
                                            </button>
                                        ) : null}
                                    </div>

                                    {globalSearch.trim() ? (
                                        <div className="absolute inset-x-0 top-[calc(100%+0.8rem)] z-40 overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--panel-shadow-soft)]">
                                            <GlobalSearchPanel
                                                isReady={searchReady}
                                                isLoading={globalSearchQuery.isFetching}
                                                results={globalSearchQuery.data?.results ?? []}
                                                total={globalSearchQuery.data?.total ?? 0}
                                                onSelect={handleGlobalResultSelect}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="workspace-route">
                            <Routes>
                                <Route path="/" element={<Navigate replace to="/dashboard" />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <Suspense fallback={<DashboardSkeleton />}>
                                            <DashboardPage />
                                        </Suspense>
                                    }
                                />
                                <Route
                                    path="/usuarios"
                                    element={
                                        user.role === 'administrador' ? (
                                            <Suspense fallback={<EntityRouteSkeleton columns={4} />}>
                                                <UserManagementPage currentUser={user} />
                                            </Suspense>
                                        ) : (
                                            <Navigate replace to="/dashboard" />
                                        )
                                    }
                                />
                                <Route
                                    path="/ajustes"
                                    element={
                                        <Suspense fallback={<SettingsRouteSkeleton />}>
                                            <VisualSettingsPage
                                                settings={visualSettings}
                                                onSave={(payload) =>
                                                    visualSettingsMutation.mutateAsync(payload)
                                                }
                                                isSaving={visualSettingsMutation.isPending}
                                            />
                                        </Suspense>
                                    }
                                />
                                {moduleOrder.map((key) => (
                                    <Route
                                        key={key}
                                        path={`/${key}`}
                                        element={
                                            <Suspense
                                                fallback={
                                                    <EntityRouteSkeleton
                                                        columns={moduleConfigs[key].columns.length + 1}
                                                    />
                                                }
                                            >
                                                <EntityPage config={moduleConfigs[key]} />
                                            </Suspense>
                                        }
                                    />
                                ))}
                                <Route path="*" element={<Navigate replace to="/dashboard" />} />
                            </Routes>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

function NavigationLink({ to, label, hint }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `nav-pill nav-pill-stack w-full ${isActive ? 'nav-pill-active' : ''}`}
        >
            <span className="text-[15px] font-semibold text-[var(--color-ink)]">{label}</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {hint}
            </span>
        </NavLink>
    );
}

function GlobalSearchPanel({ isReady, isLoading, results, total, onSelect }) {
    if (!isReady) {
        return (
            <div className="px-5 py-4 text-sm text-[var(--color-muted)]">
                Escribe al menos 2 caracteres para buscar en todo el CRM.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="px-5 py-4 text-sm text-[var(--color-muted)]">
                Buscando coincidencias en todas las entidades...
            </div>
        );
    }

    if (total === 0) {
        return (
            <div className="px-5 py-4 text-sm text-[var(--color-muted)]">
                No hay coincidencias con esa busqueda.
            </div>
        );
    }

    return (
        <div className="max-h-[28rem] overflow-y-auto px-3 py-3">
            <div className="px-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {total} resultados visibles
            </div>

            {results.map((section) => (
                <div key={section.entity} className="mb-2 last:mb-0">
                    <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {section.label}
                    </p>

                    <div className="space-y-2">
                        {section.items.map((item) => (
                            <button
                                key={`${item.entity}-${item.id}`}
                                type="button"
                                onClick={() => onSelect(item.url)}
                                className="flex w-full items-start justify-between gap-3 rounded-[22px] border border-[var(--color-line)] bg-[var(--panel-secondary-bg)] px-4 py-3 text-left transition hover:bg-[var(--color-surface)]"
                            >
                                <div>
                                    <p className="font-semibold text-[var(--color-ink)]">{item.title}</p>
                                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                                        {item.subtitle || 'Sin detalle secundario'}
                                    </p>
                                </div>
                                <span className="soft-badge">{item.meta}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
