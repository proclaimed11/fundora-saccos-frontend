import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'

// how long the overlay stays fully solid before it starts lifting
const SHOW_MS = 700

export function Preloader() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(true) // true = shows on first load too
  const [lastPath, setLastPath] = useState(pathname)

  // the route changed: switch the overlay on during this same render,
  // so the new page is never painted without it
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setVisible(true)
  }

  // start lifting after a short delay, on first load and after every route change
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), SHOW_MS)
    return () => clearTimeout(timer)
  }, [visible, pathname])

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-5 bg-white ${
        visible
          ? 'opacity-100 transition-none' // appears instantly, fully solid
          : 'pointer-events-none opacity-0 transition-opacity duration-[2500ms] ease-in-out' // slow, graceful lift
      }`}
    >
      {/* no separate fade here: the logo and spinner are part of the overlay,
          so they stay visible and only vanish at the final full transparency */}
      <img src={logo} alt="" className="h-20 w-auto max-w-[80vw] object-contain" />
      <div className="h-8 w-8 rounded-full border-[3px] border-gray-200 border-t-loader motion-safe:animate-spin" />
    </div>
  )
}