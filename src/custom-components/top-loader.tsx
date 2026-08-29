import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { Progress } from "../components/ui/progress"
import { cn } from "../../src/lib/utils"

const TopLoadingBar = () => {
  const location = useLocation()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    // Skip the very first mount — only animate on actual navigations
    if (!location.key) return

    clearInterval(intervalRef.current)
    clearTimeout(timeoutRef.current)

    setVisible(true)
    setProgress(15)

    // Creep toward 90% while we "wait" for the new route to render
    intervalRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + (90 - prev) * 0.2))
    }, 120)

    // Finish the bar shortly after the route change is applied
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setProgress(100)
      setTimeout(() => setVisible(false), 200)
    }, 400)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [location.pathname])

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <Progress
        value={progress}
        className="h-0.5 w-full rounded-none bg-transparent [&>div]:rounded-none [&>div]:transition-[transform] [&>div]:duration-200 [&>div]:ease-out"
      />
    </div>
  )
}

export default TopLoadingBar