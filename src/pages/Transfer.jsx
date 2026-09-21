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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import {
  useAddTransferMutation,
  useGetAllTransfersQuery,
  useGetCarCategoriesQuery,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, ArrowLeftRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const TRANSFER_TYPES = [
  { value: "airport", label: "Airport Transfer" },
  { value: "train_station", label: "Railway Station Transfer" },
  { value: "bus_station", label: "Bus Station Transfer" },
  { value: "city_transfer", label: "City / Local Transfer" },
  { value: "other", label: "Other" },
];

const Transfer = () => {
  const { data, isLoading: loading } = useGetAllTransfersQuery();

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          to={`/transfers/${row.original._id}`}
          className="font-medium capitalize hover:underline"
        >
          {row.getValue("name")?.split("-").join(" ")}
        </Link>
      ),
    },
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
          {row.getValue("state")?.split("-").join(" ")}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 bg-muted rounded text-xs capitalize">
          {row.getValue("type")?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      accessorKey: "distanceKm",
      header: "Distance (KM)",
      cell: ({ row }) => (
        <div className="font-semibold">
          {row.original.distanceKm || 0} KM
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
              <Link to={`/transfers/${row.original._id}`}>
                <DropdownMenuItem>View Transfer</DropdownMenuItem>
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
        title="Transfer Master"
        description="Airport, Railway & point-to-point transfer route pricing with garage return KM"
        icon={ArrowLeftRight}
        badge={`${data?.data?.transfers?.length || 0} Transfers Configured`}
        actions={<AddTransferDialog />}
      />
      <AutopaginateTable columns={columns} data={data?.data?.transfers || []} />
    </div>
  );
};

const AddTransferDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [transferType, setTransferType] = useState("airport");

  const [addNewTransfer] = useAddTransferMutation();

  const { data: categories } = useGetCarCategoriesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.categories.map((i) => ({
        _id: i._id,
        category: i.category,
      })),
    }),
  });

  const handleSave = async (e) => {
    e.preventDefault();
    const f = e.target;
    const formData = new FormData(f);
    const data = Object.fromEntries(formData.entries());

    const name = data.name?.trim().toLowerCase().replace(/\s+/g, "-");
    const cityName = data.city?.trim().toLowerCase().replace(/\s+/g, "-");
    const stateName = data.state?.trim().toLowerCase().replace(/\s+/g, "-");

    await addNewTransfer({
      name,
      type: transferType,
      city: cityName,
      state: stateName,
      distanceKm: Number(data.distanceKm) || 0,
      garageReturnKm: Number(data.garageReturnKm) || 0,
      category: [
        {
          type: selectedCategory,
          baseFare: Number(data.baseFare) || 0,
          baseKm: Number(data.baseKm) || 20,
          extraKmCharge: Number(data.extraKmCharge) || 15,
          hillCharge: Number(data.hillCharge) || 0,
          taxSlab: Number(data.taxSlab) || 5,
        },
      ],
    })
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Transfer added successfully");
        f.reset();
        setSelectedCategory("");
        setOpen(false);
      })
      .catch((err) => {
        toast.error(err?.data?.message || err.error || "Failed to add transfer");
      });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon className="h-4 w-4 mr-1" /> Add Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Transfer Route</DialogTitle>
          <DialogDescription>
            Register fixed transfer route with static distance and pricing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="transferName">Transfer Name</Label>
              <Input
                id="transferName"
                name="name"
                placeholder="e.g. Airport Transfer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transferCity">City</Label>
                <Input
                  id="transferCity"
                  name="city"
                  placeholder="e.g. Bangalore"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transferState">State</Label>
                <Input
                  id="transferState"
                  name="state"
                  placeholder="e.g. Karnataka"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Transfer Type</Label>
                <Select value={transferType} onValueChange={setTransferType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSFER_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="distanceKm">Static Distance (KM)</Label>
                <Input
                  id="distanceKm"
                  name="distanceKm"
                  type="number"
                  placeholder="e.g. 40"
                  required
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Initial Car Category</Label>
              <Select
                required
                value={selectedCategory}
                onValueChange={(val) => setSelectedCategory(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((i) => (
                    <SelectItem key={i._id} value={i._id} className="capitalize">
                      {i.category?.replace(/-/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="baseFare">Base Fare (₹)</Label>
                <Input
                  id="baseFare"
                  name="baseFare"
                  type="number"
                  placeholder="1500"
                  required
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="baseKm">Base KM</Label>
                <Input
                  id="baseKm"
                  name="baseKm"
                  type="number"
                  placeholder="20"
                  defaultValue={20}
                  required
                  min={0}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="extraKmCharge">Extra/KM (₹)</Label>
                <Input
                  id="extraKmCharge"
                  name="extraKmCharge"
                  type="number"
                  placeholder="15"
                  defaultValue={15}
                  required
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="hillCharge">Hill Charge (₹)</Label>
                <Input
                  id="hillCharge"
                  name="hillCharge"
                  type="number"
                  placeholder="0"
                  defaultValue={0}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="taxSlab">Tax Slab (%)</Label>
                <Input
                  id="taxSlab"
                  name="taxSlab"
                  type="number"
                  placeholder="5"
                  defaultValue={5}
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
            <Button type="submit">Save Transfer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Transfer;
