import './BrowserWindow.css'

/**
 * Ventana estilo "hand-drawn browser": contenedor crema con barra superior
 * (círculos cerrar/minimizar + navegación < >) y bordes de trazo irregular.
 */
export default function BrowserWindow({
  title,
  children,
  className = '',
  overflow = false,
}) {
  return (
    <div
      className={`hw-window${overflow ? ' hw-window--overflow' : ''} ${className}`.trim()}
    >
      <div className="hw-window-bar">
        <div className="hw-window-dots" aria-hidden="true">
          <span className="hw-dot" />
          <span className="hw-dot" />
          <span className="hw-dot" />
        </div>
        {title && <span className="hw-window-title">{title}</span>}
        <div className="hw-window-nav" aria-hidden="true">
          <span className="hw-nav-btn">&lt;</span>
          <span className="hw-nav-btn">&gt;</span>
        </div>
      </div>
      <div className="hw-window-body">{children}</div>
    </div>
  )
}
