import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useCreateUserMutation,
  useCreateVendorMutation,
} from "@/store/services/adminApi";
import { toast } from "sonner";

export default function CreateProfiles() {
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [createVendor, { isLoading: isCreatingVendor }] =
    useCreateVendorMutation();

  const handleCreateUser = async () => {
    await createUser()
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "User created successfully");
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Failed to create user");
      });
  };

  const handleCreateVendor = async () => {
    await createVendor()
      .unwrap()
      .then(({ data }) => {
        toast.success(data?.message || "Vendor created successfully");
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Failed to create vendor");
      });
  };

  return (
    <div className="container mx-auto flex flex-col gap-8 py-8">
      {/* User Profile Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a User account</CardTitle>
          <CardDescription>
            Enter information below to create a user account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid grid-cols-2 gap-6">
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                <Input
                  id="mobile"
                  type="tel"
                  pattern="^\+?[1-9]\d{1,14}$"
                  autoComplete="tel"
                  placeholder="+1234567890"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="password">
                  Password{" "}
                  <span className="text-xs">
                    (Must be at least 8 characters long)
                  </span>
                </FieldLabel>
                <Input id="password" type="password" minLength={8} required />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="pan">PAN</FieldLabel>
                <Input
                  id="pan"
                  type="text"
                  minLength={10}
                  maxLength={10}
                  pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                  required
                  autoComplete="pan"
                  placeholder="ABCDE1234F"
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="gst">GST Number</FieldLabel>
                <Input
                  id="gst"
                  type="text"
                  autoComplete="gst"
                  minLength={15}
                  maxLength={15}
                  pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                  placeholder="22ABCDE1234F1Z5"
                  required
                />
              </Field>
            </div>
            <Field className="mt-6">
              <Button type="submit">Create User Account</Button>
            </Field>
          </form>
        </CardContent>
      </Card>

      {/* Vendor Profile Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a Vendor account</CardTitle>
          <CardDescription>
            Enter information below to create a vendor account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid grid-cols-2 gap-6">
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="contactPerson">Name</FieldLabel>
                <Input
                  name="contactPerson"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="company">Company Name</FieldLabel>
                <Input
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Cabnex Pvt Ltd"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel htmlFor="contactPhone">Mobile</FieldLabel>
                <Input
                  name="contactPhone"
                  type="tel"
                  pattern="^\+?[1-9]\d{1,14}$"
                  autoComplete="tel"
                  placeholder="+1234567890"
                  required
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel>
                  Password{" "}
                  <span className="text-xs">
                    (Must be at least 8 characters long)
                  </span>
                </FieldLabel>
                <Input type="password" name="password" minLength={8} required />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel>PAN</FieldLabel>
                <Input
                  name="pan"
                  type="text"
                  minLength={10}
                  maxLength={10}
                  pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
                  required
                  autoComplete="pan"
                  placeholder="ABCDE1234F"
                />
              </Field>
              <Field className="col-span-2 md:col-span-1">
                <FieldLabel>GST Number</FieldLabel>
                <Input
                  name="gst"
                  type="text"
                  autoComplete="gst"
                  minLength={15}
                  maxLength={15}
                  pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
                  placeholder="22ABCDE1234F1Z5"
                  required
                />
              </Field>
            </div>
            <Field className="mt-6">
              <Button type="submit">Create Vendor Account</Button>
            </Field>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
