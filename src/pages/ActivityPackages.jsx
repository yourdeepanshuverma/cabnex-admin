import AutopaginateTable from "@/components/auto-paginate-table";
import { description } from "@/components/chart-bar-horizontal";
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
import { Card } from "@/components/ui/card";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddActivityPackageMutation,
  useDeleteActivityPackageMutation,
  useGetActivityPackagesQuery,
  useGetCityNamesQuery,
  useToggleActivityPackageStatusMutation,
  useUpdateActivityPackageMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const ActivityPackages = () => {
  const { data } = useGetActivityPackagesQuery();

  const [addActivityPackage, { isLoading: addActivityLoading }] =
    useAddActivityPackageMutation();
  const [updateActivityPackage, { isLoading: updateActivityLoading }] =
    useUpdateActivityPackageMutation();
  const [deleteActivityPackage, { isLoading: deleteActivityLoading }] =
    useDeleteActivityPackageMutation();
  const [toggleActivityPackageStatus, { isLoading: toggleActivityLoading }] =
    useToggleActivityPackageStatusMutation();

  const handleDelete = async (id) => {
    await deleteActivityPackage(id)
      .unwrap()
      .then((data) => toast.success(data.message))
      .catch((err) =>
        toast.error(err.data?.message || "Failed to delete package"),
      );
  };

  const handleToggleActivityPackageStatus = (id) => {
    toggleActivityPackageStatus(id)
      .unwrap()
      .then((data) => {
        toast.success(data.message);
      })
      .catch((err) => {
        toast.error(err.data?.message || "Failed to update category");
      });
  };

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div title={row.original.title} className="font-medium capitalize">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <div>{row.getValue("duration")}</div>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <div>{row.getValue("price")}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Visibility",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() =>
            handleToggleActivityPackageStatus(row.original._id)
          }
          disabled={toggleActivityLoading}
          aria-readonly
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(row.original.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to={`/activity-packages/${row.original._id}`}>
                    View Package
                  </Link>
                </DropdownMenuItem>

                <ActivityDialog
                  title="Edit Activity Package"
                  description="Modify the fields below to update the activity package."
                  handleSave={updateActivityPackage}
                  data={row.original}
                  isLoading={updateActivityLoading}
                >
                  <button className="hover:bg-muted w-full rounded-sm px-2 py-1.5 text-left text-sm">
                    Edit Package
                  </button>
                </ActivityDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="hover:bg-muted w-full rounded-sm px-2 py-1 text-left">
                      Delete Package
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete this package and remove it from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        disabled={deleteActivityLoading}
                        onClick={() => handleDelete(row.original._id)}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-chart-1 mb-4 flex items-center justify-between space-y-2 rounded-md px-4 py-2">
        <h1 className="mb-0 text-left text-2xl font-bold text-balance">
          Activity Packages
        </h1>
        <ActivityDialog
          title="Add Activity Package"
          description="Fill the form below to add a new activity package."
          handleSave={addActivityPackage}
          isLoading={addActivityLoading}
        >
          <PlusIcon className="mr-2 inline-block h-4 w-4" />
        </ActivityDialog>
      </div>
      <AutopaginateTable data={data?.data || []} columns={columns} />
    </div>
  );
};

const ActivityDialog = ({
  className,
  title,
  description,
  handleSave,
  data,
  btnText = "Save",
  isLoading,
  children,
}) => {
  const [formData, setFormData] = useState({
    cityId: data?.cityId || "",
    title: data?.title || "",
    description: data?.description || "",
    duration: data?.duration || "",
    price: data?.price || "",
    cancellationPolicy: data?.cancellationPolicy || "Non-refundable",
    pricingOptions: data?.pricingOptions || [],
    itinerary: data?.itinerary || [],
    includes: data?.includes || [],
    excludes: data?.excludes || [],
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(data?.images || []);

  const { data: cityNames } = useGetCityNamesQuery();

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle nested fields (like startLocation)
  const handleNestedChange = (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  // 🔹 Handle images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => ({ url: URL.createObjectURL(file) }));
    setImagePreviews(previews);
  };

  // 🔹 Add/Remove dynamic fields
  const addItem = (field, newItem) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], newItem] }));
  };

  const removeItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cityId) return toast.error("Please select a city");

    const Data = new FormData();

    Data.append("cityId", formData.cityId);
    Data.append("title", formData.title);
    Data.append("description", formData.description);
    Data.append("duration", formData.duration);
    Data.append("price", formData.price);
    Data.append("cancellationPolicy", formData.cancellationPolicy);
    Data.append("pricingOptions", JSON.stringify(formData.pricingOptions));
    Data.append("itinerary", JSON.stringify(formData.itinerary));
    Data.append("includes", JSON.stringify(formData.includes));
    Data.append("excludes", JSON.stringify(formData.excludes));

    images.forEach((file) => Data.append("images", file));

    if (!data) {
      // create new package
      await handleSave(Data)
        .unwrap()
        .then(({ data }) => {
          toast.success(data?.message || "Package created successfully");
          setFormData({
            cityId: "",
            title: "",
            description: "",
            duration: "",
            price: "",
            cancellationPolicy: "Non-refundable",
            startLocation: { name: "", coordinates: { lat: "", lng: "" } },
            pricingOptions: [],
            itinerary: [],
            includes: [],
            excludes: [],
          });
          setImages([]);
          setImagePreviews([]);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.data?.message || "Failed to create package");
        });
      return;
    }

    // update existing package
    await handleSave({ id: data._id, data: Data })
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "Package updated successfully");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.data?.message || "Failed to update package");
      });
  };

  return (
    <Dialog>
      <DialogTrigger className={className} asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="my-4 flex max-h-full flex-col overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* City ID */}
            <div className="space-y-2">
              <Label>Select City</Label>
              <Select
                name="cityId"
                value={formData.cityId}
                onValueChange={(value) =>
                  setFormData({ ...formData, cityId: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cityNames?.data?.length > 0 ? (
                    cityNames?.data?.map((city) => (
                      <SelectItem key={city._id} value={city._id}>
                        {city.city}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled>Add City First</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Title & Duration */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                title={formData.title}
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (hours/days)</Label>
              <Input
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label>Base Price (per person)</Label>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Images (Upto 8 images)</Label>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {imagePreviews.map((src, i) => (
                <img
                  key={i}
                  src={src.url}
                  alt="preview"
                  className="h-24 w-24 rounded object-cover"
                />
              ))}
            </div>
          </div>

          {/* Pricing Options */}
          <div>
            <Label>Pricing Options</Label>
            {formData.pricingOptions.map((option, i) => (
              <div key={i} className="mt-2 flex items-center gap-2">
                <Input
                  placeholder="Label"
                  value={option.label}
                  onChange={(e) =>
                    handleNestedChange(
                      `pricingOptions.${i}.label`,
                      e.target.value,
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={option.price}
                  onChange={(e) =>
                    handleNestedChange(
                      `pricingOptions.${i}.price`,
                      e.target.value,
                    )
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeItem("pricingOptions", i)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => addItem("pricingOptions", { label: "", price: 0 })}
            >
              <PlusIcon className="mr-1 h-4 w-4" /> Add Pricing Option
            </Button>
          </div>

          {/* Itinerary */}
          <div>
            <Label>Itinerary</Label>
            {formData.itinerary.map((item, i) => (
              <Card key={i} className="mt-2 p-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Place Name"
                    value={item.placeName}
                    onChange={(e) =>
                      handleNestedChange(
                        `itinerary.${i}.placeName`,
                        e.target.value,
                      )
                    }
                  />
                  <Textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleNestedChange(
                        `itinerary.${i}.description`,
                        e.target.value,
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Time Spent"
                    value={item.timeSpent}
                    onChange={(e) =>
                      handleNestedChange(
                        `itinerary.${i}.timeSpent`,
                        e.target.value,
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem("itinerary", i)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                addItem("itinerary", {
                  placeName: "",
                  description: "",
                  timeSpent: 0,
                })
              }
            >
              <PlusIcon className="mr-1 h-4 w-4" /> Add Itinerary Item
            </Button>
          </div>

          {/* Includes / Excludes */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label>Includes</Label>
              {formData.includes.map((item, i) => (
                <div key={i} className="mt-1 flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleNestedChange(`includes.${i}`, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem("includes", i)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => addItem("includes", "")}
              >
                <PlusIcon className="mr-1 h-4 w-4" /> Add Include
              </Button>
            </div>

            <div>
              <Label>Excludes</Label>
              {formData.excludes.map((item, i) => (
                <div key={i} className="mt-1 flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) =>
                      handleNestedChange(`excludes.${i}`, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem("excludes", i)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => addItem("excludes", "")}
              >
                <PlusIcon className="mr-1 h-4 w-4" /> Add Exclude
              </Button>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="space-y-2">
            <Label>Cancellation Policy</Label>
            <Input
              name="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={handleChange}
            />
          </div>

          <Button disabled={isLoading} type="submit" className="w-full">
            {!isLoading ? btnText : <Spinner />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityPackages;
