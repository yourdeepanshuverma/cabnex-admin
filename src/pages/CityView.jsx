import { useState } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import PageHeader from "@/components/common/PageHeader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetCitiesQuery,
  useUpdateCityChargesMutation,
} from "@/store/services/adminApi";
import {
  MapPin,
  ArrowLeft,
  Settings2,
  Route,
  Mountain,
  Gauge,
  ExternalLink,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

const formatStateName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function CityView() {
  const { id } = useParams();

  const { data: city, isLoading: cityLoading } = useGetCitiesQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data?.cities?.find((i) => i._id === id),
      isLoading,
    }),
  });

  const [updateCityCharges, { isLoading: isUpdatingCharges }] =
    useUpdateCityChargesMutation();

  // Dialog state
  const [citySettingsOpen, setCitySettingsOpen] = useState(false);

  // City Settings form
  const [localKmPerDay, setLocalKmPerDay] = useState(city?.localKmPerDay ?? 100);
  const [bufferKm, setBufferKm] = useState(city?.bufferKm || 0);
  const [hillCharge, setHillCharge] = useState(city?.hillCharge || 0);

  const handleOpenCitySettings = () => {
    setLocalKmPerDay(city?.localKmPerDay ?? 100);
    setBufferKm(city?.bufferKm || 0);
    setHillCharge(city?.hillCharge || 0);
    setCitySettingsOpen(true);
  };

  const handleSaveCitySettings = async (e) => {
    e.preventDefault();
    try {
      await updateCityCharges({
        cityId: city._id,
        data: {
          localKmPerDay: Number(localKmPerDay) || 0,
          bufferKm: Number(bufferKm) || 0,
          hillCharge: Number(hillCharge) || 0,
        },
      }).unwrap();
      toast.success("City parameters updated successfully");
      setCitySettingsOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update city parameters");
    }
  };

  if (cityLoading) {
    return <Spinner />;
  }

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-bold text-foreground">City Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The requested city ID does not exist or has been removed.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/city">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to City Master
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/city"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to City Master
        </Link>
        <span className="text-xs text-muted-foreground">
          City ID: <span className="font-mono text-[11px]">{city._id}</span>
        </span>
      </div>

      {/* Main PageHeader */}
      <PageHeader
        title={formatStateName(city.city)}
        description={`Operational destination in ${formatStateName(
          city.state,
        )} · Local daily baseline: ${city.localKmPerDay || 100} KM/Day`}
        icon={MapPin}
        badge={formatStateName(city.state)}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCitySettings}
            className="gap-1.5 shadow-2xs font-medium"
          >
            <Settings2 className="h-4 w-4" /> Edit City Parameters
          </Button>
        }
      />

      {/* City Parameters Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">State / Region</span>
            <MapPin className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground block mt-1.5 capitalize truncate">
            {formatStateName(city.state)}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Base State
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Local Daily Limit</span>
            <Route className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground block mt-1.5 tabular-nums">
            {city.localKmPerDay || 100} KM
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Sightseeing limit / night
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Buffer Allowance</span>
            <Gauge className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground block mt-1.5 tabular-nums">
            {city.bufferKm || 0} KM
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Routing cushion
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Terrain Hill Surcharge</span>
            <Mountain className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground block mt-1.5 tabular-nums">
            ₹{city.hillCharge || 0}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Applied on hill station routes
          </span>
        </div>
      </div>

      {/* Rate Master Centralization Notice */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Vehicle Tariffs Centralized in Rate Master
              </h3>
              <Badge variant="outline" className="text-[11px] bg-background">
                State-Level Pricing
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Car categories, daily base rates, included kilometers, extra KM
              charges, and driver allowances are defined centrally in{" "}
              <strong className="text-foreground">Rate Master</strong> per state
              ({formatStateName(city.state)}). City Master manages city-specific
              routing rules, local sightseeing runs, and terrain surcharges.
            </p>
          </div>

          <Button asChild size="sm" className="gap-1.5 shrink-0">
            <Link to="/rate-master">
              <ExternalLink className="h-3.5 w-3.5" /> Manage Rate Master
            </Link>
          </Button>
        </div>
      </div>

      {/* Routing Rules & Calculation Guide Card */}
      <div className="rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="border-b border-border/80 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Routing & Pricing Rules for {formatStateName(city.city)}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/80">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Route className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                Local Daily Limit ({city.localKmPerDay || 100} KM)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For multicity tours staying in {formatStateName(city.city)}, an
              allowance of {city.localKmPerDay || 100} KM per overnight stay is
              allocated for city sightseeing and local transit.
            </p>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Gauge className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                Buffer Allowance ({city.bufferKm || 0} KM)
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A safety cushion of {city.bufferKm || 0} KM is appended to Google
              Maps distance calculations to compensate for detours, hotel
              pickups, and traffic reroutes.
            </p>
          </div>

          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mountain className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                Terrain Surcharge (₹{city.hillCharge || 0})
              </h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {city.hillCharge > 0
                ? `A one-time terrain surcharge of ₹${city.hillCharge} is automatically added to the trip fare whenever a booking starts, ends, or traverses through ${formatStateName(city.city)}.`
                : `No terrain surcharge configured for this city (standard plains terrain).`}
            </p>
          </div>
        </div>
      </div>

      {/* City Parameters Modal */}
      <Dialog open={citySettingsOpen} onOpenChange={setCitySettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveCitySettings}>
            <DialogHeader>
              <DialogTitle>
                City Parameters: {formatStateName(city.city)}
              </DialogTitle>
              <DialogDescription>
                Configure buffer distance, local sightseeing run limits, and
                terrain hill charges for this city.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="paramLocalKm">Local Daily Limit (KM/Day)</Label>
                <Input
                  id="paramLocalKm"
                  type="number"
                  min="0"
                  value={localKmPerDay}
                  onChange={(e) => setLocalKmPerDay(e.target.value)}
                  placeholder="e.g. 100"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Daily local sightseeing distance added to multicity itineraries
                  when staying in this city.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paramBufferKm">Buffer Allowance (KM)</Label>
                <Input
                  id="paramBufferKm"
                  type="number"
                  min="0"
                  value={bufferKm}
                  onChange={(e) => setBufferKm(e.target.value)}
                  placeholder="e.g. 10"
                />
                <p className="text-[11px] text-muted-foreground">
                  Additional distance added for local congestion or detours.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paramHillCharge">Terrain Hill Charge (₹)</Label>
                <Input
                  id="paramHillCharge"
                  type="number"
                  min="0"
                  value={hillCharge}
                  onChange={(e) => setHillCharge(e.target.value)}
                  placeholder="e.g. 500"
                />
                <p className="text-[11px] text-muted-foreground">
                  Fixed surcharge applied to trips touching mountainous or hill
                  points.
                </p>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdatingCharges}>
                {isUpdatingCharges ? "Updating..." : "Update Parameters"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
