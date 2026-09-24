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
  useGetCitiesQuery,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, ArrowLeftRight, Info } from "lucide-react";
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

  const transfersList = Array.isArray(data?.data)
    ? data.data
    : data?.data?.transfers || [];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Transfer Master"
        description="Airport, Railway & point-to-point transfer route pricing with garage return KM"
        icon={ArrowLeftRight}
        badge={`${transfersList.length} Transfers Configured`}
        actions={<AddTransferDialog />}
      />
      <AutopaginateTable columns={columns} data={transfersList} />
    </div>
  );
};

const AddTransferDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");
  const [transferType, setTransferType] = useState("airport");

  // Live pricing state for preview
  const [distanceKm, setDistanceKm] = useState("50");
  const [baseFare, setBaseFare] = useState("1500");
  const [baseKm, setBaseKm] = useState("20");
  const [extraKmCharge, setExtraKmCharge] = useState("15");
  const [taxSlab, setTaxSlab] = useState("5");

  const [addNewTransfer] = useAddTransferMutation();

  const { data: citiesData } = useGetCitiesQuery();
  const cities = citiesData?.data?.cities || [];
  const selectedCity = cities.find((c) => c._id === selectedCityId);

  // Live preview calculation
  const distNum = Number(distanceKm) || 0;
  const baseFareNum = Number(baseFare) || 0;
  const baseKmNum = Number(baseKm) || 0;
  const extraRateNum = Number(extraKmCharge) || 0;
  const taxSlabNum = Number(taxSlab) || 0;

  const extraKm = Math.max(0, distNum - baseKmNum);
  const extraKmCost = extraKm * extraRateNum;
  const subtotal = baseFareNum + extraKmCost;
  const taxAmount = taxSlabNum > 0 ? (subtotal * taxSlabNum) / 100 : 0;
  const totalEstimated = Math.round(subtotal + taxAmount);

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
    if (!selectedCity) {
      toast.error("Please select a city");
      return;
    }
    if (!selectedCategory) {
      toast.error("Please choose an initial car category");
      return;
    }

    const f = e.target;
    const formData = new FormData(f);
    const data = Object.fromEntries(formData.entries());

    const name = data.name?.trim().toLowerCase().replace(/\s+/g, "-");
    const cityName = selectedCity.city;
    const stateName = selectedCity.state;

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
        setSelectedCityId("");
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
                <Label>Select City</Label>
                <Select
                  value={selectedCityId}
                  onValueChange={setSelectedCityId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        <span className="capitalize">
                          {c.city?.replace(/-/g, " ")}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={
                    selectedCity?.state
                      ? selectedCity.state.replace(/-/g, " ")
                      : ""
                  }
                  placeholder="Auto-filled from city"
                  readOnly
                  className="bg-muted capitalize cursor-not-allowed"
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="distanceKm" className="text-xs font-semibold">
                      Route Distance (KM)
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      Physical trip KM
                    </span>
                  </div>
                  <Input
                    id="distanceKm"
                    name="distanceKm"
                    type="number"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    placeholder="e.g. 50"
                    required
                    min={0}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Estimated road distance for this transfer route.
                  </p>
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
                  <Label htmlFor="baseFare" className="text-xs font-semibold">
                    Base Fare (₹)
                  </Label>
                  <Input
                    id="baseFare"
                    name="baseFare"
                    type="number"
                    value={baseFare}
                    onChange={(e) => setBaseFare(e.target.value)}
                    placeholder="1500"
                    required
                    min={0}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Fare for included KM
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="baseKm" className="text-xs font-semibold">
                    Included Base KM
                  </Label>
                  <Input
                    id="baseKm"
                    name="baseKm"
                    type="number"
                    value={baseKm}
                    onChange={(e) => setBaseKm(e.target.value)}
                    placeholder="20"
                    required
                    min={0}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Covered in Base Fare
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="extraKmCharge" className="text-xs font-semibold">
                    Extra/KM (₹)
                  </Label>
                  <Input
                    id="extraKmCharge"
                    name="extraKmCharge"
                    type="number"
                    value={extraKmCharge}
                    onChange={(e) => setExtraKmCharge(e.target.value)}
                    placeholder="15"
                    required
                    min={0}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Per extra KM charge
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="hillCharge" className="text-xs font-semibold">
                    Hill Charge (₹)
                  </Label>
                  <Input
                    id="hillCharge"
                    name="hillCharge"
                    type="number"
                    placeholder="0"
                    defaultValue={0}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taxSlab" className="text-xs font-semibold">
                    Tax Slab (%)
                  </Label>
                  <Input
                    id="taxSlab"
                    name="taxSlab"
                    type="number"
                    value={taxSlab}
                    onChange={(e) => setTaxSlab(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Live Interactive Calculation Preview */}
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3.5 text-xs text-slate-800 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between font-semibold text-orange-950">
                  <span className="flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-orange-600 shrink-0" />
                    How Pricing Works (Live Preview):
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    ₹{totalEstimated.toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-600 leading-relaxed text-[11px]">
                  {extraKm > 0 ? (
                    <>
                      • <strong>{baseKmNum} KM</strong> included in Base Fare (<strong>₹{baseFareNum}</strong>)
                      <br />
                      • <strong>{extraKm} Extra KM</strong> ({distNum} KM route − {baseKmNum} Base KM) × ₹{extraRateNum}/km = <strong>₹{extraKmCost}</strong>
                      <br />
                      • Base Subtotal: <strong>₹{subtotal}</strong> {taxSlabNum > 0 ? `+ ${taxSlabNum}% tax (₹${Math.round(taxAmount)})` : ""}
                    </>
                  ) : (
                    <>
                      • Total route distance (<strong>{distNum} KM</strong>) is within the included <strong>{baseKmNum} Base KM</strong>.
                      <br />
                      • Customer pays flat Base Fare: <strong>₹{baseFareNum}</strong> {taxSlabNum > 0 ? `+ ${taxSlabNum}% tax` : ""} (no extra KM charge).
                    </>
                  )}
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
