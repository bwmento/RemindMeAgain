import { useState } from 'react'
import { combineDateTime, dateKey, parseDateTime, splitDateTime } from '../lib/dates.js'

function reminderTimeValue(date, time, minutes) {
  if (!minutes) return null
  const start = parseDateTime(`${date}T${time}`)
  if (!start || Number.isNaN(start.getTime())) return null
  start.setMinutes(start.getMinutes() - Number(minutes))
  const pad = (value) => String(value).padStart(2, '0')
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())} ${pad(start.getHours())}:${pad(start.getMinutes())}:00`
}

function reminderMinutes(event) {
  const reminder = event?.reminders?.[0]
  if (!reminder) return ''
  const start = new Date(String(event.start_time).replace(' ', 'T')).getTime()
  const when = new Date(String(reminder.reminder_time).replace(' ', 'T')).getTime()
  const minutes = Math.round((start - when) / 60000)
  return [15, 60, 1440].includes(minutes) ? String(minutes) : ''
}

export default function EventForm({ pickedDay, onClose, onSave, editingEvent = null }) {
  const today = dateKey(new Date())
  const start = editingEvent ? splitDateTime(editingEvent.start_time) : { date: pickedDay || today, time: '18:00' }
  const end = editingEvent ? splitDateTime(editingEvent.end_time) : { date: pickedDay || today, time: '19:00' }
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const minutes = formData.get('reminder_minutes_before')
    const reminderTime = reminderTimeValue(formData.get('start_date'), formData.get('start_clock'), minutes)
    const invites = String(formData.get('invite_emails') || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)

    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      location: formData.get('location'),
      start_time: combineDateTime(formData.get('start_date'), formData.get('start_clock')),
      end_time: combineDateTime(formData.get('end_date'), formData.get('end_clock')),
      recurrence_rule: formData.get('recurrence_rule') || null,
      reminder_time: reminderTime,
      reminder_type: reminderTime ? formData.get('reminder_type') : null,
      invite_emails: invites,
    }

    setSaving(true)
    setError('')
    try {
      await onSave?.(payload)
      onClose?.()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onClick={onClose}>
      <form className="dialog dialog-wide" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{editingEvent ? 'Edit event' : 'New event'}</h2>
        {error && <p className="banner">{error}</p>}
        <label className="field">
          Title
          <input required name="title" maxLength={255} placeholder="Title" defaultValue={editingEvent?.title || ''} />
        </label>
        <div className="field-row">
          <label className="field">
            Start date
            <input type="date" name="start_date" required defaultValue={start.date} />
          </label>
          <label className="field">
            Start time
            <input type="time" name="start_clock" required defaultValue={start.time || '18:00'} />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            End date
            <input type="date" name="end_date" required defaultValue={end.date} />
          </label>
          <label className="field">
            End time
            <input type="time" name="end_clock" required defaultValue={end.time || '19:00'} />
          </label>
        </div>
        <label className="field">
          Location
          <input name="location" maxLength={255} placeholder="Address, link, or room" defaultValue={editingEvent?.location || ''} />
        </label>
        <label className="field">
          Description
          <textarea name="description" rows="3" placeholder="Details for this event" defaultValue={editingEvent?.description || ''} />
        </label>
        <div className="field-row">
          <label className="field">
            Repeats
            <select name="recurrence_rule" defaultValue={editingEvent?.recurrence_rule || ''}>
              <option value="">Does not repeat</option>
              <option value="FREQ=WEEKLY">Weekly</option>
              <option value="FREQ=MONTHLY">Monthly</option>
            </select>
          </label>
          <label className="field">
            Remind me
            <select name="reminder_minutes_before" defaultValue={reminderMinutes(editingEvent)}>
              <option value="">No reminder</option>
              <option value="15">15 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </label>
        </div>
        <label className="field">
          Reminder type
          <select name="reminder_type" defaultValue={editingEvent?.reminders?.[0]?.reminder_type || 'in-app'}>
            <option value="in-app">In-app</option>
            <option value="email">Email</option>
          </select>
        </label>
        <label className="field">
          Invite people by email
          <input name="invite_emails" placeholder="name@email.com, name@email.com" />
        </label>
        <p className="fine tight">Invites are saved only for people who already have an account.</p>
        <div className="dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}
