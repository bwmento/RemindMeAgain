import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell.jsx'
import { COMMUNITY_CALENDARS, SAMPLE_IMPORTS } from '../data.js'

export default function ImportPage() {
  const [rows, setRows] = useState(SAMPLE_IMPORTS)
  const [fileLabel, setFileLabel] = useState('No file chosen')
  const [paste, setPaste] = useState('Family dinner\nSunday 6:30pm\nMom’s house')
  const [connected, setConnected] = useState('school')
  const [notice, setNotice] = useState('')

  const includedCount = rows.filter((row) => row.included).length

  function toggleRow(id) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, included: !row.included } : row)))
  }

  function loadPreview() {
    setNotice('Preview updated. Review the rows below, then add them to your calendar.')
  }

  return (
    <AppShell>
      <main className="main-cal import-main">
        <header className="month-head">
          <div>
            <p className="kicker">Bring dates in</p>
            <h1>Import events</h1>
            <p className="lede tight">
              Pull dates out of a calendar file, notes, or a community calendar instead of typing each one.
              Imported events stay private until you share them.
            </p>
          </div>
        </header>

        <div className="import-grid">
          <section className="card">
            <h2>1. Upload a file</h2>
            <p>Upload an .ics or .csv file from another calendar.</p>
            <label className="dropzone">
              <input
                type="file"
                accept=".ics,.csv,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  setFileLabel(file ? file.name : 'No file chosen')
                  loadPreview()
                }}
              />
              <strong>Drop a file or browse</strong>
              <span>{fileLabel}</span>
            </label>
          </section>

          <section className="card">
            <h2>2. Paste from notes</h2>
            <p>Chat logs, flyers, anything messy. Stored as plain text you own.</p>
            <textarea rows="6" value={paste} onChange={(event) => setPaste(event.target.value)} />
            <button type="button" className="btn btn-outline" onClick={loadPreview}>
              Preview paste
            </button>
          </section>

          <section className="card">
            <h2>3. Community calendar</h2>
            <p>Add a school or group calendar next to your personal events.</p>
            <ul className="community-list">
              {COMMUNITY_CALENDARS.map((item) => (
                <li key={item.id}>
                  <label className="check">
                    <input
                      type="radio"
                      name="community"
                      checked={connected === item.id}
                      onChange={() => {
                        setConnected(item.id)
                        loadPreview()
                      }}
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <em>{item.detail}</em>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {notice && <p className="banner">{notice}</p>}

        <section className="preview table-wrap">
          <div className="preview-bar">
            <strong>Preview · {includedCount} selected</strong>
            <span className="fine tight">
              Visibility defaults to Private
            </span>
          </div>
          <table className="import-table">
            <thead>
              <tr>
                <th>Add</th>
                <th>Title</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
                <th>Source</th>
                <th>Visibility</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={row.included ? '' : 'dim'}>
                  <td>
                    <input type="checkbox" checked={row.included} onChange={() => toggleRow(row.id)} />
                  </td>
                  <td>{row.title}</td>
                  <td>{row.start}</td>
                  <td>{row.end}</td>
                  <td>{row.location}</td>
                  <td>{row.source}</td>
                  <td>
                    <select defaultValue={row.visibility} aria-label={`Visibility for ${row.title}`}>
                      <option>Private</option>
                      <option>Shared later</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="import-actions">
            <p className="fine tight">
              You own every imported event. Titles and notes stay on your calendar.
            </p>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => setNotice(`Added ${includedCount} events to your calendar.`)}
              >
                Add {includedCount} to my calendar
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
