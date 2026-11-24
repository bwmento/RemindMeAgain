import { createContext, useContext } from 'react'
import { ClerkProvider, useAuth, useUser } from '@clerk/react'
import { useNavigate } from 'react-router-dom'

export const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''

const SessionContext = createContext({
  ready: true,
  signedIn: false,
  getToken: async () => null,
  user: null,
})

export function useSession() {
  return useContext(SessionContext)
}

function ClerkBridge({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()

  return (
    <SessionContext.Provider
      value={{
        ready: isLoaded,
        signedIn: Boolean(isSignedIn),
        getToken,
        user,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

function ClerkWithRouter({ children }) {
  const navigate = useNavigate()

  return (
    <ClerkProvider
      publishableKey={clerkKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  )
}

export function AuthProvider({ children }) {
  if (!clerkKey) {
    return <SessionContext.Provider value={{ ready: true, signedIn: false, getToken: async () => null, user: null }}>{children}</SessionContext.Provider>
  }

  return <ClerkWithRouter>{children}</ClerkWithRouter>
}
