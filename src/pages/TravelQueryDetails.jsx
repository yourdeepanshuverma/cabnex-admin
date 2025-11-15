import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useParams } from "react-router";
import { NotFound } from "./NotFound";
import { useGetTravelQueryQuery } from "@/store/services/adminApi";
import Back from "@/components/ui/back";

export default function TravelQueryDetails() {
  const { id } = useParams();

  const { data, isLoading, isError } = useGetTravelQueryQuery(null, {
    selectFromResult: ({ data, ...other }) => ({
      data: data?.data?.find((query) => query._id === id),
    }),
  });

  if (!data) return <NotFound />;

  return (
    <>
      <Back />
      <div className="flex w-full justify-center p-6">
        <div className="w-full">
          <Card className="p-0 shadow-xl">
            <CardHeader className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {data.fullName || "Booking Details"}
                  </CardTitle>
                  <div className="mt-1 text-sm text-gray-500">
                    {data.package || "Package N/A"}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right text-lg text-gray-700">
                  <div className="font-medium text-black">Submitted on:</div>
                  <div cla ssName="font-medium">
                    {data.preferredDate
                      ? new Date(data.createdAt).toDateString()
                      : "Date N/A"}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-6 px-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-black">
                    Contact
                  </Label>
                  <DetailRow label="Full Name" value={data.fullName || "N/A"} />
                  <DetailRow label="Email" value={data.email || "N/A"} />
                  <DetailRow label="Phone" value={data.phone || "N/A"} />
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-bold text-black">
                    Booking
                  </Label>
                  <DetailRow label="Package" value={data.package || "N/A"} />
                  <DetailRow
                    label="Travellers"
                    value={data.numberOfTravelers ?? "N/A"}
                  />
                  <DetailRow
                    label="Preferred Date"
                    value={
                      data.preferredDate
                        ? new Date(data.preferredDate).toDateString()
                        : "N/A"
                    }
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-500">
                  Additional Details
                </Label>
                <p className="mt-1 text-base font-medium whitespace-pre-wrap">
                  {data.additionalDetails || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col border-b pb-3">
      <Label className="text-sm text-gray-500">{label}</Label>
      <p className="mt-1 text-base font-medium">{value}</p>
    </div>
  );
}
