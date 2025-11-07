import AutopaginateTable from "@/components/auto-paginate-table";
import Back from "@/components/ui/back";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import { useGetUserDetailsQuery } from "@/store/services/adminApi";
import { MailIcon, MoreHorizontalIcon, PhoneIcon } from "lucide-react";
import moment from "moment";
import { Link, useParams } from "react-router";

export default function UserProfile() {
  const { id } = useParams();

  const { data: user, isLoading } = useGetUserDetailsQuery(id);

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
      accessorKey: "serviceType",
      header: "Service Type",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.serviceType}</div>
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
        <div className="capitalize">{row.original.totalAmount}</div>
      ),
    },
    {
      accessorKey: "recievedAmount",
      header: "Received Amount",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.recievedAmount}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="capitalize">{row.original.status}</div>
      ),
    },
    {
      accessorKey: "assignedVendor",
      header: "Assigned Vendor",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.assignedVendor
            ? row.original.assignedVendor.company
            : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="capitalize">
          {moment(row.original.createdAt).format("MMMM Do YYYY, h:mm a")}
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
              <Link to={`/bookings/${row.original.bookingId}`}>
                <DropdownMenuItem>View Booking</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center gap-4">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Back />
      <Card className="mx-auto w-full rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {user?.data?.fullName}
          </CardTitle>
          <Link
            to={`mailto:${user?.data?.email}`}
            className="text-muted-foreground flex w-fit items-center gap-1 text-sm hover:underline"
          >
            <MailIcon size={16} /> {user?.data?.email}
          </Link>
          <Link
            to={`tel:${user?.data?.mobile}`}
            className="text-muted-foreground flex w-fit items-center gap-1 text-sm hover:underline"
          >
            <PhoneIcon size={16} /> {user?.data?.mobile}
          </Link>
          <p className="text-muted-foreground mt-1 text-sm">
            Joined: {new Date(user?.data?.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold">Bookings</h2>
          <AutopaginateTable
            columns={columns}
            data={user?.data?.bookings || []}
          />
        </CardContent>
      </Card>
    </>
  );
}
