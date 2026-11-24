import { WEEKDAYS } from '../lib/dates.js'

export default function MonthGrid({ cells, label, interactive = false, onSelectDay, onSelectEvent, selectedDay }) {
  return (
    <div className={`cal-grid ${interactive ? 'app-grid' : ''}`} role="grid" aria-label={label}>
      {WEEKDAYS.map((day) => (
        <span key={day} role="columnheader">
          {day}
        </span>
      ))}
      {cells.map((cell) => {
        const selected = interactive && !cell.muted && selectedDay === cell.key
        const className = `cal-cell ${cell.muted ? 'muted' : ''} ${selected ? 'selected' : ''}`

        return (
          <div key={cell.key} className={className} role="gridcell">
            {interactive && !cell.muted ? (
              <button type="button" className="day-num" onClick={() => onSelectDay?.(cell.key)}>
                {cell.day}
              </button>
            ) : (
              <span className="day-num">{cell.day}</span>
            )}
            {cell.events.slice(0, 3).map((event) =>
              interactive ? (
                <button key={event.event_id} type="button" className="chip" onClick={() => onSelectEvent?.(event)}>
                  {event.title}
                </button>
              ) : (
                <span key={event.event_id} className="chip">
                  {event.title}
                </span>
              ),
            )}
            {cell.events.length > 3 && <span className="more">+{cell.events.length - 3} more</span>}
          </div>
        )
      })}
    </div>
  )
}
