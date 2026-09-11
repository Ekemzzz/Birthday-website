import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Admin from './pages/Admin'

/* App shell — routes between the public birthday site ("/") and the private
   admin dashboard ("/admin"). We use a HashRouter (see main.jsx), so the admin
   lives at /#/admin and needs no server-side rewrite rules on any static host.
   The admin route guards itself: unauthenticated visitors see the login form. */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
