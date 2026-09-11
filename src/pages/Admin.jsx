import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

/* Card accents for wishes, mirroring the public site's palette. */
const cardTones = [
  'border-indigo-800/60',
  'border-rose-800/60',
  'border-amber-700/50',
]

/* ─── Protected admin route ───────────────────────────────────────
   Not logged in → login form. Logged in → the private wishes dashboard.
   This component IS the guard: nothing renders unless there's a session. */
export default function Admin() {
  const { user, loading, signIn, signOut } = useAuth()

  if (!supabase) {
    return (
      <Shell>
        <p className="text-indigo-200/80">Supabase isn&rsquo;t configured yet. Add your URL and key to <code className="text-amber-300">.env</code> and restart the dev server.</p>
      </Shell>
    )
  }
  if (loading) {
    return <Shell><p className="text-indigo-200/80">Checking your session&hellip;</p></Shell>
  }
  if (!user) return <Login onSignIn={signIn} />
  return <Dashboard user={user} onSignOut={signOut} />
}

/* Simple centered layout used by the placeholder states. */
function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">{children}</div>
    </div>
  )
}

/* ─── Login form ──────────────────────────────────────────────── */
function Login({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await onSignIn(email.trim(), password)
    setBusy(false)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-[#0B0E1A] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-5 bg-[#121629] p-8 rounded-2xl border border-indigo-800/60 shadow-xl">
        <div>
          <p className="font-mono mb-2 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">Private area &#10022;</p>
          <h1 className="font-display text-3xl text-white font-bold">Admin sign in</h1>
          <p className="mt-2 text-sm text-indigo-200/70">Only Ekemini can view the birthday wishes.</p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-medium text-indigo-200">Email
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-indigo-800/80 bg-[#0B0E1A] rounded-xl p-3.5 text-white outline-indigo-500 focus:border-indigo-400 transition-colors placeholder:text-indigo-400/50"
            placeholder="you@example.com" />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-indigo-200">Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="border border-indigo-800/80 bg-[#0B0E1A] rounded-xl p-3.5 text-white outline-indigo-500 focus:border-indigo-400 transition-colors"
            placeholder="••••••••" />
        </label>

        {error && <p className="text-sm font-medium text-rose-400">{error}</p>}

        <button type="submit" disabled={busy}
          className="inline-flex justify-center items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:opacity-95 px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <Link to="/" className="text-center text-sm text-indigo-300/70 hover:text-amber-300 transition-colors">&larr; Back to the site</Link>
      </form>
    </div>
  )
}

/* ─── Wishes dashboard ────────────────────────────────────────── */
function Dashboard({ user, onSignOut }) {
  const [wishes, setWishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(error.message)
        else { setWishes(data); setError('') }
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  async function remove(id) {
    if (!window.confirm('Delete this wish permanently?')) return
    const { error } = await supabase.from('wishes').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setWishes((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="min-h-screen bg-[#0B0E1A] text-slate-100">
      <header className="sticky top-0 z-10 border-b border-indigo-900/60 bg-[#0B0E1A]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">Birthday wishes &#10022;</p>
            <h1 className="font-display text-2xl text-white font-bold">
              {loading ? 'Loading…' : `${wishes.length} ${wishes.length === 1 ? 'wish' : 'wishes'}`}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-indigo-300/80 hover:text-amber-300 transition-colors">View site</Link>
            <button onClick={onSignOut}
              className="rounded-full border border-indigo-700/70 px-4 py-2 text-sm font-medium text-indigo-200 hover:border-rose-500/70 hover:text-rose-300 transition-colors cursor-pointer">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="mb-6 text-sm text-indigo-300/60">Signed in as {user.email}</p>

        {error && (
          <p className="mb-6 rounded-xl border border-rose-800/60 bg-rose-950/30 p-4 text-sm text-rose-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-indigo-200/70">Fetching your wishes&hellip;</p>
        ) : wishes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-800/60 p-12 text-center text-indigo-200/70">
            No wishes yet. Share your site and they&rsquo;ll show up here.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {wishes.map((w, i) => (
              <article key={w.id}
                className={`relative flex flex-col gap-3 rounded-2xl border bg-[#121629] p-6 shadow-lg transition-transform hover:-translate-y-0.5 ${cardTones[i % cardTones.length]}`}>
                <span className="font-display absolute -top-4 left-4 text-6xl leading-none text-indigo-400/30" aria-hidden="true">&ldquo;</span>
                <p className="relative text-sm leading-relaxed text-slate-200">{w.message}</p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  <div className="min-w-0">
                    <p className="truncate font-display text-base text-white">&mdash; {w.name}</p>
                    <time className="text-xs text-indigo-300/60">
                      {new Date(w.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </time>
                  </div>
                  <button onClick={() => remove(w.id)}
                    className="shrink-0 rounded-full border border-indigo-800/70 px-3 py-1.5 text-xs font-medium text-indigo-300/80 hover:border-rose-500/70 hover:text-rose-300 transition-colors cursor-pointer">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
