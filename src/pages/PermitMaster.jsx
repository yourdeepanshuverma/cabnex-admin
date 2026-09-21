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
  useCreateStatePermitMutation,
  useDeleteStatePermitMutation,
  useGetAllStatePermitsQuery,
  useGetCarCategoriesQuery,
  useUpdateStatePermitMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, ShieldCheckIcon } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const INDIAN_STATES = [
  "tamil-nadu",
  "kerala",
  "karnataka",
  "andhra-pradesh",
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

const formatStateName = (slug) => {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const PermitMaster = () => {
  const { data: permitsData, isLoading: permitsLoading } =
    useGetAllStatePermitsQuery();
  const { data: categoriesData } = useGetCarCategoriesQuery();
  const [createStatePermit] = useCreateStatePermitMutation();
  const [updateStatePermit] = useUpdateStatePermitMutation();
  const [deleteStatePermit] = useDeleteStatePermitMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("tamil-nadu");
  const [editItem, setEditItem] = useState(null);
  const [filterState, setFilterState] = useState("all");

  const categories = categoriesData?.data?.categories || [];
  const permits = permitsData?.data?.permits || [];

  const filteredPermits = useMemo(() => {
    if (filterState === "all") return permits;
    return permits.filter((p) => p.state === filterState);
  }, [permits, filterState]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (!selectedState) {
      toast.error("Please select an entering state");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please select a vehicle category");
      return;
    }

    try {
      const res = await createStatePermit({
        state: selectedState,
        vehicleCategory: selectedCategory,
        permitCharge: Number(formData.get("permitCharge")),
        remarks: formData.get("remarks") || "",
      }).unwrap();
      toast.success(res.message || "State permit created successfully");
      setAddOpen(false);
      setSelectedCategory("");
      setSelectedState("tamil-nadu");
      e.target.reset();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create state permit");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await updateStatePermit({
        id: editItem._id,
        permitCharge: Number(formData.get("permitCharge")),
        remarks: formData.get("remarks") || "",
        isActive: editItem.isActive,
      }).unwrap();
      toast.success(res.message || "State permit updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update state permit");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteStatePermit(id).unwrap();
      toast.success(res.message || "State permit deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete state permit");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateStatePermit({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success("Permit status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      accessorKey: "state",
      header: "Entering State",
      cell: ({ row }) => (
        <div className="font-semibold text-primary">
          {formatStateName(row.getValue("state"))}
          <span className="text-xs text-muted-foreground ml-1.5 font-mono">
            ({row.getValue("state")})
          </span>
        </div>
      ),
    },
    {
      accessorKey: "vehicleCategory",
      header: "Vehicle Category",
      cell: ({ row }) => {
        const cat = row.original.vehicleCategory;
        return (
          <div>
            <span className="font-medium capitalize">
              {cat?.category || "Unknown"}
            </span>
            {cat?.seats && (
              <span className="text-xs text-muted-foreground ml-1.5">
                ({cat.seats} Seater)
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "permitCharge",
      header: "Permit Charge (₹)",
      cell: ({ row }) => (
        <div className="font-bold text-base">
          ₹{Number(row.getValue("permitCharge")).toLocaleString("en-IN")}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.getValue("remarks") || "—"}
        </span>
      ),
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
                Edit Permit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete Permit
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the permit charge for{" "}
                      <strong>
                        {formatStateName(item.state)} -{" "}
                        {item.vehicleCategory?.category}
                      </strong>
                      . This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
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

  if (permitsLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="State Permit Master"
          description="Manage automated inter-state border permit charges by entering state and vehicle category."
        />

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" /> Add State Permit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add State Permit Charge</DialogTitle>
              <DialogDescription>
                Define commercial entry permit fee for taxis crossing into this state.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="state">Entering State</Label>
                <Select
                  value={selectedState}
                  onValueChange={setSelectedState}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatStateName(s)} ({s})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleCategory">Vehicle Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="vehicleCategory">
                    <SelectValue placeholder="Select Vehicle Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        <span className="capitalize">{c.category}</span>
                        {c.seats && (
                          <span className="text-muted-foreground ml-1.5 text-xs">
                            ({c.seats} Seater)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="permitCharge">Permit Charge (₹)</Label>
                <Input
                  id="permitCharge"
                  name="permitCharge"
                  type="number"
                  placeholder="e.g. 500"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="e.g. 7-day tourist permit"
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Permit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* State Filter Bar */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Filter by State:</Label>
        <Select value={filterState} onValueChange={setFilterState}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {INDIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatStateName(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          Showing {filteredPermits.length} of {permits.length} permit records
        </span>
      </div>

      {/* Data Table */}
      <AutopaginateTable
        columns={columns}
        data={filteredPermits}
        searchKey="state"
        searchPlaceholder="Search by state slug..."
      />

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit State Permit</DialogTitle>
            <DialogDescription>
              Update permit fee for{" "}
              <strong>
                {formatStateName(editItem?.state)} -{" "}
                {editItem?.vehicleCategory?.category}
              </strong>
            </DialogDescription>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <p className="font-semibold">{formatStateName(editItem.state)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Vehicle Category
                  </Label>
                  <p className="font-semibold capitalize">
                    {editItem.vehicleCategory?.category}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-permitCharge">Permit Charge (₹)</Label>
                <Input
                  id="edit-permitCharge"
                  name="permitCharge"
                  type="number"
                  defaultValue={editItem.permitCharge}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Input
                  id="edit-remarks"
                  name="remarks"
                  defaultValue={editItem.remarks}
                  placeholder="e.g. Tourist permit"
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Update Permit</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermitMaster;
