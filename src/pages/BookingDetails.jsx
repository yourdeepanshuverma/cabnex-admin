import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Back from "@/components/ui/back";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import {
  useAssignVendorToBookingMutation,
  useGetAbookingQuery,
  useLazyGetAllVendorsQuery,
  useRejectBookingMutation,
} from "@/store/services/adminApi";
import moment from "moment";
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router";

export default function BookingDetails({ data }) {
  const { id } = useParams();
  const [searchVendor, setSearchVendor] = useState("");

  const { data: bookingData } = useGetAbookingQuery(id, {
    selectFromResult: ({ data }) => ({
      data: data?.data,
    }),
  });

  const [assignVendorToBooking, { isLoading: isAssignLoading }] =
    useAssignVendorToBookingMutation();

  const [rejectBooking, { isLoading: isRejectLoading }] =
    useRejectBookingMutation();

  const [refetchVendorData, { data: vendorsData }] = useLazyGetAllVendorsQuery({
    status: "approved",
  });

  const handleAssignVendor = async (vendorId) => {
    await assignVendorToBooking({ bookingId: id, vendorId });
  };

  const handleReject = async () => {
    await rejectBooking(id);
  };

  const onChangeSearchVendor = (e) => {
    setSearchVendor(e.target.value);
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      refetchVendorData({
        search: searchVendor,
        resultPerPage: 5,
        status: "approved",
      });
    }, 1000);

    return () => {
      clearInterval(timeOutId);
    };
  }, [searchVendor]);

  if (!bookingData) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        No booking data found.
      </div>
    );
  }

  const {
    bookingId,
    serviceType,
    carCategory,
    exactLocation,
    pickupDateTime,
    returnDateTime,
    startLocation,
    destinations,
    totalAmount,
    recievedAmount,
    status,
    distance,
    createdAt,
    userId,
    assignedVendor,
  } = bookingData;

  return (
    <div>
      <Back />
      {status === "pending" && (
        <div className="flex justify-end space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-chart-5 hover:bg-chart-3">
                Assign Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="mb-2 text-center">
                  Assign Vendor
                </DialogTitle>
                <DialogDescription>
                  <Input
                    onChange={onChangeSearchVendor}
                    placeholder="Filter by company, email, etc."
                  />
                </DialogDescription>
              </DialogHeader>
              {vendorsData && (
                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {vendorsData?.data?.data?.length > 0 ? (
                    vendorsData.data.data.map((vendor) => (
                      <div
                        key={vendor._id}
                        className="flex items-center gap-2 rounded-2xl border-1 border-black/20 bg-gray-100 p-4"
                      >
                        <img
                          src={
                            vendor.profile ||
                            "https://cdn-icons-png.flaticon.com/128/16893/16893425.png"
                          }
                          className="size-10 h-10 w-10 rounded-full object-cover"
                          alt={vendor.company}
                        />
                        <div className="flex flex-col">
                          <h4
                            title={vendor.company}
                            className="line-clamp-1 w-full text-lg font-semibold capitalize"
                          >
                            {vendor.company}
                          </h4>
                          <p
                            title={vendor.email}
                            className="line-clamp-1 w-full text-sm text-gray-600"
                          >
                            {vendor.email}
                          </p>
                        </div>
                        <Button
                          disabled={isAssignLoading}
                          onClick={() => handleAssignVendor(vendor._id)}
                          className="ml-auto cursor-pointer bg-blue-500 hover:bg-blue-400"
                        >
                          Assign
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No vendors found.</div>
                  )}
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-red-500">
                Reject Vendor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently reject the
                  booking.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isRejectLoading}
                  onClick={() => handleReject(row.bookingId)}
                >
                  {isRejectLoading ? (
                    <Spinner className="w-full" />
                  ) : (
                    "Continue"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      <div className="mx-auto rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Booking Details</h1>

        {/* Basic Info */}
        <div className="mb-4 grid grid-cols-2 gap-4 pb-4">
          <div>
            <p className="text-sm text-gray-500">Booking ID</p>
            <p className="font-semibold">{bookingId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Booking Date</p>
            <p className="font-semibold">
              {moment(createdAt).format("MMMM Do YYYY, h:mm a") || "—"}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Status</p>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                status === "completed"
                  ? "bg-green-100 text-green-700"
                  : status === "inProgress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Service Type</p>
            <p className="font-semibold capitalize">{serviceType || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Car Category</p>
            <p className="font-semibold capitalize">{carCategory || "—"}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* 🧍 User Info */}
        <div>
          <h2 className="mb-2 text-lg font-semibold">
            User Details
            <Link
              to={`/users/profile/${userId?._id}`}
              className="ml-2 text-sm text-blue-600 underline"
            >
              View Profile
            </Link>
          </h2>
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-semibold">{userId?.fullName || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{userId?.email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold">{userId?.mobile || "—"}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Locations */}
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Locations</h2>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Pickup</p>
              <p className="font-semibold">{startLocation?.address || "—"}</p>
            </div>
            {destinations?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Destinations</p>
                <ul className="list-inside list-disc text-gray-800">
                  {destinations.map((d, i) => (
                    <li key={i}>{d.address}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Exact Location Notes</p>
              <p className="font-semibold">{exactLocation || "—"}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Timing */}
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Timings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Pickup Date & Time</p>
              <p className="font-semibold">
                {moment(pickupDateTime).format("MMMM Do YYYY, h:mm a") || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Return Date & Time</p>
              <p className="font-semibold">
                {returnDateTime
                  ? moment(returnDateTime).format("MMMM Do YYYY, h:mm a")
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Payment Info */}
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold">Payment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-semibold text-green-700">₹{totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Received Amount</p>
              <p className="font-semibold text-blue-700">₹{recievedAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Distance</p>
              <p className="font-semibold">
                {distance ? `${distance} km` : "—"}
              </p>
            </div>
          </div>
        </div>

        {assignedVendor && (
          <>
            <Separator className="my-6" />

            {/* 🧍 Vendor Info */}
            <div>
              <h2 className="mb-2 text-lg font-semibold">
                Assigned Vendor
                <Link
                  to={`/vendors/profile/${assignedVendor?._id}`}
                  className="ml-2 text-sm text-blue-600 underline"
                >
                  View Profile
                </Link>
              </h2>
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-semibold">
                    {assignedVendor?.company || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">
                    {assignedVendor?.email || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">
                    {assignedVendor?.contactPhone || "—"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
