import { ComponentType } from "preact";

export interface NavItem {
  title: string;
  href: string;
  icon?: ComponentType;
}

export interface SharedData {
  sidebarOpen: boolean;
  auth: {
    user: {
      username: string;
      email: string;
    };
  };
}
