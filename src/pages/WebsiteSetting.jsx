import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetWebsiteSettingsQuery,
  useUpdateWebsiteSettingsMutation,
} from "@/store/services/adminApi";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function WebsiteSetting() {
  const [basicData, setBasicData] = useState({
    siteName: "",
    logo: null,
    favicon: null,
    contactEmail: "",
    contactPhone: "",
    addresses: [],
    aboutUs: "",
  });

  const [socials, setSocials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [seo, setSeo] = useState({
    title: "",
    description: "",
    keywords: [],
  });

  const [previewMode, setPreviewMode] = useState(false);

  const { data: websiteSettings, isLoading } = useGetWebsiteSettingsQuery();
  const [updateWebsiteSettings] = useUpdateWebsiteSettingsMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSEOChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Dynamic handlers
  const addItem = (setHandle, item) => {
    setHandle((prev) => ({
      ...prev,
      item,
    }));
  };
  console.log(reviews);

  const updateItem = (setHandle, field, index, key, value) => {
    const updated = [...basicData[field]];
    updated[index][key] = value;
    setHandle((prev) => ({ ...prev, [field]: updated }));
  };

  const updateItemDirect = (setHandle, field, index, value) => {
    const updated = [...basicData[field]];
    updated[index] = value;
    setHandle((prev) => ({ ...prev, [field]: updated }));
  };

  const removeItem = (setHandle, field, index) => {
    const updated = basicData[field].filter((_, i) => i !== index);
    setHandle((prev) => ({ ...prev, [field]: updated }));
  };

  // ✅ Save to API
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new basicData();

    // append simple fields
    data.append("siteName", basicData.siteName);
    data.append("contactEmail", basicData.contactEmail);
    data.append("contactPhone", basicData.contactPhone);
    data.append("address", basicData.address);
    data.append("aboutUs", basicData.aboutUs);

    // append files
    if (basicData.logo) data.append("logo", basicData.logo);
    if (basicData.favicon) data.append("favicon", basicData.favicon);

    // socials, faqs, seo as JSON
    data.append("socials", JSON.stringify(basicData.socials));
    data.append("faqs", JSON.stringify(basicData.faqs));
    data.append("seo", JSON.stringify(basicData.seo));

    // append reviews
    basicData.reviews.forEach((r, i) => {
      data.append(`reviews[${i}][name]`, r.name);
      data.append(`reviews[${i}][role]`, r.role);
      data.append(`reviews[${i}][rating]`, r.rating);
      data.append(`reviews[${i}][comment]`, r.comment);

      if (r.profile instanceof File) {
        // ✅ use 'profiles' not 'profile'
        data.append("profiles", r.profile);
        data.append("reviewIndex", i);
      }
    });
    const Data = Object.fromEntries(data);

    console.log(basicData);
    console.log(Data);

    try {
      await updateWebsiteSettings(data)
        .unwrap()
        .then(({ data }) => {
          toast.success(
            data?.message || "Website settings saved successfully!",
          );
        });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save website settings.");
    }
  };

  //   useEffect(() => {
  //     if (websiteSettings?.data?.setting) {
  //       setBasicData(websiteSettings.data.setting);
  //     }
  //   }, [websiteSettings?.data?.setting]);

  return (
    <div className="mx-auto mt-8 max-w-5xl">
      <Card className="rounded-2xl border p-6 shadow-lg">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Website Settings</h2>
        </CardHeader>

        <Separator className="my-4" />

        {!previewMode ? (
          <div>
            {/* BASIC INFO */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Info</h3>
                <div className="space-y-1">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    name="siteName"
                    value={basicData.siteName}
                    onChange={handleChange}
                    placeholder="Site Name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      name="logo"
                      type="file"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="favicon">Favicon</Label>
                    <Input
                      name="favicon"
                      type="file"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      name="contactEmail"
                      value={basicData.contactEmail}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      name="contactPhone"
                      value={basicData.contactPhone}
                      onChange={handleChange}
                      placeholder="Phone"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    name="address"
                    value={basicData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="mt-2"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="aboutUs">About Us</Label>
                  <Textarea
                    name="aboutUs"
                    value={basicData.aboutUs}
                    onChange={handleChange}
                    placeholder="About Us"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <CardFooter className="mt-6 flex justify-end">
                <Button type="submit">Save basic info</Button>
              </CardFooter>
            </form>

            {/* SOCIALS */}
            <form onSubmit={handleSubmit}>
              <Separator className="my-4" />

              <h3 className="mb-2 text-lg font-medium">Social Links</h3>
              <ul className="ml-5 list-disc">
                {socials?.map((s, i) => (
                  <li key={i}>
                    {s.platform}: <a href={s.url}>{s.url}</a>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleSubmit}>
                {socials?.map((s, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <Input
                      placeholder="Platform (e.g. Facebook)"
                      value={s.platform}
                      onChange={(e) =>
                        updateItem("socials", i, "platform", e.target.value)
                      }
                    />
                    <Input
                      placeholder="URL"
                      value={s.url}
                      onChange={(e) =>
                        updateItem("socials", i, "url", e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => removeItem("socials", i)}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addItem("socials", { platform: "", url: "" })}
                >
                  + Add Social Link
                </Button>
              </form>
            </form>

            {/* FAQ */}
            <form onSubmit={handleSubmit}>
              <Separator className="my-4" />
              <h3 className="mb-2 text-lg font-medium">FAQs</h3>
              {faqs.map((f, i) => (
                <div key={i} className="mb-3 space-y-2">
                  <Input
                    placeholder="Question"
                    value={f.question}
                    onChange={(e) =>
                      updateItem("faqs", i, "question", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Answer"
                    value={f.answer}
                    onChange={(e) =>
                      updateItem("faqs", i, "answer", e.target.value)
                    }
                  />
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => removeItem("faqs", i)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem("faqs", { question: "", answer: "" })}
              >
                + Add FAQ
              </Button>
            </form>

            {/* REVIEWS */}
            <form onSubmit={handleSubmit}>
              <Separator className="my-4" />
              <h3 className="mb-2 text-lg font-medium">Reviews</h3>
              {reviews?.map((r, i) => (
                <div key={i} className="mb-3 space-y-2 rounded-lg border p-3">
                  <Input
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) =>
                      updateItem("reviews", i, "name", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Role"
                    value={r.role}
                    onChange={(e) =>
                      updateItem("reviews", i, "role", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Rating (1-5)"
                    type="number"
                    min={1}
                    max={5}
                    value={r.rating}
                    onChange={(e) =>
                      updateItem("reviews", i, "rating", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Comment"
                    value={r.comment}
                    onChange={(e) =>
                      updateItem("reviews", i, "comment", e.target.value)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`reviews.${i}.profile`}>
                      Profile Image
                    </Label>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        updateItemDirect("profiles", i, file);
                      }}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => removeItem("reviews", i)}
                  >
                    Remove Review
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addItem(setReviews, {
                    name: "",
                    role: "",
                    rating: 5,
                    comment: "",
                    image: "",
                  })
                }
              >
                + Add Review
              </Button>
            </form>

            {/* SEO */}
            <form onSubmit={handleSubmit}>
              <Separator className="my-4" />
              <h3 className="mb-2 text-lg font-medium">SEO</h3>
              <Input
                name="title"
                value={seo.title}
                onChange={handleSEOChange}
                placeholder="SEO Title"
              />
              <Textarea
                name="description"
                value={seo.description}
                onChange={handleSEOChange}
                placeholder="SEO Description"
                className="mt-2"
              />
              <Input
                placeholder="Keywords (comma separated)"
                value={seo.keywords.join(", ")}
                onChange={(e) =>
                  setSeo((prev) => ({
                    ...prev,
                    keywords: e.target.value.split(",").map((k) => k.trim()),
                  }))
                }
                className="mt-2"
              />
            </form>
          </div>
        ) : (
          // ✅ PREVIEW MODE
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {basicData.logo && (
                <img src={basicData.logo} alt="Logo" className="h-10 rounded" />
              )}
              <h2 className="text-2xl font-semibold">{basicData.siteName}</h2>
              {basicData.favicon && (
                <img src={basicData.favicon} alt="Favicon" className="h-6" />
              )}
            </div>
            <p>
              <strong>Contact:</strong> {basicData.contactEmail} |{" "}
              {basicData.contactPhone}
            </p>
            <p>
              <strong>Address:</strong> {basicData.address}
            </p>
            <p>
              <strong>About:</strong> {basicData.aboutUs}
            </p>

            <Separator className="my-4" />
            <h3 className="font-medium">Socials</h3>
            <ul className="ml-5 list-disc">
              {basicData.socials.map((s, i) => (
                <li key={i}>
                  {s.platform}: <a href={s.url}>{s.url}</a>
                </li>
              ))}
            </ul>

            <h3 className="mt-4 font-medium">FAQs</h3>
            <ul className="ml-5 list-disc">
              {basicData.faqs.map((f, i) => (
                <li key={i}>
                  <b>{f.question}</b> — {f.answer}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 font-medium">Reviews</h3>
            <div className="grid grid-cols-2 gap-4">
              {basicData.reviews.map((r, i) => (
                <div key={i} className="rounded-lg border p-3 shadow-sm">
                  {r.image && (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="h-12 rounded-full"
                    />
                  )}
                  <h4 className="font-semibold">{r.name}</h4>
                  <p className="text-sm">{r.role}</p>
                  <p>⭐ {r.rating}/5</p>
                  <p>{r.comment}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />
            <h3 className="font-medium">SEO</h3>
            <p>
              <strong>Title:</strong> {basicData.seo.title}
            </p>
            <p>
              <strong>Description:</strong> {basicData.seo.description}
            </p>
            <p>
              <strong>Keywords:</strong> {basicData.seo.keywords.join(", ")}
            </p>

            <CardFooter className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setPreviewMode(false)}>
                Back to Edit
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </CardFooter>
          </div>
        )}
      </Card>
    </div>
  );
}
