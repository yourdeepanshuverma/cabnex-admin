import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Spinner from "@/components/ui/spinner";
import PageHeader from "@/components/common/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  useAddNewCategoryToCityMutation,
  useGetCarCategoriesQuery,
  useGetCitiesQuery,
  useToggleCategoryStatusFromCityMutation,
  useUpdateCategoryFromCityMutation,
  useUpdateCityChargesMutation,
} from "@/store/services/adminApi";
import {
  MapPin,
  ArrowLeft,
  PlusIcon,
  Settings2,
  Car,
  MoreHorizontalIcon,
  Receipt,
  Route,
  Mountain,
  Gauge,
  Percent,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const formatStateName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const DEFAULT_FARE_STATE = {
  baseFare: "",
  marketFare: "",
  perKmCharge: "",
  perHourCharge: "",
  freeKmPerDay: "100",
  freeHoursPerDay: "8",
  extraKmCharge: "",
  extraHourCharge: "",
  driverAllowance: "300",
  nightCharge: "250",
  taxSlab: "5",
};

export default function CityView() {
  const { id } = useParams();

  const { data: city, isLoading: cityLoading } = useGetCitiesQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({
      data: data?.data?.cities?.find((i) => i._id === id),
      isLoading,
    }),
  });

  const { data: allCategoriesData } = useGetCarCategoriesQuery();
  const allCategories = allCategoriesData?.data?.categories || [];

  // Available categories that haven't been added to this city yet
  const unaddedCategories = useMemo(() => {
    if (!city?.category) return allCategories;
    const addedIds = new Set(
      city.category.map((c) => (c.type?._id || c.type)?.toString()),
    );
    return allCategories.filter((cat) => !addedIds.has(cat._id.toString()));
  }, [allCategories, city?.category]);

  const [updateCityCharges, { isLoading: isUpdatingCharges }] =
    useUpdateCityChargesMutation();
  const [addNewCategoryToCity, { isLoading: isAddingCategory }] =
    useAddNewCategoryToCityMutation();
  const [updateCategoryFromCity, { isLoading: isUpdatingCategory }] =
    useUpdateCategoryFromCityMutation();
  const [toggleCategoryStatusFromCity] =
    useToggleCategoryStatusFromCityMutation();

  // Dialog states
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [citySettingsOpen, setCitySettingsOpen] = useState(false);
  const [editCategoryItem, setEditCategoryItem] = useState(null);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fareDetails, setFareDetails] = useState(DEFAULT_FARE_STATE);

  // City Settings form
  const [bufferKm, setBufferKm] = useState(city?.bufferKm || 0);
  const [hillCharge, setHillCharge] = useState(city?.hillCharge || 0);

  const handleOpenCitySettings = () => {
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      toast.error("Please select a vehicle category");
      return;
    }

    const payload = {
      type: selectedCategory,
      baseFare: Number(fareDetails.baseFare) || 0,
      marketFare: Number(fareDetails.marketFare) || 0,
      perKmCharge: Number(fareDetails.perKmCharge) || 0,
      perHourCharge: Number(fareDetails.perHourCharge) || 0,
      freeKmPerDay: Number(fareDetails.freeKmPerDay) || 0,
      freeHoursPerDay: Number(fareDetails.freeHoursPerDay) || 0,
      extraKmCharge: Number(fareDetails.extraKmCharge) || 0,
      extraHourCharge: Number(fareDetails.extraHourCharge) || 0,
      driverAllowance: Number(fareDetails.driverAllowance) || 0,
      nightCharge: Number(fareDetails.nightCharge) || 0,
      taxSlab: Number(fareDetails.taxSlab) || 0,
    };

    try {
      await addNewCategoryToCity({
        cityId: city._id,
        category: payload,
      }).unwrap();
      toast.success("Category rates configured for city successfully");
      setSelectedCategory("");
      setFareDetails(DEFAULT_FARE_STATE);
      setAddCategoryOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to add category");
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const payload = {};
    for (const [key, value] of formData.entries()) {
      payload[key] = Number(value) || 0;
    }

    try {
      await updateCategoryFromCity({
        cityId: city._id,
        categoryId: editCategoryItem._id,
        category: payload,
      }).unwrap();
      toast.success("Category rates updated successfully");
      setEditCategoryItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update category rates");
    }
  };

  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      await toggleCategoryStatusFromCity({
        cityId: city._id,
        categoryId,
      }).unwrap();
      toast.success(`Category ${currentStatus ? "disabled" : "enabled"}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update category status");
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

  const categoryCount = city.category?.length || 0;
  const activeCount = city.category?.filter((c) => c.isActive).length || 0;

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
        badge={`${activeCount} Active / ${categoryCount} Total Categories`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenCitySettings}
              className="gap-1.5 shadow-2xs font-medium"
            >
              <Settings2 className="h-4 w-4" /> City Parameters
            </Button>

            <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 shadow-2xs">
                  <PlusIcon className="h-4 w-4" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleAddCategory}>
                  <DialogHeader>
                    <DialogTitle>
                      Add Vehicle Category to {formatStateName(city.city)}
                    </DialogTitle>
                    <DialogDescription>
                      Configure base fares, per-km rates, and allowance slabs for
                      this vehicle class in {formatStateName(city.city)}.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-5 py-4">
                    {/* Vehicle Category Selector */}
                    <div className="grid gap-1.5">
                      <Label htmlFor="category">Select Vehicle Category *</Label>
                      {unaddedCategories.length > 0 ? (
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Choose vehicle category..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
                            {unaddedCategories.map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                <div className="flex items-center gap-2">
                                  {c.image?.url && (
                                    <img
                                      src={c.image.url}
                                      alt={c.category}
                                      className="h-4 w-4 rounded object-cover"
                                    />
                                  )}
                                  <span className="font-medium capitalize">
                                    {c.category}
                                  </span>
                                  {c.seats && (
                                    <span className="text-xs text-muted-foreground">
                                      ({c.seats} seats)
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                          All available vehicle categories have already been
                          configured for this city.
                        </div>
                      )}
                    </div>

                    {/* Section 1: Base Pricing & Tax */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Receipt className="h-3.5 w-3.5" /> Base Pricing & Tax
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Base Fare (₹) *</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 2500"
                            value={fareDetails.baseFare}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                baseFare: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Market Fare (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 2800"
                            value={fareDetails.marketFare}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                marketFare: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tax Slab (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="e.g. 5"
                            value={fareDetails.taxSlab}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                taxSlab: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: KM & Hourly Running Rates */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Route className="h-3.5 w-3.5" /> KM & Hourly Rates
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Per KM (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="e.g. 14"
                            value={fareDetails.perKmCharge}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                perKmCharge: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Extra KM (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="e.g. 16"
                            value={fareDetails.extraKmCharge}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                extraKmCharge: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Per Hour (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 150"
                            value={fareDetails.perHourCharge}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                perHourCharge: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Extra Hour (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 180"
                            value={fareDetails.extraHourCharge}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                extraHourCharge: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Allowances & Inclusions */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Gauge className="h-3.5 w-3.5" /> Inclusions & Allowances
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Free KM / Day</Label>
                          <Input
                            type="number"
                            min="0"
                            value={fareDetails.freeKmPerDay}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                freeKmPerDay: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Free Hours / Day</Label>
                          <Input
                            type="number"
                            min="0"
                            value={fareDetails.freeHoursPerDay}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                freeHoursPerDay: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Driver Allowance (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={fareDetails.driverAllowance}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                driverAllowance: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Night Charge (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={fareDetails.nightCharge}
                            onChange={(e) =>
                              setFareDetails({
                                ...fareDetails,
                                nightCharge: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={isAddingCategory || !selectedCategory}
                    >
                      {isAddingCategory ? "Adding..." : "Add Category"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
            Included per service day
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

      {/* Categories Table Card */}
      <div className="rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Vehicle Categories & Local Tariffs
            </h2>
            <Badge variant="secondary" className="text-xs">
              {categoryCount}
            </Badge>
          </div>

          <span className="text-xs text-muted-foreground">
            Rates apply to local journeys & packages originating in{" "}
            {formatStateName(city.city)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[50px]">Image</TableHead>
                <TableHead className="min-w-[140px]">Vehicle Class</TableHead>
                <TableHead className="min-w-[120px]">Base / Market</TableHead>
                <TableHead className="min-w-[130px]">Per KM & Extra</TableHead>
                <TableHead className="min-w-[130px]">Per Hr & Extra</TableHead>
                <TableHead className="min-w-[120px]">Daily Inclusions</TableHead>
                <TableHead className="min-w-[140px]">Allowances</TableHead>
                <TableHead className="min-w-[80px]">Tax</TableHead>
                <TableHead className="min-w-[90px] text-center">Status</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categoryCount > 0 ? (
                city.category.map((cat) => {
                  const catType = cat.type || {};
                  const catName = catType.category || "Vehicle Class";
                  const imageUrl = catType.image?.url;

                  return (
                    <TableRow key={cat._id} className="hover:bg-muted/30">
                      {/* Vehicle Image Thumbnail */}
                      <TableCell>
                        {imageUrl ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <img
                                src={imageUrl}
                                alt={catName}
                                className="h-9 w-9 cursor-pointer rounded-lg border object-cover transition hover:scale-105"
                              />
                            </DialogTrigger>
                            <DialogContent className="max-w-fit border-none bg-white p-0 shadow-none">
                              <img
                                src={imageUrl}
                                alt={catName}
                                className="max-h-[75vh] rounded-xl object-contain"
                              />
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted border text-muted-foreground">
                            <Car className="h-4 w-4" />
                          </div>
                        )}
                      </TableCell>

                      {/* Vehicle Category Name */}
                      <TableCell>
                        <div className="font-semibold text-foreground capitalize text-sm">
                          {catName}
                        </div>
                        {catType.seats && (
                          <span className="text-[11px] text-muted-foreground">
                            {catType.seats} Seats
                          </span>
                        )}
                      </TableCell>

                      {/* Base / Market Fare */}
                      <TableCell>
                        <div className="font-bold text-foreground tabular-nums text-sm">
                          ₹{cat.baseFare?.toLocaleString() || 0}
                        </div>
                        {cat.marketFare > 0 && (
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            Market: ₹{cat.marketFare.toLocaleString()}
                          </span>
                        )}
                      </TableCell>

                      {/* Per KM & Extra KM */}
                      <TableCell>
                        <div className="text-xs font-medium text-foreground tabular-nums">
                          ₹{cat.perKmCharge || 0}/km
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          Extra: ₹{cat.extraKmCharge || 0}/km
                        </span>
                      </TableCell>

                      {/* Per Hour & Extra Hour */}
                      <TableCell>
                        <div className="text-xs font-medium text-foreground tabular-nums">
                          ₹{cat.perHourCharge || 0}/hr
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          Extra: ₹{cat.extraHourCharge || 0}/hr
                        </span>
                      </TableCell>

                      {/* Free KM / Day & Hours */}
                      <TableCell>
                        <div className="text-xs text-foreground font-medium tabular-nums">
                          {cat.freeKmPerDay || 0} KM
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {cat.freeHoursPerDay || 0} hrs/day
                        </span>
                      </TableCell>

                      {/* Allowances: Driver & Night */}
                      <TableCell>
                        <div className="text-xs text-foreground tabular-nums">
                          Driver: ₹{cat.driverAllowance || 0}
                        </div>
                        <div className="text-[11px] text-muted-foreground tabular-nums">
                          Night: ₹{cat.nightCharge || 0}
                        </div>
                      </TableCell>

                      {/* Tax Slab */}
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-normal">
                          {cat.taxSlab || 0}%
                        </Badge>
                      </TableCell>

                      {/* Visibility Switch */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={cat.isActive}
                            onCheckedChange={() =>
                              handleToggleStatus(cat._id, cat.isActive)
                            }
                            aria-label="Toggle category status"
                          />
                        </div>
                      </TableCell>

                      {/* Actions Menu */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setEditCategoryItem(cat)}
                            >
                              Edit Rates
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(cat._id, cat.isActive)
                              }
                            >
                              {cat.isActive ? "Disable Category" : "Enable Category"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                        <Car className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">
                        No Categories Configured
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 mb-4">
                        Add vehicle categories to {formatStateName(city.city)} to
                        enable local packages and booking quotes.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setAddCategoryOpen(true)}
                        className="gap-1.5"
                      >
                        <PlusIcon className="h-3.5 w-3.5" /> Add First Category
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editCategoryItem && (
        <Dialog
          open={!!editCategoryItem}
          onOpenChange={(open) => !open && setEditCategoryItem(null)}
        >
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleEditCategory}>
              <DialogHeader>
                <DialogTitle className="capitalize">
                  Edit {editCategoryItem.type?.category} Rates in{" "}
                  {formatStateName(city.city)}
                </DialogTitle>
                <DialogDescription>
                  Update base tariffs, running charges, and allowances for this
                  vehicle category.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 py-4">
                {/* Section 1: Base Pricing & Tax */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" /> Base Pricing & Tax
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Base Fare (₹) *</Label>
                      <Input
                        name="baseFare"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.baseFare}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Market Fare (₹)</Label>
                      <Input
                        name="marketFare"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.marketFare}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tax Slab (%)</Label>
                      <Input
                        name="taxSlab"
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={editCategoryItem.taxSlab}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: KM & Hourly Rates */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Route className="h-3.5 w-3.5" /> KM & Hourly Rates
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Per KM (₹)</Label>
                      <Input
                        name="perKmCharge"
                        type="number"
                        step="0.5"
                        min="0"
                        defaultValue={editCategoryItem.perKmCharge}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Extra KM (₹)</Label>
                      <Input
                        name="extraKmCharge"
                        type="number"
                        step="0.5"
                        min="0"
                        defaultValue={editCategoryItem.extraKmCharge}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Per Hour (₹)</Label>
                      <Input
                        name="perHourCharge"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.perHourCharge}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Extra Hour (₹)</Label>
                      <Input
                        name="extraHourCharge"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.extraHourCharge}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Allowances & Inclusions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/80 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" /> Inclusions & Allowances
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Free KM / Day</Label>
                      <Input
                        name="freeKmPerDay"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.freeKmPerDay}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Free Hours / Day</Label>
                      <Input
                        name="freeHoursPerDay"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.freeHoursPerDay}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Driver Allowance (₹)</Label>
                      <Input
                        name="driverAllowance"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.driverAllowance}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Night Charge (₹)</Label>
                      <Input
                        name="nightCharge"
                        type="number"
                        min="0"
                        defaultValue={editCategoryItem.nightCharge}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdatingCategory}>
                  {isUpdatingCategory ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* City Parameters Modal (Buffer KM & Hill Charge) */}
      <Dialog open={citySettingsOpen} onOpenChange={setCitySettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveCitySettings}>
            <DialogHeader>
              <DialogTitle>
                City Parameters: {formatStateName(city.city)}
              </DialogTitle>
              <DialogDescription>
                Configure buffer distance and terrain hill charges applied to
                trips in this city.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
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
