import {
  CarTaxiFrontIcon,
  IdCardIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  TentTreeIcon,
  TicketIcon,
  User2Icon,
} from "lucide-react";

const sidebarLinks = [
  { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { title: "Users", href: "/users", icon: User2Icon },
  { title: "Vendors", href: "/vendors", icon: IdCardIcon },
  { title: "Cars", href: "/cars", icon: CarTaxiFrontIcon },
  {
    title: "Cars Categories",
    href: "/cars-categories",
    icon: CarTaxiFrontIcon,
  },
  {
    title: "City",
    href: "/city",
    icon: CarTaxiFrontIcon,
  },
  {
    title: "Transfers",
    href: "/transfers",
    icon: CarTaxiFrontIcon,
  },
  { title: "Bookings", href: "/bookings", icon: TicketIcon },
  {
    title: "Travel Packages",
    href: "/travel-packages",
    icon: TentTreeIcon,
  },
  {
    title: "Rental Packages",
    href: "/rental-packages",
    icon: TentTreeIcon,
  },
];

export { sidebarLinks };
