import { useState } from "react"
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  LogOutIcon,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu"
import { Spinner } from "../../src/components/ui/spinner"
import { logout as logoutRequest } from "@/api/auth/auth"
import { clearSession, getStoredUser } from "@/lib/auth/auth"

const NavUser = () => {
  const [loggingOut, setLoggingOut] = useState(false)
  const [open, setOpen] = useState(false)

  const storedUser = getStoredUser()
  const user = {
    name: storedUser?.username ?? "",
    email: storedUser?.role ?? "",
    avatar: "",
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logoutRequest()
    } catch {
      // Even if the server call fails (e.g. token already expired), we still
      // clear the local session below — a failed logout call shouldn't trap
      // the user in a signed-in-looking state.
    } finally {
      clearSession()
      setLoggingOut(false)
      // Full reload so App.tsx's isAuthenticated state (initialized from
      // checkIsAuthenticated()) re-evaluates cleanly against the cleared session.
      window.location.href = "/login"
    }
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (loggingOut) return
        setOpen(next)
      }}
    >
      <DropdownMenuTrigger
        render={
          <button
            type="button"
             className="flex items-center gap-2 rounded-lg p-1.5 text-sm outline-none data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          />
        }
      >
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="hidden grid-flow-row text-left leading-tight sm:grid">
          <span className="truncate font-medium text-white">{user.name}</span>
          <span className="truncate text-xs text-white/70">
            {user.email}
          </span>
        </div>
        <ChevronsUpDownIcon className="ml-auto size-4 text-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="bottom"
        align="end"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden grid-flow-row text-left leading-tight sm:grid">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
        <DropdownMenuItem
          disabled={loggingOut}
          onClick={(e) => {
            e.preventDefault()
            handleLogout()
          }}
          closeOnClick={false}
        >
          {loggingOut ? <Spinner className="size-4" /> : <LogOutIcon className="text-red-600" />}
          {loggingOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NavUser