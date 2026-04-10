export default function BrandSignature({ size = 'default', subtitle = 'Jose Development CRM' }) {
    const isHero = size === 'hero';
    const wrapperClass = isHero ? 'flex items-center gap-4' : 'flex items-center gap-3';
    const badgeClass = isHero
        ? 'flex h-16 w-16 items-center justify-center rounded-[22px] border border-[var(--panel-border)] bg-[var(--panel-secondary-bg)] shadow-[var(--panel-shadow-soft)]'
        : 'flex h-11 w-11 items-center justify-center rounded-[16px] border border-[var(--panel-border)] bg-[var(--panel-secondary-bg)] shadow-[var(--panel-shadow-soft)]';
    const iconClass = isHero ? 'h-10 w-10 text-[var(--color-accent)]' : 'h-6 w-6 text-[var(--color-accent)]';
    const titleClass = isHero
        ? 'font-[var(--font-display)] text-[2rem] font-semibold tracking-[-0.05em] text-[var(--color-ink)] md:text-[2.45rem]'
        : 'font-[var(--font-display)] text-xl font-semibold tracking-[-0.04em] text-[var(--color-ink)]';
    const subtitleClass = isHero
        ? 'text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]'
        : 'text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)]';

    return (
        <div className={wrapperClass}>
            <div className={badgeClass}>
                <svg viewBox="0 0 96 96" aria-hidden="true" className={iconClass} fill="none">
                    <path
                        d="M26 18v38c0 11 7 18 18 18 9 0 16-4 21-11"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M58 28l12 10-12 10"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M46 58l9-32"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <div>
                <p className={titleClass}>
                    <span className="text-[var(--color-ink)]">Jo</span>
                    <span className="text-[var(--color-accent)]">Dev</span>
                </p>
                <p className={subtitleClass}>{subtitle}</p>
            </div>
        </div>
    );
}
