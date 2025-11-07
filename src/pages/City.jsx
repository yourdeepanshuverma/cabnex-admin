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
import {
  useAddNewCityMutation,
  useGetCarCategoriesQuery,
  useGetCitiesQuery,
} from "@/store/services/adminApi";
import { Autocomplete, LoadScript } from "@react-google-maps/api";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const libraries = ["places"];

const City = () => {
  const { data, isLoading: loading } = useGetCitiesQuery();

  const columns = [
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
              <Link to={`/city/${row.original._id}`}>
                <DropdownMenuItem>View City</DropdownMenuItem>
              </Link>
              <Dialog>
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
              </Dialog>
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
          Add City
        </h4>
        <AddCityDialog />
      </div>
      <AutopaginateTable columns={columns} data={data?.data?.cities || []} />
    </div>
  );
};

const AddCityDialog = () => {
  const autocompleteRef = useRef(null);
  const [city, setCity] = useState({
    name: "",
    place_id: "",
    state: "",
  });
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [addNewCity] = useAddNewCityMutation();

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
    if (!selectedCategory) return toast("Please select a category");

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    await addNewCity({
      city: city.name,
      place_id: city.place_id,
      state: city.state,
      category: [
        {
          type: selectedCategory,
          baseFare: data.baseFare,
          perKmCharge: data.perKmCharge,
          perHourCharge: data.perHourCharge,
          marketFare: data.marketFare,
          freeKmPerDay: data.freeKmPerDay,
          freeHoursPerDay: data.freeHoursPerDay,
          extraKmCharge: data.extraKmCharge,
          extraHourCharge: data.extraHourCharge,
          driverAllowance: data.driverAllowance,
          nightCharge: data.nightCharge,
          permitCharge: data.permitCharge,
          hillCharge: data.hillCharge,
          taxSlab: data.taxSlab,
        },
      ],
    })
      .unwrap()
      .then((data) => {
        toast.success(data.message);
        toast.success("Add more categories from city view");
        form.reset();
        setSelectedCategory("");
        setCity({ name: "", place_id: "", state: "" });
        setOpen(false);
      })
      .catch((err) => {
        toast.error(err?.data?.message || err.error);
      });
  };

  const handlePlaceChanged = (e) => {
    const place = autocompleteRef.current.getPlace();

    if (!place?.address_components) return;

    // Extract the city name only
    const cityComponent =
      place.address_components.find((comp) =>
        comp.types.includes("locality"),
      ) ||
      place.address_components.find((comp) =>
        comp.types.includes("administrative_area_level_2"),
      ) ||
      place.address_components.find((comp) =>
        comp.types.includes("administrative_area_level_1"),
      );

    const cityName = cityComponent ? cityComponent.long_name : place.name;

    const stateName = place.address_components.find((comp) =>
      comp.types.includes("administrative_area_level_1"),
    ).long_name;

    setCity({
      name: cityName,
      place_id: place.place_id,
      state: stateName,
    });
  };

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <Dialog open={open} onOpenChange={setOpen}>
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
                <Label htmlFor="city">City</Label>

                <div
                  onMouseDown={(e) => e.stopPropagation()} // ✅ Prevent dialog close when clicking suggestions
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <Autocomplete
                    onLoad={(ref) => (autocompleteRef.current = ref)}
                    onPlaceChanged={handlePlaceChanged}
                    options={{
                      componentRestrictions: { country: "IN" },
                      types: ["(cities)"],
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search for a location"
                      className="w-full rounded-md border p-3"
                      id="city"
                      name="city"
                      required
                    />
                  </Autocomplete>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Enter state name"
                  disabled
                  value={city.state}
                />
              </div>
              {/* Category fields */}
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
                  "marketFare",
                  "perKmCharge",
                  "perHourCharge",
                  "freeKmPerDay",
                  "freeHoursPerDay",
                  "extraKmCharge",
                  "extraHourCharge",
                  "driverAllowance",
                  "nightCharge",
                  "permitCharge",
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
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LoadScript>
  );
};

export default City;
