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
import {
  useCreateRateMutation,
  useDeleteRateMutation,
  useGetAllRatesQuery,
  useGetCarCategoriesQuery,
  useUpdateRateMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, CoinsIcon } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { toast } from "sonner";

const INDIAN_STATES = [
  "andhra-pradesh",
  "karnataka",
  "kerala",
  "tamil-nadu",
  "telangana",
  "puducherry",
  "goa",
  "maharashtra",
  "delhi",
  "rajasthan",
  "uttar-pradesh",
  "gujarat",
  "west-bengal",
];

const RateMaster = () => {
  const { data: ratesData, isLoading: ratesLoading } = useGetAllRatesQuery();
  const { data: categoriesData } = useGetCarCategoriesQuery();
  const [createRate] = useCreateRateMutation();
  const [updateRate] = useUpdateRateMutation();
  const [deleteRate] = useDeleteRateMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedRateModel, setSelectedRateModel] = useState("daily-included-km");
  const [editItem, setEditItem] = useState(null);

  const categories = categoriesData?.data?.categories || [];
  const rates = ratesData?.data?.rates || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!selectedCategory || !selectedState) {
      toast.error("Please select a vehicle category and state");
      return;
    }

    try {
      const res = await createRate({
        vehicleCategory: selectedCategory,
        state: selectedState,
        rateModel: selectedRateModel,
        baseRatePerDay: Number(formData.get("baseRatePerDay")),
        includedKmPerDay: Number(formData.get("includedKmPerDay")),
        extraKmRate: Number(formData.get("extraKmRate")),
        driverBataPerDay: Number(formData.get("driverBataPerDay")),
      }).unwrap();
      toast.success(res.message || "Rate card added successfully");
      setAddOpen(false);
      setSelectedCategory("");
      setSelectedState("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create rate card");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await updateRate({
        id: editItem._id,
        baseRatePerDay: Number(formData.get("baseRatePerDay")),
        includedKmPerDay: Number(formData.get("includedKmPerDay")),
        extraKmRate: Number(formData.get("extraKmRate")),
        driverBataPerDay: Number(formData.get("driverBataPerDay")),
        isActive: editItem.isActive,
      }).unwrap();
      toast.success(res.message || "Rate card updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update rate card");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteRate(id).unwrap();
      toast.success(res.message || "Rate deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete rate");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateRate({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success("Rate card status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      accessorKey: "vehicleCategory.category",
      header: "Vehicle Category",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.original.vehicleCategory?.category?.replace(/-/g, " ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("state")?.replace(/-/g, " ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "rateModel",
      header: "Rate Model",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-muted rounded text-xs capitalize">
          {row.getValue("rateModel")?.replace(/-/g, " ")}
        </span>
      ),
    },
    {
      accessorKey: "baseRatePerDay",
      header: "Base Rate / Day",
      cell: ({ row }) => (
        <div className="font-medium">₹{row.getValue("baseRatePerDay")}</div>
      ),
    },
    {
      accessorKey: "includedKmPerDay",
      header: "Included KM / Day",
      cell: ({ row }) => <div>{row.getValue("includedKmPerDay")} KM</div>,
    },
    {
      accessorKey: "extraKmRate",
      header: "Extra KM Rate",
      cell: ({ row }) => <div>₹{row.getValue("extraKmRate")}/KM</div>,
    },
    {
      accessorKey: "driverBataPerDay",
      header: "Driver Bata / Day",
      cell: ({ row }) => <div>₹{row.getValue("driverBataPerDay")}</div>,
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
              <DropdownMenuItem onClick={() => setEditItem(item)}>
                Edit Rate
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete Rate
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete the rate card for{" "}
                      <b>{item.vehicleCategory?.category}</b> in{" "}
                      <b>{item.state}</b>.
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

  if (ratesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Rate Master (Rate Cards)"
        description="Per-vehicle, per-state pricing rules, daily minimum KM, and driver allowances"
        icon={CoinsIcon}
        badge={`${rates.length} Rate Cards Active`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-xs">
                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Rate Card
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Rate Card</DialogTitle>
              <DialogDescription>
                Define pricing rates for a vehicle category in a specific state.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat._id} className="capitalize">
                          {cat.category?.replace(/-/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={selectedState}
                    onValueChange={setSelectedState}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s.replace(/-/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rate Model</Label>
                <Select
                  value={selectedRateModel}
                  onValueChange={setSelectedRateModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rate model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily-included-km">
                      Daily Included KM (Standard Outstation)
                    </SelectItem>
                    <SelectItem value="per-km-only">
                      Per KM Only
                    </SelectItem>
                    <SelectItem value="fixed-route">
                      Fixed Route Base
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseRatePerDay">Base Rate / Day (₹)</Label>
                  <Input
                    id="baseRatePerDay"
                    name="baseRatePerDay"
                    type="number"
                    placeholder="e.g. 3500"
                    required
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="includedKmPerDay">Included KM / Day</Label>
                  <Input
                    id="includedKmPerDay"
                    name="includedKmPerDay"
                    type="number"
                    placeholder="e.g. 250"
                    required
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extraKmRate">Extra KM Rate (₹/KM)</Label>
                  <Input
                    id="extraKmRate"
                    name="extraKmRate"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 14"
                    required
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverBataPerDay">Driver Bata / Day (₹)</Label>
                  <Input
                    id="driverBataPerDay"
                    name="driverBataPerDay"
                    type="number"
                    placeholder="e.g. 400"
                    required
                    min={0}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Rate Card</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />

      <AutopaginateTable columns={columns} data={rates} />

      {/* Edit Rate Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Rate Card</DialogTitle>
              <DialogDescription className="capitalize">
                {editItem.vehicleCategory?.category?.replace(/-/g, " ")} —{" "}
                {editItem.state?.replace(/-/g, " ")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editBaseRate">Base Rate / Day (₹)</Label>
                  <Input
                    id="editBaseRate"
                    name="baseRatePerDay"
                    type="number"
                    defaultValue={editItem.baseRatePerDay}
                    required
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editIncludedKm">Included KM / Day</Label>
                  <Input
                    id="editIncludedKm"
                    name="includedKmPerDay"
                    type="number"
                    defaultValue={editItem.includedKmPerDay}
                    required
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editExtraKm">Extra KM Rate (₹/KM)</Label>
                  <Input
                    id="editExtraKm"
                    name="extraKmRate"
                    type="number"
                    step="0.5"
                    defaultValue={editItem.extraKmRate}
                    required
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDriverBata">Driver Bata / Day (₹)</Label>
                  <Input
                    id="editDriverBata"
                    name="driverBataPerDay"
                    type="number"
                    defaultValue={editItem.driverBataPerDay}
                    required
                    min={0}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Rate Card</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RateMaster;
