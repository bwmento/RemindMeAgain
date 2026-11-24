import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../auth.jsx'
import AppShell from '../components/AppShell.jsx'
import { api } from '../lib/api.js'

const COLUMNS = ['title', 'start_time', 'end_time', 'description', 'location', 'recurrence_rule']

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((header) => header.trim().toLowerCase())
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map((cell) => cell.trim())
    const row = { id: index + 1, included: true }
    headers.forEach((header, cellIndex) => {
      if (COLUMNS.includes(header)) row[header] = cells[cellIndex] || ''
    })
    return row
  })
}

export default function ImportPage() {
  const { getToken } = useSession()
  const [rows, setRows] = useState([])
  const [fileLabel, setFileLabel] = useState('No file chosen')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const included = rows.filter((row) => row.included)

  function toggleRow(id) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, included: !row.included } : row)))
  }

  async function addSelected() {
    setSaving(true)
    setNotice('')
    try {
      const token = await getToken()
      for (const row of included) {
        await api('/api/events', {
          token,
          method: 'POST',
          body: {
            title: row.title,
            description: row.description || null,
            location: row.location || null,
            start_time: row.start_time,
            end_time: row.end_time,
            recurrence_rule: row.recurrence_rule || null,
            invite_emails: [],
          },
        })
      }
      setNotice(`Added ${included.length} events.`)
      setRows([])
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <main className="main-cal import-main">
        <header className="month-head">
          <div>
            <p className="kicker">Bring dates in</p>
            <h1>Import events</h1>
            <p className="lede tight">
              Upload a CSV with title, start_time, end_time, and optional description, location, and recurrence_rule.
            </p>
          </div>
        </header>

        <section className="card">
          <h2>Upload a CSV</h2>
          <p>Times use YYYY-MM-DD HH:MM:SS. Recurrence is blank, FREQ=WEEKLY, or FREQ=MONTHLY.</p>
          <label className="dropzone">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={async (event) => {
                const file = event.target.files?.[0]
                setFileLabel(file ? file.name : 'No file chosen')
                if (!file) return
                const text = await file.text()
                const parsed = parseCsv(text).filter((row) => row.title && row.start_time && row.end_time)
                setRows(parsed)
                setNotice(parsed.length ? 'Review the rows, then add them.' : 'No rows with title, start_time, and end_time.')
              }}
            />
            <strong>Drop a CSV or browse</strong>
            <span>{fileLabel}</span>
          </label>
        </section>

        {notice && <p className="banner">{notice}</p>}

        <section className="preview table-wrap">
          <div className="preview-bar">
            <strong>Preview · {included.length} selected</strong>
          </div>
          {rows.length === 0 ? (
            <div className="empty">No rows yet.</div>
          ) : (
            <table className="import-table">
              <thead>
                <tr>
                  <th>Add</th>
                  <th>Title</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Location</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className={row.included ? '' : 'dim'}>
                    <td>
                      <input type="checkbox" checked={row.included} onChange={() => toggleRow(row.id)} />
                    </td>
                    <td>{row.title}</td>
                    <td>{row.start_time}</td>
                    <td>{row.end_time}</td>
                    <td>{row.location}</td>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="import-actions">
            <div className="hero-actions">
              <button type="button" className="btn btn-accent" disabled={included.length === 0 || saving} onClick={addSelected}>
                Add {included.length} to my calendar
              </button>
              <Link className="btn btn-outline" to="/calendar">
                Back to calendar
              </Link>
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  )
}
