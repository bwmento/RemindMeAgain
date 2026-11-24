import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from '../auth.jsx'
import AppShell from '../components/AppShell.jsx'
import { api } from '../lib/api.js'
import { formatDateTime } from '../lib/dates.js'

export default function InvitationsPage() {
  const { getToken } = useSession()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken
  const [invitations, setInvitations] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const token = await getTokenRef.current()
    const data = await api('/api/invitations', { token })
    setInvitations(data.invitations)
    setError('')
  }, [])

  useEffect(() => {
    load().catch((loadError) => setError(loadError.message))
  }, [load])

  async function respond(invitationId, status) {
    const token = await getToken()
    await api(`/api/invitations/${invitationId}`, { token, method: 'PUT', body: { status } })
    await load()
  }

  return (
    <AppShell>
      <main className="main-cal">
        <header className="month-head">
          <div>
            <p className="kicker">Shared events</p>
            <h1>Invitations</h1>
          </div>
        </header>
        {error && <p className="banner">{error}</p>}
        {invitations.length === 0 ? (
          <div className="empty">No invitations yet.</div>
        ) : (
          <div className="invite-cards">
            {invitations.map((item) => (
              <article key={item.invitation_id} className="card">
                <h3>{item.title}</h3>
                <p>
                  {formatDateTime(item.start_time)} – {formatDateTime(item.end_time)}
                  <br />
                  From {item.owner_name}
                  <br />
                  Status: {item.status}
                </p>
                <div className="hero-actions card-actions">
                  <button type="button" className="btn btn-primary" onClick={() => respond(item.invitation_id, 'attending')}>
                    Accept
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => respond(item.invitation_id, 'declined')}>
                    Decline
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => respond(item.invitation_id, 'maybe')}>
                    Maybe
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  )
}
