import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SiteHeader } from '@/components/sidebar/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { requireAuth } from '@/lib/auth-utils'
import React, { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAuth()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" initialUser={session.user} />
      <SidebarInset>
        <SiteHeader />
        <div className="py-6 px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
