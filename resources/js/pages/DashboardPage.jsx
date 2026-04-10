import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../components/LoadingSkeletons';
import { fetchDashboard } from '../services/crmApi';
import { formatDateTime, formatRelationLabel, titleize } from '../utils/formatters';

export default function DashboardPage() {
    const dashboardQuery = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
    });

    if (dashboardQuery.isPending) {
        return <DashboardSkeleton />;
    }

    const data = dashboardQuery.data;
    const recentClients = data.clientes_recientes ?? [];
    const activeClients = data.metricas.clientes_activos ?? 0;
    const hasWorkspaceData = activeClients > 0 || recentClients.length > 0;

    return (
        <section className="flex min-h-[calc(100vh-12rem)] flex-col gap-4">
            <div className="grid gap-4 2xl:grid-cols-[1.35fr_0.65fr]">
                <div className="panel-side relative overflow-hidden p-6 md:p-8">
                    <div
                        className="absolute inset-y-0 right-[-12%] w-[34%] rounded-full blur-3xl"
                        style={{ background: 'color-mix(in srgb, var(--accent-strong) 16%, transparent)' }}
                    />

                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                            Resumen operativo
                        </p>
                        <h2 className="mt-4 max-w-2xl font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[3.2rem]">
                            El CRM queda centrado en clientes y control interno.
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                            Menos ruido visual y un flujo mas directo: base de clientes, gestion de accesos y
                            configuracion del entorno.
                        </p>

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            <HeroStat
                                label="Clientes activos"
                                value={activeClients}
                                note="Base comercial disponible"
                            />
                            <HeroStat
                                label="Registros recientes"
                                value={recentClients.length}
                                note="Ultimas altas visibles"
                            />
                            <HeroStat
                                label="Modulos visibles"
                                value="3"
                                note="Clientes, usuarios y ajustes"
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <span className="soft-badge">Clientes</span>
                            <span className="soft-badge">Usuarios</span>
                            <span className="soft-badge">Ajustes</span>
                        </div>
                    </div>
                </div>

                <div className="panel-surface p-6 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                        Ruta actual
                    </p>

                    <div className="mt-6 grid gap-3">
                        <CompactStat label="Vista principal" value="Clientes" />
                        <CompactStat label="Accesos internos" value="Usuarios" />
                        <CompactStat label="Configuracion" value="Ajustes" />
                    </div>
                </div>
            </div>

            {!hasWorkspaceData ? (
                <div className="flex flex-1">
                    <div className="panel-surface flex flex-1 flex-col justify-between p-8 md:p-10">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                                Espacio preparado
                            </p>
                            <h3 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                                El CRM esta listo para empezar.
                            </h3>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                                No hay clientes cargados todavia. Empieza creando la base principal y gestiona los
                                accesos desde el modulo de usuarios.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/clientes" className="primary-button">
                                Crear primer cliente
                            </Link>
                            <Link to="/usuarios" className="ghost-button">
                                Revisar usuarios
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid flex-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="panel-surface p-6 md:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                                    Clientes recientes
                                </p>
                                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                    Ultimos registros incorporados
                                </h3>
                            </div>
                            <span className="soft-badge">{recentClients.length} visibles</span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {recentClients.length === 0 ? (
                                <p className="text-sm leading-6 text-[var(--color-muted)]">
                                    Aun no hay clientes recientes para mostrar.
                                </p>
                            ) : (
                                recentClients.map((client) => (
                                    <ClientTimelineItem
                                        key={client.id}
                                        title={client.empresa ?? client.nombre_completo}
                                        subtitle={formatRelationLabel(client.nombre_completo, client.email)}
                                        meta={formatDateTime(client.created_at)}
                                        status={titleize(client.estado)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="panel-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                                Enfoque activo
                            </p>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Producto simplificado
                            </h3>

                            <div className="mt-6 space-y-3">
                                <TimelineItem
                                    label="Modulo principal"
                                    title="Clientes"
                                    subtitle="La operativa visible se concentra en la base comercial."
                                    meta="Directorio activo"
                                />
                                <TimelineItem
                                    label="Control interno"
                                    title="Usuarios"
                                    subtitle="Los accesos y roles siguen disponibles para administracion."
                                    meta="Accesos"
                                />
                                <TimelineItem
                                    label="Personalizacion"
                                    title="Ajustes"
                                    subtitle="El entorno visual permanece accesible sin tocar datos operativos."
                                    meta="Preferencias"
                                />
                            </div>
                        </div>

                        <div className="panel-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                                Acciones rapidas
                            </p>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Siguiente paso
                            </h3>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link to="/clientes" className="primary-button">
                                    Abrir clientes
                                </Link>
                                <Link to="/usuarios" className="ghost-button">
                                    Abrir usuarios
                                </Link>
                                <Link to="/ajustes" className="ghost-button">
                                    Abrir ajustes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function HeroStat({ label, value, note }) {
    return (
        <div className="rounded-[26px] border border-[var(--panel-border)] bg-[var(--hero-card-bg)] p-4 shadow-[var(--panel-shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-3 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {value}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{note}</p>
        </div>
    );
}

function CompactStat({ label, value }) {
    return (
        <div className="rounded-[24px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {value}
            </p>
        </div>
    );
}

function ClientTimelineItem({ title, subtitle, meta, status }) {
    return (
        <div className="rounded-[24px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-[var(--color-ink)]">{title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
                </div>
                <span className="soft-badge">{status}</span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {meta || 'Sin fecha'}
            </p>
        </div>
    );
}

function TimelineItem({ label, title, subtitle, meta }) {
    return (
        <div className="rounded-[24px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                {label}
            </p>
            <p className="mt-2 font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {meta}
            </p>
        </div>
    );
}
