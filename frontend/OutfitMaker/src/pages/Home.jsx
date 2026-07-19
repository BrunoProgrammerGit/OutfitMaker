import { Link } from 'react-router-dom'
import BrowserWindow from '../components/BrowserWindow'
import StatueBust from '../components/StatueBust'
import useParallax from '../lib/useParallax'
import './Home.css'

export default function Home() {
  const statueRef = useParallax(0.18)
  const statue2Ref = useParallax(0.28)

  return (
    <div className="home">
      {/* Hero — texto a la izquierda, arte rompe el marco a la derecha */}
      <section className="home-hero">
        <div ref={statueRef} className="home-hero-statue" aria-hidden="true">
          <StatueBust />
        </div>

        <BrowserWindow title="outfitmaker — inicio" className="home-hero-window" overflow>
          <span className="section-label">Tu armario, curado</span>
          <h1 className="home-title script">Vístete<br />como&nbsp;una obra<br />de arte.</h1>
          <p className="home-subtitle">
            Crea outfits, organiza tu ropa y descubre nuevas combinaciones
            con inteligencia artificial.
          </p>
          <div className="home-actions">
            <Link to="/register" className="btn btn-primary">
              Empezar gratis
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Iniciar sesión
            </Link>
          </div>
          <div className="home-tags">
            <span className="author-pill">#armario</span>
            <span className="author-pill">#outfits</span>
            <span className="author-pill">#IA</span>
          </div>
        </BrowserWindow>
      </section>

      {/* Features */}
      <section className="home-features-section">
        <div ref={statue2Ref} className="home-features-statue" aria-hidden="true">
          <StatueBust />
        </div>

        <div className="home-features">
          <Feature
            index="I"
            title="Organiza tu ropa"
            description="Clasifica prendas por tipo, color y temporada en segundos."
          />
          <Feature
            index="II"
            title="Crea outfits"
            description="Combina prendas y guarda tus looks favoritos."
          />
          <Feature
            index="III"
            title="Inspiración diaria"
            description="Recibe sugerencias de outfits según el clima y tu estilo."
          />
        </div>
      </section>
    </div>
  )
}

function Feature({ index, title, description }) {
  return (
    <BrowserWindow title={`cap. ${index.toLowerCase()}`} className="home-feature">
      <span className="home-feature-index script">{index}</span>
      <h2 className="home-feature-title">{title}</h2>
      <p className="home-feature-desc">{description}</p>
    </BrowserWindow>
  )
}
