import AutopaginateTable from "@/components/auto-paginate-table";
import CarCategoryDialog from "@/components/car-category-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import transformImage from "@/lib/transform-image";
import {
  useAddCarCategoryMutation,
  useGetCarCategoriesQuery,
  useUpdateCarCategoryMutation,
} from "@/store/services/adminApi";
import { Loader2Icon, MoreHorizontalIcon, PlusIcon, Layers } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Link } from "react-router";
import { toast } from "sonner";

const CarCategories = () => {
  const { data, isLoading } = useGetCarCategoriesQuery();
  const [addCarCategory] = useAddCarCategoryMutation();
  const [updateCarCategory] = useUpdateCarCategoryMutation();

  const handleSave = async (data, update) => {
    const formData = new FormData();

    formData.append("category", data.category);
    formData.append("seats", data.seats);
    data.carNames.forEach((car) => formData.append("carNames[]", car));

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }
    if (data.icon instanceof File) {
      formData.append("icon", data.icon);
    }

    if (update) {
      await updateCarCategory({ data: formData, id: data.id })
        .unwrap()
        .then(({ message }) => {
          toast.message(message);
        })
        .catch((error) => {
          toast.error(error.data.message);
        });
      return;
    }

    await addCarCategory(formData)
      .unwrap()
      .then(({ message }) => {
        toast.message(message);
      })
      .catch((error) => {
        toast.error(error.data.message);
      });
  };

  const columns = [
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("category")}</div>
      ),
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <img
              src={transformImage(row.original.icon?.url) || null}
              alt={row.original.category}
              className="size-10 cursor-pointer rounded-md border object-cover transition hover:scale-105"
            />
          </DialogTrigger>
          <DialogContent className="max-w-fit border-none bg-white p-0 shadow-none">
            <img
              src={row.original.icon?.url}
              alt={row.original.category}
              className="max-h-[80vh] rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <Dialog>
          <DialogTrigger asChild>
            <img
              src={transformImage(row.original.image?.url) || null}
              alt={row.original.category}
              className="size-10 cursor-pointer rounded-md border object-cover transition hover:scale-105"
            />
          </DialogTrigger>
          <DialogContent className="max-w-fit border-none bg-white p-0 shadow-none">
            <img
              src={row.original.image?.url}
              alt={row.original.category}
              className="max-h-[80vh] rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      ),
    },
    {
      accessorKey: "carNames",
      header: "Car Names",
      cell: ({ row }) => (
        <div className="flex max-w-sm flex-wrap gap-2">
          {row.original.carNames.slice(0, 2).map((car) => (
            <span
              key={car}
              className="bg-muted overflow-x-hidden rounded-md px-2 py-1 text-sm"
            >
              {car}
            </span>
          ))}
          {row.original.carNames.length > 2 && (
            <span className="bg-muted overflow-x-hidden rounded-md px-2 py-1 text-sm">
              More... ({row.original.carNames.length - 2})
            </span>
          )}
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
              <CarCategoryDialog
                title="Add Package"
                className="hover:bg-muted w-full rounded-sm px-2 py-1.5 text-left text-sm"
                onSave={(data) => handleSave(data, true)}
                data={row.original}
              >
                Edit Category
              </CarCategoryDialog>
              <Link to={`/car-categories/${row.original._id}`}>
                <DropdownMenuItem>View Category</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return !isLoading ? (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Car Categories"
        description="Vehicle classes, seating capacities, and luggage limits"
        icon={Layers}
        badge={`${data?.data?.categories?.length || 0} Categories`}
        actions={
          <CarCategoryDialog
            title="Add Car Category"
            className="cursor-pointer"
            onSave={handleSave}
          >
            <Button className="shadow-xs">
              <PlusIcon className="h-4 w-4 mr-1.5" /> Add Category
            </Button>
          </CarCategoryDialog>
        }
      />
      <AutopaginateTable
        columns={columns}
        data={data?.data?.categories || []}
      />
    </div>
  ) : (
    <Loader2Icon className="m-auto h-[80vh] animate-spin" />
  );
};

export default CarCategories;
