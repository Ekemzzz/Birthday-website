import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'

/* The admin dashboard (with its Supabase auth) is split into a separate chunk
   and loaded only when someone visits /#/admin — visitors to the public site
   never download it, keeping the first paint fast on phones. */
const Admin = lazy(() => import('./pages/Admin'))

/* App shell — routes between the public birthday site ("/") and the private
   admin dashboard ("/admin"). We use a HashRouter (see main.jsx), so the admin
   lives at /#/admin and needs no server-side rewrite rules on any static host.
   The admin route guards itself: unauthenticated visitors see the login form. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center text-indigo-200/70">Loading…</div>}>
            <Admin />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
