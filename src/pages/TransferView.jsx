import Back from "@/components/ui/back";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAddNewCategoryToTransferMutation,
  useGetAllTransfersQuery,
  useGetCarCategoriesQuery,
  useGetCitiesQuery,
  useToggleCategoryStatusFromTransferMutation,
  useUpdateCategoryFromTransferMutation,
} from "@/store/services/adminApi";
import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

export default function TransferView() {
  const { id } = useParams();

  const [newCategory, setNewCategory] = useState("");
  const [fareDetails, setFareDetails] = useState({
    baseFare: "",
    baseKm: "",
    extraKmCharge: "",
    hillCharge: "",
    taxSlab: "",
  });

  const { data: transfer } = useGetAllTransfersQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.find((i) => i._id === id),
    }),
  });

  const { data: categories } = useGetCarCategoriesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.categories
        .map((i) => ({
          _id: i._id,
          category: i.category,
        }))
        .filter(
          (i) => !transfer?.category?.some((cat) => cat.type._id === i._id),
        ),
    }),
  });

  const [addNewCategoryToTransfer, { isLoading: addNewCategoryLoading }] =
    useAddNewCategoryToTransferMutation();

  const [updateCategoryFromTransfer, { isLoading: updateCategoryLoading }] =
    useUpdateCategoryFromTransferMutation();

  const [
    toggleCategoryStatusFromTransfer,
    { isLoading: toggleCategoryLoading },
  ] = useToggleCategoryStatusFromTransferMutation();

  const handleAddCategory = () => {
    if (!newCategory) return toast.error("Please select a category");

    const categoryData = {
      type: newCategory,
      ...fareDetails,
    };

    addNewCategoryToTransfer({ transferId: id, category: categoryData })
      .unwrap()
      .then((data) => {
        toast.success(data?.data?.message || "Category added successfully");
        // Reset form
        setNewCategory("");
        setFareDetails({
          baseFare: "",
          baseKm: "",
          extraKmCharge: "",
          hillCharge: "",
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

    updateCategoryFromTransfer({
      transferId: id,
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
    toggleCategoryStatusFromTransfer({ transferId: id, categoryId })
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "Category status updated");
      })
      .catch((err) => {
        toast.error(err?.data?.message || "Something went wrong");
      });
  };

  return (
    <div className="space-y-8">
      <Back />

      <Separator />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold capitalize">{transfer?.name}</h1>
        <p className="text-muted-foreground capitalize">
          {transfer?.city.split("-").join(" ")}
          {", "}
          {transfer?.state.split("-").join(" ")}
        </p>
      </div>

      <Separator />

      {/* Existing Categories */}
      <div className="w-full overflow-x-auto rounded-md border">
        <Table className="min-w-max">
          <TableHeader className="bg-orange-500/10">
            <TableRow>
              <TableHead className="w-[60px]">Image</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Fare</TableHead>
              <TableHead>Base Km</TableHead>
              <TableHead>Extra Km Charge</TableHead>
              <TableHead>Hill Charge</TableHead>
              <TableHead>Tax Slab</TableHead>
              <TableHead className="text-right">Actions</TableHead>
              <TableHead className="text-center">Visibility</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="w-full">
            {transfer?.category.length > 0 ? (
              transfer.category.map((cat) => (
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
                  <TableCell>{cat.baseKm}</TableCell>
                  <TableCell>{cat.extraKmCharge}</TableCell>
                  <TableCell>{cat.hillCharge}</TableCell>
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
