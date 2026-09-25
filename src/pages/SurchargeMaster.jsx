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
import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSurchargeMutation,
  useDeleteSurchargeMutation,
  useGetAllSurchargesQuery,
  useGetCitiesQuery,
  useUpdateSurchargeMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, Percent } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { toast } from "sonner";

const SurchargeMaster = () => {
  const { data: surchargesData, isLoading: surchargesLoading } =
    useGetAllSurchargesQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const [createSurcharge] = useCreateSurchargeMutation();
  const [updateSurcharge] = useUpdateSurchargeMutation();
  const [deleteSurcharge] = useDeleteSurchargeMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedCity, setSelectedCity] = useState("all");

  const surcharges = surchargesData?.data?.surcharges || [];
  const rawCities = citiesData?.data?.cities || [];
  const cities = rawCities
    .slice()
    .sort((a, b) => (a.city || "").localeCompare(b.city || ""));

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const percentInput = Number(formData.get("surchargePercent"));
    // Convert 15% to 0.15 if entered as 15
    const surchargePercent =
      percentInput > 1 ? percentInput / 100 : percentInput;

    try {
      const res = await createSurcharge({
        name: formData.get("name"),
        city: selectedCity === "all" ? null : selectedCity,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        surchargePercent,
      }).unwrap();
      toast.success(res.message || "Surcharge period created successfully");
      setAddOpen(false);
      setSelectedCity("all");
      e.target.reset();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create surcharge");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const percentInput = Number(formData.get("surchargePercent"));
    const surchargePercent =
      percentInput > 1 ? percentInput / 100 : percentInput;

    try {
      const res = await updateSurcharge({
        id: editItem._id,
        name: formData.get("name"),
        city: selectedCity === "all" ? null : selectedCity,
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        surchargePercent,
        isActive: editItem.isActive,
      }).unwrap();
      toast.success(res.message || "Surcharge period updated");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update surcharge");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteSurcharge(id).unwrap();
      toast.success(res.message || "Surcharge deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete surcharge");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateSurcharge({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success("Surcharge status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toInputDateFormat = (d) => {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Season / Period",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "city",
      header: "Scope / City",
      cell: ({ row }) => {
        const city = row.original.city;
        if (!city) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              All Cities (Global)
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            {city.city} {city.state ? `(${city.state})` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      cell: ({ row }) => <div>{formatDate(row.getValue("startDate"))}</div>,
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      cell: ({ row }) => <div>{formatDate(row.getValue("endDate"))}</div>,
    },
    {
      accessorKey: "surchargePercent",
      header: "Surcharge Rate",
      cell: ({ row }) => {
        const val = row.getValue("surchargePercent") || 0;
        return (
          <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs">
            +{Math.round(val * 100)}%
          </span>
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
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-0.5" align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCity(item.city?._id || item.city || "all");
                  setEditItem(item);
                }}
              >
                Edit Period
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete Period
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete surcharge period <b>{item.name}</b>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(item._id)}>
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

  if (surchargesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Surcharge Master"
        description="Peak holiday dates & seasonal percentage markups (Diwali, Christmas, Summer Holidays)"
        icon={Percent}
        badge={`${surcharges.length} Surcharges Configured`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-xs">
                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Surcharge Period
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Surcharge Period</DialogTitle>
              <DialogDescription>
                Trips falling within this date range will automatically have this markup applied.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Period Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Diwali Peak Season"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Applicable City</Label>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city (or All Cities)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="all">
                      All Cities (Global Surcharge)
                    </SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.city} ({c.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a specific city for local peaks, or leave as All Cities for nationwide surcharges.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="surchargePercent">Surcharge Percentage (%)</Label>
                <Input
                  id="surchargePercent"
                  name="surchargePercent"
                  type="number"
                  step="1"
                  placeholder="e.g. 15 (for 15%)"
                  required
                  min={0}
                  max={100}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Period</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />

      <AutopaginateTable columns={columns} data={surcharges} />

      {/* Edit Surcharge Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Surcharge Period</DialogTitle>
              <DialogDescription>{editItem.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editPeriodName">Period Name</Label>
                <Input
                  id="editPeriodName"
                  name="name"
                  defaultValue={editItem.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Applicable City</Label>
                <Select
                  value={selectedCity}
                  onValueChange={setSelectedCity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city (or All Cities)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="all">
                      All Cities (Global Surcharge)
                    </SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.city} ({c.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editStartDate">Start Date</Label>
                  <Input
                    id="editStartDate"
                    name="startDate"
                    type="date"
                    defaultValue={toInputDateFormat(editItem.startDate)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEndDate">End Date</Label>
                  <Input
                    id="editEndDate"
                    name="endDate"
                    type="date"
                    defaultValue={toInputDateFormat(editItem.endDate)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPercent">Surcharge Percentage (%)</Label>
                <Input
                  id="editPercent"
                  name="surchargePercent"
                  type="number"
                  step="1"
                  defaultValue={Math.round((editItem.surchargePercent || 0) * 100)}
                  required
                  min={0}
                  max={100}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Period</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SurchargeMaster;
