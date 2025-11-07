import { ChartBarHorizontal } from "@/components/chart-bar-horizontal";
import { ChartBarMultiple } from "@/components/chart-bar-multiple";
import { ChartLineDefault } from "@/components/chart-line-default";
import { ChartPieLabel } from "@/components/chart-pie-label";
import PillTableSection from "@/components/pill-table-section";
import RecentsCard from "@/components/recents-card";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetDashboardStatsQuery } from "@/store/services/adminApi";
import { CalendarCheck2Icon, CheckCheckIcon } from "lucide-react";
import { Link } from "react-router";

const Dashboard = () => {
  const cardUi = [
    {
      color: "bg-blue-200",
      hoverColor: "hover:bg-blue-300",
      icon: <CalendarCheck2Icon className="md:size-10" />,
      href: "/bookings",
    },
    {
      color: "bg-cyan-200",
      hoverColor: "hover:bg-cyan-300",
      icon: <CalendarCheck2Icon className="md:size-10" />,
      href: "/bookings?status=inProgress",
    },
    {
      color: "bg-red-200",
      hoverColor: "hover:bg-red-300",
      icon: <CalendarCheck2Icon className="md:size-10" />,
      href: "/bookings?status=inProgress",
    },
    {
      color: "bg-green-200",
      hoverColor: "hover:bg-green-300",
      icon: <CheckCheckIcon className="md:size-10" />,
      href: "/bookings?status=completed",
    },
  ];

  //   recentUsers: [
  //     {
  //       id: 1,
  //       name: "Alice Johnson",
  //       handle: "@alicej",
  //       avatar: "https://i.pravatar.cc/150?img=1",
  //     },
  //     {
  //       id: 2,
  //       name: "Bob Smith",
  //       handle: "@bobsmith",
  //       avatar: "https://i.pravatar.cc/150?img=2",
  //     },
  //     {
  //       id: 3,
  //       name: "Charlie Brown",
  //       handle: "@charlieb",
  //       avatar: "https://i.pravatar.cc/150?img=3",
  //     },
  //     {
  //       id: 4,
  //       name: "Diana Prince",
  //       handle: "@dianap",
  //       avatar: "https://i.pravatar.cc/150?img=4",
  //     },
  //     {
  //       id: 5,
  //       name: "Ethan Hunt",
  //       handle: "@ethanh",
  //       avatar: "https://i.pravatar.cc/150?img=5",
  //     },
  //   ],

  //   recentVendor: [
  //     {
  //       id: 1,
  //       name: "Alice Johnson",
  //       handle: "@alicej",
  //       avatar: "https://i.pravatar.cc/150?img=1",
  //     },
  //     {
  //       id: 2,
  //       name: "Bob Smith",
  //       handle: "@bobsmith",
  //       avatar: "https://i.pravatar.cc/150?img=2",
  //     },
  //     {
  //       id: 3,
  //       name: "Charlie Brown",
  //       handle: "@charlieb",
  //       avatar: "https://i.pravatar.cc/150?img=3",
  //     },
  //     {
  //       id: 4,
  //       name: "Diana Prince",
  //       handle: "@dianap",
  //       avatar: "https://i.pravatar.cc/150?img=4",
  //     },
  //     {
  //       id: 5,
  //       name: "Ethan Hunt",
  //       handle: "@ethanh",
  //       avatar: "https://i.pravatar.cc/150?img=5",
  //     },
  //   ],
  // };

  const { data: dashboardStats } = useGetDashboardStatsQuery(null, {
    selectFromResult: ({ data }) => ({
      data: data?.data,
    }),
  });

  const bookingColumns = [
    { key: "bookingId", label: "Booking ID" },
    { key: "userName", label: "User Name" },
    { key: "carCategory", label: "Car Category" },
    { key: "serviceType", label: "Service Type" },
    { key: "totalDays", label: "Total Days" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "status", label: "Status" },
  ];

  const formattedBookingsData = dashboardStats?.inProgressTable?.map(
    (booking, index) => ({
      ...booking,
      status: (
        <Badge
          key={index}
          className={`${booking.status === "completed" ? "bg-green-100" : booking.status === "inProgress" ? "bg-yellow-100" : booking.status === "pending" ? "bg-yellow-100" : "bg-red-100"} text-accent-foreground font-medium`}
        >
          {booking.status}
        </Badge>
      ),
    }),
  );

  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 flex flex-1 flex-col gap-4 xl:col-span-12">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-6">
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @md/main:grid-cols-2 @2xl/main:grid-cols-4">
              {dashboardStats?.bookings?.map(({ title, stats }, index) => (
                <Link key={index} to={cardUi[index].href}>
                  <Card
                    className={`@container/card ${cardUi[index].color} ${cardUi[index].hoverColor} dark:bg-sidebar h-full`}
                  >
                    <CardHeader className="flex items-center justify-between gap-4">
                      <div>
                        <CardDescription className="text-foreground text-xs font-medium md:text-lg">
                          {title}
                        </CardDescription>
                        <CardTitle className="flex items-end gap-2 font-semibold tabular-nums md:text-2xl @[250px]/card:text-3xl">
                          {stats}
                        </CardTitle>
                      </div>
                      <div className="hidden rounded-lg bg-white p-2 md:block md:p-4">
                        {cardUi[index].icon}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4 px-4 lg:gap-6 lg:px-6">
          <div className="col-span-12 xl:col-span-7">
            <RecentsCard
              title="In Progress Bookings"
              columns={bookingColumns}
              data={formattedBookingsData}
            />
          </div>
          <div className="col-span-12 grid grid-cols-6 gap-4 xl:col-span-5">
            <ChartLineDefault
              className="col-span-6 md:col-span-3"
              data={dashboardStats?.charts?.revenueChartData}
            />
            <ChartPieLabel
              className="col-span-6 md:col-span-3"
              data={dashboardStats?.charts?.bookingChartData}
            />

            <ChartBarMultiple
              className="col-span-6"
              data={dashboardStats?.charts?.vendorCarChartData}
            />
          </div>
        </div>
      </div>
      {/* <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
      </div> */}
      <div className="col-span-12 mt-4 lg:mt-6">
        <PillTableSection data={dashboardStats?.pendingBookingsTable} />
      </div>
    </div>
  );
};

export default Dashboard;
