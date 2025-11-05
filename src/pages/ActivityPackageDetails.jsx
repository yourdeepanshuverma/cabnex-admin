import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  ClockIcon,
} from "lucide-react";
import { useParams } from "react-router";
import { useGetActivityPackagesQuery } from "@/store/services/adminApi";
import Back from "@/components/ui/back";

export default function ActivityPackageDetails() {
  const packageId = useParams().id;

  const { data, isLoading, isError } = useGetActivityPackagesQuery(null, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.find((pkg) => pkg._id === packageId),
    }),
  });

  if (!data)
    return <p className="text-center text-gray-500">No package data found.</p>;

  const {
    title,
    cityId,
    description,
    images,
    duration,
    price,
    pricingOptions = [],
    itinerary = [],
    includes = [],
    excludes = [],
    cancellationPolicy,
    isActive,
  } = data;

  return (
    <>
      <Back />
      <Card className="mx-auto shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            City ID: <span className="font-mono">{cityId?._id || cityId}</span>
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Images */}
          {images?.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`Image ${i + 1}`}
                  className="h-28 w-40 rounded-lg border object-cover shadow-sm"
                />
              ))}
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="mb-1 text-lg font-medium">Description</h3>
            <p className="leading-relaxed text-gray-700">{description}</p>
          </div>

          {/* Pricing */}
          <div>
            <Separator className="my-6" />
            <h3 className="mb-2 text-lg font-medium">Pricing</h3>
            <div className="flex flex-wrap items-center gap-4">
              <p className="flex items-center gap-1 text-base">
                <IndianRupee size={16} />
                <span className="font-semibold">{price}</span>
              </p>
              {duration !== 0 && (
                <p className="flex items-center gap-1 text-sm text-gray-600">
                  <ClockIcon size={16} /> Duration: {duration} hrs/day
                </p>
              )}
            </div>

            {pricingOptions?.length > 0 && (
              <Table className="mt-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingOptions.map((option, i) => (
                    <TableRow key={i}>
                      <TableCell>{option.label}</TableCell>
                      <TableCell>₹{option.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Itinerary */}
          {itinerary?.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-medium">Itinerary</h3>
              <div className="space-y-3">
                {itinerary.map((item, i) => (
                  <div key={i} className="rounded-lg border bg-gray-50 p-3">
                    <h4 className="flex items-center gap-2 font-semibold">
                      <MapPin size={16} /> {item.placeName}
                    </h4>
                    <p className="text-sm text-gray-700">{item.description}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Time Spent: {item.timeSpent} min
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Includes / Excludes */}
          {includes.length > 0 ||
            (excludes.length > 0 && (
              <div>
                <Separator className="my-6" />
                {includes.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Includes</h3>
                    <ul className="space-y-1">
                      {includes.map((inc, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-green-700"
                        >
                          <CheckCircle2 size={16} /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {excludes.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Excludes</h3>
                    <ul className="space-y-1">
                      {excludes.map((exc, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-red-700"
                        >
                          <XCircle size={16} /> {exc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

          {/* Cancellation Policy */}
          <div>
            <h3 className="mb-1 text-lg font-medium">Cancellation Policy</h3>
            <p className="text-gray-700">{cancellationPolicy}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
