import { useEffect, useState, useRef } from 'react'
import heroImage from '../My Image.png'

/* ─── Birthday Splash Screen ───────────────────────────────────── */
function BirthdaySplash({ onDone }) {
  const canvasRef = useRef(null)
  const [phase, setPhase] = useState('enter') // enter → hold → exit

  /* Confetti particle system */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
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
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 3 + 1.5,
      drift: (Math.random() - 0.5) * 1.5,
      spin: (Math.random() - 0.5) * 0.15,
      angle: Math.random() * Math.PI * 2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.y += p.speed
        p.x += p.drift
        p.angle += p.spin
        if (p.y > canvas.height + 20) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }
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
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  /* Animation timeline */
  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase('exit'), 3200)
    const doneTimer = setTimeout(() => onDone(), 4100)
    return () => { clearTimeout(holdTimer); clearTimeout(doneTimer) }
  }, [onDone])

  return (
    <div className="splash-root" data-phase={phase}>
      <canvas ref={canvasRef} className="splash-canvas" />
      <div className="splash-blob splash-blob--left" />
      <div className="splash-blob splash-blob--right" />
      <div className="splash-content" data-phase={phase}>
        <p className="splash-eyebrow">&#10022; &nbsp; September 07 &nbsp; &#10022;</p>
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

const starterWishes = [
  { id: 1, name: 'Amara', message: 'May this new year bring you beautiful surprises and every reason to smile!', tone: 'bg-[#141A33] border-indigo-800/70 text-indigo-100' },
  { id: 2, name: 'Tomi', message: "Here's to your brightest, kindest, most unforgettable year yet. Happy birthday!", tone: 'bg-[#1E142B] border-purple-800/70 text-purple-100' },
  { id: 3, name: 'Kael', message: 'Wishing you endless joy, courage, and cake on your special day!', tone: 'bg-[#0E2028] border-teal-800/70 text-teal-100' },
]

const cardTones = [
  'bg-[#141A33] border-indigo-800/70 text-indigo-100',
  'bg-[#1E142B] border-purple-800/70 text-purple-100',
  'bg-[#0E2028] border-teal-800/70 text-teal-100',
]

const PER_PAGE = 6

function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [wishes, setWishes] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('birthday-wishes'))
      if (stored && Array.isArray(stored) && stored.length > 0) {
        return stored.map((w, idx) => {
          if (!w.tone || w.tone.includes('orange-100') || w.tone.includes('violet-100')) {
            return { ...w, tone: cardTones[idx % cardTones.length] }
          }
          return w
        })
      }
      return starterWishes
    } catch {
      return starterWishes
    }
  })
  const [form, setForm] = useState({ name: '', message: '' })
  const [sent, setSent] = useState(false)
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(wishes.length / PER_PAGE)
  const visibleWishes = wishes.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  useEffect(() => localStorage.setItem('birthday-wishes', JSON.stringify(wishes)), [wishes])

  function submitWish(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    const nextTone = cardTones[wishes.length % cardTones.length]
    setWishes([{ id: Date.now(), name: form.name.trim(), message: form.message.trim(), tone: nextTone }, ...wishes])
    setForm({ name: '', message: '' })
    setSent(true)
    setPage(0)
  }

  function deleteWish(id) {
    const next = wishes.filter((w) => w.id !== id)
    setWishes(next)
    const maxPage = Math.max(0, Math.ceil(next.length / PER_PAGE) - 1)
    setPage((p) => Math.min(p, maxPage))
  }

  return <>
    {!splashDone && <BirthdaySplash onDone={() => setSplashDone(true)} />}
    <main className={`relative overflow-hidden text-slate-100 bg-[#0B0E1A] main-fade ${splashDone ? 'main-visible' : ''}`}>
      {/* Ambient Glows */}
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"></div>
      <div className="absolute -right-32 top-48 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none"></div>

      <nav className="relative z-10 mx-auto flex h-22 max-w-6xl items-center justify-between px-6 lg:px-8">
        <a href="#top" className="font-display text-4xl italic text-white font-semibold hover:text-amber-300 transition">Dev-Ek</a>
        <div className="flex gap-8 text-sm font-medium text-indigo-200">
          <a href="#about" className="hover:text-amber-300 transition-colors">About me</a>
          <a href="#wishes" className="hover:text-amber-300 transition-colors">Send wishes</a>
        </div>
      </nav>

      <section id="top" className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-14 lg:grid-cols-2 lg:px-8 pb-32 lg:pb-24">
        <div>
          <p className="font-mono mb-5 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">SEPTEMBER 07 &middot; MY DAY &#10022;</p>
          <h1 className="font-display text-6xl leading-[1.05] tracking-tight text-white sm:text-7xl font-bold">Another year<br /><em className="bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-200 bg-clip-text text-transparent not-italic">of becoming.</em></h1>
          <p className="mt-7 max-w-md leading-7 text-indigo-200/80 text-base">A little corner of the internet to celebrate this chapter, the people I love, and all the good things still on their way.</p>
          <a href="#wishes" className="mt-8 inline-flex items-center gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:opacity-95 px-6 py-4 rounded-full text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/30 hover:-translate-y-0.5">Leave a birthday wish <span className="text-white text-lg">&#8599;</span></a>
        </div>
        {/* Hero image frame — circle portrait */}
        <div className="relative mx-auto flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 lg:w-[420px] lg:h-[420px]">

          {/* Spinning gradient ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-amber-300 animate-spin" style={{animationDuration: '8s', padding: '4px'}}>
            <div className="w-full h-full rounded-full bg-[#0B0E1A]" />
          </div>

          {/* Outer pulse glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 opacity-25 blur-2xl scale-110 pointer-events-none" />

          {/* Static border ring so image sits cleanly */}
          <div className="absolute inset-0 rounded-full p-[4px] bg-gradient-to-br from-indigo-400 via-purple-500 to-amber-300 shadow-2xl shadow-indigo-900/60">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0E1A]">
              <img
                src={heroImage}
                alt="Ekemini Eshiet"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Floating badge — top right */}
          <div className="absolute top-2 -right-5 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 shadow-lg shadow-amber-500/40 z-10">
            <span className="text-lg leading-none">&#127881;</span>
            <span className="text-[9px] font-bold text-white mt-0.5 tracking-wide">B-DAY</span>
          </div>

          {/* Floating badge — bottom left */}
          <div className="absolute bottom-4 -left-5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40 text-xl z-10">
            &#127873;
          </div>

          {/* Name pill below circle */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#121629] border border-indigo-700/50 rounded-full px-4 py-1.5 shadow-lg whitespace-nowrap z-10">
            <span className="text-amber-400 text-[10px]">&#10022;</span>
            <span className="text-white text-xs font-semibold tracking-wide">Ekemini Eshiet</span>
            <span className="text-amber-400 text-[10px]">&#10022;</span>
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 bg-[#121629] border-y border-indigo-900/60 px-6 py-20 lg:grid-cols-2 lg:gap-20 lg:px-[max(2rem,calc((100%-68rem)/2))] grid gap-8">
        <div>
          <p className="font-mono mb-5 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">A LITTLE ABOUT ME &#10022;</p>
          <h2 className="font-display text-5xl leading-tight tracking-tight text-white font-bold">Growing, dreaming,<br />and making it count.</h2>
        </div>
        <p className="max-w-md pt-5 leading-8 text-indigo-200/80 text-base">I&rsquo;m someone who finds joy in good conversations, fresh ideas, and making the ordinary feel a little more special. This year, I&rsquo;m choosing gratitude, courage, and plenty of cake.</p>
      </section>

      <section id="wishes" className="relative z-10 mx-auto max-w-6xl px-6 py-24 lg:px-8">
        <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono mb-5 text-[11px] font-semibold tracking-[.14em] text-amber-400 uppercase">MAKE MY DAY &#10022;</p>
            <h2 className="font-display text-5xl tracking-tight text-white font-bold">Send some love.</h2>
          </div>
          <p className="max-w-xs leading-7 text-indigo-200/80 text-base">Your words mean more than you know. Leave a little note for the birthday person.</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
          {/* Form */}
          <form onSubmit={submitWish} className="flex flex-col gap-5 bg-[#121629] p-8 rounded-2xl border border-indigo-800/60 shadow-xl">
            <label className="flex flex-col gap-2 text-sm font-medium text-indigo-200">Your name
              <input className="border border-indigo-800/80 bg-[#0B0E1A] rounded-xl p-3.5 text-white outline-indigo-500 focus:border-indigo-400 transition-colors placeholder:text-indigo-400/50" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="What should I call you?" maxLength="40" required />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-indigo-200">Your birthday wish
              <textarea className="h-32 resize-y border border-indigo-800/80 bg-[#0B0E1A] rounded-xl p-3.5 text-white outline-indigo-500 focus:border-indigo-400 transition-colors placeholder:text-indigo-400/50" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write something lovely..." maxLength="300" required />
            </label>
            <button className="inline-flex w-fit items-center gap-3 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 hover:opacity-95 px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all shadow-lg shadow-rose-500/30 hover:-translate-y-0.5 cursor-pointer" type="submit">Send my wish <span className="text-white">&#9829;</span></button>
            {sent && <p className="text-sm font-medium text-emerald-400">Your wish has been saved. Thank you! &#10022;</p>}
          </form>

          {/* Wishes grid + pagination */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] font-semibold tracking-[.12em] text-indigo-400 uppercase">
                {wishes.length} {wishes.length === 1 ? 'WISH' : 'WISHES'} RECEIVED
              </p>
              {totalPages > 1 && (
                <p className="font-mono text-[11px] text-indigo-500 uppercase tracking-widest">
                  Page {page + 1} / {totalPages}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visibleWishes.map((wish, idx) => {
                const cardTone = (wish.tone && !wish.tone.includes('orange-100') && !wish.tone.includes('violet-100'))
                  ? wish.tone
                  : cardTones[idx % cardTones.length]
                return (
                  <article className={`relative min-h-44 p-6 rounded-2xl border shadow-lg transition-all hover:-translate-y-1 hover:shadow-indigo-900/30 ${cardTone}`} key={wish.id}>
                    <button onClick={() => deleteWish(wish.id)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/40 text-lg text-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors" type="button" aria-label={`Delete wish from ${wish.name}`}>&times;</button>
                    <span className="font-display block h-8 text-5xl leading-none text-amber-400 opacity-90">&ldquo;</span>
                    <p className="mt-2 text-sm leading-6 text-slate-100 font-normal">{wish.message}</p>
                    <strong className="mt-4 block text-xs font-semibold tracking-wide text-amber-300 uppercase">&mdash; {wish.name}</strong>
                  </article>
                )
              })}
            </div>

            {/* Pagination controls — only shown when there's more than one page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-5 py-2 rounded-full text-sm font-semibold border border-indigo-700/60 text-indigo-200 hover:border-indigo-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >&#8592; Prev</button>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-2 rounded-full transition-all ${i === page ? 'w-6 bg-amber-400' : 'w-2 bg-indigo-700 hover:bg-indigo-500'}`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-5 py-2 rounded-full text-sm font-semibold border border-indigo-700/60 text-indigo-200 hover:border-indigo-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >Next &#8594;</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-indigo-900/60 py-8 text-center text-sm text-indigo-300/70">Made with a full heart <span className="text-amber-400">&#9829;</span></footer>
    </main>
  </>
}
export default App
