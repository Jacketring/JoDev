import { useEffect, useState } from 'react';
import BrandSignature from '../components/BrandSignature';
import {
    buildVisualTheme,
    defaultVisualSettings,
    getVisualOptionLabel,
    normalizeVisualSettings,
    visualSettingsSections,
} from '../config/visualSettingsConfig';

export default function VisualSettingsPage({ settings, onSave, isSaving }) {
    const savedSettings = normalizeVisualSettings(settings);
    const savedSignature = JSON.stringify(savedSettings);

    const [draft, setDraft] = useState(savedSettings);

    useEffect(() => {
        setDraft(savedSettings);
    }, [savedSignature]);

    const draftSignature = JSON.stringify(draft);
    const hasChanges = draftSignature !== savedSignature;

    async function handleSubmit(event) {
        event.preventDefault();
        await onSave(draft);
    }

    return (
        <form onSubmit={handleSubmit} className="settings-grid">
            <div className="space-y-4">
                <section className="panel-surface theme-block panel-enter">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="brand-chip w-fit">Ajustes seguros</p>
                            <h2 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Personaliza JoDev sin romper el producto.
                            </h2>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                                Cada ajuste usa presets cerrados y compatibles. Puedes cambiar estructura,
                                superficies y ambiente visual manteniendo contraste, espaciado y estabilidad.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setDraft(savedSettings)}
                                disabled={!hasChanges || isSaving}
                                className="ghost-button disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Volver a guardado
                            </button>
                            <button
                                type="button"
                                onClick={() => setDraft(defaultVisualSettings)}
                                disabled={isSaving}
                                className="ghost-button disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Base JoDev
                            </button>
                            <button
                                type="submit"
                                disabled={!hasChanges || isSaving}
                                className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar ajustes'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <span className="soft-badge">{hasChanges ? 'Cambios sin guardar' : 'Tema activo'}</span>
                        <span className="soft-badge">11 controles certificados</span>
                        <span className="soft-badge">Sin riesgo para layout ni contraste</span>
                    </div>
                </section>

                {visualSettingsSections.map((section) => (
                    <section key={section.key} className="panel-surface theme-block panel-enter">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                {section.title}
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                                {section.description}
                            </p>
                        </div>

                        <div
                            className={`mt-6 grid gap-4 ${section.fields.length > 1 ? 'lg:grid-cols-2' : 'max-w-xl'}`}
                        >
                            {section.fields.map((field) => (
                                <div key={field.key} className="setting-card">
                                    <div>
                                        <p className="text-base font-semibold text-[var(--color-ink)]">
                                            {field.label}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                                            {field.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        {field.options.map((option) => {
                                            const isActive = draft[field.key] === option.value;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    aria-pressed={isActive}
                                                    onClick={() =>
                                                        setDraft((current) => ({
                                                            ...current,
                                                            [field.key]: option.value,
                                                        }))
                                                    }
                                                    className={`setting-choice ${isActive ? 'setting-choice-active' : ''}`}
                                                >
                                                    <span className="text-left">
                                                        <span className="block text-sm font-semibold text-[var(--color-ink)]">
                                                            {option.label}
                                                        </span>
                                                        <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                                                            {option.description}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <aside className="settings-sidebar space-y-4">
                <section className="panel-surface theme-block panel-enter">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                        Vista previa
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                        El panel de abajo usa tus elecciones actuales antes de guardar.
                    </p>

                    <div className="mt-5 settings-preview" style={buildVisualTheme(draft)}>
                        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                            <div className="panel-side theme-block">
                                <BrandSignature subtitle="Jose Development CRM" />

                                <div className="mt-5 flex flex-col gap-[var(--nav-gap)]">
                                    <div className="nav-pill nav-pill-stack nav-pill-active w-full">
                                        <span className="text-[15px] font-semibold text-[var(--color-ink)]">
                                            Dashboard
                                        </span>
                                        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                            Vista general
                                        </span>
                                    </div>
                                    <div className="nav-pill nav-pill-stack w-full">
                                        <span className="text-[15px] font-semibold text-[var(--color-ink)]">
                                            Clientes
                                        </span>
                                        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                            Core comercial
                                        </span>
                                    </div>
                                    <div className="nav-pill nav-pill-stack w-full">
                                        <span className="text-[15px] font-semibold text-[var(--color-ink)]">
                                            Ajustes
                                        </span>
                                        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                            Visuales
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="panel-surface theme-block">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                        Resumen
                                    </p>
                                    <h3 className="mt-3 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                        Tema corporativo JoDev
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                                        Configuracion visual controlada para conservar claridad y presencia
                                        profesional.
                                    </p>
                                </div>

                                <div className="grid gap-3 md:grid-cols-3">
                                    <PreviewMetric label="Clientes" value="128" />
                                    <PreviewMetric label="Pipeline" value="42k" />
                                    <PreviewMetric label="Tareas" value="9" />
                                </div>

                                <div className="panel-surface theme-block">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                        Seleccion activa
                                    </p>
                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        {Object.entries(draft).map(([key, value]) => (
                                            <div key={key} className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                                                    {key.replaceAll('_', ' ')}
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                                                    {getVisualOptionLabel(key, value)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="panel-surface theme-block panel-enter">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                        Guardarrailes
                    </p>
                    <div className="mt-4 space-y-3">
                        <RuleCard
                            title="Contraste protegido"
                            copy="No se exponen colores libres ni combinaciones que degraden legibilidad."
                        />
                        <RuleCard
                            title="Layout estable"
                            copy="Las anchuras y densidades estan acotadas para no romper tablas ni formularios."
                        />
                        <RuleCard
                            title="Marca consistente"
                            copy="Todas las variantes siguen una linea visual corporativa y controlada."
                        />
                    </div>
                </section>
            </aside>
        </form>
    );
}

function PreviewMetric({ label, value }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-border)] bg-[var(--panel-secondary-bg)] px-4 py-4 shadow-[var(--panel-shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-3 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {value}
            </p>
        </div>
    );
}

function RuleCard({ title, copy }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-sm font-semibold text-[var(--color-ink)]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{copy}</p>
        </div>
    );
}
