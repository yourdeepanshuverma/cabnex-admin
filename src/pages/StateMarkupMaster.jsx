import AutopaginateTable from "@/components/auto-paginate-table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  useCreateStateMarkupMutation,
  useDeleteStateMarkupMutation,
  useGetAllStateMarkupsQuery,
  useGetCitiesQuery,
  useGetDefaultCommissionQuery,
  useUpdateDefaultCommissionMutation,
  useUpdateStateMarkupMutation,
} from "@/store/services/adminApi";
import {
  BadgePercent,
  Edit2Icon,
  Globe,
  MapPin,
  MoreHorizontalIcon,
  PlusIcon,
  Percent,
  SlidersHorizontal,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const INDIAN_STATES = [
  "andhra-pradesh",
  "arunachal-pradesh",
  "assam",
  "bihar",
  "chhattisgarh",
  "delhi",
  "goa",
  "gujarat",
  "haryana",
  "himachal-pradesh",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya-pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "puducherry",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil-nadu",
  "telangana",
  "tripura",
  "uttar-pradesh",
  "uttarakhand",
  "west-bengal",
];

const formatStateName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const StateMarkupMaster = () => {
  const { data: markupsData, isLoading: markupsLoading } =
    useGetAllStateMarkupsQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const { data: defaultCommData, isLoading: defaultCommLoading } =
    useGetDefaultCommissionQuery();

  const [createStateMarkup, { isLoading: isCreating }] =
    useCreateStateMarkupMutation();
  const [updateStateMarkup, { isLoading: isUpdating }] =
    useUpdateStateMarkupMutation();
  const [deleteStateMarkup] = useDeleteStateMarkupMutation();
  const [updateDefaultCommission, { isLoading: isUpdatingDefaultComm }] =
    useUpdateDefaultCommissionMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [defaultCommOpen, setDefaultCommOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Filter states
  const [filterState, setFilterState] = useState("all");
  const [filterScope, setFilterScope] = useState("all");

  // Form states for Add modal
  const [selectedState, setSelectedState] = useState("tamil-nadu");
  const [selectedCity, setSelectedCity] = useState("all");

  // Default commission
  const defaultCommissionPercent =
    defaultCommData?.data?.defaultCommissionPercent ?? 0.05;
  const defaultCommissionDisplay = Math.round(defaultCommissionPercent * 100);

  const markups = markupsData?.data?.markups || [];
  const cities = citiesData?.data?.cities || [];

  // Filter cities for selected state in modal
  const citiesForSelectedState = useMemo(() => {
    if (!selectedState) return [];
    return cities.filter(
      (c) =>
        c.state?.toLowerCase().trim().replace(/\s+/g, "-") === selectedState,
    );
  }, [cities, selectedState]);

  // Combined list of all available states
  const availableStates = useMemo(() => {
    const fromCities = cities
      .map((c) => c.state?.toLowerCase().trim().replace(/\s+/g, "-"))
      .filter(Boolean);
    const set = new Set([...INDIAN_STATES, ...fromCities]);
    return Array.from(set).sort();
  }, [cities]);

  // Filtered markups
  const filteredMarkups = useMemo(() => {
    return markups.filter((m) => {
      const matchState = filterState === "all" || m.state === filterState;
      const matchScope =
        filterScope === "all" ||
        (filterScope === "state-wide" && !m.city) ||
        (filterScope === "city-specific" && !!m.city);
      return matchState && matchScope;
    });
  }, [markups, filterState, filterScope]);

  // Metrics
  const activeCount = markups.filter((m) => m.isActive).length;
  const distinctStatesCount = new Set(markups.map((m) => m.state)).size;
  const cityOverridesCount = markups.filter((m) => m.city).length;

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!selectedState) {
      toast.error("Please select a state");
      return;
    }

    const markupVal = Number(formData.get("markupPercent"));
    if (isNaN(markupVal) || markupVal < 0 || markupVal > 100) {
      toast.error("Please enter a valid markup percentage between 0 and 100");
      return;
    }

    try {
      const res = await createStateMarkup({
        state: selectedState,
        city: selectedCity === "all" ? null : selectedCity,
        markupPercent: markupVal,
        remarks: formData.get("remarks") || "",
      }).unwrap();

      toast.success(res.message || "State markup created successfully");
      setAddOpen(false);
      setSelectedCity("all");
      e.target.reset();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create state markup");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const markupVal = Number(formData.get("markupPercent"));
    if (isNaN(markupVal) || markupVal < 0 || markupVal > 100) {
      toast.error("Please enter a valid markup percentage between 0 and 100");
      return;
    }

    try {
      const res = await updateStateMarkup({
        id: editItem._id,
        markupPercent: markupVal,
        remarks: formData.get("remarks") || "",
        isActive: editItem.isActive,
      }).unwrap();

      toast.success(res.message || "State markup updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update state markup");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteStateMarkup(id).unwrap();
      toast.success(res.message || "State markup deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete state markup");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateStateMarkup({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success(
        `Markup for ${formatStateName(item.state)} ${
          item.isActive ? "deactivated" : "activated"
        }`,
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const handleUpdateDefaultCommission = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const val = Number(formData.get("defaultCommissionPercent"));

    if (isNaN(val) || val < 0 || val > 100) {
      toast.error("Please enter a valid commission percent (0-100)");
      return;
    }

    try {
      const res = await updateDefaultCommission({
        defaultCommissionPercent: val,
      }).unwrap();
      toast.success(
        res.message ||
          `Default system commission updated to ${val}% successfully`,
      );
      setDefaultCommOpen(false);
    } catch (err) {
      toast.error(
        err?.data?.message || "Failed to update default system commission",
      );
    }
  };

  const columns = [
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => {
        const stateSlug = row.getValue("state");
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">
              {formatStateName(stateSlug)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "scope",
      header: "Application Scope",
      cell: ({ row }) => {
        const item = row.original;
        if (item.city) {
          return (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <MapPin className="h-3 w-3" />
                {item.city.city ? formatStateName(item.city.city) : "Specific City"}
              </span>
              <span className="text-[11px] text-muted-foreground">
                (City Override)
              </span>
            </div>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Globe className="h-3 w-3" />
            All Cities (State-wide)
          </span>
        );
      },
    },
    {
      accessorKey: "markupPercent",
      header: "Configured Markup",
      cell: ({ row }) => {
        const val = row.getValue("markupPercent") || 0;
        const pct = Math.round(val * 100 * 10) / 10;
        const diff = pct - defaultCommissionDisplay;

        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-foreground tabular-nums">
              {pct}%
            </span>
            <span
              className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                diff > 0
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : diff < 0
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {diff > 0
                ? `+${diff}% vs default`
                : diff < 0
                ? `${diff}% vs default`
                : "Same as default"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "overrideStatus",
      header: "Commission Override",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        if (!isActive) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Inactive — Uses default ({defaultCommissionDisplay}%)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Overrides system {defaultCommissionDisplay}%
          </span>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => {
        const remarks = row.getValue("remarks");
        return remarks ? (
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
            {remarks}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={item.isActive}
              onCheckedChange={() => handleToggleStatus(item)}
              aria-label="Toggle markup status"
            />
            <span
              className={`text-xs font-medium ${
                item.isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              {item.isActive ? "Active" : "Disabled"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditItem(item)}>
                Edit Markup
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                {item.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Rule
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Markup Rule?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the markup override for{" "}
                      <strong>{formatStateName(item.state)}</strong>
                      {item.city ? ` (${item.city.city})` : ""}. Pricing for this
                      state will immediately fall back to the global default
                      system commission ({defaultCommissionDisplay}%).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(item._id)}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (markupsLoading || defaultCommLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageHeader
        title="State-wise Markup Master"
        description="Configure state and city markups to override default system commission during pricing calculation"
        icon={BadgePercent}
        badge={`${activeCount} Active Overrides`}
        actions={
          <div className="flex items-center gap-2.5">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-xs gap-1.5">
                  <PlusIcon className="h-4 w-4" /> Add State Markup
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleAdd}>
                  <DialogHeader>
                    <DialogTitle>Add State Markup</DialogTitle>
                    <DialogDescription>
                      Configure a custom markup percentage for a state or city.
                      This replaces the default {defaultCommissionDisplay}% system
                      commission for quotations in this region.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* State Selector */}
                    <div className="grid gap-1.5">
                      <Label htmlFor="state">State *</Label>
                      <Select
                        value={selectedState}
                        onValueChange={(val) => {
                          setSelectedState(val);
                          setSelectedCity("all");
                        }}
                      >
                        <SelectTrigger id="state">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableStates.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatStateName(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Selector (Optional) */}
                    <div className="grid gap-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="city">City Scope</Label>
                        <span className="text-[11px] text-muted-foreground">
                          Optional: target a single city
                        </span>
                      </div>
                      <Select
                        value={selectedCity}
                        onValueChange={setSelectedCity}
                      >
                        <SelectTrigger id="city">
                          <SelectValue placeholder="All Cities in State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48">
                          <SelectItem value="all">
                            🌐 All Cities in {formatStateName(selectedState)} (State-wide)
                          </SelectItem>
                          {citiesForSelectedState.map((c) => (
                            <SelectItem key={c._id} value={c._id}>
                              📍 {formatStateName(c.city)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Markup Percentage */}
                    <div className="grid gap-1.5">
                      <Label htmlFor="markupPercent">
                        Markup Percentage (%) *
                      </Label>
                      <div className="relative">
                        <Input
                          id="markupPercent"
                          name="markupPercent"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          placeholder="e.g., 8"
                          required
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                          %
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Default system commission is {defaultCommissionDisplay}%.
                        Entering 8 means an 8% markup will be applied to
                        quotations.
                      </p>
                    </div>

                    {/* Remarks */}
                    <div className="grid gap-1.5">
                      <Label htmlFor="remarks">Remarks / Notes</Label>
                      <Input
                        id="remarks"
                        name="remarks"
                        placeholder="e.g. Higher operational costs in hill terrain"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? "Saving..." : "Create Markup"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Global Default System Commission Banner Card */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/10 p-4 md:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Global Default System Commission
                </h3>
                <span className="inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/30">
                  {defaultCommissionDisplay}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
                This base commission rate automatically applies to trips across all
                states and cities where no custom state markup rule is configured below.
              </p>
            </div>
          </div>

          <Dialog open={defaultCommOpen} onOpenChange={setDefaultCommOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 border-primary/30 hover:bg-primary/10 hover:text-primary font-medium"
              >
                <Edit2Icon className="h-3.5 w-3.5" /> Edit Default Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <form onSubmit={handleUpdateDefaultCommission}>
                <DialogHeader>
                  <DialogTitle>Update Global Default Commission</DialogTitle>
                  <DialogDescription>
                    Change the baseline system commission applied when a state has
                    no custom markup rule configured.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="defaultCommissionPercent">
                      Default Commission Rate (%) *
                    </Label>
                    <div className="relative">
                      <Input
                        id="defaultCommissionPercent"
                        name="defaultCommissionPercent"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        defaultValue={defaultCommissionDisplay}
                        required
                        className="pr-8 text-base font-semibold"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                        %
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Setting this to e.g. 5 means all unconfigured states apply a
                      5% platform commission.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isUpdatingDefaultComm}>
                    {isUpdatingDefaultComm ? "Saving..." : "Save Default"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground block">
            Total Rules
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground block mt-1">
            {markups.length}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Configured overrides
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground block">
            Active Overrides
          </span>
          <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 block mt-1">
            {activeCount}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Currently in effect
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground block">
            States Configured
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground block mt-1">
            {distinctStatesCount}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {cityOverridesCount} city-level overrides
          </span>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground block">
            Default Commission
          </span>
          <span className="text-2xl font-bold tracking-tight text-primary block mt-1">
            {defaultCommissionDisplay}%
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Baseline fallback rate
          </span>
        </div>
      </div>

      {/* Table Filters & Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-[200px]">
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                <SelectItem value="all">All States ({markups.length})</SelectItem>
                {availableStates.map((s) => {
                  const count = markups.filter((m) => m.state === s).length;
                  if (count === 0) return null;
                  return (
                    <SelectItem key={s} value={s}>
                      {formatStateName(s)} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Select value={filterScope} onValueChange={setFilterScope}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Filter by scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="state-wide">🌐 State-wide Only</SelectItem>
                <SelectItem value="city-specific">📍 City Overrides Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(filterState !== "all" || filterScope !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterState("all");
                setFilterScope("all");
              }}
              className="h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>

        <span className="text-xs text-muted-foreground">
          Showing {filteredMarkups.length} of {markups.length} rules
        </span>
      </div>

      {/* Main Table */}
      <AutopaginateTable
        columns={columns}
        data={filteredMarkups}
        searchKey="state"
        searchPlaceholder="Search by state name..."
      />

      {/* Edit Modal */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <form onSubmit={handleEdit}>
              <DialogHeader>
                <DialogTitle>
                  Edit Markup: {formatStateName(editItem.state)}
                  {editItem.city ? ` (${editItem.city.city})` : ""}
                </DialogTitle>
                <DialogDescription>
                  Update the markup percentage applied to quotations in this region.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-1.5">
                  <Label>Scope</Label>
                  <div className="rounded-lg border bg-muted/40 p-2.5 text-xs text-foreground">
                    {editItem.city ? (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-sky-500" />
                        Specific City: {formatStateName(editItem.city.city)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Globe className="h-3.5 w-3.5 text-emerald-500" />
                        State-wide: All cities in {formatStateName(editItem.state)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="editMarkupPercent">Markup Percentage (%) *</Label>
                  <div className="relative">
                    <Input
                      id="editMarkupPercent"
                      name="markupPercent"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      defaultValue={Math.round((editItem.markupPercent || 0) * 100 * 10) / 10}
                      required
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">
                      %
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Overrides baseline system commission ({defaultCommissionDisplay}%).
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="editRemarks">Remarks / Notes</Label>
                  <Input
                    id="editRemarks"
                    name="remarks"
                    defaultValue={editItem.remarks || ""}
                    placeholder="e.g. Adjusted for local vendor rates"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StateMarkupMaster;
