// Tema oscuro consistente para toda la aplicación
export const darkTheme = {
  bg: {
    primary: '#0a0a0a',
    secondary: '#1a1a1a',
    card: '#1e1e1e',
    hover: '#2a2a2a',
  },
  border: {
    default: '#2a2a2a',
    accent: '#ffd700',
    hover: '#ff8c00',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    accent: '#ffd700',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  accent: {
    yellow: '#ffd700',
    orange: '#ff8c00',
  },
  status: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
};

// Estilos de botones
export const buttonStyles = {
  primary: {
    background: darkTheme.accent.yellow,
    color: darkTheme.bg.primary,
    border: `2px solid ${darkTheme.accent.yellow}`,
  },
  primaryHover: {
    background: darkTheme.accent.orange,
    borderColor: darkTheme.accent.orange,
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)',
  },
  secondary: {
    background: darkTheme.bg.hover,
    color: darkTheme.text.secondary,
    border: `2px solid ${darkTheme.border.default}`,
  },
  disabled: {
    background: darkTheme.bg.hover,
    color: '#666666',
    border: `2px solid ${darkTheme.border.default}`,
    cursor: 'not-allowed',
  },
};

// Estilos de inputs
export const inputStyles = {
  default: {
    background: darkTheme.bg.secondary,
    border: `2px solid ${darkTheme.border.default}`,
    color: darkTheme.text.primary,
  },
  focus: {
    borderColor: darkTheme.border.accent,
    boxShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
  },
};

// Estilos de cards
export const cardStyles = {
  default: {
    background: darkTheme.bg.card,
    border: `2px solid ${darkTheme.border.default}`,
  },
  active: {
    background: darkTheme.bg.card,
    border: `2px solid ${darkTheme.border.accent}`,
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
  },
  hit: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: `2px solid ${darkTheme.status.success}`,
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
  },
  miss: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: `2px solid ${darkTheme.status.error}`,
    boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
  },
};

// Estilos de mensajes paso a paso
export const stepStyles = {
  info: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: `2px solid ${darkTheme.status.info}`,
  },
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: `2px solid ${darkTheme.status.success}`,
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: `2px solid ${darkTheme.status.error}`,
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    border: `2px solid ${darkTheme.status.warning}`,
  },
};
