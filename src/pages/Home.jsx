import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import heroImage from '../assets/hero.webp'

/* ─── Typewriter hook ───────────────────────────────────────────── */
function useTypewriter(lines, { delay = 500, speed = 55 } = {}) {
  const [displayed, setDisplayed] = useState([])   // fully typed lines
  const [current, setCurrent] = useState('')        // line being typed
  const [lineIdx, setLineIdx] = useState(0)         // which line we're on
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (lineIdx >= lines.length) { setDone(true); return }

    // pause before starting the first character of a new line
    const startPause = setTimeout(() => {
      let charIdx = 0
      const interval = setInterval(() => {
        charIdx++
        setCurrent(lines[lineIdx].slice(0, charIdx))
        if (charIdx === lines[lineIdx].length) {
          clearInterval(interval)
          setDisplayed((prev) => [...prev, lines[lineIdx]])
          setCurrent('')
          setLineIdx((i) => i + 1)
        }
      }, speed)
      return () => clearInterval(interval)
    }, lineIdx === 0 ? delay : 300)

    return () => clearTimeout(startPause)
  }, [lineIdx, lines, delay, speed])

  return { displayed, current, done }
}

/* ─── Birthday Splash Screen ───────────────────────────────────── */
function BirthdaySplash({ onDone }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('enter') // enter → hold → exit

  /* Confetti particle system — frame-rate independent, respects reduced-motion */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const colors = ['#fbbf24', '#818cf8', '#c084fc', '#f472b6', '#34d399', '#fb923c']
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: reduceMotion ? Math.random() * canvas.height : Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 1.5,
      drift: (Math.random() - 0.5) * 1.5,
      spin: (Math.random() - 0.5) * 0.15,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    /* Paint every particle at its current position */
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        if (p.shape === 'rect') {
          ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })
    }

    /* Reduced motion: a single static frame, no animation loop */
    if (reduceMotion) {
      render()
      return () => window.removeEventListener('resize', resize)
    }

    /* Otherwise animate, scaling movement by elapsed time (normalized to 60fps)
       so speed is identical on 60Hz, 120Hz and 144Hz displays */
    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min((now - last) / (1000 / 60), 3)
      last = now
      particles.forEach((p) => {
        p.y += p.speed * dt
        p.x += p.drift * dt
        p.angle += p.spin * dt
        if (p.y > canvas.height + 20) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }
      })
      render()
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  /* Lock body scroll and force splash to cover full viewport on mobile */
  useEffect(() => {
    document.body.classList.add('splash-open')
    return () => document.body.classList.remove('splash-open')
  }, [])

  /* Animation timeline — shortened when reduced-motion is preferred */
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const holdTimer = setTimeout(() => setPhase('exit'), reduceMotion ? 1200 : 3200)
    const doneTimer = setTimeout(() => onDone(), reduceMotion ? 1600 : 4100)
    return () => { clearTimeout(holdTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className="splash-root" data-phase={phase}>
      <canvas ref={canvasRef} className="splash-canvas" />
      <div className="splash-blob splash-blob--left" />
      <div className="splash-blob splash-blob--right" />
      <div className="splash-content" data-phase={phase}>
        <p className="splash-eyebrow">October 08</p>
        <h1 className="splash-title">
          <span className="splash-happy">Happy</span>
          <span className="splash-birthday">Birthday</span>
        </h1>
        <p className="splash-name">Ekemini Eshiet</p>
        <div className="splash-balloons" aria-hidden="true">
          <span>&#127880;</span><span>&#127874;</span><span>&#127881;</span><span>&#127873;</span><span>&#127880;</span>
        </div>
      </div>
    </div>
  )
}

function Home() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem('splash-shown') === 'true'
  })
  const [form, setForm] = useState({ name: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [scrolled, setScrolled] = useState(false)       // #2 frosted nav
  const [menuOpen, setMenuOpen] = useState(false)        // #3 hamburger

  // #2 — frosted nav on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 640) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // #4 — intersection observer for section entrance animations
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target) } }),
      { threshold: 0.15 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [splashDone])

  const headingLines = ['Another year of', 'growing, learning', 'and evolving.']
  const { displayed, current, done: typeDone } = useTypewriter(
    splashDone ? headingLines : [],
    { delay: 400, speed: 55 }
  )

  async function submitWish(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    if (!supabase) { setStatus('error'); return }
    setStatus('sending')
    try {
      const { error } = await supabase.from('wishes').insert({ name: form.name.trim(), message: form.message.trim() })
      if (error) { setStatus('error'); return }
      setForm({ name: '', message: '' })
      setStatus('success')
    } catch { setStatus('error') }
  }

  return <>
    {!splashDone && <BirthdaySplash onDone={() => { sessionStorage.setItem('splash-shown', 'true'); setSplashDone(true) }} />}
    <main className={`relative overflow-hidden text-slate-100 bg-[#0B0E1A] ${splashDone ? 'main-visible' : 'main-fade'}`}>
      {/* Ambient Glows */}
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 top-48 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'nav-frosted' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <a href="#top" className="font-display text-3xl italic text-white font-semibold hover:text-amber-300 transition">Dev-Ek</a>

          {/* Desktop links */}
          <div className="hidden sm:flex gap-8 text-sm font-medium text-indigo-200">
            <a href="#about"  className="hover:text-amber-300 transition-colors">About me</a>
            <a href="#wishes" className="hover:text-amber-300 transition-colors">Send wishes</a>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="sm:hidden flex flex-col justify-center gap-[5px] w-8 h-8 relative z-40"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-white rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} nav-frosted`}>
          <div className="flex flex-col px-6 py-4 gap-4 text-sm font-medium text-indigo-200">
            <a href="#about"  onClick={() => setMenuOpen(false)} className="hover:text-amber-300 transition-colors">About me</a>
            <a href="#wishes" onClick={() => setMenuOpen(false)} className="hover:text-amber-300 transition-colors">Send wishes</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="top"
        className="relative z-10 min-h-[60vh] sm:min-h-[75vh] lg:min-h-[92vh] flex items-center sm:items-end pb-0 sm:pb-16 lg:pb-20 px-6 lg:px-8 overflow-hidden"
      >
        <img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" style={{objectPosition: '85% top'}} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E1A] via-[#0B0E1A]/70 to-[#0B0E1A]/20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E1A]/90 via-[#0B0E1A]/50 to-transparent pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <p className="font-mono mb-3 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">OCTOBER 08 &middot; MY BIRTHDAY</p>
          <h1 className="font-display leading-[1.1] tracking-tight text-white font-bold max-w-2xl" style={{fontSize: 'clamp(1.6rem, 5vw, 3.75rem)'}}>
            {displayed.map((line, i) => (
              <span key={i} className="block">
                {i === 0
                  ? <span className="text-white">{line}</span>
                  : <em className="bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-200 bg-clip-text text-transparent not-italic">{line}</em>}
              </span>
            ))}
            {!typeDone && (
              <span className="block">
                {displayed.length === 0
                  ? <span className="text-white">{current}</span>
                  : <em className="bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-200 bg-clip-text text-transparent not-italic">{current}</em>}
                <span className="typing-cursor" aria-hidden="true" />
              </span>
            )}
          </h1>

          {/* #5 — subtitle + button fade in after typewriter done */}
          <div className={`hero-after-type ${typeDone ? 'hero-after-type--visible' : ''}`}>
            <p className="mt-4 max-w-md leading-7 text-indigo-200/80 text-base">Grateful for every moment that shaped me, and excited for everything still to come.</p>
            <a href="#wishes" className="mt-5 inline-flex items-center gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:opacity-95 px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/30 hover:-translate-y-0.5">Leave a birthday wish <span className="text-white text-lg">&#8599;</span></a>
          </div>
        </div>


      </section>

      {/* ── About ── */}
      <section id="about" className="reveal relative z-10 bg-[#121629] border-y border-indigo-900/60 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-[max(2rem,calc((100%-68rem)/2))] grid gap-8">
        <div>
          <p className="font-mono mb-5 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">A LITTLE ABOUT ME</p>
          <h2 className="font-display text-5xl leading-tight tracking-tight text-white font-bold">Growing, dreaming,<br />and making it count.</h2>
        </div>
        <p className="max-w-md pt-5 leading-8 text-indigo-200/80 text-base">I am someone who loves exploring new things, finds joy in good conversations, fresh ideas. This year, I am choosing to focus more on the things that matter, working hard and trying out new things.</p>
      </section>

      {/* ── Wishes ── */}
      <section id="wishes" className="reveal relative z-10 mx-auto max-w-3xl px-6 py-24 lg:px-8">
        <div className="mb-12 text-center">
          <p className="font-mono mb-5 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">MAKE MY DAY</p>
          <h2 className="font-display text-5xl tracking-tight text-white font-bold">Send some love.</h2>
          <p className="mx-auto mt-5 max-w-md leading-7 text-indigo-200/80 text-base">Your words mean more than you know. Leave a little note for the birthday person &mdash; it goes straight to her, and only her.</p>
        </div>
        <form onSubmit={submitWish} className="flex flex-col gap-5 bg-[#121629] p-8 rounded-2xl border border-indigo-800/60 shadow-xl">
          <label className="flex flex-col gap-2 text-sm font-medium text-indigo-200">Your name
            <input className="border border-indigo-800/80 bg-[#0B0E1A] rounded-xl p-3.5 text-white outline-indigo-500 focus:border-indigo-400 transition-colors placeholder:text-indigo-400/50" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="What should I call you?" maxLength="40" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-indigo-200">Your birthday wish
            <textarea className="h-32 resize-y border border-indigo-800/80 bg-[#0B0E1A] rounded-xl p-3.5 text-white outline-indigo-500 focus:border-indigo-400 transition-colors placeholder:text-indigo-400/50" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write something lovely..." maxLength="300" required />
          </label>
          <button disabled={status === 'sending'} className="inline-flex w-fit items-center gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:opacity-95 px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0" type="submit">{status === 'sending' ? 'Sending...' : 'Send my wish'} <span className="text-white">&#9829;</span></button>
          {status === 'success' && <p className="text-sm font-medium text-emerald-400">Your wish is on its way to Ekemini. Thank you!</p>}
          {status === 'error'   && <p className="text-sm font-medium text-rose-400">Something went wrong. Please try again.</p>}
        </form>
      </section>

      <footer className="relative z-10 border-t border-indigo-900/60 py-8 text-center text-sm text-indigo-300/70">Made with a full heart <span className="text-amber-400">&#9829;</span></footer>
    </main>
  </>
}
export default Home
