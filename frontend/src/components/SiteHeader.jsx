import { UserButton } from '@clerk/react'
import { Link } from 'react-router-dom'
import { clerkKey, useSession } from '../auth.jsx'

export default function SiteHeader() {
  const { signedIn } = useSession()

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
        {signedIn ? (
          clerkKey ? <UserButton /> : null
        ) : (
          <Link className="btn btn-primary" to="/sign-in">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  )
}
