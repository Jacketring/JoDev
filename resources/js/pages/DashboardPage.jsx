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
    const metrics = data.metricas ?? {};
    const recentClients = data.clientes_recientes ?? [];
    const recentOpportunities = data.oportunidades_recientes ?? [];
    const upcomingActivities = data.actividades_proximas ?? [];
    const overdueTasks = data.tareas_vencidas ?? [];
    const clientDistribution = buildDistributionRows(data.distribuciones?.clientes_estado);
    const taskDistribution = buildDistributionRows(data.distribuciones?.tareas_estado);
    const funnelRows = data.embudo ?? [];
    const hasWorkspaceData =
        (metrics.clientes_totales ?? 0) > 0 ||
        (metrics.oportunidades_abiertas ?? 0) > 0 ||
        upcomingActivities.length > 0 ||
        overdueTasks.length > 0;

    return (
        <section className="flex min-h-[calc(100vh-12rem)] flex-col gap-4">
            <div className="grid gap-4 2xl:grid-cols-[1.3fr_0.7fr]">
                <div className="panel-side relative overflow-hidden p-6 md:p-8">
                    <div
                        className="absolute inset-y-0 right-[-12%] w-[34%] rounded-full blur-3xl"
                        style={{ background: 'color-mix(in srgb, var(--accent-strong) 16%, transparent)' }}
                    />

                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                            Vista transversal
                        </p>
                        <h2 className="mt-4 max-w-3xl font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[3.2rem]">
                            Clientes, pipeline y ejecucion operativa en una sola lectura.
                        </h2>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                            El CRM ya no se queda en una libreta de clientes: muestra oportunidades abiertas,
                            seguimiento cercano y tareas pendientes sin salir de la portada.
                        </p>

                        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <HeroStat
                                label="Clientes activos"
                                value={metrics.clientes_activos ?? 0}
                                note="Base comercial disponible"
                            />
                            <HeroStat
                                label="Base total"
                                value={metrics.clientes_totales ?? 0}
                                note="Registros visibles"
                            />
                            <HeroStat
                                label="Oportunidades abiertas"
                                value={metrics.oportunidades_abiertas ?? 0}
                                note="Pipeline vivo"
                            />
                            <HeroStat
                                label="Valor pipeline"
                                value={formatCurrency(metrics.valor_pipeline ?? 0)}
                                note="Importe abierto"
                            />
                            <HeroStat
                                label="Tareas pendientes"
                                value={metrics.tareas_pendientes ?? 0}
                                note="Pendientes y en progreso"
                            />
                            <HeroStat
                                label="Actividades proximas"
                                value={metrics.actividades_proximas ?? 0}
                                note="Seguimiento inmediato"
                            />
                        </div>
                    </div>
                </div>

                <div className="panel-surface p-6 md:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                        Acceso rapido
                    </p>

                    <div className="mt-6 grid gap-3">
                        <CompactStat label="Directorio" value="Clientes y contactos" />
                        <CompactStat label="Pipeline" value="Oportunidades" />
                        <CompactStat label="Seguimiento" value="Actividades y tareas" />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/clientes" className="primary-button">
                            Abrir clientes
                        </Link>
                        <Link to="/oportunidades" className="ghost-button">
                            Abrir pipeline
                        </Link>
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
                                El CRM esta listo para cargar entidades reales.
                            </h3>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                                Empieza por clientes, despues conecta contactos y oportunidades para activar el
                                tablero operativo completo.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/clientes" className="primary-button">
                                Crear primer cliente
                            </Link>
                            <Link to="/contactos" className="ghost-button">
                                Preparar contactos
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid flex-1 gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="grid gap-4">
                        <DualListCard
                            leftEyebrow="Clientes recientes"
                            leftTitle="Ultimas altas"
                            leftItems={recentClients}
                            renderLeft={(client) => (
                                <TimelineItem
                                    key={`client-${client.id}`}
                                    title={client.empresa ?? client.nombre_completo}
                                    subtitle={formatRelationLabel(client.nombre_completo, client.email)}
                                    meta={formatDateTime(client.created_at)}
                                    badge={titleize(client.estado)}
                                />
                            )}
                            leftEmpty="Aun no hay clientes recientes para mostrar."
                            rightEyebrow="Oportunidades recientes"
                            rightTitle="Movimientos del pipeline"
                            rightItems={recentOpportunities}
                            renderRight={(opportunity) => (
                                <TimelineItem
                                    key={`opp-${opportunity.id}`}
                                    title={opportunity.titulo}
                                    subtitle={formatRelationLabel(opportunity.cliente?.empresa, titleize(opportunity.fase))}
                                    meta={formatCurrency(opportunity.valor_estimado)}
                                    badge={titleize(opportunity.estado)}
                                />
                            )}
                            rightEmpty="Aun no hay oportunidades recientes para mostrar."
                        />

                        <DualListCard
                            leftEyebrow="Actividades proximas"
                            leftTitle="Seguimiento inmediato"
                            leftItems={upcomingActivities}
                            renderLeft={(activity) => (
                                <TimelineItem
                                    key={`activity-${activity.id}`}
                                    title={activity.asunto}
                                    subtitle={formatRelationLabel(activity.cliente?.empresa, activity.contacto?.nombre_completo)}
                                    meta={formatDateTime(activity.fecha_actividad)}
                                    badge={titleize(activity.tipo)}
                                />
                            )}
                            leftEmpty="No hay actividades cercanas pendientes."
                            rightEyebrow="Tareas vencidas"
                            rightTitle="Atascos a resolver"
                            rightItems={overdueTasks}
                            renderRight={(task) => (
                                <TimelineItem
                                    key={`task-${task.id}`}
                                    title={task.titulo}
                                    subtitle={formatRelationLabel(task.cliente?.empresa, task.contacto?.nombre_completo)}
                                    meta={formatDateTime(task.fecha_vencimiento)}
                                    badge={titleize(task.estado)}
                                />
                            )}
                            rightEmpty="No hay tareas vencidas."
                        />
                    </div>

                    <div className="grid gap-4">
                        <DistributionTableCard
                            eyebrow="Clientes por estado"
                            title="Base comercial"
                            description="Reparto actual entre clientes activos e inactivos para leer la salud de la cartera."
                            total={data.distribuciones?.clientes_estado?.total ?? 0}
                            rows={clientDistribution}
                        />

                        <DistributionTableCard
                            eyebrow="Tareas por estado"
                            title="Carga operativa"
                            description="Lectura rapida del trabajo pendiente, en progreso o cerrado dentro del CRM."
                            total={data.distribuciones?.tareas_estado?.total ?? 0}
                            rows={taskDistribution}
                        />

                        <PipelineCard rows={funnelRows} />
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

function TimelineItem({ title, subtitle, meta, badge }) {
    return (
        <div className="rounded-[24px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-semibold text-[var(--color-ink)]">{title}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">{subtitle}</p>
                </div>
                <span className="soft-badge">{badge}</span>
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {meta || 'Sin fecha'}
            </p>
        </div>
    );
}

function DualListCard({
    leftEyebrow,
    leftTitle,
    leftItems,
    renderLeft,
    leftEmpty,
    rightEyebrow,
    rightTitle,
    rightItems,
    renderRight,
    rightEmpty,
}) {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <ListCard eyebrow={leftEyebrow} title={leftTitle} items={leftItems} renderItem={renderLeft} empty={leftEmpty} />
            <ListCard eyebrow={rightEyebrow} title={rightTitle} items={rightItems} renderItem={renderRight} empty={rightEmpty} />
        </div>
    );
}

function ListCard({ eyebrow, title, items, renderItem, empty }) {
    return (
        <div className="panel-surface p-6 md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                {eyebrow}
            </p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {title}
            </h3>

            <div className="mt-6 space-y-3">
                {items.length === 0 ? (
                    <p className="text-sm leading-6 text-[var(--color-muted)]">{empty}</p>
                ) : (
                    items.map((item) => renderItem(item))
                )}
            </div>
        </div>
    );
}

function DistributionTableCard({ eyebrow, title, description, total, rows }) {
    return (
        <div className="panel-surface p-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                        {eyebrow}
                    </p>
                    <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                        {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
                </div>
                <span className="soft-badge">{total} registros</span>
            </div>

            {rows.length === 0 ? (
                <p className="mt-6 text-sm leading-6 text-[var(--color-muted)]">
                    Aun no hay datos suficientes para construir esta tabla.
                </p>
            ) : (
                <div className="mt-6 overflow-hidden rounded-[24px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="border-b border-[var(--panel-line)] bg-[color-mix(in srgb, var(--panel-secondary-bg) 82%, white)]">
                                <tr>
                                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                        Registros
                                    </th>
                                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                        Peso
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr
                                        key={row.key}
                                        className="border-b border-[var(--panel-line)]/80 align-top last:border-b-0"
                                    >
                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-[var(--color-ink)]">{row.label}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-[var(--color-ink)]">
                                            {row.total}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-[var(--color-ink)]">
                                            {row.percentage}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function PipelineCard({ rows }) {
    return (
        <div className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
                Pipeline por fase
            </p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                Valor abierto por etapa
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                Embudo resumido para detectar si el pipeline se concentra demasiado al inicio o al cierre.
            </p>

            {rows.length === 0 ? (
                <p className="mt-6 text-sm leading-6 text-[var(--color-muted)]">
                    No hay oportunidades abiertas suficientes para dibujar el pipeline.
                </p>
            ) : (
                <div className="mt-6 space-y-3">
                    {rows.map((row) => (
                        <div
                            key={row.fase}
                            className="rounded-[22px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-[var(--color-ink)]">{titleize(row.fase)}</p>
                                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                                        {row.total} oportunidades
                                    </p>
                                </div>
                                <p className="text-sm font-semibold text-[var(--color-ink)]">
                                    {formatCurrency(row.valor)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function buildDistributionRows(distribution) {
    const total = distribution?.total ?? 0;

    return (distribution?.items ?? []).map((item) => {
        const count = Number(item.total ?? 0);
        const share = total > 0 ? Math.round((count / total) * 100) : 0;

        return {
            key: item.clave,
            label: titleize(item.clave),
            total: count,
            percentage: `${share}%`,
        };
    });
}
