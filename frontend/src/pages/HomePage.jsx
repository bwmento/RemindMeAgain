import { Link } from 'react-router-dom'
import MonthGrid from '../components/MonthGrid.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { octoberCells } from '../data.js'

export default function HomePage() {
  return (
    <div className="page">
      <SiteHeader />

      <section className="hero">
        <div>
          <p className="kicker">Quadra Code · calendar for people and groups</p>
          <h1>Plan it, share it, get reminded before it starts.</h1>
          <p className="lede">
            One calendar for your own dates and the events you throw with friends or family. Create an event, invite
            people, collect RSVPs and time polls, and import the rest so you are not retyping flyers and school
            calendars.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-accent" to="/calendar">
              Create a free account
            </Link>
            <Link className="btn btn-outline" to="/calendar">
              Open the calendar
            </Link>
            <Link className="btn btn-ghost" to="/import">
              Import events
            </Link>
          </div>
          <p className="fine">Sign in with any email. Imported events stay private until you share them.</p>
        </div>

        <aside className="preview" aria-label="Sample October calendar">
          <div className="preview-bar">
            <strong>October 2026</strong>
            <span className="fine tight">
              Mine · shared · imported
            </span>
          </div>
          <MonthGrid cells={octoberCells()} />
        </aside>
      </section>

      <section className="section" id="how">
        <h2>What you can do</h2>
        <p className="intro">Create events, import calendars, invite people, and get reminded before anything starts.</p>
        <div className="cards steps">
          <article className="card">
            <div className="step-num">1</div>
            <h3>Fill your calendar</h3>
            <p>Add personal events or import a file / community feed. Filter by mine, shared, or imported.</p>
          </article>
          <article className="card">
            <div className="step-num">2</div>
            <h3>Invite and RSVP</h3>
            <p>Send invites, collect attending / maybe / not, and run a time poll when the date is not settled.</p>
          </article>
          <article className="card">
            <div className="step-num">3</div>
            <h3>Get reminded</h3>
            <p>Attach a reminder to any event and get an email or in-app ping before it starts.</p>
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
