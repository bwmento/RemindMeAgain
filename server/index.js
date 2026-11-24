import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mysql from 'mysql2/promise'
import { createClerkClient, verifyToken } from '@clerk/backend'

const port = Number(process.env.PORT || 43174)
const clerk = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null

const pool =
  process.env.DB_USER
    ? mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'remindmeagain',
        dateStrings: true,
        waitForConnections: true,
        connectionLimit: 10,
      })
    : null

const app = express()
app.use(cors())
app.use(express.json())

function fail(res, status, error) {
  res.status(status).json({ error })
}

function normalizeDateTime(value) {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::(\d{2}))?$/)
  if (!match) return null
  return `${match[1]} ${match[2]}:${match[3] || '00'}`
}

function readEventBody(body) {
  const title = String(body.title || '').trim()
  const description = String(body.description || '').trim() || null
  const location = String(body.location || '').trim() || null
  const startTime = normalizeDateTime(body.start_time)
  const endTime = normalizeDateTime(body.end_time)
  const recurrenceRule = body.recurrence_rule ? String(body.recurrence_rule).trim() : null
  const reminderTime = body.reminder_time ? normalizeDateTime(body.reminder_time) : null
  const reminderType = body.reminder_type ? String(body.reminder_type).trim() : null
  const inviteEmails = Array.isArray(body.invite_emails)
    ? body.invite_emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean)
    : []

  if (!title || title.length > 255) {
    return { error: 'Title is required and must be 255 characters or fewer.' }
  }
  if (location && location.length > 255) {
    return { error: 'Location must be 255 characters or fewer.' }
  }
  if (recurrenceRule && recurrenceRule.length > 255) {
    return { error: 'Recurrence rule must be 255 characters or fewer.' }
  }
  if (!['FREQ=WEEKLY', 'FREQ=MONTHLY', null].includes(recurrenceRule)) {
    return { error: 'Recurrence rule must be empty, weekly, or monthly.' }
  }
  if (!startTime || !endTime) {
    return { error: 'Start and end must be valid datetimes.' }
  }
  if (endTime < startTime) {
    return { error: 'End time must be after the start time.' }
  }
  if (body.reminder_time && !reminderTime) {
    return { error: 'Reminder time must be a valid datetime.' }
  }
  if (reminderTime && !['in-app', 'email'].includes(reminderType)) {
    return { error: 'Reminder type must be in-app or email.' }
  }

  return {
    value: {
      title,
      description,
      location,
      startTime,
      endTime,
      recurrenceRule,
      reminderTime,
      reminderType: reminderTime == null ? null : reminderType,
      inviteEmails,
    },
  }
}

async function requireUser(req, res, next) {
  try {
    if (!clerk || !pool) {
      return fail(res, 503, 'Set CLERK_SECRET_KEY and the database settings in server/.env.')
    }

    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return fail(res, 401, 'Sign in required.')

    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    const clerkUser = await clerk.users.getUser(payload.sub)
    const email =
      clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress
    if (!email) return fail(res, 400, 'Your Clerk account needs an email address.')

    const name = (clerkUser.fullName || clerkUser.username || email).slice(0, 100)
    await pool.query(
      `INSERT INTO Users (clerk_id, name, email)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email)`,
      [payload.sub, name, email],
    )
    const [users] = await pool.query('SELECT user_id, clerk_id, name, email, timezone, created_at FROM Users WHERE clerk_id = ?', [
      payload.sub,
    ])
    req.dbUser = users[0]
    next()
  } catch (error) {
    console.error(error)
    fail(res, 401, 'Sign in required.')
  }
}

async function loadEvents(userId) {
  const [events] = await pool.query(
    `SELECT e.event_id, e.owner_id, e.title, e.description, e.location, e.start_time, e.end_time,
            e.recurrence_rule, e.created_at, e.updated_at, u.name AS owner_name
     FROM Events e
     JOIN Users u ON u.user_id = e.owner_id
     WHERE e.owner_id = ?
        OR EXISTS (
          SELECT 1 FROM Invitations i WHERE i.event_id = e.event_id AND i.user_id = ?
        )
     ORDER BY e.start_time`,
    [userId, userId],
  )

  if (events.length === 0) return []

  const ids = events.map((event) => event.event_id)
  const [reminders] = await pool.query(
    `SELECT reminder_id, event_id, user_id, reminder_time, reminder_type, status
     FROM Reminders WHERE event_id IN (?) AND user_id = ?`,
    [ids, userId],
  )
  const [invitations] = await pool.query(
    `SELECT i.invitation_id, i.event_id, i.user_id, i.status, i.created_at, u.name, u.email
     FROM Invitations i
     JOIN Users u ON u.user_id = i.user_id
     WHERE i.event_id IN (?)`,
    [ids],
  )
  const [rsvps] = await pool.query(
    `SELECT rsvp_id, event_id, user_id, status, updated_at
     FROM RSVPs WHERE event_id IN (?) AND user_id = ?`,
    [ids, userId],
  )

  return events.map((event) => ({
    ...event,
    reminders: reminders.filter((reminder) => reminder.event_id === event.event_id),
    invitations: invitations.filter((invitation) => invitation.event_id === event.event_id),
    rsvp: rsvps.find((rsvp) => rsvp.event_id === event.event_id) || null,
  }))
}

async function saveReminder(connection, eventId, userId, reminderTime, reminderType) {
  await connection.query('DELETE FROM Reminders WHERE event_id = ? AND user_id = ?', [eventId, userId])
  if (!reminderTime) return
  await connection.query(
    `INSERT INTO Reminders (event_id, user_id, reminder_time, reminder_type, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [eventId, userId, reminderTime, reminderType],
  )
}

async function saveInvitations(connection, eventId, ownerId, emails) {
  const unknown = []
  for (const email of emails) {
    const [users] = await connection.query('SELECT user_id FROM Users WHERE email = ? LIMIT 1', [email])
    const inviteeId = users[0]?.user_id
    if (!inviteeId || inviteeId === ownerId) {
      if (!inviteeId) unknown.push(email)
      continue
    }
    await connection.query(
      `INSERT INTO Invitations (event_id, user_id, status)
       VALUES (?, ?, 'pending')
       ON DUPLICATE KEY UPDATE status = status`,
      [eventId, inviteeId],
    )
  }
  return unknown
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: Boolean(pool), clerk: Boolean(clerk) })
})

app.get('/api/events', requireUser, async (req, res, next) => {
  try {
    const events = await loadEvents(req.dbUser.user_id)
    res.json({ user: req.dbUser, events })
  } catch (error) {
    next(error)
  }
})

app.post('/api/events', requireUser, async (req, res, next) => {
  const parsed = readEventBody(req.body || {})
  if (parsed.error) return fail(res, 400, parsed.error)
  const event = parsed.value
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.query(
      `INSERT INTO Events (owner_id, title, description, location, start_time, end_time, recurrence_rule)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.dbUser.user_id, event.title, event.description, event.location, event.startTime, event.endTime, event.recurrenceRule],
    )
    await saveReminder(connection, result.insertId, req.dbUser.user_id, event.reminderTime, event.reminderType)
    const unknownEmails = await saveInvitations(connection, result.insertId, req.dbUser.user_id, event.inviteEmails)
    await connection.commit()
    const events = await loadEvents(req.dbUser.user_id)
    res.status(201).json({
      event: events.find((item) => item.event_id === result.insertId),
      unknown_emails: unknownEmails,
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
})

app.put('/api/events/:eventId', requireUser, async (req, res, next) => {
  const eventId = Number(req.params.eventId)
  if (!Number.isInteger(eventId)) return fail(res, 400, 'Invalid event id.')
  const parsed = readEventBody(req.body || {})
  if (parsed.error) return fail(res, 400, parsed.error)
  const event = parsed.value
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.query(
      `UPDATE Events
       SET title = ?, description = ?, location = ?, start_time = ?, end_time = ?, recurrence_rule = ?
       WHERE event_id = ? AND owner_id = ?`,
      [event.title, event.description, event.location, event.startTime, event.endTime, event.recurrenceRule, eventId, req.dbUser.user_id],
    )
    if (result.affectedRows === 0) {
      await connection.rollback()
      return fail(res, 404, 'Event not found.')
    }
    await saveReminder(connection, eventId, req.dbUser.user_id, event.reminderTime, event.reminderType)
    const unknownEmails = await saveInvitations(connection, eventId, req.dbUser.user_id, event.inviteEmails)
    await connection.commit()
    const events = await loadEvents(req.dbUser.user_id)
    res.json({
      event: events.find((item) => item.event_id === eventId),
      unknown_emails: unknownEmails,
    })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
})

app.delete('/api/events/:eventId', requireUser, async (req, res, next) => {
  const eventId = Number(req.params.eventId)
  if (!Number.isInteger(eventId)) return fail(res, 400, 'Invalid event id.')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [owned] = await connection.query('SELECT event_id FROM Events WHERE event_id = ? AND owner_id = ?', [
      eventId,
      req.dbUser.user_id,
    ])
    if (owned.length === 0) {
      await connection.rollback()
      return fail(res, 404, 'Event not found.')
    }
    await connection.query(
      `DELETE ar FROM Availability_Responses ar
       JOIN Poll_Options po ON po.option_id = ar.option_id
       JOIN Polls p ON p.poll_id = po.poll_id
       WHERE p.event_id = ?`,
      [eventId],
    )
    await connection.query(
      `DELETE po FROM Poll_Options po
       JOIN Polls p ON p.poll_id = po.poll_id
       WHERE p.event_id = ?`,
      [eventId],
    )
    await connection.query('DELETE FROM Polls WHERE event_id = ?', [eventId])
    await connection.query('DELETE FROM Reminders WHERE event_id = ?', [eventId])
    await connection.query('DELETE FROM Invitations WHERE event_id = ?', [eventId])
    await connection.query('DELETE FROM RSVPs WHERE event_id = ?', [eventId])
    await connection.query('DELETE FROM Events WHERE event_id = ? AND owner_id = ?', [eventId, req.dbUser.user_id])
    await connection.commit()
    res.json({ event_id: eventId })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
})

app.put('/api/events/:eventId/rsvp', requireUser, async (req, res, next) => {
  const eventId = Number(req.params.eventId)
  const status = String(req.body?.status || '')
  if (!Number.isInteger(eventId)) return fail(res, 400, 'Invalid event id.')
  if (!['attending', 'maybe', 'declined'].includes(status)) {
    return fail(res, 400, 'RSVP status must be attending, maybe, or declined.')
  }
  try {
    const [invited] = await pool.query(
      'SELECT invitation_id FROM Invitations WHERE event_id = ? AND user_id = ?',
      [eventId, req.dbUser.user_id],
    )
    if (invited.length === 0) return fail(res, 404, 'Invitation not found.')
    await pool.query(
      `INSERT INTO RSVPs (event_id, user_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [eventId, req.dbUser.user_id, status],
    )
    await pool.query('UPDATE Invitations SET status = ? WHERE event_id = ? AND user_id = ?', [
      status,
      eventId,
      req.dbUser.user_id,
    ])
    res.json({ event_id: eventId, status })
  } catch (error) {
    next(error)
  }
})

app.get('/api/reminders', requireUser, async (req, res, next) => {
  try {
    const [reminders] = await pool.query(
      `SELECT r.reminder_id, r.event_id, r.user_id, r.reminder_time, r.reminder_type, r.status, e.title
       FROM Reminders r
       JOIN Events e ON e.event_id = r.event_id
       WHERE r.user_id = ?
       ORDER BY r.reminder_time`,
      [req.dbUser.user_id],
    )
    res.json({ reminders })
  } catch (error) {
    next(error)
  }
})

app.get('/api/invitations', requireUser, async (req, res, next) => {
  try {
    const [invitations] = await pool.query(
      `SELECT i.invitation_id, i.event_id, i.user_id, i.status, i.created_at,
              e.title, e.start_time, e.end_time, e.location, u.name AS owner_name
       FROM Invitations i
       JOIN Events e ON e.event_id = i.event_id
       JOIN Users u ON u.user_id = e.owner_id
       WHERE i.user_id = ?
       ORDER BY e.start_time`,
      [req.dbUser.user_id],
    )
    res.json({ invitations })
  } catch (error) {
    next(error)
  }
})

app.put('/api/invitations/:invitationId', requireUser, async (req, res, next) => {
  const invitationId = Number(req.params.invitationId)
  const status = String(req.body?.status || '')
  if (!Number.isInteger(invitationId)) return fail(res, 400, 'Invalid invitation id.')
  if (!['pending', 'attending', 'maybe', 'declined'].includes(status)) {
    return fail(res, 400, 'Invitation status must be pending, attending, maybe, or declined.')
  }
  try {
    const [rows] = await pool.query(
      'SELECT invitation_id, event_id FROM Invitations WHERE invitation_id = ? AND user_id = ?',
      [invitationId, req.dbUser.user_id],
    )
    if (rows.length === 0) return fail(res, 404, 'Invitation not found.')
    await pool.query('UPDATE Invitations SET status = ? WHERE invitation_id = ?', [status, invitationId])
    if (status !== 'pending') {
      await pool.query(
        `INSERT INTO RSVPs (event_id, user_id, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [rows[0].event_id, req.dbUser.user_id, status],
      )
    }
    res.json({ invitation_id: invitationId, status })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  fail(res, 500, 'Something went wrong while talking to the database.')
})

app.listen(port, () => {
  console.log(`API listening on ${port}`)
})
