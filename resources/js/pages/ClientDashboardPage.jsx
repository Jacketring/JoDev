import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../services/crmApi';
import { formatCurrency, formatDateTime, titleize } from '../utils/formatters';

export default function ClientDashboardPage({ user }) {
    const dashboardQuery = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
    });

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

    if (dashboardQuery.isPending) {
        return (
            <div className="panel-surface p-8 text-sm text-[var(--color-muted)]">
                Cargando tu resumen comercial...
            </div>
        );
    }

    const data = dashboardQuery.data;
    const companyName = user.cliente?.empresa ?? user.cliente?.nombre_completo ?? 'Tu empresa';

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
                            Seguimiento claro para {companyName}.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">
                            Aqui ves el estado comercial de tu cuenta, el pipeline abierto y las proximas
                            interacciones preparadas por JoDev.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
                        <QuickAction
                            to="/mi-empresa"
                            title="Mi empresa"
                            copy="Actualiza datos de contacto y presencia corporativa."
                        />
                        <QuickAction
                            to="/seguimiento"
                            title="Seguimiento"
                            copy="Consulta oportunidades, actividades y tareas de tu cuenta."
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
                <MetricCard label="Oportunidades abiertas" value={data.metricas.oportunidades_abiertas} />
                <MetricCard label="Valor en pipeline" value={formatCurrency(data.metricas.valor_pipeline)} />
                <MetricCard label="Actividades proximas" value={data.metricas.actividades_proximas} />
                <MetricCard label="Tareas pendientes" value={data.metricas.tareas_pendientes} />
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="panel-surface p-6">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                Pipeline
                            </p>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Estado de tus oportunidades
                            </h3>
                        </div>
                        <span className="soft-badge">{data.embudo.length} fases activas</span>
                    </div>

                    <div className="mt-6 space-y-3">
                        {data.embudo.length === 0 ? (
                            <p className="text-sm leading-6 text-[var(--color-muted)]">
                                No hay oportunidades abiertas ahora mismo.
                            </p>
                        ) : (
                            data.embudo.map((fase) => (
                                <div
                                    key={fase.fase}
                                    className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-[var(--color-ink)]">
                                                {titleize(fase.fase)}
                                            </p>
                                            <p className="mt-1 text-sm text-[var(--color-muted)]">
                                                {fase.total} oportunidades
                                            </p>
                                        </div>
                                        <p className="font-[var(--font-display)] text-xl font-semibold text-[var(--accent-strong)]">
                                            {formatCurrency(fase.valor)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="panel-surface p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                            Agenda
                        </p>
                        <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                            Proximas actividades
                        </h3>

                        <div className="mt-6 space-y-3">
                            {data.actividades_proximas.length === 0 ? (
                                <p className="text-sm leading-6 text-[var(--color-muted)]">
                                    No hay actividades proximas en agenda.
                                </p>
                            ) : (
                                data.actividades_proximas.slice(0, 4).map((item) => (
                                    <FeedCard
                                        key={item.id}
                                        label={titleize(item.tipo)}
                                        title={item.asunto}
                                        meta={formatDateTime(item.fecha_actividad)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="panel-surface p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                            Alertas
                        </p>
                        <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                            Tareas que requieren atencion
                        </h3>

                        <div className="mt-6 space-y-3">
                            {data.tareas_vencidas.length === 0 ? (
                                <p className="text-sm leading-6 text-[var(--color-muted)]">
                                    No hay tareas vencidas para tu cuenta.
                                </p>
                            ) : (
                                data.tareas_vencidas.slice(0, 4).map((item) => (
                                    <FeedCard
                                        key={item.id}
                                        label={titleize(item.prioridad)}
                                        title={item.titulo}
                                        meta={formatDateTime(item.fecha_vencimiento)}
                                    />
                                ))
                            )}
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
        <Link to={to} className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-border)] bg-[var(--panel-secondary-bg)] px-4 py-4 shadow-[var(--panel-shadow-soft)] transition hover:-translate-y-[1px]">
            <p className="font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{copy}</p>
        </Link>
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
