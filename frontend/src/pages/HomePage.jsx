import { Link } from 'react-router-dom'
import MonthGrid from '../components/MonthGrid.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { buildMonthCells, formatMonthLabel } from '../lib/dates.js'

export default function HomePage() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const label = formatMonthLabel(year, month)

  return (
    <div className="page">
      <SiteHeader />

      <section className="hero">
        <div>
          <p className="kicker">Quadra Code · calendar for people and groups</p>
          <h1>Plan it, share it, get reminded before it starts.</h1>
          <p className="lede">
            One calendar for your own dates and the events you throw with friends or family. Create an event, invite
            people, collect RSVPs, and import the rest so you are not retyping flyers and school calendars.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-accent" to="/sign-up">
              Create a free account
            </Link>
            <Link className="btn btn-outline" to="/calendar">
              Open the calendar
            </Link>
            <Link className="btn btn-ghost" to="/import">
              Import events
            </Link>
          </div>
          <p className="fine">Sign in with Clerk. Events stay on your account.</p>
        </div>

        <aside className="preview" aria-label={label}>
          <div className="preview-bar">
            <strong>{label}</strong>
          </div>
          <MonthGrid cells={buildMonthCells(year, month, [])} label={label} />
        </aside>
      </section>

      <section className="section" id="how">
        <h2>What you can do</h2>
        <p className="intro">Create events, import calendars, invite people, and get reminded before anything starts.</p>
        <div className="cards steps">
          <article className="card">
            <div className="step-num">1</div>
            <h3>Fill your calendar</h3>
            <p>Add events or import a CSV. Your month starts empty until you do.</p>
          </article>
          <article className="card">
            <div className="step-num">2</div>
            <h3>Invite and RSVP</h3>
            <p>Invite people who already have accounts, then collect attending, maybe, or declined.</p>
          </article>
          <article className="card">
            <div className="step-num">3</div>
            <h3>Get reminded</h3>
            <p>Attach an in-app or email reminder to any event you create.</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <span>Quadra Calendar</span>
        <Link to="/calendar">Calendar →</Link>
      </footer>
    </div>
  )
}
