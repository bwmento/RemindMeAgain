import AppShell from '../components/AppShell.jsx'
import { PENDING_INVITES } from '../data.js'

export default function InvitationsPage() {
  return (
    <AppShell>
      <main className="main-cal">
        <header className="month-head">
          <div>
            <p className="kicker">Shared events</p>
            <h1>Invitations</h1>
          </div>
        </header>
        <div className="invite-cards">
          {PENDING_INVITES.map((item) => (
            <article key={item.id} className="card">
              <h3>{item.title}</h3>
              <p>
                {item.when}
                <br />
                From {item.from}
              </p>
              <div className="hero-actions card-actions">
                <button type="button" className="btn btn-primary">
                  Accept
                </button>
                <button type="button" className="btn btn-outline">
                  Decline
                </button>
                <button type="button" className="btn btn-ghost">
                  Maybe
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  )
}
