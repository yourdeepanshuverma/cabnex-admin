import Back from "@/components/ui/back";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useAddCarToCategoryMutation,
  useGetCarCategoriesQuery,
} from "@/store/services/adminApi";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";

export default function CategoryView() {
  const { id } = useParams();

  const [carNames, setCarNames] = useState("");

  const { data } = useGetCarCategoriesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.categories?.find((i) => i._id === id),
    }),
  });

  const [addCarToCategory] = useAddCarToCategoryMutation();

  const handleAddCarName = () => {
    if (!carNames.length) return toast.error("Please enter a car name.");

    const carNamesArray = carNames.split(",").map((name) => name.trim());

    addCarToCategory({ categoryId: id, carNames: carNamesArray })
      .unwrap()
      .then(({ data }) => {
        toast.message(data?.message);
        setCarNames("");
      })
      .catch((error) => {
        toast.error(error.data.message);
      });
  };

  if (!data?._id) {
    return <div>Category not found.</div>;
  }

  return (
    <div>
      <Back />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div>
            <h4 className="text-2xl font-medium">Image:</h4>
            {data?.image ? (
              <img
                src={data?.image?.url}
                alt={data?.category}
                className="size-80 rounded-lg border object-cover"
              />
            ) : (
              <div className="bg-muted text-muted-foreground flex size-80 items-center justify-center rounded-lg border">
                No Image
              </div>
            )}
          </div>
          <div>
            <h4 className="text-2xl font-medium">Icon:</h4>
            {data?.icon ? (
              <img
                src={data?.icon?.url}
                alt={data?.category}
                className="size-80 rounded-lg border object-cover"
              />
            ) : (
              <div className="bg-muted text-muted-foreground flex size-80 items-center justify-center rounded-lg border">
                No Icon
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 self-start">
          <div>
            <h1 className="text-muted-foreground text-sm">Category</h1>
            <h2 className="text-2xl font-semibold capitalize">
              {data?.category}
            </h2>
          </div>
          <div className="space-y-6">
            {/* Car Names */}
            <div>
              <h3 className="flex items-center gap-2 font-medium">Car Names</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {data?.carNames.map((car, idx) => (
                  <Badge key={idx} variant="secondary">
                    {car}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <Separator />
          <div className="my-2 flex flex-col gap-4">
            <h3 className="flex items-center gap-2 text-2xl font-medium">
              Add New Car Name
              <PlusIcon className="h-5 w-5" />
            </h3>
            <div className="flex max-w-sm gap-2">
              <input
                type="text"
                placeholder="Enter car name"
                className="focus:ring-primary w-full rounded-md border px-3 py-2 outline-none focus:ring-2"
                value={carNames}
                onChange={(e) => setCarNames(e.target.value)}
              />
              <button
                className="bg-primary hover:bg-primary/80 rounded-md px-4 py-2 text-white"
                onClick={handleAddCarName}
                type="button"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
