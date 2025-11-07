import { ArrowUpDownIcon, MoreHorizontalIcon, PlusIcon } from "lucide-react";
import TravelPackageDialog from "@/components/travel-package-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AutopaginateTable from "@/components/auto-paginate-table";
import {
  useAddTravelPackageMutation,
  useDeleteTravelPackageMutation,
  useGetAllTravelPackagesQuery,
  useUpdateTravelPackageMutation,
} from "@/store/services/adminApi";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import transformImage from "@/lib/transform-image";
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

const TravelPackages = () => {
  const { data } = useGetAllTravelPackagesQuery();
  const [addTravelPackage] = useAddTravelPackageMutation();
  const [updateTravelPackage] = useUpdateTravelPackageMutation();
  const [deleteTravelPackage] = useDeleteTravelPackageMutation();

  const onSave = async (formData, id) => {
    const packageData = new FormData();
    for (const key in formData) {
      packageData.append(key, formData[key]);
    }

    if (id) {
      await updateTravelPackage({ id, data: packageData })
        .then(({ data }) => toast.success(data?.message))
        .catch((error) => toast.error(error?.data?.message));
      return;
    }

    await addTravelPackage(packageData)
      .then(({ data }) => toast.success(data?.message))
      .catch((error) => toast.error(error?.data?.message));
  };

  const handleDelete = async (id) => {
    await deleteTravelPackage(id)
      .then(({ data }) => toast.success(data?.message))
      .catch((error) => toast.error(error?.data?.message));
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: () => {
        return <div>Description</div>;
      },
      cell: ({ row }) => (
        <div
          className="max-w-[250px] truncate"
          title={row.getValue("description")}
        >
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "place",
      header: () => <div>Place</div>,
      cell: ({ row }) => {
        const place = row.getValue("place");
        return <div className="font-medium">{place}</div>;
      },
    },
    {
      accessorKey: "Days & Nights",
      header: () => <div>Days & Nights</div>,
      cell: ({ row }) => {
        const days = row.original.days;
        const nights = row.original.nights;
        return (
          <div className="font-medium">
            {days} Days / {nights} Nights
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex w-full items-center justify-start gap-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDownIcon />
        </Button>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));

        // Format the price as a dollar amount
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 2,
        }).format(price);

        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "image",
      header: () => <div>Image</div>,
      cell: ({ row }) => {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <img
                src={transformImage(row.original.image.url, 100)}
                alt={row.original.name}
                className="size-10 cursor-pointer rounded-md border object-cover transition hover:scale-105"
              />
            </DialogTrigger>
            <DialogContent className="max-w-fit border-none bg-white p-0 shadow-none">
              <img
                src={row.original.image.url}
                alt={row.original.name}
                className="max-h-[80vh] rounded-lg object-contain"
              />
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <TravelPackageDialog
                title="Add Package"
                className="hover:bg-muted w-full rounded-sm px-2 py-1 text-left"
                onSave={onSave}
                data={row.original}
              >
                Edit Packages
              </TravelPackageDialog>
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
                      This action cannot be undone. This will permanently delete
                      this package and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(row.original._id)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-chart-1 mb-4 flex items-center justify-between space-y-2 rounded-md px-4 py-2">
        <h1 className="mb-0 text-left text-2xl font-bold text-balance">
          Add Package
        </h1>
        <TravelPackageDialog
          title="Add Package"
          className="cursor-pointer"
          onSave={onSave}
        >
          <PlusIcon />
        </TravelPackageDialog>
      </div>
      <AutopaginateTable data={data?.data || []} columns={columns} />
    </div>
  );
};

export default TravelPackages;
