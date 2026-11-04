export default function EventForm({ pickedDay = 15, onClose }) {
  function handleSubmit(event) {
    event.preventDefault()
    onClose?.()
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <form className="dialog dialog-wide" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>New event</h2>
        <label className="field">
          Title
          <input required name="title" placeholder="Friendsgiving, midterm, standup…" />
        </label>
        <div className="field-row">
          <label className="field">
            Start date
            <input type="date" name="startDate" defaultValue={`2026-10-${String(pickedDay).padStart(2, '0')}`} />
          </label>
          <label className="field">
            Start time
            <input type="time" name="startTime" defaultValue="18:00" />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            End date
            <input type="date" name="endDate" defaultValue={`2026-10-${String(pickedDay).padStart(2, '0')}`} />
          </label>
          <label className="field">
            End time
            <input type="time" name="endTime" defaultValue="20:00" />
          </label>
        </div>
        <label className="field">
          Location
          <input name="location" placeholder="Address, Zoom link, or room" />
        </label>
        <label className="field">
          Notes
          <textarea name="notes" rows="3" placeholder="Anything invitees should know" />
        </label>
        <div className="field-row">
          <label className="field">
            Repeats
            <select name="recurrence" defaultValue="none">
              <option value="none">Does not repeat</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="field">
            Remind me
            <select name="reminder" defaultValue="60">
              <option value="15">15 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </label>
        </div>
        <label className="field">
          Invite people (emails)
          <input name="invites" placeholder="amy@email.com, jake@email.com" />
        </label>
        <label className="check">
          <input type="checkbox" name="poll" />
          Add a time poll for invitees
        </label>
        <div className="dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
