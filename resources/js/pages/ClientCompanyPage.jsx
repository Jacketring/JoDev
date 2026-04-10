import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { CompanyPageSkeleton } from '../components/LoadingSkeletons';
import { fetchRecord, updateRecord } from '../services/crmApi';
import { formatRelationLabel, titleize } from '../utils/formatters';

const editableFields = [
    { name: 'empresa', label: 'Empresa', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'telefono', label: 'Telefono', type: 'text' },
    { name: 'movil', label: 'Movil', type: 'text' },
    { name: 'direccion', label: 'Direccion', type: 'text', className: 'md:col-span-2' },
    { name: 'ciudad', label: 'Ciudad', type: 'text' },
    { name: 'provincia', label: 'Provincia', type: 'text' },
    { name: 'codigo_postal', label: 'Codigo postal', type: 'text' },
    { name: 'pais', label: 'Pais', type: 'text' },
    { name: 'web', label: 'Web', type: 'url' },
    { name: 'notas', label: 'Notas', type: 'textarea', className: 'md:col-span-2' },
];

export default function ClientCompanyPage({ user }) {
    const queryClient = useQueryClient();
    const [values, setValues] = useState(createEmptyForm());
    const [errors, setErrors] = useState({});

    const companyQuery = useQuery({
        enabled: Boolean(user.cliente_id),
        queryKey: ['cliente-propio', user.cliente_id],
        queryFn: () => fetchRecord('/api/clientes', user.cliente_id),
    });

    useEffect(() => {
        if (companyQuery.data) {
            setValues(createFormState(companyQuery.data));
        }
    }, [companyQuery.data]);

    const saveMutation = useMutation({
        mutationFn: (payload) => updateRecord('/api/clientes', user.cliente_id, payload),
        onSuccess: async (record) => {
            setErrors({});
            setValues(createFormState(record));

            queryClient.setQueryData(['auth', 'user'], (currentUser) =>
                currentUser
                    ? {
                          ...currentUser,
                          cliente: {
                              ...currentUser.cliente,
                              id: record.id,
                              empresa: record.empresa,
                              nombre_completo: record.nombre_completo,
                              estado: record.estado,
                          },
                      }
                    : currentUser,
            );

            await queryClient.invalidateQueries({ queryKey: ['cliente-propio', user.cliente_id] });
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            await queryClient.invalidateQueries({ queryKey: ['crm-options'] });
        },
        onError: (error) => {
            setErrors(error.response?.data?.errors ?? {});
        },
    });

    if (!user.cliente_id) {
        return (
            <div className="panel-surface p-8">
                <p className="brand-chip">Mi empresa</p>
                <h2 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                    Tu cuenta no tiene empresa vinculada.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                    Pide a un administrador que relacione esta cuenta con un cliente para activar esta vista.
                </p>
            </div>
        );
    }

    if (companyQuery.isPending) {
        return <CompanyPageSkeleton />;
    }

    const company = companyQuery.data;

    function updateField(name, value) {
        setValues((current) => ({
            ...current,
            [name]: value,
        }));

        setErrors((current) => ({ ...current, [name]: undefined }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        saveMutation.mutate({
            nombre: company.nombre,
            apellidos: company.apellidos,
            empresa: values.empresa,
            email: values.email,
            telefono: values.telefono,
            movil: values.movil,
            direccion: values.direccion,
            ciudad: values.ciudad,
            provincia: values.provincia,
            codigo_postal: values.codigo_postal,
            pais: values.pais,
            web: values.web,
            origen: company.origen,
            estado: company.estado,
            notas: values.notas,
        });
    }

    return (
        <section className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
                <div className="panel-side p-6">
                    <p className="brand-chip">Ficha cliente</p>
                    <h2 className="mt-4 font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                        {company.empresa ?? company.nombre_completo}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                        Mantienes actualizados los datos visibles de tu empresa sin tocar la estructura interna del CRM.
                    </p>

                    <div className="mt-6 grid gap-3">
                        <InfoCard label="Representante" value={company.nombre_completo} />
                        <InfoCard label="Estado comercial" value={titleize(company.estado)} />
                        <InfoCard label="Origen" value={titleize(company.origen ?? 'directo')} />
                        <InfoCard
                            label="Contacto principal"
                            value={formatRelationLabel(company.telefono, company.email)}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="panel-surface p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                                Datos editables
                            </p>
                            <h3 className="mt-2 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                                Informacion corporativa y canales de contacto
                            </h3>
                        </div>

                        <button type="submit" disabled={saveMutation.isPending} className="primary-button disabled:opacity-50">
                            {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {editableFields.map((field) => (
                            <div key={field.name} className={field.className ?? ''}>
                                <label className="field-label" htmlFor={`company-${field.name}`}>
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        id={`company-${field.name}`}
                                        value={values[field.name] ?? ''}
                                        onChange={(event) => updateField(field.name, event.target.value)}
                                        className="form-input min-h-28"
                                    />
                                ) : (
                                    <input
                                        id={`company-${field.name}`}
                                        type={field.type}
                                        value={values[field.name] ?? ''}
                                        onChange={(event) => updateField(field.name, event.target.value)}
                                        className="form-input"
                                    />
                                )}
                                {errors[field.name] ? (
                                    <p className="mt-2 text-sm text-red-600">{errors[field.name][0]}</p>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </form>
            </div>
        </section>
    );
}

function createEmptyForm() {
    return Object.fromEntries(editableFields.map((field) => [field.name, '']));
}

function createFormState(record) {
    return {
        empresa: record.empresa ?? '',
        email: record.email ?? '',
        telefono: record.telefono ?? '',
        movil: record.movil ?? '',
        direccion: record.direccion ?? '',
        ciudad: record.ciudad ?? '',
        provincia: record.provincia ?? '',
        codigo_postal: record.codigo_postal ?? '',
        pais: record.pais ?? '',
        web: record.web ?? '',
        notas: record.notas ?? '',
    };
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">{value || 'Sin dato'}</p>
        </div>
    );
}
