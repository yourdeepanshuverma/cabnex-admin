import React, { useState } from "react";
import AutopaginateTable from "@/components/auto-paginate-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetHotelBookingQueriesQuery,
  useUpdateHotelBookingQueryStatusMutation,
  useDeleteHotelBookingQueryMutation,
} from "@/store/services/adminApi";
import {
  Loader2Icon,
  MoreHorizontalIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  HotelIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  BedIcon,
  DollarSignIcon,
  InfoIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

const statusConfig = {
  Pending: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
  },
  Contacted: {
    label: "Contacted",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
  },
  Confirmed: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  },
};

const HotelQueries = () => {
  const { data, isLoading } = useGetHotelBookingQueriesQuery(null, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data,
      isLoading,
    }),
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateHotelBookingQueryStatusMutation();
  const [deleteQuery] = useDeleteHotelBookingQueryMutation();

  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDetails = (query) => {
    setSelectedQuery(query);
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (queryId, newStatus) => {
    try {
      const res = await updateStatus({ id: queryId, status: newStatus }).unwrap();
      toast.success(res.message || "Status updated successfully");
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (queryId) => {
    if (!window.confirm("Are you sure you want to delete this hotel query?")) return;
    try {
      const res = await deleteQuery(queryId).unwrap();
      toast.success(res.message || "Query deleted successfully");
      if (selectedQuery?._id === queryId) {
        setIsDialogOpen(false);
        setSelectedQuery(null);
      }
    } catch (err) {
      toast.error(err.data?.message || "Failed to delete query");
    }
  };

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
          <span className="text-gray-500 font-medium">
            {row.original?.customer?.countryCode}{" "}
            {row.original?.customer?.mobile || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "hotel",
      header: "Hotel & City",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm max-w-[200px]">
          <span className="font-semibold text-gray-900 truncate" title={row.original?.hotel?.name}>
            {row.original?.hotel?.name || "N/A"}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            {row.original?.hotel?.destinationName || "N/A"}
            {row.original?.hotel?.starRating ? ` • ${row.original.hotel.starRating}★` : ""}
          </span>
        </div>
      ),
    },
    {
      id: "room",
      header: "Room & Meal",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm max-w-[180px]">
          <span className="font-medium text-gray-800 truncate" title={row.original?.selectedRoom?.roomTypeName}>
            {row.original?.selectedRoom?.roomTypeName || "N/A"}
          </span>
          <span className="text-xs text-primary font-medium">
            {row.original?.selectedRoom?.mealPlan || "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "stayDates",
      header: "Check In / Out",
      cell: ({ row }) => {
        const stay = row.original?.stayDetails;
        if (!stay?.checkInDate) return <span className="text-gray-500 text-sm">N/A</span>;
        return (
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              {stay.checkInDate} ➔ {stay.checkOutDate}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              ({stay.totalNights} Night{stay.totalNights > 1 ? "s" : ""})
            </span>
          </div>
        );
      },
    },
    {
      id: "guests",
      header: "Rooms & Guests",
      cell: ({ row }) => {
        const stay = row.original?.stayDetails;
        if (!stay) return <span className="text-gray-500 text-sm">N/A</span>;
        return (
          <div className="text-sm font-medium text-gray-700">
            {stay.rooms} Room{stay.rooms > 1 ? "s" : ""} • {stay.adults} Adult{stay.adults > 1 ? "s" : ""}
            {stay.children > 0 && `, ${stay.children} Child`}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original?.status || "Pending";
        const config = statusConfig[status] || {
          label: status,
          className: "bg-gray-100 text-gray-800",
        };
        return (
          <Badge className={`font-semibold border ${config.className}`}>
            {config.label}
          </Badge>
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleOpenDetails(row.original)}
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => handleDelete(row.original._id)}
              >
                Delete Query
              </DropdownMenuItem>
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
          Hotel Booking Queries
        </h4>
      </div>

      <AutopaginateTable columns={columns} data={data || []} />

      {/* Details Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-6">
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Hotel Booking Query Details
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Submitted on:{" "}
                  {selectedQuery?.createdAt
                    ? new Date(selectedQuery.createdAt).toLocaleString("en-IN")
                    : "N/A"}
                </DialogDescription>
              </div>

              {/* Dynamic Status Dropdown */}
              {selectedQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                  <Select
                    value={selectedQuery.status || "Pending"}
                    onValueChange={(val) => handleStatusChange(selectedQuery._id, val)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[140px] h-9 text-sm font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-6 pt-2">
              {/* Customer Details */}
              <div className="bg-muted/20 p-4 rounded-xl border border-muted space-y-3">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Full Name</span>
                    <span className="font-semibold text-gray-900">
                      {selectedQuery.customer?.fullName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Mobile Phone</span>
                    <a
                      href={`tel:${selectedQuery.customer?.countryCode}${selectedQuery.customer?.mobile}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {selectedQuery.customer?.countryCode} {selectedQuery.customer?.mobile}
                    </a>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-gray-500 font-medium block">Email Address</span>
                    <a
                      href={`mailto:${selectedQuery.customer?.email}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      {selectedQuery.customer?.email}
                    </a>
                  </div>
                  {selectedQuery.customer?.remarks && (
                    <div className="sm:col-span-2 bg-white p-3 rounded-md border text-xs text-gray-700">
                      <span className="font-bold text-gray-900 block mb-1">Customer Remarks:</span>
                      {selectedQuery.customer.remarks}
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Details */}
              <div className="bg-muted/20 p-4 rounded-xl border border-muted space-y-3">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-2">
                  <HotelIcon className="h-4 w-4 text-primary" />
                  Hotel Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Hotel Name</span>
                    <span className="font-bold text-gray-900 text-base">
                      {selectedQuery.hotel?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Destination</span>
                    <span className="font-semibold text-gray-800">
                      {selectedQuery.hotel?.destinationName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Star Rating</span>
                    <span className="font-semibold text-amber-600 flex items-center gap-1">
                      {selectedQuery.hotel?.starRating || 4} <StarIcon className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    </span>
                  </div>
                  {selectedQuery.hotel?.address && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-gray-500 font-medium block">Address</span>
                      <span className="text-gray-700">{selectedQuery.hotel.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stay Specifications */}
              <div className="bg-muted/20 p-4 rounded-xl border border-muted space-y-3">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Stay & Guest Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Check-In Date</span>
                    <span className="font-bold text-gray-900">{selectedQuery.stayDetails?.checkInDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Check-Out Date</span>
                    <span className="font-bold text-gray-900">{selectedQuery.stayDetails?.checkOutDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Total Nights</span>
                    <span className="font-semibold text-gray-800">
                      {selectedQuery.stayDetails?.totalNights} Night(s)
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Rooms Required</span>
                    <span className="font-semibold text-gray-800">{selectedQuery.stayDetails?.rooms} Room(s)</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Adults</span>
                    <span className="font-semibold text-gray-800">{selectedQuery.stayDetails?.adults}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Children / Infants</span>
                    <span className="font-semibold text-gray-800">
                      {selectedQuery.stayDetails?.children || 0} Child / {selectedQuery.stayDetails?.infants || 0} Infant
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Purpose</span>
                    <span className="font-semibold text-gray-800">{selectedQuery.stayDetails?.purpose || "Holiday"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Pet Friendly</span>
                    <span className="font-semibold text-gray-800">
                      {selectedQuery.stayDetails?.isPetFriendly ? "Yes 🐾" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium block">Query Source</span>
                    <span className="font-semibold text-gray-800">{selectedQuery.source || "Website"}</span>
                  </div>
                </div>
              </div>

              {/* Room & Rates Breakdown */}
              <div className="bg-muted/20 p-4 rounded-xl border border-muted space-y-3">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-2">
                  <BedIcon className="h-4 w-4 text-primary" />
                  Selected Room & Rates Breakdown
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 bg-white p-3 rounded-lg border">
                    <div>
                      <span className="text-xs text-gray-500 font-bold uppercase block">Selected Room Type</span>
                      <span className="font-bold text-gray-900 text-base">
                        {selectedQuery.selectedRoom?.roomTypeName}
                      </span>
                    </div>
                    <Badge variant="secondary" className="w-fit font-bold text-primary">
                      Meal Plan: {selectedQuery.selectedRoom?.mealPlan}
                    </Badge>
                  </div>

                  {selectedQuery.selectedRoom?.rates && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border text-xs">
                      <div>
                        <span className="text-gray-500 block">Single Rate:</span>
                        <span className="font-bold text-gray-900">
                          ₹{selectedQuery.selectedRoom.rates.single?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Double Rate:</span>
                        <span className="font-bold text-gray-900">
                          ₹{selectedQuery.selectedRoom.rates.double?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Triple Rate:</span>
                        <span className="font-bold text-gray-900">
                          ₹{selectedQuery.selectedRoom.rates.triple?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Extra Adult Rate:</span>
                        <span className="font-bold text-gray-900">
                          ₹{selectedQuery.selectedRoom.rates.extraAdult?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Child with Bed Rate:</span>
                        <span className="font-bold text-gray-900">
                          ₹{selectedQuery.selectedRoom.rates.childWithBed?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  ) : (
    <Loader2Icon className="m-auto h-[80vh] animate-spin text-primary" />
  );
};

export default HotelQueries;
