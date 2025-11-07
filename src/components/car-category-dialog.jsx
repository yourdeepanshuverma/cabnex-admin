import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
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

const CarCategoryDialog = ({ title, children, data, onSave, className }) => {
  const [form, setForm] = useState({
    category: "",
    carNames: [],
    image: null,
    icon: null,
  });

  const [preview, setPreview] = useState(data?.image?.url || "");
  const [previewIcon, setPreviewIcon] = useState(data?.icon?.url || "");

  useEffect(() => {
    if (data) {
      setForm({
        category: data?.category || "",
        carNames: data?.carNames || [],
        image: null,
        icon: null,
      });
      setPreview(data?.image?.url || "");
      setPreviewIcon(data?.icon?.url || "");
    } else {
      // reset for add mode
      setForm({
        category: "",
        carNames: [],
        image: null,
        icon: null,
      });
      setPreview("");
      setPreviewIcon("");
    }
  }, [data]);

  const onCarAdd = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent form submit
      const value = e.target.value.trim();
      if (!value) return;

      // Split by comma, trim each car name, and filter out empty strings
      const newCars = value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      setForm((prev) => ({
        ...prev,
        carNames: [...prev.carNames, ...newCars],
      }));

      e.target.value = ""; // clear input
    }
  };

  const onValueChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onCarRemove = (index) => {
    setForm({
      ...form,
      carNames: form.carNames.filter((_, i) => i !== index),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Update form state with the selected file
    setForm({ ...form, [e.target.name]: e.target.files[0] });
    if (e.target.name === "image") {
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else if (e.target.name === "icon") {
      setPreviewIcon(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data) {
      form.id = data._id;
      onSave(form, true);
    } else onSave(form);

    setForm({
      category: "",
      carNames: [],
      image: null,
    });
    setPreview("");
    setPreviewIcon("");
  };

  return (
    <Dialog className="max-w-4xl">
      <DialogTrigger className={`${className}`}>{children}</DialogTrigger>
      <DialogContent className="my-4 max-h-[80vh] overflow-x-hidden overflow-y-auto px-2 py-4 sm:px-6 sm:py-6">
        <DialogHeader>
          <DialogTitle className="text-left font-bold">{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="col-span-2 grid h-fit grid-cols-2 gap-4 lg:col-span-1">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                required={!data}
                className="lowercase"
                placeholder="sedan, suv, premium sedan"
                value={form.category}
                onChange={onValueChange}
                name="category"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="cars">Car Names</Label>
              <Input
                className="lowercase"
                placeholder="swift, brezza, amaze"
                onKeyDown={(e) => e.key === "Enter" && onCarAdd(e)}
                name="cars"
              />
              <div className="flex flex-wrap gap-1">
                {form.carNames.length > 0 &&
                  form.carNames.map((name, index) => (
                    <Badge key={index}>
                      {name}
                      <Button
                        variant="primary"
                        size="icon"
                        onClick={() => onCarRemove(index)}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                required={!data}
                name="icon"
                id="icon"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={handleImageChange}
              />
              {previewIcon && (
                <img
                  src={previewIcon}
                  alt="Icon Preview"
                  className="mt-2 h-auto w-full object-cover"
                />
              )}
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                required={!data}
                name="image"
                id="image"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={handleImageChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Image Preview"
                  className="mt-2 h-auto w-full object-cover"
                />
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarCategoryDialog;
