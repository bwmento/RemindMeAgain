export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* All events are organized here and then pushed into the function that organizes each calendar (like octoberCells)
This is the point all event gathering avenues will be directed towards */

export const EVENTS = [
  {
    id: 1,
    day: 3,
    title: 'Dentist',
    time: '9:00 AM',
    endTime: '9:45 AM',
    category: 'Personal',
    scope: 'mine',
    chip: 'chip-personal',
    location: 'Oak Park Dental',
    notes: 'Cleaning. Bring insurance card.',
    recurrence: 'Does not repeat',
    reminder: '1 hour before · email',
    rsvp: null,
    invites: [],
    owner: 'You',
  },
  {
    id: 2,
    day: 7,
    title: 'Team standup',
    time: '10:30 AM',
    endTime: '10:50 AM',
    category: 'Work',
    scope: 'shared',
    chip: 'chip-work',
    location: 'Zoom',
    notes: 'Weekly sync with design.',
    recurrence: 'Weekly on Tuesday',
    reminder: '15 minutes before · in-app',
    rsvp: 'Attending',
    invites: [
      { name: 'Amy Brooks', status: 'Attending' },
      { name: 'Jake Wilson', status: 'Maybe' },
    ],
    owner: 'Mike Davis',
    poll: { status: 'Closed', winner: 'Tue 10:30 AM' },
  },
  {
    id: 3,
    day: 15,
    title: 'Flight to Denver',
    time: '6:40 AM',
    endTime: '9:10 AM',
    category: 'Travel',
    scope: 'mine',
    chip: 'chip-travel',
    location: 'DTW → DEN',
    notes: 'Confirmation F8Q2. Window seat.',
    recurrence: 'Does not repeat',
    reminder: '1 day before · email',
    rsvp: null,
    invites: [],
    owner: 'You',
  },
  {
    id: 4,
    day: 15,
    title: 'Friendsgiving planning',
    time: '7:00 PM',
    endTime: '8:00 PM',
    category: 'Personal',
    scope: 'shared',
    chip: 'chip-personal',
    location: 'Kate’s apartment',
    notes: 'Bring a side. Poll still open for the weekend.',
    recurrence: 'Does not repeat',
    reminder: '3 hours before · email',
    rsvp: 'Maybe',
    invites: [
      { name: 'Kate Brown', status: 'Attending' },
      { name: 'Ben Carter', status: 'Pending' },
      { name: 'Emma Clark', status: 'Attending' },
    ],
    owner: 'You',
    poll: {
      status: 'Open',
      options: [
        { label: 'Sat 7 Nov · 5pm', votes: 3 },
        { label: 'Sun 8 Nov · 4pm', votes: 1 },
      ],
    },
  },
  {
    id: 5,
    day: 21,
    title: 'Fall Career Fair',
    time: '11:00 AM',
    endTime: '3:00 PM',
    category: 'School',
    scope: 'imported',
    chip: 'chip-school',
    location: 'Recreation Center',
    notes: 'Imported from the school calendar.',
    recurrence: 'Does not repeat',
    reminder: '1 day before · email',
    rsvp: null,
    invites: [],
    owner: 'You',
  },
  {
    id: 6,
    day: 28,
    title: 'Portfolio review',
    time: '2:00 PM',
    endTime: '3:00 PM',
    category: 'Work',
    scope: 'mine',
    chip: 'chip-work',
    location: 'Library 3rd floor',
    notes: '',
    recurrence: 'Does not repeat',
    reminder: '1 hour before · in-app',
    rsvp: null,
    invites: [],
    owner: 'You',
  },
]

export const REMINDERS = [
  { id: 1, when: 'Today · 8:00 AM', title: 'Dentist', detail: 'In 1 hour · email + in-app' },
  { id: 2, when: 'Tue 14 Oct · 5:40 AM', title: 'Flight to Denver', detail: '1 day before' },
  { id: 3, when: 'Wed 21 Oct · 11:00 AM', title: 'Fall Career Fair', detail: 'Imported event' },
]

export const PENDING_INVITES = [
  { id: 1, title: 'Game night', from: 'Kate Brown', when: 'Fri 30 Oct · 8:00 PM' },
  { id: 2, title: 'Design critique', from: 'Mike Davis', when: 'Mon 2 Nov · 1:00 PM' },
]

export const SAMPLE_IMPORTS = [
  {
    id: 'i1',
    title: 'Midterm',
    start: '2026-10-22 10:00',
    end: '2026-10-22 11:50',
    location: 'Room 234',
    source: 'School calendar',
    visibility: 'Private',
    included: true,
  },
  {
    id: 'i2',
    title: 'Advising walk-in',
    start: '2026-10-24 13:00',
    end: '2026-10-24 15:00',
    location: 'Student center',
    source: 'School calendar',
    visibility: 'Private',
    included: true,
  },
  {
    id: 'i3',
    title: 'Family dinner',
    start: '2026-10-25 18:30',
    end: '2026-10-25 20:30',
    location: 'Home',
    source: 'Pasted notes',
    visibility: 'Private',
    included: false,
  },
]

export const COMMUNITY_CALENDARS = [
  {
    id: 'school',
    name: 'School calendar',
    detail: 'Official academic and campus events.',
  },
  {
    id: 'work',
    name: 'Studio team calendar',
    detail: 'Shared work events from people you already work with.',
  },
]

export function octoberCells(events = EVENTS) {
  const firstWeekday = 4
  const daysInMonth = 31
  const cells = []
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ key: `pad-${i}`, day: 27 + i, muted: true, events: [] })
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `d-${day}`,
      day,
      muted: false,
      events: events.filter((event) => event.day === day),
    })
  }
  return cells
}
