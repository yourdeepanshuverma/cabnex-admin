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
  useCreateAgentGradeMutation,
  useDeleteAgentGradeMutation,
  useGetAllAgentGradesQuery,
  useUpdateAgentGradeMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, Award } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { toast } from "sonner";

const AgentGradeMaster = () => {
  const { data: gradesData, isLoading: gradesLoading } =
    useGetAllAgentGradesQuery();
  const [createAgentGrade] = useCreateAgentGradeMutation();
  const [updateAgentGrade] = useUpdateAgentGradeMutation();
  const [deleteAgentGrade] = useDeleteAgentGradeMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [gradeName, setGradeName] = useState("A");
  const [editItem, setEditItem] = useState(null);

  const grades = gradesData?.data?.grades || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const cabMarkup = Number(formData.get("cabMarkupPercent"));
    const cashback = Number(formData.get("cashbackPercent"));

    try {
      const res = await createAgentGrade({
        grade: gradeName,
        cabMarkupPercent: cabMarkup > 1 ? cabMarkup / 100 : cabMarkup,
        cashbackPercent: cashback > 1 ? cashback / 100 : cashback,
        priority: Number(formData.get("priority")) || 1,
      }).unwrap();
      toast.success(res.message || "Agent Grade created successfully");
      setAddOpen(false);
      e.target.reset();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create agent grade");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const cabMarkup = Number(formData.get("cabMarkupPercent"));
    const cashback = Number(formData.get("cashbackPercent"));

    try {
      const res = await updateAgentGrade({
        id: editItem._id,
        cabMarkupPercent: cabMarkup > 1 ? cabMarkup / 100 : cabMarkup,
        cashbackPercent: cashback > 1 ? cashback / 100 : cashback,
        priority: Number(formData.get("priority")),
        isActive: editItem.isActive,
      }).unwrap();
      toast.success(res.message || "Agent Grade updated");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update grade");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteAgentGrade(id).unwrap();
      toast.success(res.message || "Grade deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete grade");
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await updateAgentGrade({
        id: item._id,
        isActive: !item.isActive,
      }).unwrap();
      toast.success("Grade status updated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => (
        <span className="font-bold text-lg px-3 py-1 bg-muted rounded-md inline-block">
          Grade {row.getValue("grade")}
        </span>
      ),
    },
    {
      accessorKey: "cabMarkupPercent",
      header: "Cab Markup Rate",
      cell: ({ row }) => {
        const val = row.getValue("cabMarkupPercent") || 0;
        return (
          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded text-sm">
            {Math.round(val * 100)}%
          </span>
        );
      },
    },
    {
      accessorKey: "cashbackPercent",
      header: "Cashback Rate",
      cell: ({ row }) => {
        const val = row.getValue("cashbackPercent") || 0;
        return (
          <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
            {Math.round(val * 100)}%
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority Tier",
      cell: ({ row }) => <div>Tier {row.getValue("priority")}</div>,
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
                Edit Grade
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete Grade
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete Grade <b>{item.grade}</b>.
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

  if (gradesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Agent Grade Master"
        description="B2B Agent partner tiers with markup percentages and cashback incentives"
        icon={Award}
        badge={`${grades.length} Grades Configured`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-xs">
                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Agent Grade
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Agent Grade Tier</DialogTitle>
              <DialogDescription>
                Define the markup and cashback percentage for this agent tier.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Grade Tier</Label>
                <Select value={gradeName} onValueChange={setGradeName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A (Premium)</SelectItem>
                    <SelectItem value="B">Grade B (Standard)</SelectItem>
                    <SelectItem value="C">Grade C (Basic)</SelectItem>
                    <SelectItem value="D">Grade D (Entry)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cabMarkupPercent">Cab Markup (%)</Label>
                  <Input
                    id="cabMarkupPercent"
                    name="cabMarkupPercent"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 8 (for 8%)"
                    required
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashbackPercent">Cashback (%)</Label>
                  <Input
                    id="cashbackPercent"
                    name="cashbackPercent"
                    type="number"
                    step="0.5"
                    placeholder="e.g. 1 (for 1%)"
                    required
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority Order</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  placeholder="e.g. 1"
                  defaultValue={1}
                  required
                  min={1}
                />
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Create Grade</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />

      <AutopaginateTable columns={columns} data={grades} />

      {/* Edit Grade Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Grade {editItem.grade}</DialogTitle>
              <DialogDescription>
                Update markup and cashback for Grade {editItem.grade}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCabMarkup">Cab Markup (%)</Label>
                  <Input
                    id="editCabMarkup"
                    name="cabMarkupPercent"
                    type="number"
                    step="0.5"
                    defaultValue={Math.round((editItem.cabMarkupPercent || 0) * 100)}
                    required
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCashback">Cashback (%)</Label>
                  <Input
                    id="editCashback"
                    name="cashbackPercent"
                    type="number"
                    step="0.5"
                    defaultValue={Math.round((editItem.cashbackPercent || 0) * 100)}
                    required
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPriority">Priority Order</Label>
                <Input
                  id="editPriority"
                  name="priority"
                  type="number"
                  defaultValue={editItem.priority || 1}
                  required
                  min={1}
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
                <Button type="submit">Update Grade</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AgentGradeMaster;
