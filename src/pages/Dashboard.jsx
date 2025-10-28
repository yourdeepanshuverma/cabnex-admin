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

const Dashboard = () => {
  const uiColor = ["bg-blue-200", "bg-cyan-200", "bg-red-200", "bg-green-200"];

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

  console.log(dashboardStats);

  const bookingsData = [
    {
      _id: "12345",
      user: {
        fullName: "Alice",
        mobile: "123-456-7890",
        email: "alice@example.com",
      },
      carCategory: {
        name: "Sedan",
        baseFare: 5.0,
        perKmRate: 1.5,
      },
      serviceType: "outstation",
      startLocation: {
        address: "123 Main St, Cityville",
        latitude: 40.7128,
        longitude: -74.006,
      },
      pickupAddress: {
        address: "456 Elm St, Townsville",
        latitude: 40.7306,
        longitude: -73.9352,
      },
      destinations: [
        {
          address: "789 Oak St, Villagetown",
          latitude: 40.758,
          longitude: -73.9855,
        },
        {
          address: "101 Pine St, Hamletcity",
          latitude: 40.706,
          longitude: -74.0086,
        },
      ],
      totalDays: 5,
      totalDistance: 150,
      totalAmount: 230,
      status: "on-going",
      assignedVendor: {
        company: "Vendor Co.",
        contactPerson: "Bob Smith",
        contactPhone: "987-654-3210",
        email: "contact@vendorco.com",
      },
      color: "bg-blue-100",
    },
    {
      _id: "12346",
      user: {
        fullName: "Bob",
        mobile: "223-456-7890",
        email: "bob@example.com",
      },
      carCategory: {
        name: "SUV",
        baseFare: 7.0,
        perKmRate: 2.0,
      },
      serviceType: "rental",
      startLocation: {
        address: "321 Maple St, Cityville",
        latitude: 40.7128,
        longitude: -74.006,
      },
      pickupAddress: {
        address: "654 Cedar St, Townsville",
        latitude: 40.7306,
        longitude: -73.9352,
      },
      destinations: [
        {
          address: "987 Birch St, Villagetown",
          latitude: 40.758,
          longitude: -73.9855,
        },
      ],
      totalDays: 3,
      totalDistance: 90,
      totalAmount: 180,
      status: "on-going",
      assignedVendor: {
        company: "Auto Rentals",
        contactPerson: "Sara Lee",
        contactPhone: "876-543-2109",
        email: "sara@autorentals.com",
      },
      color: "bg-blue-100",
    },
    {
      _id: "12347",
      user: {
        fullName: "Charlie",
        mobile: "323-456-7890",
        email: "charlie@example.com",
      },
      carCategory: {
        name: "Luxury",
        baseFare: 10.0,
        perKmRate: 3.0,
      },
      serviceType: "cityTaxi",
      startLocation: {
        address: "789 Oak St, Cityville",
        latitude: 40.758,
        longitude: -73.9855,
      },
      pickupAddress: {
        address: "123 Main St, Cityville",
        latitude: 40.7128,
        longitude: -74.006,
      },
      destinations: [
        {
          address: "456 Elm St, Townsville",
          latitude: 40.7306,
          longitude: -73.9352,
        },
      ],
      totalDays: 1,
      totalDistance: 30,
      totalAmount: 100,
      status: "on-going",
      assignedVendor: {
        company: "City Cabs",
        contactPerson: "Mike Johnson",
        contactPhone: "765-432-1098",
        email: "mike@citycabs.com",
      },
      color: "bg-blue-100",
    },
    {
      _id: "12348",
      user: {
        fullName: "Diana",
        mobile: "423-456-7890",
        email: "diana@example.com",
      },
      carCategory: {
        name: "SUV",
        baseFare: 7.0,
        perKmRate: 2.0,
      },
      serviceType: "rental",
      startLocation: {
        address: "321 Maple St, Cityville",
        latitude: 40.7128,
        longitude: -74.006,
      },
      pickupAddress: {
        address: "654 Cedar St, Townsville",
        latitude: 40.7306,
        longitude: -73.9352,
      },
      destinations: [
        {
          address: "987 Birch St, Villagetown",
          latitude: 40.758,
          longitude: -73.9855,
        },
      ],
      totalDays: 2,
      totalDistance: 60,
      totalAmount: 120,
      status: "on-going",
      assignedVendor: {
        company: "Auto Rentals",
        contactPerson: "Sara Lee",
        contactPhone: "876-543-2109",
        email: "sara@autorentals.com",
      },
      color: "bg-blue-100",
    },
    {
      _id: "12349",
      user: {
        fullName: "Ethan",
        mobile: "523-456-7890",
        email: "ethan@example.com",
      },
      carCategory: {
        name: "Luxury",
        baseFare: 10.0,
        perKmRate: 3.0,
      },
      serviceType: "outstation",
      startLocation: {
        address: "789 Oak St, Cityville",
        latitude: 40.758,
        longitude: -73.9855,
      },
      pickupAddress: {
        address: "123 Main St, Cityville",
        latitude: 40.7128,
        longitude: -74.006,
      },
      destinations: [
        {
          address: "456 Elm St, Townsville",
          latitude: 40.7306,
          longitude: -73.9352,
        },
      ],
      totalDays: 1,
      totalDistance: 30,
      totalAmount: 100,
      status: "on-going",
      assignedVendor: {
        company: "City Cabs",
        contactPerson: "Mike Johnson",
        contactPhone: "765-432-1098",
        email: "mike@citycabs.com",
      },
      color: "bg-blue-100",
    },
    {
      _id: "1234239",
      user: {
        fullName: "Ethan",
        mobile: "523-456-7890",
        email: "ethan@example.com",
      },
      carCategory: {
        name: "Luxury",
        baseFare: 10.0,
        perKmRate: 3.0,
      },
      serviceType: "outstation",
      startLocation: {
        address: "789 Oak St, Cityville",
        latitude: 40.758,
        longitude: -73.9855,
      },
      pickupAddress: {
        address: "123 Main St, Cityville",
        latitude: 40.7128,
        longitude: -74.006,
      },
      destinations: [
        {
          address: "456 Elm St, Townsville",
          latitude: 40.7306,
          longitude: -73.9352,
        },
      ],
      totalDays: 1,
      totalDistance: 30,
      totalAmount: 100,
      status: "on-going",
      assignedVendor: {
        company: "City Cabs",
        contactPerson: "Mike Johnson",
        contactPhone: "765-432-1098",
        email: "mike@citycabs.com",
      },
      color: "bg-blue-100",
    },
  ];

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
      <div className="col-span-12 flex flex-1 flex-col gap-4 xl:col-span-9">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @md/main:grid-cols-2 @2xl/main:grid-cols-4">
              {dashboardStats?.bookings?.map(
                ({ title, icon: Icon, stats }, index) => (
                  <Card
                    className={`@container/card ${uiColor[index]} dark:bg-sidebar`}
                    key={index}
                  >
                    <CardHeader>
                      <CardDescription className="text-foreground font-medium">
                        {title}
                      </CardDescription>
                      <CardTitle className="flex items-end gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {Icon && <Icon size={30} />} {stats}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ),
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-4 px-4 lg:grid-cols-6 lg:gap-6 lg:px-6">
          <div className="col-span-6 xl:col-span-4">
            <RecentsCard
              title="In Progress Bookings"
              columns={bookingColumns}
              data={formattedBookingsData}
            />
          </div>
          <div className="col-span-6 flex flex-col gap-4 xl:col-span-2">
            <ChartLineDefault data={dashboardStats?.charts?.revenueChartData} />
            <ChartBarHorizontal />
          </div>
        </div>
      </div>
      <div className="col-span-12 flex flex-col gap-4 lg:col-span-3">
        {/* Booking Charts */}
        <ChartPieLabel data={dashboardStats?.charts?.bookingChartData} />
        <ChartBarMultiple data={dashboardStats?.charts?.vendorCarChartData} />
      </div>
      <div className="col-span-12 mt-4 lg:mt-6">
        <PillTableSection data={dashboardStats?.pendingBookingsTable} />
      </div>
    </div>
  );
};

export default Dashboard;
