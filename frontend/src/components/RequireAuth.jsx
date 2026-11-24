import { Navigate } from 'react-router-dom'
import { useSession } from '../auth.jsx'

export default function RequireAuth({ children }) {
  const { ready, signedIn } = useSession()
  if (!ready) return <p className="page">Loading…</p>
  if (!signedIn) return <Navigate to="/sign-in" replace />
  return children
}
