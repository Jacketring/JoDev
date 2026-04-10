export function LoadingLine({ className = '' }) {
    return <div aria-hidden="true" className={`loading-skeleton ${className}`.trim()} />;
}

export function LoadingBlock({ className = '' }) {
    return (
        <div
            aria-hidden="true"
            className={`loading-skeleton loading-skeleton-block ${className}`.trim()}
        />
    );
}

export function MetricGridSkeleton({ count = 4, className = '' }) {
    return (
        <div className={`grid gap-4 md:grid-cols-2 2xl:grid-cols-4 ${className}`.trim()}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={`metric-skeleton-${index}`} className="panel-surface px-5 py-5">
                    <LoadingLine className="h-3 w-28" />
                    <LoadingLine className="mt-4 h-10 w-24" />
                    <LoadingLine className="mt-3 h-3 w-32" />
                </div>
            ))}
        </div>
    );
}

export function FeedCardsSkeleton({ cards = 4 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: cards }).map((_, index) => (
                <div
                    key={`feed-skeleton-${index}`}
                    className="rounded-[var(--panel-secondary-radius)] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4"
                >
                    <LoadingLine className="h-3 w-24" />
                    <LoadingLine className="mt-3 h-5 w-2/3" />
                    <LoadingLine className="mt-2 h-4 w-1/2" />
                    <LoadingLine className="mt-3 h-3 w-28" />
                </div>
            ))}
        </div>
    );
}

export function LoadingTableRows({ columns, rows = 6 }) {
    return Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
            key={`table-skeleton-row-${rowIndex}`}
            className="border-b border-[var(--color-line)]/60 align-top last:border-b-0"
        >
            {Array.from({ length: columns }).map((_, columnIndex) => (
                <td key={`table-skeleton-cell-${rowIndex}-${columnIndex}`} className="px-5 py-4">
                    <LoadingLine
                        className={`h-4 ${
                            columnIndex === 0 ? 'w-3/4' : columnIndex === columns - 1 ? 'w-20' : 'w-24'
                        }`}
                    />
                    {columnIndex === 0 ? <LoadingLine className="mt-2 h-3 w-1/2" /> : null}
                </td>
            ))}
        </tr>
    ));
}

export function DetailPanelSkeleton({ blocks = 5 }) {
    return (
        <div className="space-y-6">
            <div>
                <LoadingLine className="h-3 w-24" />
                <LoadingLine className="mt-3 h-8 w-3/4" />
                <LoadingLine className="mt-3 h-4 w-full" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                {Array.from({ length: blocks }).map((_, index) => (
                    <div
                        key={`detail-skeleton-${index}`}
                        className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3"
                    >
                        <LoadingLine className="h-3 w-24" />
                        <LoadingLine className="mt-3 h-4 w-5/6" />
                        <LoadingLine className="mt-2 h-4 w-2/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <section className="flex min-h-[calc(100vh-12rem)] flex-col gap-4">
            <div className="grid gap-4 2xl:grid-cols-[1.35fr_0.65fr]">
                <div className="panel-side p-6 md:p-8">
                    <LoadingLine className="h-3 w-28" />
                    <LoadingLine className="mt-5 h-12 w-4/5" />
                    <LoadingLine className="mt-3 h-4 w-full" />
                    <LoadingLine className="mt-2 h-4 w-3/4" />

                    <div className="mt-8 grid gap-3 md:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`hero-metric-skeleton-${index}`}
                                className="rounded-[26px] border border-[var(--panel-border)] bg-[var(--hero-card-bg)] p-4 shadow-[var(--panel-shadow-soft)]"
                            >
                                <LoadingLine className="h-3 w-24" />
                                <LoadingLine className="mt-4 h-10 w-20" />
                                <LoadingLine className="mt-3 h-3 w-28" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <LoadingLine className="h-8 w-40" />
                        <LoadingLine className="h-8 w-36" />
                        <LoadingLine className="h-8 w-32" />
                    </div>
                </div>

                <div className="panel-surface p-6 md:p-7">
                    <LoadingLine className="h-3 w-24" />
                    <div className="mt-6 grid gap-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={`compact-stat-skeleton-${index}`}
                                className="rounded-[24px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] px-4 py-4"
                            >
                                <LoadingLine className="h-3 w-32" />
                                <LoadingLine className="mt-3 h-10 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid flex-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="panel-surface p-6 md:p-7">
                    <LoadingLine className="h-3 w-20" />
                    <LoadingLine className="mt-3 h-8 w-56" />
                    <div className="mt-6 space-y-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={`pipeline-skeleton-${index}`}
                                className="rounded-[26px] border border-[var(--panel-line)] bg-[var(--panel-secondary-bg)] p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="w-full max-w-[14rem]">
                                        <LoadingLine className="h-4 w-32" />
                                        <LoadingLine className="mt-2 h-3 w-24" />
                                    </div>
                                    <LoadingLine className="h-5 w-20" />
                                </div>
                                <LoadingBlock className="mt-4 h-2 w-full" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="panel-surface p-6">
                        <LoadingLine className="h-3 w-28" />
                        <LoadingLine className="mt-3 h-8 w-48" />
                        <div className="mt-6">
                            <FeedCardsSkeleton cards={3} />
                        </div>
                    </div>

                    <div className="panel-surface p-6">
                        <LoadingLine className="h-3 w-32" />
                        <LoadingLine className="mt-3 h-8 w-52" />
                        <div className="mt-6">
                            <FeedCardsSkeleton cards={3} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function EntityRouteSkeleton({ columns = 5 }) {
    return (
        <section className="panel-enter space-y-5">
            <div className="panel-surface overflow-hidden p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={`filter-skeleton-${index}`}>
                                <LoadingLine className="mb-3 h-3 w-20" />
                                <LoadingBlock className="h-11 w-full" />
                            </div>
                        ))}
                    </div>

                    <LoadingLine className="h-11 w-36" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <LoadingLine className="h-3 w-36" />
                    <LoadingLine className="h-3 w-28" />
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="panel-surface overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
                                <tr>
                                    {Array.from({ length: columns }).map((_, index) => (
                                        <th key={`entity-head-skeleton-${index}`} className="px-5 py-4">
                                            <LoadingLine className="h-3 w-20" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <LoadingTableRows columns={columns} />
                            </tbody>
                        </table>
                    </div>
                </div>

                <aside className="panel-surface min-h-[320px] p-5">
                    <DetailPanelSkeleton />
                </aside>
            </div>
        </section>
    );
}

export function SettingsRouteSkeleton() {
    return (
        <div className="settings-grid">
            <div className="space-y-4">
                <section className="panel-surface theme-block panel-enter">
                    <LoadingLine className="h-8 w-32" />
                    <LoadingLine className="mt-5 h-10 w-3/4" />
                    <LoadingLine className="mt-4 h-4 w-full" />
                    <LoadingLine className="mt-2 h-4 w-5/6" />
                    <div className="mt-6 flex flex-wrap gap-2">
                        <LoadingLine className="h-10 w-36" />
                        <LoadingLine className="h-10 w-28" />
                        <LoadingLine className="h-10 w-32" />
                    </div>
                </section>

                {Array.from({ length: 2 }).map((_, index) => (
                    <section key={`settings-skeleton-${index}`} className="panel-surface theme-block panel-enter">
                        <LoadingLine className="h-3 w-28" />
                        <LoadingLine className="mt-3 h-4 w-full" />
                        <LoadingLine className="mt-2 h-4 w-4/5" />

                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                            {Array.from({ length: 2 }).map((_, optionIndex) => (
                                <div key={`settings-card-skeleton-${index}-${optionIndex}`} className="setting-card">
                                    <LoadingLine className="h-4 w-32" />
                                    <LoadingLine className="mt-3 h-4 w-full" />
                                    <div className="mt-4 grid gap-2">
                                        {Array.from({ length: 3 }).map((_, choiceIndex) => (
                                            <LoadingBlock
                                                key={`settings-choice-skeleton-${index}-${optionIndex}-${choiceIndex}`}
                                                className="h-20 w-full"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <aside className="settings-sidebar space-y-4">
                <section className="panel-surface theme-block panel-enter">
                    <LoadingLine className="h-3 w-24" />
                    <LoadingLine className="mt-3 h-4 w-full" />
                    <LoadingBlock className="mt-5 h-[24rem] w-full" />
                </section>
            </aside>
        </div>
    );
}

export function ClientDashboardSkeleton() {
    return (
        <section className="space-y-5">
            <div className="panel-side p-7 md:p-8">
                <LoadingLine className="h-8 w-28" />
                <LoadingLine className="mt-5 h-12 w-4/5" />
                <LoadingLine className="mt-4 h-4 w-full" />
                <LoadingLine className="mt-2 h-4 w-2/3" />

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:w-[360px] xl:grid-cols-1">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <LoadingBlock key={`client-action-skeleton-${index}`} className="h-24 w-full" />
                    ))}
                </div>
            </div>

            <MetricGridSkeleton />

            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="panel-surface p-6">
                    <LoadingLine className="h-3 w-20" />
                    <LoadingLine className="mt-3 h-8 w-56" />
                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <LoadingBlock key={`client-pipeline-skeleton-${index}`} className="h-24 w-full" />
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    <div className="panel-surface p-6">
                        <LoadingLine className="h-3 w-20" />
                        <LoadingLine className="mt-3 h-8 w-48" />
                        <div className="mt-6">
                            <FeedCardsSkeleton cards={3} />
                        </div>
                    </div>

                    <div className="panel-surface p-6">
                        <LoadingLine className="h-3 w-20" />
                        <LoadingLine className="mt-3 h-8 w-56" />
                        <div className="mt-6">
                            <FeedCardsSkeleton cards={3} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function CompanyPageSkeleton() {
    return (
        <section className="space-y-5">
            <div className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
                <div className="panel-side p-6">
                    <LoadingLine className="h-8 w-24" />
                    <LoadingLine className="mt-5 h-10 w-3/4" />
                    <LoadingLine className="mt-4 h-4 w-full" />
                    <LoadingLine className="mt-2 h-4 w-5/6" />

                    <div className="mt-6 grid gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <LoadingBlock key={`company-info-skeleton-${index}`} className="h-20 w-full" />
                        ))}
                    </div>
                </div>

                <div className="panel-surface p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="w-full max-w-[26rem]">
                            <LoadingLine className="h-3 w-28" />
                            <LoadingLine className="mt-3 h-8 w-full" />
                        </div>
                        <LoadingLine className="h-11 w-40" />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div key={`company-field-skeleton-${index}`} className={index === 4 || index === 9 ? 'md:col-span-2' : ''}>
                                <LoadingLine className="mb-3 h-3 w-24" />
                                <LoadingBlock className={`w-full ${index === 9 ? 'h-28' : 'h-11'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FollowUpColumnSkeleton({ cards = 4 }) {
    return (
        <div className="panel-surface p-6">
            <LoadingLine className="h-3 w-24" />
            <LoadingLine className="mt-3 h-8 w-40" />
            <div className="mt-6">
                <FeedCardsSkeleton cards={cards} />
            </div>
        </div>
    );
}
