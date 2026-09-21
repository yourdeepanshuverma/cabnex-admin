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
  useCreateGarageMutation,
  useDeleteGarageMutation,
  useGetAllGaragesQuery,
  useGetCitiesQuery,
  useUpdateGarageMutation,
} from "@/store/services/adminApi";
import {
  MoreHorizontalIcon,
  PlusIcon,
  Warehouse,
  MapPin,
  Search,
  Check,
  Building,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const GarageMaster = () => {
  const { data: garagesData, isLoading: garagesLoading } =
    useGetAllGaragesQuery();
  const { data: citiesData } = useGetCitiesQuery();

  const [createGarage, { isLoading: isCreating }] = useCreateGarageMutation();
  const [updateGarage, { isLoading: isUpdating }] = useUpdateGarageMutation();
  const [deleteGarage] = useDeleteGarageMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form states for Add modal
  const [addName, setAddName] = useState("");
  const [addBaseCity, setAddBaseCity] = useState("");
  const [addAssignedCities, setAddAssignedCities] = useState([]);
  const [addCitySearch, setAddCitySearch] = useState("");

  // Form states for Edit modal
  const [editName, setEditName] = useState("");
  const [editBaseCity, setEditBaseCity] = useState("");
  const [editAssignedCities, setEditAssignedCities] = useState([]);
  const [editCitySearch, setEditCitySearch] = useState("");

  const garages = garagesData?.data?.garages || [];
  const cities = citiesData?.data?.cities || [];

  // Map of cityId -> garage that already claims this city
  const cityAssignmentMap = useMemo(() => {
    const map = new Map();
    garages.forEach((g) => {
      (g.assignedCities || []).forEach((c) => {
        const cId = typeof c === "object" ? c._id : c;
        map.set(cId.toString(), {
          garageId: g._id,
          garageName: g.name,
        });
      });
    });
    return map;
  }, [garages]);

  const handleOpenAdd = () => {
    setAddName("");
    setAddBaseCity("");
    setAddAssignedCities([]);
    setAddCitySearch("");
    setAddOpen(true);
  };

  const handleOpenEdit = (garage) => {
    setEditItem(garage);
    setEditName(garage.name || "");
    setEditBaseCity(
      typeof garage.garageCity === "object"
        ? garage.garageCity?._id
        : garage.garageCity || ""
    );
    setEditAssignedCities(
      (garage.assignedCities || []).map((c) =>
        typeof c === "object" ? c._id : c
      )
    );
    setEditCitySearch("");
  };

  const handleToggleAddCity = (cityId) => {
    setAddAssignedCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleToggleEditCity = (cityId) => {
    setEditAssignedCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addName.trim()) {
      toast.error("Please enter a garage name");
      return;
    }
    if (!addBaseCity) {
      toast.error("Please select a base location city");
      return;
    }

    try {
      const res = await createGarage({
        name: addName.trim(),
        garageCity: addBaseCity,
        assignedCities: addAssignedCities,
      }).unwrap();
      toast.success(res.message || "Garage created successfully");
      setAddOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create garage");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Please enter a garage name");
      return;
    }
    if (!editBaseCity) {
      toast.error("Please select a base location city");
      return;
    }

    try {
      const res = await updateGarage({
        id: editItem._id,
        name: editName.trim(),
        garageCity: editBaseCity,
        assignedCities: editAssignedCities,
      }).unwrap();
      toast.success(res.message || "Garage updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update garage");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteGarage(id).unwrap();
      toast.success(res.message || "Garage deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete garage");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateGarage({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success("Garage status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  // Helper to filter cities
  const filterCities = (searchStr) => {
    if (!searchStr) return cities;
    const lower = searchStr.toLowerCase();
    return cities.filter(
      (c) =>
        c.city.toLowerCase().includes(lower) ||
        (c.state && c.state.toLowerCase().includes(lower))
    );
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Garage Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0">
            <Warehouse className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {row.getValue("name")}
            </div>
            <div className="text-xs text-muted-foreground">
              Base:{" "}
              <span className="font-medium capitalize text-foreground/80">
                {row.original.garageCity?.city || "Unknown City"}
              </span>
              {row.original.garageCity?.state && (
                <span className="capitalize">
                  {" "}
                  ({row.original.garageCity.state})
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "garageCity",
      header: "Base City",
      cell: ({ row }) => {
        const cityObj = row.original.garageCity;
        return (
          <div className="flex items-center gap-1.5 text-sm">
            <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="capitalize font-medium">
              {cityObj?.city || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "assignedCities",
      header: "Assigned Service Cities",
      cell: ({ row }) => {
        const assigned = row.original.assignedCities || [];
        if (assigned.length === 0) {
          return (
            <span className="text-xs text-muted-foreground italic">
              No cities assigned
            </span>
          );
        }
        const displaySlice = assigned.slice(0, 4);
        const remaining = assigned.length - displaySlice.length;

        return (
          <div className="flex flex-wrap items-center gap-1.5 max-w-md py-1">
            {displaySlice.map((c) => {
              const name = typeof c === "object" ? c.city : c;
              return (
                <Badge
                  key={typeof c === "object" ? c._id : c}
                  variant="secondary"
                  className="capitalize text-xs font-normal bg-secondary/80 hover:bg-secondary"
                >
                  {name}
                </Badge>
              );
            })}
            {remaining > 0 && (
              <Badge variant="outline" className="text-xs font-medium">
                +{remaining} more
              </Badge>
            )}
            <span className="text-xs text-muted-foreground ml-1">
              ({assigned.length} total)
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggleStatus(row.original)}
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="float-right">
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                Edit Garage
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:text-red-600 focus:text-red-600"
                  >
                    Delete Garage
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Garage?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <b>{item.name}</b>? Trips
                      originating from its assigned cities will no longer calculate
                      garage distances until reassigned.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(item._id)}
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

  if (garagesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Garage Master"
        description="Configure taxi base locations (garages) and assign service cities to calculate taxi dispatch and return distances"
        icon={Warehouse}
        badge={`${garages.length} Garages Configured`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAdd} className="shadow-xs">
                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Garage
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add New Garage</DialogTitle>
                <DialogDescription>
                  Set a base garage location and select the service cities that
                  dispatch from and return to this garage.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleAdd}
                className="flex flex-col flex-1 overflow-hidden space-y-4 pt-2"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="add-name">Garage Name</Label>
                  <Input
                    id="add-name"
                    placeholder="e.g. Kumarakom Central Hub"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="add-base-city">Base City Location</Label>
                  <Select
                    value={addBaseCity}
                    onValueChange={setAddBaseCity}
                    required
                  >
                    <SelectTrigger id="add-base-city" className="w-full">
                      <SelectValue placeholder="Select base city for garage" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {cities.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          <span className="capitalize">{c.city}</span>
                          {c.state && (
                            <span className="text-muted-foreground text-xs ml-1.5 capitalize">
                              ({c.state})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col flex-1 min-h-[220px] space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      Assigned Service Cities ({addAssignedCities.length}{" "}
                      selected)
                    </Label>
                    {addBaseCity && !addAssignedCities.includes(addBaseCity) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-xs text-emerald-600 hover:text-emerald-700 h-6 px-2"
                        onClick={() => handleToggleAddCity(addBaseCity)}
                      >
                        + Include Base City
                      </Button>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search cities or states..."
                      className="pl-8 text-xs h-8"
                      value={addCitySearch}
                      onChange={(e) => setAddCitySearch(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-md p-2 overflow-y-auto max-h-52 grid grid-cols-2 gap-1.5 bg-muted/20">
                    {filterCities(addCitySearch).map((c) => {
                      const isSelected = addAssignedCities.includes(c._id);
                      const claimed = cityAssignmentMap.get(c._id.toString());
                      const isClaimedByOther = Boolean(claimed);

                      return (
                        <div
                          key={c._id}
                          onClick={() => {
                            if (!isClaimedByOther) {
                              handleToggleAddCity(c._id);
                            }
                          }}
                          className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer border transition-colors ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-medium"
                              : isClaimedByOther
                              ? "opacity-50 cursor-not-allowed bg-muted/40 border-transparent"
                              : "hover:bg-accent border-transparent"
                          }`}
                        >
                          <div className="truncate pr-1">
                            <span className="capitalize">{c.city}</span>
                            {c.state && (
                              <span className="text-[10px] text-muted-foreground ml-1 capitalize block truncate">
                                {c.state}
                              </span>
                            )}
                          </div>
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          ) : isClaimedByOther ? (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                              in {claimed.garageName}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <DialogFooter className="pt-2">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Save Garage"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-4 md:p-6 flex-1">
        <AutopaginateTable
          columns={columns}
          data={garages}
          searchKey="name"
          searchPlaceholder="Search garages by name..."
        />
      </div>

      {/* Edit Garage Dialog */}
      {editItem && (
        <Dialog
          open={Boolean(editItem)}
          onOpenChange={(open) => !open && setEditItem(null)}
        >
          <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Edit Garage</DialogTitle>
              <DialogDescription>
                Update base city location or assigned service cities for{" "}
                <b>{editItem.name}</b>.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleEdit}
              className="flex flex-col flex-1 overflow-hidden space-y-4 pt-2"
            >
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Garage Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-base-city">Base City Location</Label>
                <Select
                  value={editBaseCity}
                  onValueChange={setEditBaseCity}
                  required
                >
                  <SelectTrigger id="edit-base-city" className="w-full">
                    <SelectValue placeholder="Select base city" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        <span className="capitalize">{c.city}</span>
                        {c.state && (
                          <span className="text-muted-foreground text-xs ml-1.5 capitalize">
                            ({c.state})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col flex-1 min-h-[220px] space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Assigned Service Cities ({editAssignedCities.length}{" "}
                    selected)
                  </Label>
                  {editBaseCity && !editAssignedCities.includes(editBaseCity) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-xs text-emerald-600 hover:text-emerald-700 h-6 px-2"
                      onClick={() => handleToggleEditCity(editBaseCity)}
                    >
                      + Include Base City
                    </Button>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search cities or states..."
                    className="pl-8 text-xs h-8"
                    value={editCitySearch}
                    onChange={(e) => setEditCitySearch(e.target.value)}
                  />
                </div>

                <div className="border rounded-md p-2 overflow-y-auto max-h-52 grid grid-cols-2 gap-1.5 bg-muted/20">
                  {filterCities(editCitySearch).map((c) => {
                    const isSelected = editAssignedCities.includes(c._id);
                    const claimed = cityAssignmentMap.get(c._id.toString());
                    const isClaimedByOther =
                      claimed && claimed.garageId !== editItem._id;

                    return (
                      <div
                        key={c._id}
                        onClick={() => {
                          if (!isClaimedByOther) {
                            handleToggleEditCity(c._id);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer border transition-colors ${
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : isClaimedByOther
                            ? "opacity-50 cursor-not-allowed bg-muted/40 border-transparent"
                            : "hover:bg-accent border-transparent"
                        }`}
                      >
                        <div className="truncate pr-1">
                          <span className="capitalize">{c.city}</span>
                          {c.state && (
                            <span className="text-[10px] text-muted-foreground ml-1 capitalize block truncate">
                              {c.state}
                            </span>
                          )}
                        </div>
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : isClaimedByOther ? (
                          <span className="text-[9px] text-amber-600 dark:text-amber-400 shrink-0 font-medium">
                            in {claimed.garageName}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </Button>
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

export default GarageMaster;
