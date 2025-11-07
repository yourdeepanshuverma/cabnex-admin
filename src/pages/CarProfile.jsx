import Back from "@/components/ui/back";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Spinner from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetCarDetailsQuery,
  useUpdateACarMutation,
} from "@/store/services/adminApi";
import { BadgeCheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

export default function CarProfile() {
  const { id } = useParams();
  const { data: carDetails, isLoading } = useGetCarDetailsQuery(id);

  const [updateACar] = useUpdateACarMutation();

  const [selectedImage, setSelectedImage] = useState(
    carDetails?.data?.images[0]?.url,
  );

  useEffect(() => {
    setSelectedImage(carDetails?.data?.images[0]?.url);
  }, [carDetails]);

  const handleApprove = async () => {
    await updateACar({ id, data: { isVerified: "approved" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((error) => toast.error(error?.data?.message));
  };
  const handleReject = async () => {
    await updateACar({ id, data: { isVerified: "rejected" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((error) => toast.error(error?.data?.message));
  };

  const handleDisapprove = async () => {
    await updateACar({ id, data: { isVerified: "pending" } })
      .then(({ data }) => toast.success(data?.message))
      .catch((error) => toast.error(error?.data?.message));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <Back />
      {carDetails?.data?.isVerified !== "approved" && (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={handleApprove}
            className="bg-chart-5 hover:bg-chart-4 text-white hover:text-white"
            variant="outline"
          >
            Approve
          </Button>
          {carDetails?.data?.isVerified === "pending" && (
            <Button
              onClick={handleReject}
              className="text-red-700"
              variant="ghost"
            >
              Reject
            </Button>
          )}
        </div>
      )}
      {carDetails?.data?.isVerified === "approved" && (
        <div className="flex items-center justify-end gap-2">
          <Button onClick={handleDisapprove} variant="destructive">
            Disapprove
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="bg-muted h-[400px] w-full overflow-hidden rounded-md">
            <img
              alt={"Selected Car"}
              src={selectedImage}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {carDetails?.data?.images?.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(src.url)}
                className={`m-1 overflow-hidden rounded-md ring-offset-2 transition-shadow focus:ring-2 focus:outline-none ${
                  selectedImage === src ? "ring-primary ring-2" : ""
                }`}
              >
                <img
                  src={src.url}
                  className="h-20 w-28 object-cover"
                  alt="thumb"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            {carDetails?.data?.model}

            <Badge
              variant="secondary"
              className={`${
                carDetails?.data?.isVerified === "approved"
                  ? "bg-blue-500"
                  : carDetails?.data?.isVerified === "pending"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              } text-white capitalize dark:bg-blue-600`}
            >
              <BadgeCheckIcon />
              {carDetails?.data?.isVerified}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {carDetails?.data?.fuelType} • {carDetails?.data?.colour} •{" "}
            {carDetails?.data?.seatingCapacity} Seats
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {JSON.parse(carDetails?.data?.features)?.map((f, idx) => (
              <Badge key={idx} className="capitalize">
                {f}
              </Badge>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="prose max-w-none">
            <div className="text-muted-foreground text-sm">
              Registration Number
            </div>
            <div className="font-medium">
              {carDetails?.data?.registrationNumber}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <div className="text-muted-foreground text-sm">Make</div>
              <div className="font-medium">{carDetails?.data?.make}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Year</div>
              <div className="font-medium">{carDetails?.data?.year}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">
                Air Conditioning
              </div>
              <div className="font-medium">
                {carDetails?.data?.airConditioning ? "Yes" : "No"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Availability</div>
              <div className="font-medium capitalize">
                {carDetails?.data?.status}
              </div>
            </div>
          </div>

          <Card className="mt-4 overflow-hidden pt-0">
            <CardHeader className="bg-accent-foreground/5 py-4 text-center">
              <CardTitle className="font-bold">Vendor Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-muted-foreground text-sm">Company</div>
                  <div className="font-medium">
                    {carDetails?.data?.vendor?.company}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">
                    Contact Person
                  </div>
                  <div className="font-medium">
                    {carDetails?.data?.vendor?.contactPerson}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Email</div>
                  <div className="font-medium">
                    <a
                      className="underline"
                      href={`mailto:${carDetails?.data?.vendor?.email}`}
                    >
                      {carDetails?.data?.vendor?.email}
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Phone</div>
                  <div className="font-medium">
                    <a
                      className="underline"
                      href={`tel:${carDetails?.data?.vendor?.contactPhone}`}
                    >
                      {carDetails?.data?.vendor?.contactPhone}
                    </a>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">
                    Company Type
                  </div>
                  <div className="font-medium capitalize">
                    {carDetails?.data?.vendor?.companyType}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">
                    Verification
                  </div>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={`${carDetails?.data?.vendor?.isVerified === "approved" ? "bg-blue-500" : carDetails?.data.vendor?.isVerified === "pending" ? "bg-yellow-500" : "bg-red-500"} text-white dark:bg-blue-600`}
                    >
                      {carDetails?.data?.vendor?.isVerified === "approved" && (
                        <BadgeCheckIcon />
                      )}
                      {carDetails?.data?.vendor?.isVerified}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
