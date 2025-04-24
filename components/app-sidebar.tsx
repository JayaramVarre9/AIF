"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} className="overflow-hidden">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-13 py-4">
          <Image
            src="/attainxname.svg"
            alt="AttainX Name"
            width={120}
            height={22}
            className="bg-white pl-2"
          />
        </div>
      </SidebarHeader>

      {/* Scrollable SidebarContent with scrollbar hidden */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <SidebarContent>
          <NavMain
            items={[
              {
                title: "Home",
                url: "/dashboard",
                icon: SquareTerminal,
                isActive: true,
                items: [
                  { title: "Clusters", url: "/cluster" },
                  { title: "Activity", url: "/logs" },
                  { title: "Dashboard", url: "/dashboard" },
                ],
              },
              {
                title: "Activity",
                url: "#",
                icon: Bot,
                items: [
                  { title: "Logs", url: "/logs" },
                  { title: "Resources Running", url: "/cluster" },
                  { title: "View Status", url: "#" },
                ],
              },
              {
                title: "Documentation",
                url: "#",
                icon: BookOpen,
                items: [
                  { title: "Introduction", url: "#" },
                  { title: "Get Started", url: "#" },
                  { title: "Tutorials", url: "#" },
                  { title: "Changelog", url: "#" },
                ],
              },
              {
                title: "Settings",
                url: "#",
                icon: Settings2,
                items: [
                  { title: "General", url: "#" },
                  { title: "Team", url: "#" },
                  { title: "Limits", url: "#" },
                ],
              },
            ]}
          />
          <NavProjects
            projects={[
              { name: "Audio", url: "#", icon: Frame },
              { name: "CV", url: "#", icon: PieChart },
            ]}
          />
        </SidebarContent>
      </div>

      <SidebarFooter>
        <NavUser user={{ name: "AI-Factroy", email: "", avatar: "" }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
export { Sidebar }

