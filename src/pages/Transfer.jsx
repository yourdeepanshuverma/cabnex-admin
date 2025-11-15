import AutopaginateTable from "@/components/auto-paginate-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Table, TableHead, TableHeader } from "@/components/ui/table";
import {
  useAddTransferMutation,
  useGetAllTransfersQuery,
  useGetCarCategoriesQuery,
} from "@/store/services/adminApi";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const libraries = ["places"];

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
          {row.getValue("name").split("-").join(" ")}
        </Link>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.getValue("city").split("-").join(" ")}
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "State",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue("state").split("-").join(" ")}
        </div>
      ),
    },
    {
      accessorKey: "category.type",
      header: "Categories",
      cell: ({ row }) => (
        <div className="capitalize">
          {row.original.category.map((i) => i.type.category).join(", ")}
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
                <DropdownMenuItem>View Details</DropdownMenuItem>
              </Link>
              {/* <Dialog>
                <DialogTrigger asChild>
                  <button className="m-0 px-1 py-2 text-sm">
                    Duplicate City
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Duplicate City</DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog> */}
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
      <div className="bg-chart-1 mb-4 flex items-center justify-between space-y-2 rounded-md px-4 py-2">
        <h4 className="mb-0 scroll-m-20 text-left text-2xl font-bold text-balance">
          Add Transfers
        </h4>
        <AddTransferDialog />
      </div>
      <AutopaginateTable columns={columns} data={data?.data || []} />
    </div>
  );
};

const AddTransferDialog = () => {
  const autocompleteRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    place_id: "",
    type: "",
    city: "",
    state: "",
  });
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);

  const [addNewTransfer, { isLoading }] = useAddTransferMutation();

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

    await addNewTransfer({
      ...form,
      category: [
        {
          type: selectedCategory,
          baseFare: Number(data.baseFare),
          baseKm: Number(data.baseKm),
          extrakmCharge: Number(data.extrakmCharge),
          hillCharge: Number(data.hillCharge),
          taxSlab: Number(data.taxSlab),
        },
      ],
    })
      .unwrap()
      .then((data) => {
        toast.success(data.message);
        f.reset();
        setForm({ name: "", place_id: "", state: "", city: "", type: "" });
        setOpen(false);
      })
      .catch((err) => {
        toast.error(err?.data?.message || err.error);
      });
  };

  // Google dropdown starts appearing — disable closing temporarily
  const handleFocus = () => {
    setIsSelecting(true);
  };

  const handlePlaceChanged = (e) => {
    const place = autocompleteRef.current.getPlace();

    if (!place?.address_components) return;

    const isAirport =
      place.types?.includes("airport") || /airport/i.test(place.name);

    const type = isAirport
      ? "airport"
      : place.types?.includes("train_station")
        ? "train_station"
        : place.types?.includes("bus_station")
          ? "bus_station"
          : place.types?.includes("subway_station")
            ? "subway_station"
            : place.types?.includes("transit_station")
              ? "transit_station"
              : "other";

    const cityName =
      place.address_components.find((comp) => comp.types.includes("locality"))
        ?.long_name ||
      place.address_components.find((comp) =>
        comp.types.includes("administrative_area_level_2"),
      )?.long_name ||
      place.address_components.find((comp) =>
        comp.types.includes("administrative_area_level_1"),
      )?.long_name;

    const stateName = place.address_components.find((comp) =>
      comp.types.includes("administrative_area_level_1"),
    )?.long_name;

    setForm({
      name: place.name,
      place_id: place.place_id,
      type: type,
      city: cityName,
      state: stateName,
    });
    setIsSelecting(false);
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!isSelecting) setOpen(v);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent showCloseButton={false} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add City</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Place</Label>

                <div
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  onTouchStartCapture={(e) => e.stopPropagation()}
                >
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={handlePlaceChanged}
                    options={{
                      componentRestrictions: { country: "IN" },
                      types: ["transit_station"],
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search for a location"
                      className="w-full rounded-md border p-3"
                      onFocus={handleFocus}
                      onBlurCapture={() => setIsSelecting(false)}
                      required
                    />
                  </Autocomplete>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 space-y-2">
                <div>
                  <Label>City</Label>
                  <Input disabled value={form.city} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input disabled value={form.state} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select Category</Label>
                <Select
                  required
                  name="categoryId"
                  value={selectedCategory}
                  onValueChange={(val) => setSelectedCategory(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((i) => (
                      <SelectItem key={i._id} value={i._id}>
                        {i.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  "baseFare",
                  "baseKm",
                  "extraKmCharge",
                  "hillCharge",
                  "taxSlab",
                ].map((key) => (
                  <div key={key} className="grid gap-2">
                    <Label htmlFor={key} className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <Input
                      id={key}
                      name={key}
                      type="number"
                      placeholder={0}
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LoadScript>
  );
};

export default Transfer;
