import { useState } from 'react'

const RSVP_OPTIONS = ['Attending', 'Maybe', 'Not attending']

export default function EventDetail({ event, onClose }) {
  const [rsvp, setRsvp] = useState(event.rsvp || 'Attending')

  if (!event) return null

  return (
    <section className="detail-card">
      <header className="detail-head">
        <div>
          <p className="kicker">{event.scope === 'imported' ? 'Imported' : event.scope === 'shared' ? 'Shared event' : 'Your event'}</p>
          <h2>{event.title}</h2>
        </div>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Close
        </button>
      </header>
      <p>
        <strong>
          Oct {event.day} · {event.time}
          {event.endTime ? ` – ${event.endTime}` : ''}
        </strong>
      </p>
      <dl className="meta">
        <div>
          <dt>Location</dt>
          <dd>{event.location || '—'}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{event.owner}</dd>
        </div>
        <div>
          <dt>Repeats</dt>
          <dd>{event.recurrence}</dd>
        </div>
        <div>
          <dt>Reminder</dt>
          <dd>{event.reminder}</dd>
        </div>
      </dl>
      {event.notes && <p className="notes">{event.notes}</p>}

      {event.scope === 'shared' && (
        <>
          <h3>Your RSVP</h3>
          <div className="filters">
            {RSVP_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter ${rsvp === option ? 'on' : ''}`}
                onClick={() => setRsvp(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <h3>Invitations</h3>
          <ul className="invite-list">
            {event.invites.map((person) => (
              <li key={person.name}>
                <span>{person.name}</span>
                <span className={`pill pill-${person.status.toLowerCase().replace(' ', '-')}`}>{person.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {event.poll && (
        <>
          <h3>Time poll · {event.poll.status}</h3>
          {event.poll.winner && <p className="fine">Chosen time: {event.poll.winner}</p>}
          {event.poll.options && (
            <ul className="poll-list">
              {event.poll.options.map((option) => (
                <li key={option.label}>
                  <span>{option.label}</span>
                  <span>{option.votes} available</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}
