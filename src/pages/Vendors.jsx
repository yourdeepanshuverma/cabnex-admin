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
  useGetVendorStatsQuery,
  useLazyGetAllVendorsQuery,
} from "@/store/services/adminApi";
import { BadgeCheckIcon, BanIcon, MoreHorizontalIcon } from "lucide-react";
import moment from "moment";
import { Link } from "react-router";

const columns = [
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => (
      <Link
        to={`/vendors/profile/${row.original._id}`}
        className="flex items-center gap-2 capitalize hover:underline"
      >
        {row.getValue("company")}
        {row.original.isVerified === "approved" && (
          <BadgeCheckIcon size="18" fill="blue" stroke="white" />
        )}
        {row.original.isBlocked && <BanIcon size="14" />}
      </Link>
    ),
  },
  {
    accessorKey: "companyType",
    header: () => {
      return <div>Company Type</div>;
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("companyType")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => {
      return <div>Email</div>;
    },
    cell: ({ row }) => (
      <a
        href={`mailto:${row.getValue("email")}`}
        className="lowercase hover:underline"
      >
        {row.getValue("email")}
      </a>
    ),
  },
  {
    accessorKey: "contactPhone",
    header: () => {
      return <div>Mobile</div>;
    },
    cell: ({ row }) => (
      <a
        className="flex items-center justify-start lowercase hover:underline"
        href={`tel:${row.getValue("contactPhone")}`}
      >
        +91 {row.getValue("contactPhone")}
      </a>
    ),
  },
  {
    accessorKey: "isVerified",
    header: () => {
      return <div>Status</div>;
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
    accessorKey: "createdAt",
    header: () => {
      return <div>Joined</div>;
    },
    cell: ({ row }) => (
      <div>{moment(row.getValue("createdAt")).format("MMM D, YYYY")}</div>
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
            <Link to={`/vendors/profile/${row.original._id}`}>
              <DropdownMenuItem>View vendor</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const Vendors = () => {
  const { data: vendorsData } = useGetVendorStatsQuery();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {vendorsData?.data?.map((item, index) => (
              <SectionCards key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
      <DataTable fetchFunc={useLazyGetAllVendorsQuery} columns={columns} />
    </div>
  );
};

export default Vendors;
