import Back from "@/components/ui/back";
import { Separator } from "@/components/ui/separator";
import { useGetAbookingQuery } from "@/store/services/adminApi";
import moment from "moment";
import React from "react";
import { Link, useParams } from "react-router";

export default function BookingDetails({ data }) {
  const { id } = useParams();
  const { data: bookingData } = useGetAbookingQuery(id, {
    selectFromResult: ({ data }) => ({
      data: data?.data,
    }),
  });

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
    packageType,
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
  } = bookingData;

  return (
    <div>
      <Back />
      <div className="mx-auto rounded-lg bg-white p-6 shadow">
        <h1 className="mb-6 text-2xl font-bold">Booking Details</h1>

        {/* Basic Info */}
        <div className="mb-4 grid grid-cols-2 gap-4 pb-4">
          <div>
            <p className="text-sm text-gray-500">Booking ID</p>
            <p className="font-semibold">{bookingId}</p>
          </div>
          <div>
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
          <div>
            <p className="text-sm text-gray-500">Package Type</p>
            <p className="font-semibold">{packageType || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Booking Date</p>
            <p className="font-semibold">
              {moment(createdAt).format("MMMM Do YYYY, h:mm a") || "—"}
            </p>
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
      </div>
    </div>
  );
}
