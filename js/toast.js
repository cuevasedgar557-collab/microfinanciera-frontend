// Toast Component - Notificaciones no intrusivas
class Toast {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Crear contenedor si no existe
    if (!document.getElementById('toast-container')) {
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
      this.container = container;
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      word-wrap: break-word;
      white-space: pre-wrap;
    `;

    // Colores según tipo
    const config = {
      success: {
        bg: '#d4edda',
        border: '#c3e6cb',
        color: '#155724',
        icon: '✓'
      },
      error: {
        bg: '#f8d7da',
        border: '#f5c6cb',
        color: '#721c24',
        icon: '✕'
      },
      warning: {
        bg: '#fff3cd',
        border: '#ffeeba',
        color: '#856404',
        icon: '⚠'
      },
      info: {
        bg: '#d1ecf1',
        border: '#bee5eb',
        color: '#0c5460',
        icon: 'ℹ'
      }
    };

    const cfg = config[type] || config.info;

    toast.style.backgroundColor = cfg.bg;
    toast.style.border = `2px solid ${cfg.border}`;
    toast.style.color = cfg.color;

    // Contenido
    const icon = document.createElement('span');
    icon.textContent = cfg.icon;
    icon.style.cssText = `
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
    `;

    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = `
      flex: 1;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: ${cfg.color};
      padding: 0;
      margin-left: 8px;
      flex-shrink: 0;
    `;

    closeBtn.onclick = () => this.remove(toast);

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(closeBtn);

    this.container.appendChild(toast);

    // Auto-remove
    const timeout = setTimeout(() => {
      this.remove(toast);
    }, duration);

    toast.onmouseenter = () => clearTimeout(timeout);
    toast.onmouseleave = () => {
      setTimeout(() => this.remove(toast), duration);
    };

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

// Instancia global
const toast = new Toast();

// Función global para usar en toda la app
function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
  toast.show(mensaje, tipo, duracion);
}

// Estilos globales para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
