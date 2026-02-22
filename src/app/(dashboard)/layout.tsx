import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SiteHeader } from '@/components/sidebar/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React, { ReactNode } from 'react'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="py-6 px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
