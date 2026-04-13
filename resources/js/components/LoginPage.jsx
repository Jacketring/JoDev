import { useState } from 'react';
import BrandSignature from './BrandSignature';

export default function LoginPage({ onSubmit, isPending, error }) {
    const [values, setValues] = useState({
        email: '',
        password: '',
        remember: true,
    });

    const message =
        error?.response?.data?.errors?.email?.[0] ??
        error?.response?.data?.message ??
        null;

    function updateField(name, value) {
        setValues((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        await onSubmit(values);
    }

    return (
        <div className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[-8%] top-[-10%] h-80 w-80 rounded-full bg-[rgba(151,190,214,0.38)] blur-3xl" />
                <div className="absolute right-[-4%] top-[10%] h-[26rem] w-[26rem] rounded-full bg-[rgba(195,221,237,0.62)] blur-3xl" />
                <div className="absolute bottom-[-12%] left-[28%] h-[28rem] w-[28rem] rounded-full bg-[rgba(127,174,200,0.18)] blur-3xl" />
            </div>

            <div className="relative mx-auto grid max-w-[1280px] gap-5 lg:grid-cols-[1.08fr_0.92fr]">
                <section className="panel-side panel-enter flex min-h-[320px] flex-col justify-between overflow-hidden p-6 md:p-8 lg:min-h-[calc(100vh-3rem)] lg:p-10">
                    <div>
                        <BrandSignature size="hero" />

                        <div className="mt-12 max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                                Plataforma comercial
                            </p>
                            <h1 className="mt-5 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[3.7rem] md:leading-[1.02]">
                                Gestion comercial con presencia, control y continuidad.
                            </h1>
                            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
                                JoDev concentra clientes, accesos y configuracion del entorno en un espacio sobrio,
                                claro y preparado para trabajo real.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 rounded-[30px] border border-white/75 bg-[linear-gradient(160deg,rgba(244,248,251,0.78),rgba(230,240,247,0.92))] p-6 shadow-[0_22px_44px_rgba(103,155,183,0.12)]">
                        <div className="grid gap-6 md:grid-cols-3">
                            <BrandFact
                                label="Identidad"
                                value="JoDev"
                                note="Marca, clientes y operaciones bajo un unico acceso corporativo."
                            />
                            <BrandFact
                                label="Entorno"
                                value="Privado"
                                note="Uso exclusivo para usuarios autorizados dentro de la organizacion."
                            />
                            <BrandFact
                                label="Cobertura"
                                value="CRM"
                                note="Clientes, accesos y ajustes visuales dentro de la misma plataforma."
                            />
                        </div>
                    </div>
                </section>

                <section className="panel-surface panel-enter overflow-hidden p-6 md:p-8 lg:min-h-[calc(100vh-3rem)] lg:p-10">
                    <div className="flex h-full flex-col justify-center">
                        <div className="max-w-md">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                                Acceso corporativo
                            </p>
                            <h2 className="mt-5 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
                                Accede a JoDev
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">
                                Introduce tus credenciales para entrar en la plataforma y continuar tu trabajo.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-10 max-w-md space-y-5">
                            <div>
                                <label className="field-label" htmlFor="email">
                                    Email corporativo
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={values.email}
                                    onChange={(event) => updateField('email', event.target.value)}
                                    className="form-input"
                                    autoComplete="username"
                                    placeholder="tu@jodev.es"
                                />
                            </div>

                            <div>
                                <label className="field-label" htmlFor="password">
                                    Contrasena
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={values.password}
                                    onChange={(event) => updateField('password', event.target.value)}
                                    className="form-input"
                                    autoComplete="current-password"
                                    placeholder="Introduce tu contrasena"
                                />
                            </div>

                            <label className="inline-flex items-center gap-3 text-sm text-[var(--color-muted)]">
                                <input
                                    type="checkbox"
                                    checked={values.remember}
                                    onChange={(event) => updateField('remember', event.target.checked)}
                                />
                                <span>Mantener sesion en este equipo</span>
                            </label>

                            {message ? (
                                <div className="rounded-[22px] border border-[rgba(103,155,183,0.26)] bg-[rgba(244,248,251,0.92)] px-4 py-3 text-sm text-[var(--color-ink)]">
                                    {message}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isPending ? 'Accediendo...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="mt-8 max-w-md rounded-[24px] border border-[var(--color-line)] bg-white/55 px-5 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                                Acceso restringido
                            </p>
                            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                                Plataforma reservada para usuarios autorizados de JoDev. Si necesitas acceso,
                                solicita tus credenciales al administrador.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function BrandFact({ label, value, note }) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-3 font-[var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
                {value}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {note}
            </p>
        </div>
    );
}
