import { Link, NavLink } from 'react-router-dom'

export default function AppShell({ children, rail }) {
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
          <strong>Sarah Miller</strong>
          <span>sarah.miller@email.com</span>
        </div>
      </aside>
      {children}
      {rail}
    </div>
  )
}
