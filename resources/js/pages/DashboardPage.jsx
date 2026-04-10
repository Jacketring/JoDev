import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DashboardSkeleton } from '../components/LoadingSkeletons';
import { fetchDashboard } from '../services/crmApi';
import { formatCurrency, formatDateTime, formatRelationLabel, titleize } from '../utils/formatters';

export default function DashboardPage() {
    const dashboardQuery = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
    });

    if (dashboardQuery.isPending) {
        return <DashboardSkeleton />;
    }

    const data = dashboardQuery.data;
    const hasWorkspaceData =
        data.metricas.clientes_activos > 0 ||
        data.metricas.oportunidades_abiertas > 0 ||
        data.metricas.tareas_pendientes > 0 ||
        data.metricas.actividades_proximas > 0 ||
        data.metricas.valor_pipeline > 0 ||
        data.embudo.length > 0 ||
        data.tareas_vencidas.length > 0 ||
        data.actividades_proximas.length > 0 ||
        data.oportunidades_recientes.length > 0;

    const attentionItems = [
        ...data.tareas_vencidas.slice(0, 3).map((item) => ({
            id: `task-${item.id}`,
            label: 'Tarea vencida',
            title: item.titulo,
            subtitle: formatRelationLabel(
                item.cliente?.empresa ?? item.cliente?.nombre_completo,
                item.contacto?.nombre_completo,
            ),
            meta: formatDateTime(item.fecha_vencimiento),
        })),
        ...data.actividades_proximas.slice(0, 3).map((item) => ({
            id: `activity-${item.id}`,
            label: titleize(item.tipo),
            title: item.asunto,
            subtitle: item.cliente?.empresa ?? item.cliente?.nombre_completo ?? 'Sin cliente',
            meta: formatDateTime(item.fecha_actividad),
        })),
    ].slice(0, 5);

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
                            Resumen ejecutivo
                        </p>
                        <h2 className="mt-4 max-w-2xl font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[3.2rem]">
                            Estado comercial en una sola vista.
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                            Menos bloques, menos ruido y mas foco en lo que importa: base activa, pipeline y
                            seguimiento inmediato.
                        </p>

                        <div className="mt-8 grid gap-3 md:grid-cols-3">
                            <HeroStat
                                label="Clientes activos"
                                value={data.metricas.clientes_activos}
                                note="Base comercial operativa"
                            />
                            <HeroStat
                                label="Pipeline abierto"
                                value={formatCurrency(data.metricas.valor_pipeline)}
                                note="Valor total en curso"
                            />
                            <HeroStat
                                label="Tareas pendientes"
                                value={data.metricas.tareas_pendientes}
                                note="Seguimiento por resolver"
                            />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <span className="soft-badge">
                                {data.metricas.oportunidades_abiertas} oportunidades abiertas
                            </span>
                            <span className="soft-badge">
                                {data.metricas.actividades_proximas} actividades proximas
                            </span>
                            <span className="soft-badge">{data.embudo.length} fases activas</span>
                        </div>
                    </div>
                </div>

                <div className="panel-surface p-6 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                        Ritmo del dia
                    </p>

                    <div className="mt-6 grid gap-3">
                        <CompactStat
                            label="Oportunidades abiertas"
                            value={data.metricas.oportunidades_abiertas}
                        />
                        <CompactStat
                            label="Actividades proximas"
                            value={data.metricas.actividades_proximas}
                        />
                        <CompactStat
                            label="Tareas vencidas"
                            value={data.tareas_vencidas.length}
                        />
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
                                No hay datos cargados todavia. Empieza creando la base comercial y el dashboard
                                se ira llenando solo con actividad real.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/clientes" className="primary-button">
                                Crear primer cliente
                            </Link>
                            <Link to="/oportunidades" className="ghost-button">
                                Crear oportunidad
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
                                    Pipeline
                                </p>
                                <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                    Distribucion por fase
                                </h3>
                            </div>
                            <span className="soft-badge">{data.embudo.length} activas</span>
                        </div>

                        <div className="mt-6 space-y-4">
                            {data.embudo.length === 0 ? (
                                <p className="text-sm leading-6 text-[var(--color-muted)]">
                                    Aun no hay movimiento en el pipeline.
                                </p>
                            ) : (
                                data.embudo.map((fase) => (
                                    <PipelineRow
                                        key={fase.fase}
                                        label={titleize(fase.fase)}
                                        count={fase.total}
                                        value={formatCurrency(fase.valor)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="panel-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                                Atencion inmediata
                            </p>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Agenda y alertas
                            </h3>

                            <div className="mt-6 space-y-3">
                                {attentionItems.length === 0 ? (
                                    <p className="text-sm leading-6 text-[var(--color-muted)]">
                                        No hay alertas ni actividad inmediata en este momento.
                                    </p>
                                ) : (
                                    attentionItems.map((item) => (
                                        <TimelineItem
                                            key={item.id}
                                            label={item.label}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            meta={item.meta}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="panel-surface p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                                Movimiento reciente
                            </p>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Ultimas oportunidades
                            </h3>

                            <div className="mt-6 space-y-3">
                                {data.oportunidades_recientes.length === 0 ? (
                                    <p className="text-sm leading-6 text-[var(--color-muted)]">
                                        Aun no hay oportunidades registradas.
                                    </p>
                                ) : (
                                    data.oportunidades_recientes.slice(0, 4).map((item) => (
                                        <TimelineItem
                                            key={item.id}
                                            label={titleize(item.fase)}
                                            title={item.titulo}
                                            subtitle={
                                                item.cliente?.empresa ??
                                                item.cliente?.nombre_completo ??
                                                'Sin cliente'
                                            }
                                            meta={formatCurrency(item.valor_estimado)}
                                        />
                                    ))
                                )}
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

function PipelineRow({ label, count, value }) {
    return (
        <div className="rounded-[26px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-semibold text-[var(--color-ink)]">{label}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{count} oportunidades</p>
                </div>
                <p className="font-[var(--font-display)] text-xl font-semibold text-[var(--color-accent)]">
                    {value}
                </p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--pipeline-track-bg)]">
                <div
                    className="h-full rounded-full bg-[var(--pipeline-bar-bg)]"
                    style={{ width: `${Math.max(10, Math.min(100, count * 14))}%` }}
                />
            </div>
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
