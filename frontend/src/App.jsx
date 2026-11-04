import { Navigate, Route, Routes } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage.jsx'
import HomePage from './pages/HomePage.jsx'
import ImportPage from './pages/ImportPage.jsx'
import InvitationsPage from './pages/InvitationsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/import" element={<ImportPage />} />
      <Route path="/invitations" element={<InvitationsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
