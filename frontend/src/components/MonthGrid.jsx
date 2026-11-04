import { WEEKDAYS } from '../data.js'

/* 7-column CSS grid, first row being the headers which are days of the week. then one cell per day for the month under the headers\
Any cells that don't match the month's format are muted and don't have any interactivity

Also used as the preview in the unsigned-in page
*/

export default function MonthGrid({ cells, interactive = false, onSelectDay, onSelectEvent, selectedDay }) {
  return (
    <div className={`cal-grid ${interactive ? 'app-grid' : ''}`} role="grid" aria-label="October 2026">
      {WEEKDAYS.map((day) => (
        <span key={day} role="columnheader">
          {day}
        </span>
      ))}
      {cells.map((cell) => {
        const selected = interactive && !cell.muted && selectedDay === cell.day
        const className = `cal-cell ${cell.muted ? 'muted' : ''} ${selected ? 'selected' : ''}`

        return (
          <div key={cell.key} className={className} role="gridcell">
            {interactive && !cell.muted ? (
              <button type="button" className="day-num" onClick={() => onSelectDay?.(cell.day)}>
                {cell.day}
              </button>
            ) : (
              <span className="day-num">{cell.day}</span>
            )}
            {cell.events.slice(0, 3).map((event) =>
              interactive ? (
                <button
                  key={event.id}
                  type="button"
                  className={`chip ${event.chip}`}
                  onClick={() => onSelectEvent?.(event)}
                >
                  {event.title}
                </button>
              ) : (
                <span key={event.id} className={`chip ${event.chip}`}>
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
