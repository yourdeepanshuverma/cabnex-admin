import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

const TravelPackageDialog = ({ title, children, data, onSave, className }) => {
  const [form, setForm] = useState({
    name: data?.name || "",
    description: data?.description || "",
    days: data?.days || 0,
    nights: data?.nights || 0,
    place: data?.place || "",
    price: data?.price || 0,
    image: data?.image || null,
  });

  const [preview, setPreview] = useState(data?.image?.url || "");

  const onValueChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Update form state with the selected file
    setForm({ ...form, image: e.target.files[0] });
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <Dialog className="max-w-4xl">
      <DialogTrigger className={className}>{children}</DialogTrigger>
      <DialogContent className="my-4 max-h-[80vh] overflow-x-hidden overflow-y-auto px-2 py-4 sm:px-6 sm:py-6">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="col-span-2 grid h-fit grid-cols-6 gap-4 lg:col-span-1">
          <div className="col-span-3 space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              placeholder="Jaipur Tour"
              value={form.name}
              onChange={onValueChange}
              name="name"
              required={!data}
            />
          </div>
          <div className="col-span-3 space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              placeholder="6999"
              type="number"
              onChange={onValueChange}
              value={form.price}
              defaultValue={data?.price || 0}
              name="price"
              required={!data}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="place">Place</Label>
            <Input
              placeholder="Jaipur"
              value={form.place}
              onChange={onValueChange}
              name="place"
              required={!data}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="days">Days</Label>
            <Input
              placeholder="3"
              type="number"
              onChange={onValueChange}
              value={form.days}
              defaultValue={data?.days || 0}
              name="days"
              required={!data}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="nights">Nights</Label>
            <Input
              placeholder="2"
              type="number"
              onChange={onValueChange}
              value={form.nights}
              name="nights"
              required={!data}
            />
          </div>
          <div className="col-span-6 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              placeholder="Type here."
              value={form.description}
              onChange={onValueChange}
              name="description"
              required={!data}
            />
          </div>
          <div className="col-span-6 space-y-2">
            <Label htmlFor="picture">Picture</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              className="cursor-pointer"
              onChange={handleImageChange}
              // required={!data}
            />
            {preview && (
              <img
                src={preview}
                alt="Image Preview"
                className="mt-2 size-60 object-cover"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (!form.name || !form.description || !form.price)
                return toast.error("Please fill all fields.");
              if (data) onSave(form, data._id);
              else
                (onSave(form),
                  setForm({
                    name: "",
                    description: "",
                    days: "",
                    nights: "",
                    place: "",
                    price: "",
                    image: null,
                  }));
              setPreview("");
            }}
            type="submit"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TravelPackageDialog;
