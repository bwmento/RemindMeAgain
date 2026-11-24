import { SignIn } from '@clerk/react'
import { Link, Navigate } from 'react-router-dom'
import { clerkKey, useSession } from '../auth.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function SignInPage() {
  const { signedIn } = useSession()
  if (signedIn) return <Navigate to="/calendar" replace />

  return (
    <div className="page">
      <SiteHeader />
      <div className="auth-page">
        {clerkKey ? (
          <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
        ) : (
          <section className="card auth-setup">
            <h1>Sign in</h1>
            <p>Add your Clerk publishable key to <code>frontend/.env</code> as <code>VITE_CLERK_PUBLISHABLE_KEY</code>, then restart the app.</p>
            <p>The API also needs <code>CLERK_SECRET_KEY</code> and the MySQL settings in <code>server/.env</code>.</p>
            <Link className="btn btn-outline" to="/">
              Back home
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
