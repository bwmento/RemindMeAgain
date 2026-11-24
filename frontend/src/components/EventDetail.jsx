import { formatDateTime, recurrenceLabel } from '../lib/dates.js'

const RSVP_OPTIONS = [
  { id: 'attending', label: 'Attending' },
  { id: 'maybe', label: 'Maybe' },
  { id: 'declined', label: 'Declined' },
]

export default function EventDetail({ event, currentUserId, onClose, onEdit, onDelete, onRsvp }) {
  if (!event) return null

  const owned = event.owner_id === currentUserId
  const invitation = event.invitations?.find((item) => item.user_id === currentUserId)
  const reminder = event.reminders?.[0]

  return (
    <section className="detail-card">
      <header className="detail-head">
        <div>
          <p className="kicker">{owned ? 'Your event' : 'Shared event'}</p>
          <h2>{event.title}</h2>
        </div>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Close
        </button>
        {owned && (
          <button type="button" className="btn btn-primary" onClick={() => onEdit?.(event)}>
            Edit event
          </button>
        )}
        {owned && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (window.confirm('Delete this event?')) onDelete?.(event.event_id)
            }}
          >
            Delete event
          </button>
        )}
      </header>
      <p>
        <strong>
          {formatDateTime(event.start_time)} – {formatDateTime(event.end_time)}
        </strong>
      </p>
      <dl className="meta">
        <div>
          <dt>Location</dt>
          <dd>{event.location || '—'}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{event.owner_name}</dd>
        </div>
        <div>
          <dt>Repeats</dt>
          <dd>{recurrenceLabel(event.recurrence_rule)}</dd>
        </div>
        <div>
          <dt>Reminder</dt>
          <dd>{reminder ? `${formatDateTime(reminder.reminder_time)} · ${reminder.reminder_type}` : '—'}</dd>
        </div>
      </dl>
      {event.description && <p className="notes">{event.description}</p>}

      {invitation && (
        <>
          <h3>Your RSVP</h3>
          <div className="filters">
            {RSVP_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`filter ${(event.rsvp?.status || invitation.status) === option.id ? 'on' : ''}`}
                onClick={() => onRsvp?.(event.event_id, option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}

      {event.invitations?.length > 0 && (
        <>
          <h3>Invitations</h3>
          <ul className="invite-list">
            {event.invitations.map((person) => (
              <li key={person.invitation_id}>
                <span>{person.name}</span>
                <span className="pill">{person.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
