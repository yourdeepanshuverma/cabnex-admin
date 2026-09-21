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
  useCreateChargeMutation,
  useDeleteChargeMutation,
  useGetAllChargesQuery,
  useUpdateChargeMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, ReceiptText } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { toast } from "sonner";

const CHARGE_TYPES = [
  { value: "toll", label: "Toll" },
  { value: "parking", label: "Parking" },
  { value: "permit", label: "State Permit" },
  { value: "night-halt", label: "Night Halt" },
  { value: "other-charges", label: "Other Charges" },
];

const ChargeMaster = () => {
  const { data: chargesData, isLoading: chargesLoading } = useGetAllChargesQuery();
  const [createCharge] = useCreateChargeMutation();
  const [updateCharge] = useUpdateChargeMutation();
  const [deleteCharge] = useDeleteChargeMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [chargeType, setChargeType] = useState("toll");
  const [isPerDay, setIsPerDay] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const charges = chargesData?.data?.charges || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await createCharge({
        name: formData.get("name"),
        type: chargeType,
        defaultAmount: Number(formData.get("defaultAmount")),
        state: formData.get("state") || null,
        isPerDay,
      }).unwrap();
      toast.success(res.message || "Charge created successfully");
      setAddOpen(false);
      e.target.reset();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create charge");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await updateCharge({
        id: editItem._id,
        name: formData.get("name"),
        defaultAmount: Number(formData.get("defaultAmount")),
        state: formData.get("state") || null,
        isPerDay: editItem.isPerDay,
        isActive: editItem.isActive,
      }).unwrap();
      toast.success(res.message || "Charge updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update charge");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteCharge(id).unwrap();
      toast.success(res.message || "Charge deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete charge");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateCharge({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success("Charge status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Charge Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-muted rounded text-xs uppercase font-mono">
          {row.getValue("type")}
        </span>
      ),
    },
    {
      accessorKey: "defaultAmount",
      header: "Default Amount (₹)",
      cell: ({ row }) => (
        <div className="font-semibold">₹{row.getValue("defaultAmount")}</div>
      ),
    },
    {
      accessorKey: "state",
      header: "State Specific",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("state") || "All States"}</div>
      ),
    },
    {
      accessorKey: "isPerDay",
      header: "Per Day?",
      cell: ({ row }) => (
        <div>{row.getValue("isPerDay") ? "Yes" : "Flat / Per Trip"}</div>
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
                Edit Charge
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete Charge
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete charge <b>{item.name}</b>.
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

  if (chargesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Charge Master"
        description="Standard travel allowances & mandatory fees (toll, state permits, parking, night halt)"
        icon={ReceiptText}
        badge={`${charges.length} Charges Defined`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-xs">
                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Charge
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Charge</DialogTitle>
              <DialogDescription>
                Define a standard fee item applied during trip price calculation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Charge Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Standard Toll Charge"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Charge Type</Label>
                <Select value={chargeType} onValueChange={setChargeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHARGE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultAmount">Default Amount (₹)</Label>
                  <Input
                    id="defaultAmount"
                    name="defaultAmount"
                    type="number"
                    placeholder="e.g. 500"
                    required
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State (Optional)</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="e.g. karnataka"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isPerDay"
                  checked={isPerDay}
                  onCheckedChange={setIsPerDay}
                />
                <Label htmlFor="isPerDay" className="cursor-pointer">
                  Charge applies per day (multiplied by service days)
                </Label>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Charge</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />

      <AutopaginateTable columns={columns} data={charges} />

      {/* Edit Charge Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Charge</DialogTitle>
              <DialogDescription>{editItem.name}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editName">Charge Name</Label>
                <Input
                  id="editName"
                  name="name"
                  defaultValue={editItem.name}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAmount">Default Amount (₹)</Label>
                  <Input
                    id="editAmount"
                    name="defaultAmount"
                    type="number"
                    defaultValue={editItem.defaultAmount}
                    required
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editState">State (Optional)</Label>
                  <Input
                    id="editState"
                    name="state"
                    defaultValue={editItem.state || ""}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="editIsPerDay"
                  checked={editItem.isPerDay}
                  onCheckedChange={(checked) =>
                    setEditItem((prev) => ({ ...prev, isPerDay: checked }))
                  }
                />
                <Label htmlFor="editIsPerDay" className="cursor-pointer">
                  Charge applies per day
                </Label>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Charge</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ChargeMaster;
