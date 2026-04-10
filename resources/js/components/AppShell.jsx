import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { moduleConfigs, moduleOrder } from '../config/crmConfig';
import {
    buildVisualTheme,
    normalizeVisualSettings,
} from '../config/visualSettingsConfig';
import {
    fetchVisualSettings,
    updateVisualSettings,
} from '../services/crmApi';
import BrandSignature from './BrandSignature';
import EntityPage from './EntityPage';
import DashboardPage from '../pages/DashboardPage';
import UserManagementPage from '../pages/UserManagementPage';
import VisualSettingsPage from '../pages/VisualSettingsPage';

const sectionMeta = {
    dashboard: {
        title: 'Dashboard',
        eyebrow: 'JoDev CRM',
        description: 'Vista general del estado comercial, el pipeline y las prioridades del momento.',
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
    const queryClient = useQueryClient();

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

    const visualSettings = normalizeVisualSettings(visualSettingsQuery.data);
    const sectionKey = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
    const section = sectionMeta[sectionKey] ?? moduleConfigs[sectionKey] ?? sectionMeta.dashboard;

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
                                <span className="soft-badge">{user.role === 'administrador' ? 'Administrador' : 'Cliente'}</span>
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
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                        {section.eyebrow}
                                    </p>
                                    <h1 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
                                        {section.title}
                                    </h1>
                                </div>

                                <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                                    {section.description}
                                </p>
                            </div>
                        </div>

                        <div className="workspace-route">
                            <Routes>
                                <Route path="/" element={<Navigate replace to="/dashboard" />} />
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route
                                    path="/usuarios"
                                    element={
                                        user.role === 'administrador' ? (
                                            <UserManagementPage currentUser={user} />
                                        ) : (
                                            <Navigate replace to="/dashboard" />
                                        )
                                    }
                                />
                                <Route
                                    path="/ajustes"
                                    element={
                                        <VisualSettingsPage
                                            settings={visualSettings}
                                            onSave={(payload) =>
                                                visualSettingsMutation.mutateAsync(payload)
                                            }
                                            isSaving={visualSettingsMutation.isPending}
                                        />
                                    }
                                />
                                {moduleOrder.map((key) => (
                                    <Route
                                        key={key}
                                        path={`/${key}`}
                                        element={<EntityPage config={moduleConfigs[key]} />}
                                    />
                                ))}
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
