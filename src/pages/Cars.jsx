import DataTable from "@/components/manual-data-fetch-table";
import { SectionCards } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetCarStatsQuery,
  useLazyGetAllCarsQuery,
} from "@/store/services/adminApi";
import { BadgeCheckIcon, MoreHorizontalIcon } from "lucide-react";
import { Link } from "react-router";

const columns = [
  {
    accessorKey: "make/model",
    header: () => {
      return <div>Make/Model</div>;
    },
    cell: ({ row }) => (
      <Link
        to={`/cars/profile/${row.original._id}`}
        className="capitalize hover:underline"
      >
        {row.original.make} {row.original.model}
      </Link>
    ),
  },
  {
    accessorKey: "vendor.company",
    header: "Company",
    cell: ({ row }) => (
      <Link
        to={`/vendors/profile/${row.original.vendor._id}`}
        className="flex items-center gap-2 capitalize hover:underline"
      >
        {row.original.vendor.company}
        {row.original.vendor.isVerified === "approved" && (
          <BadgeCheckIcon size="18" fill="blue" stroke="white" />
        )}
      </Link>
    ),
  },
  {
    accessorKey: "registrationNumber",
    header: () => {
      return <div>Registration Number</div>;
    },
    cell: ({ row }) => (
      <div className="uppercase">{row.getValue("registrationNumber")}</div>
    ),
  },
  {
    accessorKey: "fuelType",
    header: () => {
      return <div>Fuel Type</div>;
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("fuelType")}</div>
    ),
  },
  {
    accessorKey: "year",
    header: () => {
      return <div>Year</div>;
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("year")}</div>,
  },
  {
    accessorKey: "status",
    header: () => {
      return <div>Availability</div>;
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "isVerified",
    header: () => {
      return <div>Car Verified</div>;
    },
    cell: ({ row }) => (
      <div
        className={`capitalize ${row.getValue("isVerified") === "approved" ? "text-green-500" : row.getValue("isVerified") === "pending" ? "text-yellow-500" : "text-red-500"}`}
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
            <DropdownMenuSeparator />
            <Link to={`/cars/profile/${row.original._id}`}>
              <DropdownMenuItem>View car</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const Cars = () => {
  const { data: carsData } = useGetCarStatsQuery();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {carsData?.data?.map((item, index) => (
              <SectionCards key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
      <DataTable fetchFunc={useLazyGetAllCarsQuery} columns={columns} />
    </div>
  );
};

export default Cars;
