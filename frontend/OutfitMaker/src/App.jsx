import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import RegisterForm from './features/auth/RegisterForm'
import './App.css'

const NEWSPAPER_TEXT =
  'Lorem ipsum dolor sit amet consectetur · Ars vestimenti classica · Anno MMXXVI · Editio matutina · Sartor est qui vestem facit · Moda et forma · '

function App() {
  return (
    <div className="app">
      {/* CAPA 2 — Tira de papel crema fija (header) */}
      <header className="paper-strip paper-strip--top">
        <div className="paper-strip-news" aria-hidden="true">
          {NEWSPAPER_TEXT.repeat(3)}
        </div>
        <div className="app-header-inner">
          <Link to="/" className="app-logo script">
            OutfitMaker
          </Link>
          <span className="author-pill">est. MMXXVI</span>
        </div>
      </header>

      {/* CAPA 3 — Contenido */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </main>

      {/* CAPA 2 — Tira de papel crema fija (footer) */}
      <footer className="paper-strip paper-strip--bottom">
        <div className="paper-strip-news" aria-hidden="true">
          {NEWSPAPER_TEXT.repeat(3)}
        </div>
        <p className="app-footer-text">OutfitMaker · Digital Neoclassical Collage</p>
      </footer>
    </div>
  )
}

export default App
