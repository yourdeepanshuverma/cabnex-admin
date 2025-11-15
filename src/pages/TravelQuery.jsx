import AutopaginateTable from "@/components/auto-paginate-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetTravelQueryQuery } from "@/store/services/adminApi";
import { Loader2Icon, MoreHorizontalIcon } from "lucide-react";
import { Link } from "react-router";

const TravelQuery = () => {
  const { data, isLoading } = useGetTravelQueryQuery(null, {
    selectFromResult: ({ data }) => ({
      data: data?.data,
    }),
  });

  console.log(data);

  const columns = [
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("fullName")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <Link
          to={`mailto:${row.getValue("email")}`}
          className="font-medium lowercase hover:underline"
        >
          {row.getValue("email")}
        </Link>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <Link
          to={`tel:${row.getValue("phone")}`}
          className="font-medium lowercase hover:underline"
        >
          {row.getValue("phone")}
        </Link>
      ),
    },
    {
      accessorKey: "package",
      header: "Package",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("package")}</div>
      ),
    },
    {
      accessorKey: "preferredDate",
      header: "Preferred Date",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.getValue("preferredDate")}
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
              <Link to={`/travel-queries/${row.original._id}`}>
                <DropdownMenuItem>View Query</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return !isLoading ? (
    <div className="flex flex-1 flex-col">
      <div className="bg-chart-1 mb-4 flex items-center justify-between space-y-2 rounded-md px-4 py-2">
        <h4 className="mb-0 scroll-m-20 text-left text-2xl font-bold text-balance">
          Travel Queries
        </h4>
      </div>
      <AutopaginateTable columns={columns} data={data || []} />
    </div>
  ) : (
    <Loader2Icon className="m-auto h-[80vh] animate-spin" />
  );
};

export default TravelQuery;
