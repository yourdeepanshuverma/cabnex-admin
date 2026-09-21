import AutopaginateTable from "@/components/auto-paginate-table";
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
import {
  useAddNewCityMutation,
  useGetCitiesQuery,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, MapPin } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const City = () => {
  const { data, isLoading: loading } = useGetCitiesQuery();

  const columns = [
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.getValue("city")?.split("-").join(" ")}
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("state")?.split("-").join(" ") || "-"}
        </div>
      ),
    },
    {
      accessorKey: "localKmPerDay",
      header: "Local KM / Day",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.localKmPerDay !== undefined
            ? `${row.original.localKmPerDay} KM`
            : "100 KM"}
        </div>
      ),
    },
    {
      accessorKey: "category.type",
      header: "Categories",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.category?.map((i) => i.type?.category).filter(Boolean).join(", ") || "None"}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
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
              <Link to={`/city/${row.original._id}`}>
                <DropdownMenuItem>View City</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="City Master"
        description="Manage operational service cities and local daily run limits (KM/Day)"
        icon={MapPin}
        badge={`${data?.data?.cities?.length || 0} Cities Active`}
        actions={<AddCityDialog />}
      />
      <AutopaginateTable columns={columns} data={data?.data?.cities || []} />
    </div>
  );
};

const AddCityDialog = () => {
  const [open, setOpen] = useState(false);
  const [addNewCity] = useAddNewCityMutation();

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const cityName = formData
      .get("city")
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const stateName = formData
      .get("state")
      ?.trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const localKmPerDay = Number(formData.get("localKmPerDay")) || 100;
    const bufferKm = Number(formData.get("bufferKm")) || 0;
    const hillCharge = Number(formData.get("hillCharge")) || 0;

    await addNewCity({
      city: cityName,
      state: stateName,
      localKmPerDay,
      bufferKm,
      hillCharge,
    })
      .unwrap()
      .then((res) => {
        toast.success(res.message || "City added successfully");
        toast.success("Add more categories from city view");
        form.reset();
        setOpen(false);
      })
      .catch((err) => {
        toast.error(err?.data?.message || err.error || "Failed to add city");
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="h-4 w-4 mr-1" /> Add City
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add City</DialogTitle>
          <DialogDescription>
            Register a new city and set its local daily KM limit.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City Name</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g. Bangalore"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="e.g. Karnataka"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="localKmPerDay">Local KM Per Day</Label>
              <Input
                id="localKmPerDay"
                name="localKmPerDay"
                type="number"
                defaultValue={100}
                placeholder="e.g. 100"
                min={0}
                required
              />
              <p className="text-xs text-muted-foreground">
                Daily local distance allowance for multicity local stays
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bufferKm">Buffer KM</Label>
                <Input
                  id="bufferKm"
                  name="bufferKm"
                  type="number"
                  placeholder="e.g. 10"
                  defaultValue={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hillCharge">Hill Charge (₹)</Label>
                <Input
                  id="hillCharge"
                  name="hillCharge"
                  type="number"
                  placeholder="e.g. 500"
                  defaultValue={0}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save City</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default City;
