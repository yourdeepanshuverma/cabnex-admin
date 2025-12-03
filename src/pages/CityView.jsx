import { useState, useEffect, use } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useAddNewCategoryToCityMutation,
  useGetCarCategoriesQuery,
  useGetCitiesQuery,
  useToggleCategoryStatusFromCityMutation,
  useUpdateCategoryFromCityMutation,
  useUpdateCityChargesMutation,
} from "@/store/services/adminApi";
import { useParams } from "react-router";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import Back from "@/components/ui/back";
import { Switch } from "@/components/ui/switch";

export default function CityView() {
  const { id } = useParams();

  const [cityCharges, setCityCharges] = useState({
    bufferKm: 0,
    hillCharge: 0,
  });

  const [newCategory, setNewCategory] = useState("");
  const [fareDetails, setFareDetails] = useState({
    baseFare: "",
    marketFare: "",
    perKmCharge: "",
    perHourCharge: "",
    freeKmPerDay: "",
    freeHoursPerDay: "",
    extraKmCharge: "",
    extraHourCharge: "",
    driverAllowance: "",
    nightCharge: "",
    permitCharge: "",
    hillCharge: "",
    taxSlab: "",
  });

  const { data: city } = useGetCitiesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.cities?.find((i) => i._id === id),
    }),
  });
  const { data: categories } = useGetCarCategoriesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.categories
        .map((i) => ({
          _id: i._id,
          category: i.category,
        }))
        .filter((i) => !city?.category?.some((cat) => cat.type._id === i._id)),
    }),
  });

  const [updateCityCharges, { isLoading: updateCityChargesLoading }] =
    useUpdateCityChargesMutation();

  const [addNewCategoryToCity, { isLoading: addNewCategoryLoading }] =
    useAddNewCategoryToCityMutation();

  const [updateCategoryFromCity, { isLoading: updateCategoryLoading }] =
    useUpdateCategoryFromCityMutation();

  const [toggleCategoryStatusFromCity, { isLoading: toggleCategoryLoading }] =
    useToggleCategoryStatusFromCityMutation();

  const handleAddCategory = () => {
    if (!newCategory) return toast.error("Please select a category");

    const categoryData = {
      type: newCategory,
      ...fareDetails,
    };

    addNewCategoryToCity({ cityId: city._id, category: categoryData })
      .unwrap()
      .then(() => {
        // Reset form
        setNewCategory("");
        setFareDetails({
          baseFare: "",
          marketFare: "",
          perKmCharge: "",
          perHourCharge: "",
          freeKmPerDay: "",
          freeHoursPerDay: "",
          extraKmCharge: "",
          extraHourCharge: "",
          driverAllowance: "",
          nightCharge: "",
          permitCharge: "",
          taxSlab: "",
        });
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Something went wrong");
      });
  };

  const handleEditCategoryFromCity = (e, categoryId) => {
    e.preventDefault();

    // Grab all form data
    const formData = new FormData(e.target);

    // Convert it to a plain object
    const data = Object.fromEntries(formData.entries());

    // Convert numeric strings to numbers
    Object.keys(data).forEach((key) => {
      data[key] = Number(data[key]);
    });

    updateCategoryFromCity({
      cityId: city._id,
      categoryId,
      category: data,
    })
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "Category updated successfully");
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Something went wrong");
      });
  };

  const handleToggleCategoryVisibility = (categoryId) => () => {
    toggleCategoryStatusFromCity({ cityId: city._id, categoryId })
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "Category status updated");
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Something went wrong");
      });
  };

  const handleUpdateCityCharges = () => {
    updateCityCharges({
      cityId: city?._id,
      data: cityCharges,
    })
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "City charges updated");
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Something went wrong");
      });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Back />

      <Separator />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold capitalize">{city?.city}</h1>
        <p className="text-muted-foreground capitalize">
          {city?.state.split("-").join(" ")}
        </p>
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-1">
          <Label className="font-semibold">Buffer Km</Label>
          <Input
            type="number"
            label="Buffer Km"
            defaultValue={city?.bufferKm}
            onChange={(e) =>
              setCityCharges({ ...cityCharges, bufferKm: e.target.value })
            }
            className="max-w-sm"
            placeholder="in kilometers"
            disabled={updateCityChargesLoading}
          />
        </div>
        <div className="space-y-1">
          <Label className="font-semibold">Hill Charge</Label>
          <Input
            type="number"
            label="Hill Charge"
            defaultValue={city?.hillCharge}
            onChange={(e) =>
              setCityCharges({ ...cityCharges, hillCharge: e.target.value })
            }
            className="max-w-sm"
            placeholder="in Rupees"
            disabled={updateCityChargesLoading}
          />
        </div>
        <Button
          onClick={handleUpdateCityCharges}
          disabled={updateCityChargesLoading}
        >
          {" "}
          Update
        </Button>
      </div>

      <Separator />

      {/* Existing Categories */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-orange-500/10">
            <TableRow>
              <TableHead className="w-[60px]">Image</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Fare</TableHead>
              <TableHead>Market Fare</TableHead>
              <TableHead>Per(km) Charge</TableHead>
              <TableHead>Per(hrs) Charge</TableHead>
              <TableHead>Free(km)/day</TableHead>
              <TableHead>Free(hrs)/day</TableHead>
              <TableHead>Extra Km</TableHead>
              <TableHead>Extra Hour</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Night Charge</TableHead>
              <TableHead>Permit Charge</TableHead>
              <TableHead>Tax Slab</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="text-center">Visibility</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="">
            {city?.category.length > 0 ? (
              city.category.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <img
                          src={cat.type.image?.url}
                          alt={cat.type.category}
                          className="size-10 cursor-pointer rounded-md border object-cover transition hover:scale-105"
                        />
                      </DialogTrigger>
                      <DialogContent className="max-w-fit border-none bg-white p-0 shadow-none">
                        <img
                          src={cat.type.image?.url}
                          alt={cat.type.category}
                          className="max-h-[80vh] rounded-lg object-contain"
                        />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="font-medium capitalize">
                    {cat.type.category}
                  </TableCell>
                  <TableCell>{cat.baseFare}</TableCell>
                  <TableCell>{cat.marketFare}</TableCell>
                  <TableCell>{cat.perKmCharge}</TableCell>
                  <TableCell>{cat.perHourCharge}</TableCell>
                  <TableCell>{cat.freeKmPerDay}</TableCell>
                  <TableCell>{cat.freeHoursPerDay}</TableCell>
                  <TableCell>{cat.extraKmCharge}</TableCell>
                  <TableCell>{cat.extraHourCharge}</TableCell>
                  <TableCell>{cat.driverAllowance}</TableCell>
                  <TableCell>{cat.nightCharge}</TableCell>
                  <TableCell>{cat.permitCharge}</TableCell>
                  <TableCell>{cat.taxSlab}%</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="capitalize">
                            Edit {cat.type.category} Category
                          </DialogTitle>
                          <DialogDescription>
                            Make changes to your category here. Click save when
                            you&apos;re done.
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={(e) =>
                            handleEditCategoryFromCity(e, cat._id)
                          }
                          className="mt-4 space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {Object.keys(fareDetails).map((key) => (
                              <div key={key}>
                                <Label htmlFor={`name-${key}`}>
                                  {key.replace(/([A-Z])/g, " $1")}
                                </Label>
                                <Input
                                  id={`name-${key}`}
                                  name={key}
                                  type="number"
                                  defaultValue={cat[key]}
                                />
                              </div>
                            ))}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              type="submit"
                              disabled={updateCategoryLoading}
                            >
                              Save changes
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={cat.isActive}
                      onCheckedChange={handleToggleCategoryVisibility(cat._id)}
                      disabled={toggleCategoryLoading}
                      aria-readonly
                      id="category-visibility"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="py-4 text-center">
                  Add categories to this transfer package.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      {/* Add new category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Category</Label>
            <Select
              value={newCategory?.category}
              onValueChange={(val) => setNewCategory(val)}
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

          {/* Fare fields */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Object.keys(fareDetails).map((key) => (
              <div key={key}>
                <Label className="capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </Label>
                <Input
                  type="number"
                  value={fareDetails[key]}
                  onChange={(e) =>
                    setFareDetails({ ...fareDetails, [key]: e.target.value })
                  }
                  placeholder="Enter value"
                />
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={handleAddCategory}
            disabled={addNewCategoryLoading}
          >
            Add Category
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
