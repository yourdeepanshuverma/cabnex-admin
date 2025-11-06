import AutopaginateTable from "@/components/auto-paginate-table";
import Back from "@/components/ui/back";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetVendorDetailsQuery,
  useUpdateAVendorMutation,
} from "@/store/services/adminApi";
import {
  BadgeCheckIcon,
  MailIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  User2Icon,
} from "lucide-react";
import moment from "moment/moment";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

const carColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "make",
    header: "Make",
    cell: ({ row }) => (
      <Link
        to={`/cars/profile/${row.original._id}`}
        className="flex items-center gap-2 capitalize hover:underline"
      >
        {row.getValue("make")}
        {row.original.isVerified === "approved" && (
          <BadgeCheckIcon size="18" fill="blue" stroke="white" />
        )}
      </Link>
    ),
  },
  {
    accessorKey: "model",
    header: () => {
      return <div>Model</div>;
    },
    cell: ({ row }) => <div>{row.getValue("model")}</div>,
  },
  {
    accessorKey: "registrationNumber",
    header: () => {
      return <div className="text-center">Registration Number</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.getValue("registrationNumber")}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => {
      return <div className="text-center">Status</div>;
    },
    cell: ({ row }) => (
      <div className="text-center lowercase">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "fuelType",
    header: () => {
      return <div className="text-center">Fuel Type</div>;
    },
    cell: ({ row }) => (
      <div className="text-center lowercase">{row.getValue("fuelType")}</div>
    ),
  },
  {
    accessorKey: "isVerified",
    header: () => {
      return <div className="text-center">Status</div>;
    },
    cell: ({ row }) => (
      <div
        className={`text-center lowercase ${row.getValue("isVerified") === "approved" ? "text-green-500" : row.getValue("isVerified") === "pending" ? "text-yellow-500" : "text-red-500"}`}
      >
        {row.getValue("isVerified")}
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
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(row.original._id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Link to={`/cars/profile/${row.original._id}`}>
              <DropdownMenuItem>View Details</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function VendorProfile() {
  const { id } = useParams();
  const { data } = useGetVendorDetailsQuery(id);

  const [updateAVendor] = useUpdateAVendorMutation();

  const handleApprove = async () => {
    await updateAVendor({ id, data: { isVerified: "approved" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleReject = async () => {
    await updateAVendor({ id, data: { isVerified: "rejected" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleBlock = async () => {
    await updateAVendor({ id, data: { isBlocked: true } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleUnblock = async () => {
    await updateAVendor({ id, data: { isBlocked: false } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  const handleDisapprove = async () => {
    await updateAVendor({ id, data: { isVerified: "pending" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((err) =>
        toast.error(err?.data?.message || "Something went wrong"),
      );
  };

  return (
    <div className="w-full space-y-6">
      <Back />
      {/* Vendor Profile Header */}
      {/* Approve / Reject Buttons */}
      {data?.data?.vendor?.isVerified !== "approved" && (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={handleApprove}
            className="bg-chart-5 hover:bg-chart-4 text-white hover:text-white"
            variant="outline"
          >
            Approve
          </Button>
          {data?.data?.vendor?.isVerified === "pending" && (
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
      {data?.data?.vendor?.isVerified === "approved" && (
        <div className="flex items-center justify-end gap-2">
          {data?.data?.vendor?.isVerified === "approved" && (
            <Button onClick={handleDisapprove} variant="destructive">
              Disapprove
            </Button>
          )}
          {data?.data?.vendor?.isBlocked ? (
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
      <Card className="relative flex flex-col gap-6 p-6">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <CardTitle className="flex items-center gap-2 text-2xl">
            {data?.data?.vendor?.company}
            {data?.data?.vendor?.isVerified === "approved" && (
              <Badge
                variant="secondary"
                className="bg-blue-500 text-white dark:bg-blue-600"
              >
                <BadgeCheckIcon />
                Verified
              </Badge>
            )}
            {data?.data?.vendor?.isBlocked && (
              <Badge variant="default">Blocked</Badge>
            )}
          </CardTitle>

          <div className="flex flex-col justify-center gap-4 pt-2 md:justify-start">
            <p className="text-muted-foreground inline-flex w-fit items-center gap-1 text-sm capitalize">
              <User2Icon className="h-4 w-4" />
              {data?.data?.vendor?.contactPerson}
            </p>
            <a
              href={`tel:${data?.data?.vendor?.contactPhone}`}
              className="text-muted-foreground inline-flex w-fit items-center gap-1 text-sm hover:underline"
            >
              <PhoneIcon className="h-4 w-4" />
              +91 {data?.data?.vendor?.contactPhone}
            </a>
            <a
              href={`mailto:${data?.data?.vendor?.email}`}
              className="text-muted-foreground inline-flex w-fit items-center gap-1 text-sm hover:underline"
            >
              <MailIcon className="h-4 w-4" />
              {data?.data?.vendor?.email}
            </a>
          </div>
        </div>

        <CardFooter className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="font-medium">Joined Date</h4>
            <p className="text-muted-foreground">
              {moment(data?.data?.vendor?.createdAt).format("DD MMM, YYYY")}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Gst Number</h4>
            <p className="text-muted-foreground capitalize">
              {data?.data?.vendor?.gst}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Pan Number</h4>
            <p className="text-muted-foreground capitalize">
              {data?.data?.vendor?.pan}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Company Type</h4>
            <p className="text-muted-foreground capitalize">
              {data?.data?.vendor?.companyType}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Total Cars</h4>
            <p className="text-muted-foreground capitalize">
              {data?.data?.vendor?.cars?.length || 0}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Total Bookings</h4>
            <p className="text-muted-foreground capitalize">
              {data?.data?.vendor?.bookings?.length || 0}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Rating</h4>
            <p className="text-muted-foreground capitalize">
              {data?.data?.vendor?.rating || "N/A"}
            </p>
          </div>
          <div>
            <h4 className="font-medium">Available Cars</h4>
            <p className="text-muted-foreground capitalize">
              {
                data?.data?.vendor?.cars?.filter(
                  (car) => car.status === "available",
                ).length
              }
            </p>
          </div>
        </CardFooter>
      </Card>
      {/* Cars Listing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Cars</h2>
        <AutopaginateTable
          columns={carColumns}
          data={data?.data?.vendor?.cars || []}
        />
      </div>
      {/* Bookings Listing */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Assigned Bookings</h2>
        <AutopaginateTable
          columns={[]}
          data={data?.data?.vendor?.bookings || []}
        />
      </div>
    </div>
  );
}
