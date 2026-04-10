import { Suspense, lazy } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { buildVisualTheme, normalizeVisualSettings } from '../config/visualSettingsConfig';
import { fetchVisualSettings, updateVisualSettings } from '../services/crmApi';
import BrandSignature from './BrandSignature';
import {
    ClientDashboardSkeleton,
    CompanyPageSkeleton,
    SettingsRouteSkeleton,
} from './LoadingSkeletons';

const ClientCompanyPage = lazy(() => import('../pages/ClientCompanyPage'));
const ClientDashboardPage = lazy(() => import('../pages/ClientDashboardPage'));
const VisualSettingsPage = lazy(() => import('../pages/VisualSettingsPage'));

const sectionMeta = {
    dashboard: {
        title: 'Portal cliente',
        eyebrow: 'Tu cuenta',
        description: 'Resumen limpio de tu empresa vinculada, acceso a la ficha principal y ajustes personales.',
    },
    'mi-empresa': {
        title: 'Mi empresa',
        eyebrow: 'Ficha corporativa',
        description: 'Actualiza tus datos de contacto y presencia digital sin tocar la estructura interna del CRM.',
    },
    ajustes: {
        title: 'Ajustes visuales',
        eyebrow: 'Preferencias personales',
        description: 'Personaliza el entorno sin alterar la estructura ni la coherencia visual del portal.',
    },
};

export default function ClientShell({ user, onLogout, logoutPending }) {
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
    const companyName = user.cliente?.empresa ?? user.cliente?.nombre_completo ?? 'Cuenta cliente';

    return (
        <div className="workspace-theme" style={buildVisualTheme(visualSettings)}>
            <div className="client-shell">
                <header className="client-masthead panel-side">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="max-w-3xl">
                            <BrandSignature size="hero" subtitle="Portal de cliente" />
                            <h1 className="mt-6 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[3.4rem]">
                                Un acceso limpio para revisar tu empresa sin entrar en la operativa interna.
                            </h1>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                                Tu espacio queda centrado en {companyName}: la ficha principal de la cuenta y tus
                                ajustes personales de visualizacion.
                            </p>
                        </div>

                        <div className="client-account-card">
                            <p className="brand-chip">Cuenta cliente</p>
                            <p className="mt-4 text-lg font-semibold text-[var(--color-ink)]">{user.name}</p>
                            <p className="mt-1 text-sm text-[var(--color-muted)]">{user.email}</p>
                            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                Empresa vinculada
                            </p>
                            <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{companyName}</p>
                            <button
                                type="button"
                                onClick={onLogout}
                                disabled={logoutPending}
                                className="ghost-button mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {logoutPending ? 'Cerrando...' : 'Cerrar sesion'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="client-nav-wrap">
                    <nav className="panel-surface client-nav">
                        <ClientNavLink to="/dashboard" label="Portal" hint="Resumen" />
                        <ClientNavLink to="/mi-empresa" label="Mi empresa" hint="Ficha" />
                        <ClientNavLink to="/ajustes" label="Ajustes" hint="Visuales" />
                    </nav>
                </div>

                <div className="panel-surface client-route-shell">
                    <Routes>
                        <Route path="/" element={<Navigate replace to="/dashboard" />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ClientSection sectionKey="dashboard">
                                    <Suspense fallback={<ClientDashboardSkeleton />}>
                                        <ClientDashboardPage user={user} />
                                    </Suspense>
                                </ClientSection>
                            }
                        />
                        <Route
                            path="/mi-empresa"
                            element={
                                <ClientSection sectionKey="mi-empresa">
                                    <Suspense fallback={<CompanyPageSkeleton />}>
                                        <ClientCompanyPage user={user} />
                                    </Suspense>
                                </ClientSection>
                            }
                        />
                        <Route
                            path="/ajustes"
                            element={
                                <ClientSection sectionKey="ajustes">
                                    <Suspense fallback={<SettingsRouteSkeleton />}>
                                        <VisualSettingsPage
                                            settings={visualSettings}
                                            onSave={(payload) => visualSettingsMutation.mutateAsync(payload)}
                                            isSaving={visualSettingsMutation.isPending}
                                        />
                                    </Suspense>
                                </ClientSection>
                            }
                        />
                        <Route path="*" element={<Navigate replace to="/dashboard" />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

function ClientSection({ sectionKey, children }) {
    const section = sectionMeta[sectionKey] ?? sectionMeta.dashboard;

    return (
        <div className="space-y-5">
            <div className="client-section-header">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                    {section.eyebrow}
                </p>
                <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
                        {section.title}
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
                        {section.description}
                    </p>
                </div>
            </div>

            {children}
        </div>
    );
}

function ClientNavLink({ to, label, hint }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `nav-pill nav-pill-stack client-nav-pill ${isActive ? 'nav-pill-active' : ''}`
            }
        >
            <span className="text-[15px] font-semibold text-[var(--color-ink)]">{label}</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {hint}
            </span>
        </NavLink>
    );
}
