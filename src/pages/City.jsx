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
  const [isSelecting, setIsSelecting] = useState(false);

  const [addNewCity] = useAddNewCityMutation();

  const handleSave = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    await addNewCity({
      city: city.name,
      place_id: city.place_id,
      state: city.state,
      bufferKm: data.bufferKm,
      hillCharge: data.hillCharge,
    })
      .unwrap()
      .then((data) => {
        toast.success(data.message);
        toast.success("Add more categories from city view");
        form.reset();
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
    setIsSelecting(false);
  };

  // Google dropdown starts appearing — disable closing temporarily
  const handleFocus = () => {
    setIsSelecting(true);
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
                <Label htmlFor="city">City</Label>

                <div
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  onTouchStartCapture={(e) => e.stopPropagation()}
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
                      onFocus={handleFocus}
                      onBlurCapture={() => setIsSelecting(false)}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bufferKm">Bffer km</Label>
                  <Input
                    id="bufferKm"
                    name="bufferKm"
                    placeholder="Enter buffer km"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hillCharge">Hill Charge</Label>
                  <Input
                    id="hillCharge"
                    name="hillCharge"
                    placeholder="Enter hill charge"
                  />
                </div>
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
