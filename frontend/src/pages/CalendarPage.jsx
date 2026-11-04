import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell.jsx'
import EventDetail from '../components/EventDetail.jsx'
import EventForm from '../components/EventForm.jsx'
import MonthGrid from '../components/MonthGrid.jsx'
import { EVENTS, PENDING_INVITES, REMINDERS, octoberCells } from '../data.js'

/* Handles the filter state and the general state of the signed-in session when it comes to the calendar itself */

const SCOPES = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'shared', label: 'Shared' },
  { id: 'imported', label: 'Imported' },
]

const CATEGORIES = ['All', 'Personal', 'Work', 'Travel', 'School']

export default function CalendarPage() {
  const [scope, setScope] = useState('all')
  const [category, setCategory] = useState('All')
  const [openForm, setOpenForm] = useState(false)
  const [pickedDay, setPickedDay] = useState(15)
  const [selected, setSelected] = useState(EVENTS[3])

  const visibleEvents = useMemo(
    () =>
      EVENTS.filter((event) => (scope === 'all' || event.scope === scope) && (category === 'All' || event.category === category)),
    [scope, category],
  )

  const cells = useMemo(() => octoberCells(visibleEvents), [visibleEvents])
  const dayEvents = visibleEvents.filter((event) => event.day === pickedDay)

  const rail = (
    <aside className="rail">
      {selected ? (
        <EventDetail event={selected} onClose={() => setSelected(null)} />
      ) : (
        <>
          <h2 className="rail-title">Oct {pickedDay}</h2>
          {dayEvents.length === 0 ? (
            <div className="empty">Nothing on this day. Create an event or import one.</div>
          ) : (
            dayEvents.map((item) => (
              <button key={item.id} type="button" className="reminder clickable" onClick={() => setSelected(item)}>
                <time>{item.time}</time>
                <strong>{item.title}</strong>
                <span className="fine tight">
                  {item.scope === 'shared' ? `RSVP · ${item.rsvp}` : item.category}
                </span>
              </button>
            ))
          )}
        </>
      )}
      <h2 className="rail-title spaced">
        Reminders
      </h2>
      {REMINDERS.map((item) => (
        <article key={item.id} className="reminder">
          <time>{item.when}</time>
          <strong>{item.title}</strong>
          <span className="fine tight">
            {item.detail}
          </span>
        </article>
      ))}
      <h2 className="rail-title spaced">
        Pending invites
      </h2>
      {PENDING_INVITES.map((item) => (
        <article key={item.id} className="reminder">
          <time>{item.when}</time>
          <strong>{item.title}</strong>
          <span className="fine tight">
            From {item.from}
          </span>
        </article>
      ))}
    </aside>
  )

  return (
    <AppShell rail={rail}>
      <main className="main-cal">
        <div className="month-head">
          <div>
            <h1>October 2026</h1>
          </div>
          <button type="button" className="btn btn-accent" onClick={() => setOpenForm(true)}>
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
        <div className="filters" aria-label="Category">
          {CATEGORIES.map((name) => (
            <button
              key={name}
              type="button"
              className={`filter ${category === name ? 'on' : ''}`}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="preview">
          <MonthGrid
            cells={cells}
            interactive
            selectedDay={pickedDay}
            onSelectDay={(day) => {
              setPickedDay(day)
              setSelected(null)
            }}
            onSelectEvent={(event) => {
              setPickedDay(event.day)
              setSelected(event)
            }}
          />
        </div>
      </main>
      {openForm && <EventForm pickedDay={pickedDay} onClose={() => setOpenForm(false)} />}
    </AppShell>
  )
}
