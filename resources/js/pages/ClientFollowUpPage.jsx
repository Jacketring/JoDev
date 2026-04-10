import { useQuery } from '@tanstack/react-query';
import { fetchCollection } from '../services/crmApi';
import { formatCurrency, formatDateTime, titleize } from '../utils/formatters';

export default function ClientFollowUpPage() {
    const opportunitiesQuery = useQuery({
        queryKey: ['client-follow-up', 'oportunidades'],
        queryFn: () =>
            fetchCollection('/api/oportunidades', {
                per_page: 6,
            }),
    });

    const activitiesQuery = useQuery({
        queryKey: ['client-follow-up', 'actividades'],
        queryFn: () =>
            fetchCollection('/api/actividades', {
                per_page: 6,
            }),
    });

    const tasksQuery = useQuery({
        queryKey: ['client-follow-up', 'tareas'],
        queryFn: () =>
            fetchCollection('/api/tareas', {
                per_page: 6,
            }),
    });

    const loading =
        opportunitiesQuery.isPending || activitiesQuery.isPending || tasksQuery.isPending;

    if (loading) {
        return (
            <div className="panel-surface p-8 text-sm text-[var(--color-muted)]">
                Cargando seguimiento comercial...
            </div>
        );
    }

    const opportunities = opportunitiesQuery.data?.data ?? [];
    const activities = activitiesQuery.data?.data ?? [];
    const tasks = tasksQuery.data?.data ?? [];

    return (
        <section className="space-y-5">
            <div className="panel-surface p-6">
                <p className="brand-chip">Seguimiento</p>
                <h2 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Todo el contexto de tu cuenta en una sola vista.
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                    Esta zona no te deja reconfigurar el CRM, pero si revisar con claridad lo que esta abierto,
                    lo que viene en agenda y lo que necesita atencion.
                </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
                <FollowColumn
                    title="Oportunidades"
                    eyebrow="Pipeline"
                    emptyMessage="No hay oportunidades visibles para tu cuenta."
                    items={opportunities}
                    renderItem={(item) => (
                        <FollowCard
                            key={item.id}
                            label={titleize(item.fase)}
                            title={item.titulo}
                            meta={`${formatCurrency(item.valor_estimado)} · ${item.probabilidad}%`}
                            secondary={titleize(item.estado)}
                        />
                    )}
                />
                <FollowColumn
                    title="Actividades"
                    eyebrow="Agenda"
                    emptyMessage="No hay actividades registradas."
                    items={activities}
                    renderItem={(item) => (
                        <FollowCard
                            key={item.id}
                            label={titleize(item.tipo)}
                            title={item.asunto}
                            meta={formatDateTime(item.fecha_actividad)}
                            secondary={item.completada ? 'Completada' : 'Pendiente'}
                        />
                    )}
                />
                <FollowColumn
                    title="Tareas"
                    eyebrow="Operativa"
                    emptyMessage="No hay tareas visibles para tu cuenta."
                    items={tasks}
                    renderItem={(item) => (
                        <FollowCard
                            key={item.id}
                            label={titleize(item.prioridad)}
                            title={item.titulo}
                            meta={formatDateTime(item.fecha_vencimiento)}
                            secondary={titleize(item.estado)}
                        />
                    )}
                />
            </div>
        </section>
    );
}

function FollowColumn({ eyebrow, title, items, emptyMessage, renderItem }) {
    return (
        <div className="panel-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                {eyebrow}
            </p>
            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {title}
            </h3>

            <div className="mt-6 space-y-3">
                {items.length === 0 ? (
                    <p className="text-sm leading-6 text-[var(--color-muted)]">{emptyMessage}</p>
                ) : (
                    items.map(renderItem)
                )}
            </div>
        </div>
    );
}

function FollowCard({ label, title, meta, secondary }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                {label}
            </p>
            <p className="mt-2 font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{meta || 'Sin fecha'}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {secondary}
            </p>
        </div>
    );
}
