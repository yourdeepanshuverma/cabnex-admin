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
import {
  useCreateRouteMutation,
  useDeleteRouteMutation,
  useGetAllRoutesQuery,
  useGetCitiesQuery,
  useUpdateRouteMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, RouteIcon } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { toast } from "sonner";

const RouteMaster = () => {
  const { data: routesData, isLoading: routesLoading } = useGetAllRoutesQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const [createRoute] = useCreateRouteMutation();
  const [updateRoute] = useUpdateRouteMutation();
  const [deleteRoute] = useDeleteRouteMutation();

  const [addOpen, setAddOpen] = useState(false);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [editItem, setEditItem] = useState(null);

  const cities = citiesData?.data?.cities || [];
  const routes = routesData?.data?.routes || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const distanceKm = Number(formData.get("distanceKm"));

    if (!fromCity || !toCity) {
      toast.error("Please select both from and to cities");
      return;
    }
    if (fromCity === toCity) {
      toast.error("From and To cities cannot be the same");
      return;
    }

    try {
      const res = await createRoute({
        fromCity,
        toCity,
        distanceKm,
      }).unwrap();
      toast.success(res.message || "Route created successfully");
      setAddOpen(false);
      setFromCity("");
      setToCity("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create route");
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const distanceKm = Number(formData.get("distanceKm"));

    try {
      const res = await updateRoute({
        id: editItem._id,
        distanceKm,
      }).unwrap();
      toast.success(res.message || "Route updated successfully");
      setEditItem(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update route");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteRoute(id).unwrap();
      toast.success(res.message || "Route deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete route");
    }
  };

  const columns = [
    {
      accessorKey: "fromCity.city",
      header: "From City",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.original.fromCity?.city?.replace(/-/g, " ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "fromCity.state",
      header: "From State",
      cell: ({ row }) => (
        <div className="capitalize text-muted-foreground text-sm">
          {row.original.fromCity?.state?.replace(/-/g, " ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "toCity.city",
      header: "To City",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.original.toCity?.city?.replace(/-/g, " ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "toCity.state",
      header: "To State",
      cell: ({ row }) => (
        <div className="capitalize text-muted-foreground text-sm">
          {row.original.toCity?.state?.replace(/-/g, " ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "distanceKm",
      header: "Distance (KM)",
      cell: ({ row }) => (
        <div className="font-semibold">{row.getValue("distanceKm")} KM</div>
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
                Edit Distance
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete Route
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will delete the route between{" "}
                      <b>{item.fromCity?.city}</b> and{" "}
                      <b>{item.toCity?.city}</b> ({item.distanceKm} KM).
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

  if (routesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Route Master (KM Master)"
        description="Intercity distance database for quotation & pricing"
        icon={RouteIcon}
        badge={`${routes.length} Routes Configured`}
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-xs">
                <PlusIcon className="h-4 w-4 mr-1.5" /> Add Route
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
              <DialogDescription>
                Define the static road distance between two cities.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>From City</Label>
                <Select value={fromCity} onValueChange={setFromCity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id} className="capitalize">
                        {c.city?.replace(/-/g, " ")} ({c.state?.replace(/-/g, " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To City</Label>
                <Select value={toCity} onValueChange={setToCity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id} className="capitalize">
                        {c.city?.replace(/-/g, " ")} ({c.state?.replace(/-/g, " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distanceKm">Distance (KM)</Label>
                <Input
                  id="distanceKm"
                  name="distanceKm"
                  type="number"
                  placeholder="e.g. 150"
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
                <Button type="submit">Create Route</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    />

      <AutopaginateTable columns={columns} data={routes} />

      {/* Edit Distance Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Route Distance</DialogTitle>
              <DialogDescription className="capitalize">
                {editItem.fromCity?.city?.replace(/-/g, " ")} ↔{" "}
                {editItem.toCity?.city?.replace(/-/g, " ")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editDistanceKm">Distance (KM)</Label>
                <Input
                  id="editDistanceKm"
                  name="distanceKm"
                  type="number"
                  defaultValue={editItem.distanceKm}
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
                <Button type="submit">Update Distance</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RouteMaster;
