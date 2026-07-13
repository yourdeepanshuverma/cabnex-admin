import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router";
import { NotFound } from "./NotFound";
import {
  useGetItineraryByIdQuery,
  useUpdateItineraryStatusMutation,
} from "@/store/services/adminApi";
import Back from "@/components/ui/back";
import {
  Loader2Icon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  HotelIcon,
  CarIcon,
  CompassIcon,
  DollarSignIcon,
  TagIcon,
  InfoIcon,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-800 border-gray-200" },
  pending_quote: { label: "Pending Quote", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300" },
  quoted: { label: "Quoted", className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300" },
};

export default function CustomItineraryDetails() {
  const { id } = useParams();

  const { data, isLoading, isError, error } = useGetItineraryByIdQuery(id);
  const itinerary = data?.data;

  const [updateStatus, { isLoading: isUpdating }] = useUpdateItineraryStatusMutation();

  if (isLoading) {
    return <Loader2Icon className="m-auto h-[80vh] animate-spin text-primary" />;
  }

  if (isError || !itinerary) {
    return <NotFound />;
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(res.message || "Status updated successfully");
    } catch (err) {
      toast.error(err.data?.message || "Failed to update status");
    }
  };

  const destinationsList = itinerary.trip?.destinations?.map((d) => d.name) || [];
  const statusInfo = statusConfig[itinerary.status] || { label: itinerary.status, className: "" };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Back />
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-500">Update Status:</span>
          <Select
            value={itinerary.status || "pending_quote"}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_quote">Pending Quote</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <Card className="shadow-lg border-muted">
            <CardHeader className="border-b bg-muted/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Badge className={`mb-2 border ${statusInfo.className}`}>
                    {statusInfo.label}
                  </Badge>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Itinerary for {itinerary.customer?.fullName}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Route: {destinationsList.join(" ➔ ") || "N/A"}
                  </p>
                </div>
                <div className="text-sm text-gray-500 sm:text-right">
                  <div>Requested on:</div>
                  <div className="font-semibold text-gray-800">
                    {new Date(itinerary.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Customer and Trip Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                    <UserIcon className="h-4 w-4 text-primary" />
                    Customer Details
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label="Full Name"
                      value={itinerary.customer?.fullName}
                      icon={<UserIcon className="h-4 w-4 text-gray-400" />}
                    />
                    <DetailRow
                      label="Email Address"
                      value={itinerary.customer?.email}
                      icon={<MailIcon className="h-4 w-4 text-gray-400" />}
                      href={`mailto:${itinerary.customer?.email}`}
                    />
                    <DetailRow
                      label="Phone Number"
                      value={itinerary.customer?.mobile}
                      icon={<PhoneIcon className="h-4 w-4 text-gray-400" />}
                      href={`tel:${itinerary.customer?.mobile}`}
                    />
                  </div>
                </div>

                {/* Trip Info */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                    <CompassIcon className="h-4 w-4 text-primary" />
                    Trip Specifications
                  </h3>
                  <div className="space-y-3">
                    <DetailRow
                      label="Travel Dates"
                      value={
                        itinerary.trip?.startDate
                          ? `${new Date(itinerary.trip.startDate).toLocaleDateString("en-IN")} to ${new Date(itinerary.trip.endDate).toLocaleDateString("en-IN")} (${itinerary.trip.totalDays} Days)`
                          : "N/A"
                      }
                      icon={<CalendarIcon className="h-4 w-4 text-gray-400" />}
                    />
                    <DetailRow
                      label="Travelers"
                      value={
                        itinerary.trip?.travelers
                          ? `${itinerary.trip.travelers.adults} Adults, ${itinerary.trip.travelers.children} Children, ${itinerary.trip.travelers.infants} Infants`
                          : "N/A"
                      }
                      icon={<UsersIcon className="h-4 w-4 text-gray-400" />}
                    />
                    <DetailRow
                      label="Source / Platform"
                      value={itinerary.querySource || "website_custom_planner"}
                      icon={<InfoIcon className="h-4 w-4 text-gray-400" />}
                    />
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {itinerary.customer?.remarks && (
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <TagIcon className="h-4 w-4 text-gray-500" />
                    Remarks / Special Requests
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {itinerary.customer.remarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Plans List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 px-1">Day-by-Day Itinerary Plans</h3>
            {itinerary.dayPlans && itinerary.dayPlans.length > 0 ? (
              itinerary.dayPlans.map((plan, index) => (
                <Card key={index} className="shadow-md border-muted">
                  <CardHeader className="bg-muted/10 py-3 px-5 border-b flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground font-semibold">
                        Day {plan.day}
                      </Badge>
                      <span className="font-semibold text-gray-800">
                        {plan.destinationName}
                      </span>
                    </div>
                    {plan.title && (
                      <span className="text-sm font-medium text-gray-500 truncate max-w-[250px] sm:max-w-md">
                        {plan.title}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="p-5 space-y-4 text-sm text-gray-700">
                    {plan.details && (
                      <p className="text-gray-600 italic whitespace-pre-wrap border-l-2 pl-3 py-1">
                        {plan.details}
                      </p>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Hotel detail */}
                      {plan.hotelName && (
                        <div className="flex items-start gap-2 bg-muted/20 p-3 rounded-lg border border-muted">
                          <HotelIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                              Hotel Stay
                            </span>
                            <span className="font-bold text-gray-800 block">
                              {plan.hotelName}
                            </span>
                            {plan.roomTypeName && (
                              <span className="text-gray-600 text-xs block font-medium">
                                Room: {plan.roomTypeName} ({plan.occupancyType} occupancy)
                              </span>
                            )}
                            {plan.mealPlan && (
                              <span className="text-primary text-xs block font-semibold">
                                Meal: {plan.mealPlan}
                              </span>
                            )}
                            {plan.costs?.hotelCost > 0 && (
                              <span className="text-gray-900 font-bold block text-xs mt-1">
                                Cost: ₹{plan.costs.hotelCost.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Vehicle detail */}
                      {plan.vehicleName && (
                        <div className="flex items-start gap-2 bg-muted/20 p-3 rounded-lg border border-muted">
                          <CarIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                              Transport
                            </span>
                            <span className="font-bold text-gray-800 block">
                              {plan.vehicleName}
                            </span>
                            {plan.costs?.vehicleCost > 0 && (
                              <span className="text-gray-900 font-bold block text-xs mt-1">
                                Cost: ₹{plan.costs.vehicleCost.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Activity detail */}
                      {plan.activityName && (
                        <div className="flex items-start gap-2 bg-muted/20 p-3 rounded-lg border border-muted">
                          <CompassIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                              Activity
                            </span>
                            <span className="font-bold text-gray-800 block">
                              {plan.activityName}
                            </span>
                            {plan.costs?.activityCost > 0 && (
                              <span className="text-gray-900 font-bold block text-xs mt-1">
                                Cost: ₹{plan.costs.activityCost.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Day pricing total */}
                    {plan.costs?.dayTotal > 0 && (
                      <div className="flex justify-end pt-1">
                        <span className="text-xs font-bold text-gray-500">
                          Day Total:{" "}
                          <span className="text-gray-900 text-sm font-extrabold ml-1">
                            ₹{plan.costs.dayTotal.toLocaleString("en-IN")}
                          </span>
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                No daily itinerary details specified.
              </Card>
            )}
          </div>
        </div>

        {/* Pricing Summary sidebar */}
        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20 sticky top-6">
            <CardHeader className="bg-primary/5 border-b border-primary/10 px-6 py-4">
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSignIcon className="h-5 w-5 text-primary" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-gray-600 border-b pb-2">
                  <span>Hotel Stays Total</span>
                  <span className="font-semibold text-gray-800">
                    ₹{itinerary.pricing?.totalHotels?.toLocaleString("en-IN") || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600 border-b pb-2">
                  <span>Transfers/Vehicles Total</span>
                  <span className="font-semibold text-gray-800">
                    ₹{itinerary.pricing?.totalTransfers?.toLocaleString("en-IN") || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600 border-b pb-2">
                  <span>Activities Total</span>
                  <span className="font-semibold text-gray-800">
                    ₹{itinerary.pricing?.totalActivities?.toLocaleString("en-IN") || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 text-base font-extrabold text-gray-950">
                  <span>Grand Total</span>
                  <span className="text-primary text-xl">
                    {itinerary.pricing?.currency === "INR" ? "₹" : itinerary.pricing?.currency}{" "}
                    {itinerary.pricing?.grandTotal?.toLocaleString("en-IN") || 0}
                  </span>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-xs text-gray-600 space-y-2 mt-4">
                <p className="font-semibold text-primary">Status Information:</p>
                <p>Ensure the status represents the current phase of discussions or confirmation with the guest.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon, href }) {
  const content = (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <Label className="text-xs text-gray-400 block">{label}</Label>
        <span className={`text-sm font-semibold text-gray-800 ${href ? "text-primary hover:underline" : ""}`}>
          {value || "N/A"}
        </span>
      </div>
    </div>
  );

  if (href && value) {
    return <a href={href}>{content}</a>;
  }

  return content;
}
