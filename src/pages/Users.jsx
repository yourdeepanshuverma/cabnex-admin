import ManualDataFetchTable from "@/components/manual-data-fetch-table";
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
  useGetUserStatsQuery,
  useLazyGetAllUsersQuery,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon } from "lucide-react";
import moment from "moment";
import { Link } from "react-router";

const columns = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => (
      <Link
        to={`/users/profile/${row.original._id}`}
        className="flex items-center gap-2 font-medium capitalize hover:underline"
      >
        {row.getValue("fullName")}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: () => {
      return <div>Email</div>;
    },
    cell: ({ row }) => (
      <Link
        to={`mailto:${row.getValue("email")}`}
        className="lowercase hover:underline"
      >
        {row.getValue("email")}
      </Link>
    ),
  },
  {
    accessorKey: "mobile",
    header: () => {
      return <div>Mobile</div>;
    },
    cell: ({ row }) => (
      <Link
        className="flex items-center justify-start lowercase hover:underline"
        to={`tel:${row.getValue("mobile")}`}
      >
        +91 {row.getValue("mobile")}
      </Link>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => {
      return <div>Created At</div>;
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
            <Link to={`/users/profile/${row.original._id}`}>
              <DropdownMenuItem>View User</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const Users = () => {
  const { data: userStats } = useGetUserStatsQuery();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {userStats?.data?.map((item, index) => (
              <SectionCards key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
      <ManualDataFetchTable
        fetchFunc={useLazyGetAllUsersQuery}
        columns={columns}
      />
    </div>
  );
};

export default Users;
