import { Link } from 'react-router-dom';
import { titleize } from '../utils/formatters';

export default function ClientDashboardPage({ user }) {
    if (!user.cliente_id) {
        return (
            <div className="panel-surface p-8">
                <p className="brand-chip">Portal cliente</p>
                <h2 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Tu cuenta aun no tiene empresa vinculada.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                    Un administrador debe asociar esta cuenta a un cliente para activar el portal.
                </p>
            </div>
        );
    }

    const companyName = user.cliente?.empresa ?? user.cliente?.nombre_completo ?? 'Tu empresa';
    const companyState = titleize(user.cliente?.estado ?? 'activo');

    return (
        <section className="space-y-5">
            <div className="panel-side relative overflow-hidden p-7 md:p-8">
                <div
                    className="absolute inset-y-0 right-[-10%] w-[36%] rounded-full blur-3xl"
                    style={{ background: 'color-mix(in srgb, var(--accent-strong) 18%, transparent)' }}
                />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <p className="brand-chip">Portal cliente</p>
                        <h2 className="mt-4 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)]">
                            Acceso centrado en {companyName}.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">
                            Este portal queda reducido a la ficha principal de tu empresa y a tus ajustes
                            personales, sin exponer la operativa interna del CRM.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
                        <QuickAction
                            to="/mi-empresa"
                            title="Mi empresa"
                            copy="Actualiza datos corporativos y canales de contacto."
                        />
                        <QuickAction
                            to="/ajustes"
                            title="Ajustes"
                            copy="Personaliza el entorno visual de tu cuenta."
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Empresa vinculada" value={companyName} />
                <MetricCard label="Estado comercial" value={companyState} />
                <MetricCard label="Areas visibles" value="Portal, empresa y ajustes" />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="panel-surface p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                        Resumen de cuenta
                    </p>
                    <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                        Tu espacio visible en JoDev
                    </h3>

                    <div className="mt-6 grid gap-3">
                        <InfoCard label="Empresa" value={companyName} />
                        <InfoCard label="Usuario de acceso" value={user.name} />
                        <InfoCard label="Email" value={user.email} />
                        <InfoCard label="Rol" value="Cliente" />
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="panel-surface p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                            Producto visible
                        </p>
                        <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                            Acceso simplificado
                        </h3>

                        <div className="mt-6 space-y-3">
                            <FeedCard
                                label="Ficha"
                                title="Mi empresa"
                                meta="Datos corporativos y contacto principal"
                            />
                            <FeedCard
                                label="Preferencias"
                                title="Ajustes"
                                meta="Personalizacion visual segura"
                            />
                        </div>
                    </div>

                    <div className="panel-surface p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                            Siguiente paso
                        </p>
                        <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                            Mantener la ficha al dia
                        </h3>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/mi-empresa" className="primary-button">
                                Abrir mi empresa
                            </Link>
                            <Link to="/ajustes" className="ghost-button">
                                Abrir ajustes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function MetricCard({ label, value }) {
    return (
        <div className="panel-surface px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-3 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {value}
            </p>
        </div>
    );
}

function QuickAction({ to, title, copy }) {
    return (
        <Link
            to={to}
            className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-border)] bg-[var(--panel-secondary-bg)] px-4 py-4 shadow-[var(--panel-shadow-soft)] transition hover:-translate-y-[1px]"
        >
            <p className="font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{copy}</p>
        </Link>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">{value}</p>
        </div>
    );
}

function FeedCard({ label, title, meta }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                {label}
            </p>
            <p className="mt-2 font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {meta}
            </p>
        </div>
    );
}
