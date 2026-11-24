import { UserButton } from '@clerk/react'
import { Link, NavLink } from 'react-router-dom'
import { clerkKey, useSession } from '../auth.jsx'

export default function AppShell({ children, rail }) {
  const { user } = useSession()
  const email = user?.primaryEmailAddress?.emailAddress || ''
  const name = user?.fullName || user?.username || email || 'Signed in'

  return (
    <div className={`app-shell ${rail ? '' : 'app-shell-wide'}`}>
      <aside className="side">
        <Link to="/" className="wordmark">
          <span className="mark">Q</span>
          Quadra Calendar
        </Link>
        <nav aria-label="App">
          <NavLink to="/calendar" className={({ isActive }) => (isActive ? 'active' : '')}>
            Calendar
          </NavLink>
          <NavLink to="/import" className={({ isActive }) => (isActive ? 'active' : '')}>
            Import events
          </NavLink>
          <NavLink to="/invitations" className={({ isActive }) => (isActive ? 'active' : '')}>
            Invitations
          </NavLink>
        </nav>
        <div className="side-user">
          <strong>{name}</strong>
          <span>{email}</span>
          {clerkKey && <UserButton />}
        </div>
      </aside>
      {children}
      {rail}
    </div>
  )
}
