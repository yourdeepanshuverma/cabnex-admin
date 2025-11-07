import AutopaginateTable from "@/components/auto-paginate-table";
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
  useAddRentalPackageMutation,
  useDeleteRentalPackageMutation,
  useGetRentalPackagesQuery,
  useUpdateRentalPackageMutation,
} from "@/store/services/adminApi";
import { MoreHorizontalIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

const RentalPackages = () => {
  const { data } = useGetRentalPackagesQuery();
  const [addRentalPackage] = useAddRentalPackageMutation();
  const [updateRentalPackage] = useUpdateRentalPackageMutation();
  const [deleteRentalPackage] = useDeleteRentalPackageMutation();

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await addRentalPackage(Object.fromEntries(formData))
      .unwrap()
      .then((data) => {
        toast.success(data.message);
        e.target.reset();
      })
      .catch((err) =>
        toast.error(err.data?.message || "Failed to add package"),
      );
  };
  const handleEdit = async (e, id) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    await updateRentalPackage({ id, data: Object.fromEntries(formData) })
      .unwrap()
      .then((data) => toast.success(data.message))
      .catch((err) =>
        toast.error(err.data?.message || "Failed to update package"),
      );
  };
  const handleDelete = async (id) => {
    await deleteRentalPackage(id)
      .unwrap()
      .then((data) => toast.success(data.message))
      .catch((err) =>
        toast.error(err.data?.message || "Failed to delete package"),
      );
  };

  const columns = [
    {
      accessorKey: "kilometer",
      header: "Kilometer",
      cell: ({ row }) => (
        <div className="font-medium capitalize">
          {row.getValue("kilometer")}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: () => {
        return <div>Duration(Hours)</div>;
      },
      cell: ({ row }) => <div>{row.getValue("duration")}</div>,
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
                <DropdownMenuSeparator />
                <Dialog>
                  <DialogTrigger className="hover:bg-muted w-full rounded-sm px-2 py-1 text-left">
                    Edit Package
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Package</DialogTitle>
                      <DialogDescription>
                        Make changes to your package here. Click save when
                        you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => handleEdit(e, row.original._id)}
                      className="space-y-4"
                    >
                      <div className="grid gap-4">
                        {["kilometer", "duration"].map((key) => (
                          <div className="grid gap-3" key={key}>
                            <Label htmlFor={key} className="capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </Label>
                            <Input
                              id={key}
                              name={key}
                              type="number"
                              defaultValue={row.original[key]}
                            />
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
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
          Add Package
        </h1>
        <Dialog>
          <DialogTrigger asChild>
            <PlusIcon />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Package</DialogTitle>
              <DialogDescription>
                Make changes to your package here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid gap-4">
                {["kilometer", "duration"].map((key) => (
                  <div className="grid gap-3" key={key}>
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <AutopaginateTable data={data?.data || []} columns={columns} />
    </div>
  );
};

export default RentalPackages;
