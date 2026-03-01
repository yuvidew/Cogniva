"use client"

import {
  CreditCard,
  MoreVertical,
  LogOut,
  Bell,
  UserCircle,
  LogOutIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "../ui/spinner"

export function NavUser() {
  const { isMobile } = useSidebar();
  const [isSignOutLoading, setIsSignOutLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { data: session } = authClient.useSession();
  const user = session?.user;


  const onSignOut = async () => {
    setIsSignOutLoading(true)
    try {

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            setOpen(false)
            router.replace("/sign-in")
          }
        }
      })
    } catch {
      setIsSignOutLoading(false)
    } finally {
      setIsSignOutLoading(false)
    }
  }




  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                <AvatarFallback className="rounded-lg">
                  {user?.name?.slice(0, 2).toUpperCase() ?? "CN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
                  <AvatarFallback className="rounded-lg">
                    {user?.name?.slice(0, 2).toUpperCase() ?? "CN"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push("/profile"); setOpen(false); }}>
                <UserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={async (e) => { e.preventDefault(); await authClient.customer.portal(); setOpen(false); }}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push("/notifications"); setOpen(false); }}>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onSignOut(); }} disabled={isSignOutLoading}>
              {isSignOutLoading ? <Spinner className="text-primary" /> : <LogOutIcon className=" size-4" />}
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
