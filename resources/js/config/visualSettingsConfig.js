import { getThemeModeVars } from './themeModeConfig';

export const defaultVisualSettings = {
    theme_mode: 'original',
    navigation_density: 'balanced',
    content_width: 'wide',
    interface_density: 'balanced',
    panel_style: 'glass',
    panel_contrast: 'balanced',
    corner_style: 'balanced',
    shadow_depth: 'balanced',
    accent_tone: 'sereno',
    background_scene: 'mist',
    motion_level: 'balanced',
};

export const visualSettingsSections = [
    {
        key: 'theme',
        title: 'Tema',
        description: 'Selecciona la familia visual general del CRM sin comprometer legibilidad ni estructura.',
        fields: [
            {
                key: 'theme_mode',
                label: 'Modo visual',
                description: 'Cada modo aplica una paleta completa y segura sobre JoDev.',
                options: [
                    { value: 'original', label: 'Original', description: 'La identidad azul corporativa de JoDev.' },
                    { value: 'claro', label: 'Claro', description: 'Base blanca y limpia para un aspecto sobrio.' },
                    { value: 'oscuro', label: 'Oscuro', description: 'Interfaz profunda para entornos de baja luz.' },
                    { value: 'cyberpunk', label: 'Cyberpunk', description: 'Negro y amarillo con energia tecnica.' },
                ],
            },
        ],
    },
    {
        key: 'layout',
        title: 'Estructura',
        description: 'Controla el reparto del espacio sin romper jerarquia ni legibilidad.',
        fields: [
            {
                key: 'navigation_density',
                label: 'Menu lateral',
                description: 'Ajusta el ancho del panel y la separacion de la navegacion.',
                options: [
                    { value: 'compact', label: 'Compacto', description: 'Mas contenido visible en pantalla.' },
                    { value: 'balanced', label: 'Equilibrado', description: 'Relacion estable entre menu y trabajo.' },
                    { value: 'expanded', label: 'Amplio', description: 'Mayor presencia para navegacion y marca.' },
                ],
            },
            {
                key: 'content_width',
                label: 'Anchura de trabajo',
                description: 'Define cuanto se expande el contenido principal.',
                options: [
                    { value: 'full', label: 'Completa', description: 'Aprovecha casi todo el ancho disponible.' },
                    { value: 'wide', label: 'Ancha', description: 'Mantiene amplitud con mejor control visual.' },
                    { value: 'focused', label: 'Enfocada', description: 'Mas contenida para lectura y formularios.' },
                ],
            },
            {
                key: 'interface_density',
                label: 'Densidad',
                description: 'Regula paddings y respiracion general de la interfaz.',
                options: [
                    { value: 'compact', label: 'Compacta', description: 'Mas informacion por bloque.' },
                    { value: 'balanced', label: 'Balanceada', description: 'Ritmo general recomendado.' },
                    { value: 'comfortable', label: 'Comoda', description: 'Mas aire entre paneles y secciones.' },
                ],
            },
        ],
    },
    {
        key: 'surfaces',
        title: 'Superficies',
        description: 'Solo se permiten combinaciones que conservan contraste y estabilidad visual.',
        fields: [
            {
                key: 'panel_style',
                label: 'Material',
                description: 'Cambia el caracter de tarjetas y contenedores.',
                options: [
                    { value: 'glass', label: 'Cristal', description: 'Ligero y luminoso con profundidad suave.' },
                    { value: 'solid', label: 'Solido', description: 'Mas limpio y estable para trabajo largo.' },
                    { value: 'elevated', label: 'Elevado', description: 'Mayor sensacion de capas y relieve.' },
                ],
            },
            {
                key: 'panel_contrast',
                label: 'Contraste',
                description: 'Modula bordes y separacion entre bloques.',
                options: [
                    { value: 'soft', label: 'Suave', description: 'Transiciones discretas entre paneles.' },
                    { value: 'balanced', label: 'Equilibrado', description: 'Lectura clara sin dureza visual.' },
                    { value: 'defined', label: 'Definido', description: 'Jerarquia mas marcada en listas y modulos.' },
                ],
            },
            {
                key: 'corner_style',
                label: 'Geometria',
                description: 'Ajusta el radio de tarjetas, botones y controles.',
                options: [
                    { value: 'rounded', label: 'Redondeada', description: 'Mas organica y amable.' },
                    { value: 'balanced', label: 'Balanceada', description: 'Corporativa y actual.' },
                    { value: 'refined', label: 'Refinada', description: 'Mas precisa y sobria.' },
                ],
            },
            {
                key: 'shadow_depth',
                label: 'Profundidad',
                description: 'Define cuanto relieve proyectan los contenedores.',
                options: [
                    { value: 'subtle', label: 'Sutil', description: 'Presencia minima y limpia.' },
                    { value: 'balanced', label: 'Equilibrada', description: 'Profundidad controlada.' },
                    { value: 'defined', label: 'Marcada', description: 'Capas mas evidentes sin perder orden.' },
                ],
            },
        ],
    },
    {
        key: 'atmosphere',
        title: 'Ambiente',
        description: 'Paleta, fondos y movimiento dentro de limites seguros para el producto.',
        fields: [
            {
                key: 'accent_tone',
                label: 'Acento',
                description: 'Ajusta la intensidad del color principal dentro del modo elegido.',
                options: [
                    { value: 'sereno', label: 'Sereno', description: 'Version mas suave y equilibrada.' },
                    { value: 'oceano', label: 'Oceano', description: 'Version mas tecnica y marcada.' },
                    { value: 'profundo', label: 'Profundo', description: 'Version con mayor presencia visual.' },
                ],
            },
            {
                key: 'background_scene',
                label: 'Fondo',
                description: 'Ajusta la cantidad de atmosfera del lienzo.',
                options: [
                    { value: 'clean', label: 'Limpio', description: 'Minimo ruido visual.' },
                    { value: 'mist', label: 'Niebla', description: 'Capas suaves y luminosas.' },
                    { value: 'aurora', label: 'Aurora', description: 'Mas presencia ambiental sin saturar.' },
                ],
            },
            {
                key: 'motion_level',
                label: 'Movimiento',
                description: 'Regula el nivel de transicion del sistema.',
                options: [
                    { value: 'reduced', label: 'Reducido', description: 'Interfaz mas inmediata y sobria.' },
                    { value: 'balanced', label: 'Equilibrado', description: 'Transiciones suaves recomendadas.' },
                    { value: 'expressive', label: 'Expresivo', description: 'Mayor sensacion de fluidez en cambios.' },
                ],
            },
        ],
    },
];

const optionMap = visualSettingsSections
    .flatMap((section) => section.fields)
    .reduce((map, field) => {
        map[field.key] = field.options.map((option) => option.value);
        return map;
    }, {});

export function normalizeVisualSettings(settings) {
    const input = settings ?? {};

    return Object.fromEntries(
        Object.entries(defaultVisualSettings).map(([key, defaultValue]) => {
            const allowedValues = optionMap[key] ?? [];
            const value = allowedValues.includes(input[key]) ? input[key] : defaultValue;

            return [key, value];
        }),
    );
}

export function getVisualOptionLabel(key, value) {
    const field = visualSettingsSections
        .flatMap((section) => section.fields)
        .find((item) => item.key === key);

    return field?.options.find((option) => option.value === value)?.label ?? value;
}

export function buildVisualTheme(settingsInput) {
    const settings = normalizeVisualSettings(settingsInput);

    const navigationThemes = {
        compact: {
            '--layout-sidebar-width': '228px',
            '--sidebar-padding': '0.95rem',
            '--nav-padding-x': '0.9rem',
            '--nav-padding-y': '0.75rem',
            '--nav-gap': '0.45rem',
        },
        balanced: {
            '--layout-sidebar-width': '248px',
            '--sidebar-padding': '1rem',
            '--nav-padding-x': '1rem',
            '--nav-padding-y': '0.85rem',
            '--nav-gap': '0.55rem',
        },
        expanded: {
            '--layout-sidebar-width': '286px',
            '--sidebar-padding': '1.15rem',
            '--nav-padding-x': '1.05rem',
            '--nav-padding-y': '0.95rem',
            '--nav-gap': '0.7rem',
        },
    };

    const widthThemes = {
        full: {
            '--layout-content-max': '100%',
        },
        wide: {
            '--layout-content-max': '1660px',
        },
        focused: {
            '--layout-content-max': '1440px',
        },
    };

    const densityThemes = {
        compact: {
            '--page-padding-x': '0.9rem',
            '--page-padding-y': '0.9rem',
            '--layout-gap': '0.85rem',
            '--surface-padding': '1.15rem',
            '--header-padding': '1.1rem 1.25rem',
        },
        balanced: {
            '--page-padding-x': '1rem',
            '--page-padding-y': '1rem',
            '--layout-gap': '1rem',
            '--surface-padding': '1.35rem',
            '--header-padding': '1.25rem 1.45rem',
        },
        comfortable: {
            '--page-padding-x': '1.15rem',
            '--page-padding-y': '1.15rem',
            '--layout-gap': '1.15rem',
            '--surface-padding': '1.6rem',
            '--header-padding': '1.45rem 1.6rem',
        },
    };

    const panelThemes = {
        glass: {
            '--panel-opacity': '78%',
            '--panel-side-opacity': '88%',
            '--panel-secondary-opacity': '92%',
            '--panel-blur': 'blur(18px)',
            '--nav-active-opacity': '94%',
        },
        solid: {
            '--panel-opacity': '98%',
            '--panel-side-opacity': '96%',
            '--panel-secondary-opacity': '100%',
            '--panel-blur': 'blur(4px)',
            '--nav-active-opacity': '100%',
        },
        elevated: {
            '--panel-opacity': '92%',
            '--panel-side-opacity': '90%',
            '--panel-secondary-opacity': '95%',
            '--panel-blur': 'blur(12px)',
            '--nav-active-opacity': '96%',
        },
    };

    const contrastThemes = {
        soft: {
            '--border-opacity': '72%',
            '--line-opacity': '62%',
            '--focus-opacity': '12%',
        },
        balanced: {
            '--border-opacity': '84%',
            '--line-opacity': '78%',
            '--focus-opacity': '18%',
        },
        defined: {
            '--border-opacity': '100%',
            '--line-opacity': '96%',
            '--focus-opacity': '24%',
        },
    };

    const cornerThemes = {
        rounded: {
            '--panel-radius': '34px',
            '--panel-secondary-radius': '26px',
            '--pill-radius': '999px',
        },
        balanced: {
            '--panel-radius': '30px',
            '--panel-secondary-radius': '22px',
            '--pill-radius': '999px',
        },
        refined: {
            '--panel-radius': '22px',
            '--panel-secondary-radius': '18px',
            '--pill-radius': '20px',
        },
    };

    const shadowThemes = {
        subtle: {
            '--shadow-opacity': '0.08',
            '--shadow-soft-opacity': '0.06',
        },
        balanced: {
            '--shadow-opacity': '0.12',
            '--shadow-soft-opacity': '0.09',
        },
        defined: {
            '--shadow-opacity': '0.18',
            '--shadow-soft-opacity': '0.13',
        },
    };

    const themeModeVars = getThemeModeVars(
        settings.theme_mode,
        settings.accent_tone,
        settings.background_scene,
    );

    const surfaceVars = {
        '--panel-border': `color-mix(in srgb, var(--line-base) ${contrastThemes[settings.panel_contrast]['--border-opacity']}, transparent)`,
        '--panel-line': `color-mix(in srgb, var(--line-base) ${contrastThemes[settings.panel_contrast]['--line-opacity']}, transparent)`,
        '--focus-ring': `color-mix(in srgb, var(--accent-strong) ${contrastThemes[settings.panel_contrast]['--focus-opacity']}, transparent)`,
        '--panel-surface-bg': `color-mix(in srgb, var(--panel-core) ${panelThemes[settings.panel_style]['--panel-opacity']}, transparent)`,
        '--panel-side-bg': `linear-gradient(160deg, color-mix(in srgb, var(--panel-core) ${panelThemes[settings.panel_style]['--panel-side-opacity']}, transparent), color-mix(in srgb, var(--panel-tint) ${panelThemes[settings.panel_style]['--panel-side-opacity']}, transparent))`,
        '--panel-secondary-bg': `color-mix(in srgb, var(--secondary-core) ${panelThemes[settings.panel_style]['--panel-secondary-opacity']}, transparent)`,
        '--nav-active-bg': `color-mix(in srgb, var(--panel-highlight) ${panelThemes[settings.panel_style]['--nav-active-opacity']}, transparent)`,
        '--panel-shadow': `0 22px 60px rgb(var(--shadow-rgb) / ${shadowThemes[settings.shadow_depth]['--shadow-opacity']})`,
        '--panel-shadow-soft': `0 14px 30px rgb(var(--shadow-rgb) / ${shadowThemes[settings.shadow_depth]['--shadow-soft-opacity']})`,
        '--table-head-bg': `color-mix(in srgb, var(--color-surface) 88%, transparent)`,
        '--table-head-text': 'var(--color-muted)',
        '--hero-card-bg': `color-mix(in srgb, var(--panel-highlight) 72%, transparent)`,
        '--pipeline-bar-bg': 'var(--accent-strong)',
        '--pipeline-track-bg': `color-mix(in srgb, var(--panel-highlight) 92%, var(--panel-tint))`,
    };

    const motionThemes = {
        reduced: {
            '--motion-duration': '120ms',
            '--button-lift': '0px',
            '--panel-enter-distance': '6px',
        },
        balanced: {
            '--motion-duration': '280ms',
            '--button-lift': '-1px',
            '--panel-enter-distance': '16px',
        },
        expressive: {
            '--motion-duration': '380ms',
            '--button-lift': '-2px',
            '--panel-enter-distance': '20px',
        },
    };

    return {
        ...themeModeVars,
        ...navigationThemes[settings.navigation_density],
        ...widthThemes[settings.content_width],
        ...densityThemes[settings.interface_density],
        ...surfaceVars,
        '--panel-blur': panelThemes[settings.panel_style]['--panel-blur'],
        ...cornerThemes[settings.corner_style],
        ...motionThemes[settings.motion_level],
    };
}
