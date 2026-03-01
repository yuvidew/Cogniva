"use client";

import * as React from "react";
import {
    MessageCircle,
    Cpu,
    LayoutDashboard,
    Database,
    FileText as FileDescription,
    FileType,
    HelpCircle,
    ClipboardList,
    Search,
    Settings,
    Users,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { SquareMousePointer } from "lucide-react";
import Link from "next/link";
import { PlanSection } from "./plan-section";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },

    navMain: {
        title: "Main",
        items:  [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Agents",
            url: "/agents",
            icon: Cpu,
        },
        {
            title: "Charts",
            url: "/charts",
            icon: MessageCircle,
        },
        {
            title: "Profile",
            url: "/profile",
            icon: Users,
        },
    ]
    },
    navSecondary: {
        title: "Settings",
        items: [
        {
            title: "Settings",
            url: "#",
            icon: Settings,
        },
        {
            title: "Get Help",
            url: "#",
            icon: HelpCircle,
        },
        {
            title: "Search",
            url: "#",
            icon: Search,
        },
    ]},
    documents: [
        {
            name: "Data Library",
            url: "#",
            icon: Database,
        },
        {
            name: "Reports",
            url: "#",
            icon: ClipboardList,
        },
        {
            name: "Word Assistant",
            url: "#",
            icon: FileType,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-transparent"
                        >
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <Button size="icon-sm">
                                    <SquareMousePointer />
                                </Button>
                                <span className="text-base font-semibold">Cogniva</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain.items} title={data.navMain.title} />
                <NavSecondary items={data.navSecondary.items} title={data.navSecondary.title} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <PlanSection/>
                <NavUser  />
            </SidebarFooter>
        </Sidebar>
    );
}
