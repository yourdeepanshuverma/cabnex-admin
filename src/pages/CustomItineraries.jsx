import AutopaginateTable from "@/components/auto-paginate-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetItinerariesQuery } from "@/store/services/adminApi";
import { Loader2Icon, MoreHorizontalIcon } from "lucide-react";
import { Link } from "react-router";

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-800 border-gray-200" },
  pending_quote: { label: "Pending Quote", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300" },
  quoted: { label: "Quoted", className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300" },
};

const CustomItineraries = () => {
  const { data, isLoading } = useGetItinerariesQuery(null, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data,
      isLoading,
    }),
  });

  const columns = [
    {
      id: "fullName",
      header: "Customer Name",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.original?.customer?.fullName || "N/A"}
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          <Link
            to={`mailto:${row.original?.customer?.email}`}
            className="text-primary hover:underline font-medium"
          >
            {row.original?.customer?.email || "N/A"}
          </Link>
          <span className="text-gray-500 font-medium">{row.original?.customer?.mobile || "N/A"}</span>
        </div>
      ),
    },
    {
      id: "destinations",
      header: "Destinations",
      cell: ({ row }) => {
        const dests = row.original?.trip?.destinations?.map((d) => d.name) || [];
        return (
          <div className="font-medium max-w-[200px] truncate" title={dests.join(", ")}>
            {dests.join(" ➔ ") || "N/A"}
          </div>
        );
      },
    },
    {
      id: "dates",
      header: "Trip Dates",
      cell: ({ row }) => {
        const trip = row.original?.trip;
        if (!trip?.startDate) return <div className="text-gray-500">N/A</div>;
        const start = new Date(trip.startDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const end = new Date(trip.endDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">{`${start} - ${end}`}</span>
            <span className="text-xs text-gray-500 font-medium">({trip.totalDays} Days)</span>
          </div>
        );
      },
    },
    {
      id: "travelers",
      header: "Travelers",
      cell: ({ row }) => {
        const travelers = row.original?.trip?.travelers;
        if (!travelers) return <span className="font-medium text-gray-500">N/A</span>;
        return (
          <div className="font-medium text-sm text-gray-700">
            {travelers.adults} Adults
            {travelers.children > 0 && `, ${travelers.children} Children`}
            {travelers.infants > 0 && `, ${travelers.infants} Infants`}
          </div>
        );
      },
    },
    {
      id: "grandTotal",
      header: "Grand Total",
      cell: ({ row }) => {
        const pricing = row.original?.pricing;
        if (!pricing) return <span className="font-semibold text-gray-500">N/A</span>;
        return (
          <div className="font-semibold text-gray-900">
            {pricing.currency === "INR" ? "₹" : pricing.currency}{" "}
            {pricing.grandTotal?.toLocaleString("en-IN")}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original?.status || "pending_quote";
        const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
        return (
          <Badge className={`font-semibold border ${config.className}`}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
      header: "Requested At",
      cell: ({ row }) => {
        if (!row.original?.createdAt) return <span className="text-gray-500">N/A</span>;
        return (
          <div className="font-medium text-sm text-gray-600">
            {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        );
      },
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
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-0.5" align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Link to={`/custom-itineraries/${row.original._id}`}>
                <DropdownMenuItem className="cursor-pointer">
                  View Details
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return !isLoading ? (
    <div className="flex flex-1 flex-col p-4 sm:p-6">
      <div className="bg-chart-1 mb-4 flex items-center justify-between space-y-2 rounded-md px-4 py-2">
        <h4 className="mb-0 scroll-m-20 text-left text-2xl font-bold text-balance">
          Custom Itineraries
        </h4>
      </div>
      <AutopaginateTable columns={columns} data={data || []} />
    </div>
  ) : (
    <Loader2Icon className="m-auto h-[80vh] animate-spin text-primary" />
  );
};

export default CustomItineraries;
