import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from '../auth.jsx'
import AppShell from '../components/AppShell.jsx'
import EventDetail from '../components/EventDetail.jsx'
import EventForm from '../components/EventForm.jsx'
import MonthGrid from '../components/MonthGrid.jsx'
import { api } from '../lib/api.js'
import { buildMonthCells, dateKey, eventOccursOn, formatDateTime, formatDayLabel, formatMonthLabel, parseDateTime } from '../lib/dates.js'

const SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'shared', label: 'Shared' },
]

export default function CalendarPage() {
  const { getToken } = useSession()
  const getTokenRef = useRef(getToken)
  getTokenRef.current = getToken
  const today = new Date()
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [scope, setScope] = useState('all')
  const [openForm, setOpenForm] = useState(false)
  const [pickedDay, setPickedDay] = useState(dateKey(today))
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [user, setUser] = useState(null)
  const [events, setEvents] = useState([])
  const [reminders, setReminders] = useState([])
  const [invitations, setInvitations] = useState([])
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const token = await getTokenRef.current()
    const [eventData, reminderData, invitationData] = await Promise.all([
      api('/api/events', { token }),
      api('/api/reminders', { token }),
      api('/api/invitations', { token }),
    ])
    setUser(eventData.user)
    setEvents(eventData.events)
    setReminders(reminderData.reminders)
    setInvitations(invitationData.invitations.filter((item) => item.status === 'pending'))
    setError('')
  }, [])

  useEffect(() => {
    load().catch((loadError) => setError(loadError.message))
  }, [load])

  const visibleEvents = useMemo(() => {
    if (!user) return events
    return events.filter((event) => {
      if (scope === 'mine') return event.owner_id === user.user_id
      if (scope === 'shared') return event.owner_id !== user.user_id || event.invitations.length > 0
      return true
    })
  }, [events, scope, user])

  const cells = useMemo(
    () => buildMonthCells(cursor.year, cursor.month, visibleEvents),
    [cursor.month, cursor.year, visibleEvents],
  )
  const monthLabel = formatMonthLabel(cursor.year, cursor.month)
  const pickedDate = parseDateTime(`${pickedDay} 00:00:00`)
  const dayEvents = visibleEvents.filter((event) => eventOccursOn(event, pickedDate))
  const selected = events.find((event) => event.event_id === selectedId) || null

  function shiftMonth(amount) {
    const next = new Date(cursor.year, cursor.month + amount, 1)
    setCursor({ year: next.getFullYear(), month: next.getMonth() })
    setPickedDay(dateKey(next))
    setSelectedId(null)
  }

  async function handleSaveEvent(payload) {
    const token = await getToken()
    const path = editingEvent ? `/api/events/${editingEvent.event_id}` : '/api/events'
    const result = await api(path, { token, method: editingEvent ? 'PUT' : 'POST', body: payload })
    if (result.unknown_emails?.length) {
      setNotice(`Saved. No account found for ${result.unknown_emails.join(', ')}.`)
    } else {
      setNotice('')
    }
    setEditingEvent(null)
    setSelectedId(null)
    await load()
  }

  async function handleDeleteEvent(eventId) {
    const token = await getToken()
    await api(`/api/events/${eventId}`, { token, method: 'DELETE' })
    setSelectedId(null)
    await load()
  }

  async function handleRsvp(eventId, status) {
    const token = await getToken()
    await api(`/api/events/${eventId}/rsvp`, { token, method: 'PUT', body: { status } })
    await load()
  }

  const rail = (
    <aside className="rail">
      {selected ? (
        <EventDetail
          event={selected}
          currentUserId={user?.user_id}
          onClose={() => setSelectedId(null)}
          onDelete={handleDeleteEvent}
          onRsvp={handleRsvp}
          onEdit={(event) => {
            setEditingEvent(event)
            setSelectedId(null)
            setOpenForm(true)
          }}
        />
      ) : (
        <>
          <h2 className="rail-title">{formatDayLabel(pickedDay)}</h2>
          {dayEvents.length === 0 ? (
            <div className="empty">Nothing on this day.</div>
          ) : (
            dayEvents.map((item) => (
              <button key={item.event_id} type="button" className="reminder clickable" onClick={() => setSelectedId(item.event_id)}>
                <time>{formatDateTime(item.start_time)}</time>
                <strong>{item.title}</strong>
                <span className="fine tight">{item.location || item.owner_name}</span>
              </button>
            ))
          )}
        </>
      )}
      <h2 className="rail-title spaced">Reminders</h2>
      {reminders.length === 0 ? (
        <div className="empty">No reminders yet.</div>
      ) : (
        reminders.map((item) => (
          <article key={item.reminder_id} className="reminder">
            <time>{formatDateTime(item.reminder_time)}</time>
            <strong>{item.title}</strong>
            <span className="fine tight">
              {item.reminder_type} · {item.status}
            </span>
          </article>
        ))
      )}
      <h2 className="rail-title spaced">Pending invites</h2>
      {invitations.length === 0 ? (
        <div className="empty">No pending invitations.</div>
      ) : (
        invitations.map((item) => (
          <article key={item.invitation_id} className="reminder">
            <time>{formatDateTime(item.start_time)}</time>
            <strong>{item.title}</strong>
            <span className="fine tight">From {item.owner_name}</span>
          </article>
        ))
      )}
    </aside>
  )

  return (
    <AppShell rail={rail}>
      <main className="main-cal">
        {error && <p className="banner">{error}</p>}
        {notice && <p className="banner">{notice}</p>}
        <div className="month-head">
          <div className="month-nav">
            <button type="button" className="btn btn-outline" onClick={() => shiftMonth(-1)} aria-label="Previous month">
              ←
            </button>
            <h1>{monthLabel}</h1>
            <button type="button" className="btn btn-outline" onClick={() => shiftMonth(1)} aria-label="Next month">
              →
            </button>
          </div>
          <button
            type="button"
            className="btn btn-accent"
            onClick={() => {
              setEditingEvent(null)
              setOpenForm(true)
            }}
          >
            New event
          </button>
        </div>
        <div className="filters" aria-label="Calendar scope">
          {SCOPES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter ${scope === item.id ? 'on' : ''}`}
              onClick={() => setScope(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="preview">
          <MonthGrid
            cells={cells}
            label={monthLabel}
            interactive
            selectedDay={pickedDay}
            onSelectDay={(day) => {
              setPickedDay(day)
              setSelectedId(null)
            }}
            onSelectEvent={(event) => {
              setPickedDay(dateKey(parseDateTime(event.start_time)))
              setSelectedId(event.event_id)
            }}
          />
        </div>
      </main>
      {openForm && (
        <EventForm
          key={editingEvent?.event_id ?? 'new-event'}
          pickedDay={pickedDay}
          editingEvent={editingEvent}
          onClose={() => {
            setOpenForm(false)
            setEditingEvent(null)
          }}
          onSave={handleSaveEvent}
        />
      )}
    </AppShell>
  )
}
