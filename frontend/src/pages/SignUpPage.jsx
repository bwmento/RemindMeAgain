import { SignUp } from '@clerk/react'
import { Link, Navigate } from 'react-router-dom'
import { clerkKey, useSession } from '../auth.jsx'
import SiteHeader from '../components/SiteHeader.jsx'

export default function SignUpPage() {
  const { signedIn } = useSession()
  if (signedIn) return <Navigate to="/calendar" replace />

  return (
    <div className="page">
      <SiteHeader />
      <div className="auth-page">
        {clerkKey ? (
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        ) : (
          <section className="card auth-setup">
            <h1>Create an account</h1>
            <p>Add your Clerk publishable key to <code>frontend/.env</code> as <code>VITE_CLERK_PUBLISHABLE_KEY</code>, then restart the app.</p>
            <Link className="btn btn-outline" to="/sign-in">
              Sign in
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
