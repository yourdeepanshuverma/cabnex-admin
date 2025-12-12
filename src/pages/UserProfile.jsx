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
import {
  useGetUserDetailsQuery,
  useUpdateAUserMutation,
} from "@/store/services/adminApi";
import { MailIcon, MoreHorizontalIcon, PhoneIcon } from "lucide-react";
import moment from "moment";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

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

  const [updateAUser] = useUpdateAUserMutation();

  const handleApprove = async () => {
    await updateAUser({ id, data: { isVerified: "approved" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleReject = async () => {
    await updateAUser({ id, data: { isVerified: "rejected" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleBlock = async () => {
    await updateAUser({ id, data: { isBlocked: true } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleUnblock = async () => {
    await updateAUser({ id, data: { isBlocked: false } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleDisapprove = async () => {
    await updateAUser({ id, data: { isVerified: "pending" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center gap-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Back />
      {/* Approve / Reject Buttons */}
      {user?.data?.isVerified !== "approved" && (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={handleApprove}
            className="bg-chart-5 hover:bg-chart-4 text-white hover:text-white"
            variant="outline"
          >
            Approve
          </Button>
          {user?.data?.isVerified === "pending" && (
            <Button
              onClick={handleReject}
              className="text-red-700"
              variant="ghost"
            >
              Reject
            </Button>
          )}
        </div>
      )}
      {/* Disapprove / Block Buttons */}
      {user?.data?.isVerified === "approved" && (
        <div className="flex items-center justify-end gap-2">
          {user?.data?.isVerified === "approved" && (
            <Button onClick={handleDisapprove} variant="destructive">
              Disapprove
            </Button>
          )}
          {user?.data?.isBlocked ? (
            <Button
              onClick={handleUnblock}
              className="text-red-700"
              variant="ghost"
            >
              Unblock Vendor
            </Button>
          ) : (
            <Button onClick={handleBlock} variant="destructive">
              Block Vendor
            </Button>
          )}
        </div>
      )}
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
            Pan Number : {user?.data?.pan || "N/A"}
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            GST Number : {user?.data?.gst || "N/A"}
          </p>
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
    </div>
  );
}
