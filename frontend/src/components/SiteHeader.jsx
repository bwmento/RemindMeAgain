import { Link } from 'react-router-dom'

export default function SiteHeader() {
  return (
    <header className="nav">
      <Link to="/" className="wordmark">
        <span className="mark">Q</span>
        Quadra Calendar
      </Link>
      <nav className="nav-links" aria-label="Primary">
        <Link className="btn btn-ghost" to="/calendar">
          Calendar
        </Link>
        <Link className="btn btn-ghost" to="/import">
          Import
        </Link>
        <Link className="btn btn-outline" to="/calendar">
          Open app
        </Link>
        <Link className="btn btn-primary" to="/calendar">
          Sign in
        </Link>
      </nav>
    </header>
  )
}
