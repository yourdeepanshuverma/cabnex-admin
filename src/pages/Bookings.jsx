import DataTable from "@/components/manual-data-fetch-table";
import { SectionCards } from "@/components/section-cards";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  useGetBookingStatsQuery,
  useLazyGetAllBookingsQuery,
} from "@/store/services/adminApi";
import ManualDataFetchTable from "@/components/manual-data-fetch-table";
import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation, useParams } from "react-router";
import { MoreHorizontalIcon } from "lucide-react";

const Bookings = () => {
  const { search } = useLocation();
  const queryParams = Object.fromEntries(new URLSearchParams(search));
  const { data: bookingsStats } = useGetBookingStatsQuery({});

  const columns = [
    {
      accessorKey: "bookingId",
      header: "Booking ID",
      cell: ({ row }) => (
        <Link
          to={`/bookings/${row.getValue("bookingId")}`}
          className="font-medium hover:underline"
        >
          {row.getValue("bookingId")}
        </Link>
      ),
    },
    {
      accessorKey: "userId.fullName",
      header: "User Name",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original?.userId?.fullName}(
          <Link to={`tel:${row.original?.userId?.mobile}`}>
            {row.original?.userId?.mobile}
          </Link>
          )
        </div>
      ),
    },
    {
      accessorKey: "serviceType",
      header: "Service Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.original?.serviceType}</div>
      ),
    },
    {
      accessorKey: "pickupDateTime",
      header: "Pickup Date & Time",
      cell: ({ row }) => (
        <div className="capitalize">
          {moment(row.original.pickupDateTime).format("MMMM Do YYYY, h:mm a")}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="capitalize">{row.original?.totalAmount}</div>
      ),
    },
    {
      accessorKey: "recievedAmount",
      header: "Received Amount",
      cell: ({ row }) => (
        <div className="capitalize">{row.original?.recievedAmount}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.original?.status}</div>
      ),
    },
    {
      accessorKey: "assignedVendor",
      header: "Assigned Vendor",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.assignedVendor
            ? row.original.assignedVendor?.company
            : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="capitalize">
          {moment(row.original?.createdAt).format("MMMM Do YYYY, h:mm a")}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="float-right">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-0.5" align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to={`/bookings/${row.original?.bookingId}`}>
                <DropdownMenuItem>View Booking</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {bookingsStats?.data?.map((item, index) => (
              <SectionCards key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
      <ManualDataFetchTable
        searchText="Search using Booking ID"
        fetchFunc={useLazyGetAllBookingsQuery}
        columns={columns}
        status={queryParams.status}
      />
    </div>
  );
};

export default Bookings;
