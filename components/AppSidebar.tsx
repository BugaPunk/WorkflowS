import { JSX } from "preact";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar.tsx";
import { AppLogo } from "./AppLogo.tsx";
import { NavMain } from "./NavMain.tsx";
import { NavFooter } from "./NavFooter.tsx";
import { NavUser } from "./NavUser.tsx";
import { UserRole } from "../models/user.ts";

interface AppSidebarProps {
  userRole?: UserRole;
}

export function AppSidebar({ userRole }: AppSidebarProps): JSX.Element {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <a href="/welcome" class="flex items-center w-full">
                <AppLogo />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain userRole={userRole} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter class="mt-auto" />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
