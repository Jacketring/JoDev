const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
});

const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
});

export function formatDateTime(value) {
    if (!value) {
        return 'Sin fecha';
    }

    return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value) {
    if (!value) {
        return 'Sin fecha';
    }

    return dateFormatter.format(new Date(value));
}

export function formatCurrency(value) {
    return currencyFormatter.format(Number(value || 0));
}

export function titleize(value) {
    if (!value) {
        return 'Sin definir';
    }

    return value
        .replaceAll('_', ' ')
        .split(' ')
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(' ');
}

export function toDateInputValue(value) {
    if (!value) {
        return '';
    }

    return new Date(value).toISOString().slice(0, 10);
}

export function toDateTimeInputValue(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function formatRelationLabel(primary, secondary) {
    if (!primary && !secondary) {
        return 'Sin asignar';
    }

    return [primary, secondary].filter(Boolean).join(' / ');
}
