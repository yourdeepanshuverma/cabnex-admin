import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
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
import Spinner from "@/components/ui/spinner";
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
  const [updateWebsiteSettings, { isLoading: isUpdating }] =
    useUpdateWebsiteSettingsMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, state, setState) => {
    const { name, files } = e.target;
    setState((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSEOChange = (e) => {
    const { name, value } = e.target;
    setSeo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Dynamic handlers for arrays
  const addItem = (setState, item) => {
    setState((prev) => [...prev, item]);
  };

  const updateItem = (state, setState, index, key, value) => {
    const updated = state.map((item, i) =>
      i === index ? { ...item, [key]: value } : item,
    );
    setState(updated);
  };

  const removeItem = (state, setState, index) => {
    const updated = state.filter((_, i) => i !== index);
    setState(updated);
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

  const handleBasicSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // append simple fields
    if (basicData.siteName) data.append("siteName", basicData.siteName);
    if (basicData.contactEmail)
      data.append("contactEmail", basicData.contactEmail);
    if (basicData.contactPhone)
      data.append("contactPhone", basicData.contactPhone);

    // append addresses array properly
    basicData.addresses.forEach((addr, index) => {
      data.append(`addresses[${index}]`, addr);
    });

    // append files if selected
    if (basicData.logo && basicData.logo instanceof File) {
      data.append("logo", basicData.logo);
    }
    if (basicData.favicon && basicData.favicon instanceof File) {
      data.append("favicon", basicData.favicon);
    }

    // ✅ for debugging (shows all keys)
    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }

    await updateWebsiteSettings(data)
      .then(() => {
        toast.success("Basic info saved!");
      })
      .catch((error) => {
        toast.error("Failed to save basic info.");
      });
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    socials.forEach((addr, index) => {
      data.append(`socials[${index}][platform]`, addr.platform);
      data.append(`socials[${index}][url]`, addr.url);
    });

    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }

    await updateWebsiteSettings(data)
      .then(() => {
        toast.success("Social links saved!");
      })
      .catch((error) => {
        toast.error("Failed to save social links.");
      });
  };

  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    faqs.forEach((addr, index) => {
      data.append(`faqs[${index}][question]`, addr.question);
      data.append(`faqs[${index}][answer]`, addr.answer);
    });

    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }
    await updateWebsiteSettings(data)
      .then(() => {
        toast.success("FAQs saved!");
      })
      .catch((error) => {
        toast.error("Failed to save FAQs.");
      });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    reviews.forEach((r, i) => {
      data.append(`reviews[${i}][name]`, r.name);
      data.append(`reviews[${i}][role]`, r.role);
      data.append(`reviews[${i}][rating]`, r.rating);
      data.append(`reviews[${i}][comment]`, r.comment);
      if (r.profile instanceof File) {
        data.append(`reviews[${i}][profile]`, r.profile);
      }
    });

    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }

    await updateWebsiteSettings(data)
      .then(() => {
        toast.success("Reviews saved!");
      })
      .catch((error) => {
        toast.error("Failed to save reviews.");
      });
  };

  const handleSeoSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("seo[title]", seo.title);
    data.append("seo[description]", seo.description);

    for (let i = 0; i < seo.keywords.length; i++) {
      data.append(`seo[keywords][${i}]`, seo.keywords[i]);
    }

    for (const [key, value] of data.entries()) {
      console.log(key, value);
    }
    await updateWebsiteSettings(data)
      .then(() => {
        toast.success("SEO info saved!");
      })
      .catch((error) => {
        toast.error("Failed to save SEO info.");
      });
  };

  useEffect(() => {
    if (websiteSettings?.data?.setting) {
      setBasicData(websiteSettings.data.setting);
      setSocials(websiteSettings.data.setting.socials || []);
      setFaqs(websiteSettings.data.setting.faqs || []);
      setReviews(websiteSettings.data.setting.reviews || []);
      setSeo(websiteSettings.data.setting.seo || {});
    }
  }, [websiteSettings?.data?.setting]);

  return (
    <div className="m-8 mx-auto max-w-7xl">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Website Settings</h2>

        {!previewMode ? (
          <div>
            {/* BASIC INFO */}
            <form
              className="space-y-6 rounded-2xl border p-6 shadow-sm"
              onSubmit={handleBasicSubmit}
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Basic Info{" "}
                  <span className="text-xs">(Please save after update.)</span>
                </h3>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      name="siteName"
                      value={basicData.siteName}
                      onChange={handleChange}
                      placeholder="Site Name"
                    />
                  </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      name="logo"
                      type="file"
                      onChange={(e) =>
                        handleFileChange(e, basicData, setBasicData)
                      }
                    />
                    <pre className="text-xs text-gray-500">{`(Recommended size: 150x75px)`}</pre>
                    <div>
                      {basicData.logo && (
                        <img
                          src={
                            basicData?.logo?.url ||
                            URL.createObjectURL(basicData.logo)
                          }
                          alt="Logo Preview"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="favicon">Favicon</Label>
                    <Input
                      name="favicon"
                      type="file"
                      onChange={(e) =>
                        handleFileChange(e, basicData, setBasicData)
                      }
                    />
                    <pre className="text-xs text-gray-500">{`(Recommended size: 50x50px)`}</pre>
                    <div>
                      {basicData.favicon && (
                        <img
                          src={
                            basicData?.favicon?.url ||
                            URL.createObjectURL(basicData.favicon)
                          }
                          alt="Favicon Preview"
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Address</Label>
                  {basicData?.addresses?.map((addr, index) => (
                    <div key={index} className="mt-2 flex items-center gap-2">
                      <Input
                        name={`address-${index}`}
                        value={addr}
                        onChange={(e) => {
                          const updatedAddresses = [...basicData.addresses];
                          updatedAddresses[index] = e.target.value;
                          setBasicData((prev) => ({
                            ...prev,
                            addresses: updatedAddresses,
                          }));
                        }}
                        placeholder="Address"
                      />
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => {
                          const updatedAddresses = basicData.addresses.filter(
                            (_, i) => i !== index,
                          );
                          setBasicData((prev) => ({
                            ...prev,
                            addresses: updatedAddresses,
                          }));
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      setBasicData((prev) => ({
                        ...prev,
                        addresses: [...prev.addresses, ""],
                      }));
                    }}
                  >
                    + Add Address
                  </Button>
                </div>
              </div>

              {/* ACTIONS */}
              <CardFooter className="mt-6 flex justify-end">
                <Button disabled={isUpdating} type="submit">
                  {isUpdating ? <Spinner /> : "Save basic info"}
                </Button>
              </CardFooter>
            </form>

            <Separator className="my-4" />

            {/* SOCIALS */}
            <form
              className="space-y-6 rounded-2xl border p-6 shadow-sm"
              onSubmit={handleSocialSubmit}
            >
              <h3 className="mb-2 text-lg font-medium">
                Social Links{" "}
                <span className="text-xs">(Please save after update.)</span>
              </h3>
              {socials?.map((s, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <Input
                    placeholder="Platform (e.g. Facebook)"
                    value={s.platform}
                    onChange={(e) =>
                      updateItem(
                        socials,
                        setSocials,
                        i,
                        "platform",
                        e.target.value,
                      )
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={s.url}
                    onChange={(e) =>
                      updateItem(socials, setSocials, i, "url", e.target.value)
                    }
                  />
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => removeItem(socials, setSocials, i)}
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(setSocials, { platform: "", url: "" })}
              >
                + Add Social Link
              </Button>

              <CardFooter className="mt-6 flex justify-end">
                <Button type="submit">Save Social Links</Button>
              </CardFooter>
            </form>

            <Separator className="my-4" />

            {/* FAQ */}
            <form
              className="space-y-6 rounded-2xl border p-6 shadow-sm"
              onSubmit={handleFaqSubmit}
            >
              <h3 className="mb-2 text-lg font-medium">
                FAQs{" "}
                <span className="text-xs">(Please save after update.)</span>
              </h3>
              <Accordion type="multiple" className="w-full">
                {faqs.map((f, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {f.question || `Question ${i + 1}`}
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="mt-2 space-y-2">
                        <Input
                          placeholder="Question"
                          value={f.question}
                          onChange={(e) =>
                            updateItem(
                              faqs,
                              setFaqs,
                              i,
                              "question",
                              e.target.value,
                            )
                          }
                        />
                        <Textarea
                          placeholder="Answer"
                          value={f.answer}
                          onChange={(e) =>
                            updateItem(
                              faqs,
                              setFaqs,
                              i,
                              "answer",
                              e.target.value,
                            )
                          }
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => removeItem(faqs, setFaqs, i)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(setFaqs, { question: "", answer: "" })}
              >
                + Add FAQ
              </Button>

              <CardFooter className="mt-6 flex justify-end">
                <Button type="submit">Save FAQs</Button>
              </CardFooter>
            </form>

            <Separator className="my-4" />

            {/* REVIEWS */}
            <form
              className="space-y-6 rounded-2xl border p-6 shadow-sm"
              onSubmit={handleReviewSubmit}
            >
              <h3 className="mb-2 text-lg font-medium">
                Reviews{" "}
                <span className="text-xs">(Please save after update.)</span>
              </h3>
              <Accordion type="multiple" className="w-full">
                {reviews.map((r, i) => (
                  <AccordionItem
                    key={i}
                    value={`review-${i}`}
                    className="mb-2 rounded-lg border px-2"
                  >
                    <AccordionTrigger className="text-left font-medium">
                      {r.name
                        ? `${r.name} (${r.role || "No Role"})`
                        : `Review ${i + 1}`}
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="bg-muted/10 mt-2 space-y-3 rounded-lg border p-3">
                        {/* Name */}
                        <div>
                          <Label>Name</Label>
                          <Input
                            placeholder="Name"
                            value={r.name}
                            onChange={(e) =>
                              updateItem(
                                reviews,
                                setReviews,
                                i,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Role Dropdown */}
                        <div>
                          <Label>Role</Label>
                          <Select
                            value={r.role}
                            onValueChange={(value) =>
                              updateItem(reviews, setReviews, i, "role", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Customer">Customer</SelectItem>
                              <SelectItem value="Vendor">Vendor</SelectItem>
                              <SelectItem value="Driver">Driver</SelectItem>
                              <SelectItem value="Partner">Partner</SelectItem>
                              <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Rating */}
                        <div>
                          <Label>Rating (1-5)</Label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            placeholder="Rating"
                            value={r.rating}
                            onChange={(e) =>
                              updateItem(
                                reviews,
                                setReviews,
                                i,
                                "rating",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Comment */}
                        <div>
                          <Label>Comment</Label>
                          <Textarea
                            placeholder="Comment"
                            value={r.comment}
                            onChange={(e) =>
                              updateItem(
                                reviews,
                                setReviews,
                                i,
                                "comment",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Profile Image */}
                        <div>
                          <Label htmlFor={`reviews.${i}.profile`}>
                            Profile Image
                          </Label>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              updateItem(
                                reviews,
                                setReviews,
                                i,
                                "profile",
                                file,
                              );
                            }}
                          />
                          <pre className="text-xs text-gray-500">
                            (File Size Limit: 5MB | Recommended Size: 100x100px)
                          </pre>
                          <div>
                            {r.profile && (
                              <img
                                src={
                                  r?.profile?.url ||
                                  URL.createObjectURL(r.profile)
                                }
                                alt="Profile"
                                className="mt-2 h-16 w-16 rounded-full bg-white/40 object-cover"
                              />
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => removeItem(reviews, setReviews, i)}
                          >
                            Remove Review
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
              <CardFooter className="mt-2 flex justify-end">
                <Button type="submit">Save Reviews</Button>
              </CardFooter>
            </form>

            <Separator className="my-4" />

            {/* SEO */}
            <form
              className="space-y-6 rounded-2xl border p-6 shadow-sm"
              onSubmit={handleSeoSubmit}
            >
              <h3 className="mb-2 text-lg font-medium">
                SEO <span className="text-xs">(Please save after update.)</span>
              </h3>
              <div className="space-y-2">
                <Label htmlFor="title">SEO Title</Label>
                <Input
                  name="title"
                  value={seo.title}
                  onChange={handleSEOChange}
                  placeholder="SEO Title"
                />
                <Label htmlFor="description" className="mt-2">
                  SEO Description
                </Label>
                <Textarea
                  name="description"
                  value={seo.description}
                  onChange={handleSEOChange}
                  placeholder="SEO Description"
                  className="mt-2"
                />
                <Label htmlFor="keywords" className="mt-2">
                  SEO Keywords
                  <span className="text-xs">(comma separated)</span>
                </Label>

                <Input
                  placeholder="Keywords (comma separated)"
                  defaultValue={seo.keywords.join(", ")}
                  onChange={(e) =>
                    setSeo((prev) => ({
                      ...prev,
                      keywords: e.target.value.split(",").map((k) => k.trim()),
                    }))
                  }
                />
              </div>

              {/* ACTIONS */}
              <CardFooter className="mt-6 flex justify-end">
                <Button type="submit">Save Seo info</Button>
              </CardFooter>
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
      </div>
    </div>
  );
}
