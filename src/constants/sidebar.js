import {
  LayoutDashboard,
  Route,
  Coins,
  ReceiptText,
  Percent,
  Award,
  MapPin,
  ArrowLeftRight,
  Ticket,
  CarTaxiFront,
  Layers,
  Compass,
  MessageSquareQuote,
  Map,
  Hotel,
  CalendarRange,
  Sparkles,
  Users,
  IdCard,
  UserPlus,
  Warehouse,
  ShieldCheck,
  BadgePercent,
} from "lucide-react";

export const sidebarGroups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Pricing & Masters",
    items: [
      {
        title: "Route Master",
        href: "/route-master",
        icon: Route,
        badge: "KM Master",
      },
      {
        title: "Rate Master",
        href: "/rate-master",
        icon: Coins,
      },
      {
        title: "Charge Master",
        href: "/charge-master",
        icon: ReceiptText,
      },
      {
        title: "Permit Master",
        href: "/permit-master",
        icon: ShieldCheck,
      },
      {
        title: "State Markups",
        href: "/state-markups",
        icon: BadgePercent,
      },
      {
        title: "Surcharge Master",
        href: "/surcharge-master",
        icon: Percent,
      },
      {
        title: "Agent Grades",
        href: "/agent-grades",
        icon: Award,
      },
      {
        title: "City Master",
        href: "/city",
        icon: MapPin,
      },
      {
        title: "Garage Master",
        href: "/garage-master",
        icon: Warehouse,
      },
      {
        title: "Transfers",
        href: "/transfers",
        icon: ArrowLeftRight,
      },
    ],
  },
  {
    label: "Fleet & Bookings",
    items: [
      {
        title: "Bookings",
        href: "/bookings",
        icon: Ticket,
      },
      {
        title: "Cars",
        href: "/cars",
        icon: CarTaxiFront,
      },
      {
        title: "Car Categories",
        href: "/car-categories",
        icon: Layers,
      },
    ],
  },
  {
    label: "Packages & Queries",
    items: [
      {
        title: "Travel Packages",
        href: "/travel-packages",
        icon: Compass,
      },
      {
        title: "Travel Queries",
        href: "/travel-queries",
        icon: MessageSquareQuote,
      },
      {
        title: "Custom Itineraries",
        href: "/custom-itineraries",
        icon: Map,
      },
      {
        title: "Hotel Queries",
        href: "/hotel-queries",
        icon: Hotel,
      },
      {
        title: "Rental Packages",
        href: "/rental-packages",
        icon: CalendarRange,
      },
      {
        title: "Activity Packages",
        href: "/activity-packages",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Users & Management",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: Users,
      },
      {
        title: "Vendors",
        href: "/vendors",
        icon: IdCard,
      },
      {
        title: "Create Profiles",
        href: "/create-profiles",
        icon: UserPlus,
      },
    ],
  },
];

// Flat array exported for any legacy consumers
export const sidebarLinks = sidebarGroups.flatMap((group) => group.items);
