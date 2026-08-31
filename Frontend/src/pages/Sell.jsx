import { Save, Trash2, Upload, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const initialForm = {
    title: "",
    description: "",
    price: "",
    productCondition: "GOOD",
    categoryId: "",
    imageUrls: [],
};

export default function Sell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const edit = params.get("edit");

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    /*
     * Load categories.
     * If editing, also load the existing product.
     */
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError("");

                // Load categories first
                const categoryData = await api.getCategories();

                console.log("Categories received:", categoryData);

                /*
                 * Normally backend returns:
                 *
                 * [
                 *   { id: 1, name: "Books" },
                 *   { id: 2, name: "Electronics" }
                 * ]
                 *
                 * This also protects us if the backend accidentally
                 * returns an object instead of an array.
                 */
                if (Array.isArray(categoryData)) {
                    setCategories(categoryData);
                } else {
                    console.error(
                        "Expected categories array but received:",
                        categoryData
                    );

                    setCategories([]);
                    throw new Error("Invalid category data received");
                }

                // If editing an existing product
                if (edit) {
                    const product = await api.getProduct(edit);

                    if (
                        !user ||
                        Number(product.sellerId) !== Number(user.userId)
                    ) {
                        navigate("/products");
                        return;
                    }

                    setForm({
                        title: product.title || "",
                        description: product.description || "",
                        price: product.price || "",
                        productCondition:
                            product.productCondition || "GOOD",
                        categoryId:
                            product.categoryId !== null &&
                            product.categoryId !== undefined
                                ? String(product.categoryId)
                                : "",
                        imageUrls: product.imageUrls || [],
                    });
                }
            } catch (e) {
                console.error("Sell page error:", e);
                setError(e.message || "Failed to load sell page");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [edit, navigate, user]);

    /*
     * Generic form updater
     */
    function updateField(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }

    /*
     * Upload image
     */
    async function uploadImage(e) {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (form.imageUrls.length >= 5) {
            setError("You can upload maximum 5 images.");
            e.target.value = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        const formData = new FormData();

        // Backend expects "image"
        formData.append("image", file);

        try {
            setUploading(true);
            setError("");

            const response = await api.uploadImage(formData);

            if (!response?.url) {
                throw new Error("Image upload failed: URL not received");
            }

            setForm((prev) => ({
                ...prev,
                imageUrls: [...prev.imageUrls, response.url],
            }));
        } catch (e) {
            console.error("Image upload error:", e);
            setError(e.message || "Failed to upload image");
        } finally {
            setUploading(false);

            // Allows selecting same image again
            e.target.value = "";
        }
    }

    /*
     * Remove image
     */
    function removeImage(index) {
        setForm((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.filter((_, i) => i !== index),
        }));
    }

    /*
     * Submit product
     */
    async function submit(e) {
        e.preventDefault();

        setError("");

        if (!form.categoryId) {
            setError("Please select a category.");
            return;
        }

        if (form.imageUrls.length === 0) {
            setError("Please upload at least one image.");
            return;
        }

        setBusy(true);

        try {
            const productData = {
                title: form.title.trim(),
                description: form.description.trim(),
                price: Number(form.price),
                productCondition: form.productCondition,
                categoryId: Number(form.categoryId),
                imageUrls: form.imageUrls,
            };

            console.log("Submitting product:", productData);

            const product = edit
                ? await api.updateProduct(edit, productData)
                : await api.createProduct(productData);

            navigate(`/products/${product.id}`);
        } catch (e) {
            console.error("Product submit error:", e);
            setError(e.message || "Failed to save product");
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container-page py-10">
            <div className="mx-auto max-w-3xl">

                {/* Header */}
                <p className="text-sm font-bold text-indigo-600">
                    {edit ? "Edit listing" : "Sell an item"}
                </p>

                <h1 className="mt-1 text-3xl font-black">
                    Tell buyers what you're selling.
                </h1>

                {/* Error */}
                {error && (
                    <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="mt-8 space-y-5"
                >

                    {/* Product details */}
                    <div className="rounded-3xl border bg-white p-6 sm:p-8">

                        {/* Title */}
                        <label>
                            <span className="label">
                                Title
                            </span>

                            <input
                                required
                                className="field"
                                value={form.title}
                                onChange={(e) =>
                                    updateField(
                                        "title",
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. Engineering Mathematics Book"
                            />
                        </label>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">

                            {/* Price */}
                            <label>
                                <span className="label">
                                    Price (₹)
                                </span>

                                <input
                                    required
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    className="field"
                                    value={form.price}
                                    onChange={(e) =>
                                        updateField(
                                            "price",
                                            e.target.value
                                        )
                                    }
                                    placeholder="500"
                                />
                            </label>

                            {/* CATEGORY */}
                            <label>
                                <span className="label">
                                    Category
                                </span>

                                <div className="relative">
                                    <select
                                        required
                                        value={form.categoryId}
                                        onChange={(e) => {
                                            const value =
                                                e.target.value;

                                            console.log(
                                                "Selected category:",
                                                value
                                            );

                                            updateField(
                                                "categoryId",
                                                value
                                            );
                                        }}
                                        className="field appearance-none pr-10"
                                    >
                                        <option value="">
                                            Choose category
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                </div>

                                {categories.length === 0 && (
                                    <p className="mt-2 text-xs text-rose-500">
                                        No categories available.
                                    </p>
                                )}
                            </label>
                        </div>

                        {/* Condition */}
                        <label className="mt-5 block">
                            <span className="label">
                                Condition
                            </span>

                            <select
                                className="field"
                                value={form.productCondition}
                                onChange={(e) =>
                                    updateField(
                                        "productCondition",
                                        e.target.value
                                    )
                                }
                            >
                                {[
                                    "NEW",
                                    "LIKE_NEW",
                                    "GOOD",
                                    "FAIR",
                                    "POOR",
                                ].map((condition) => (
                                    <option
                                        key={condition}
                                        value={condition}
                                    >
                                        {condition.replace(
                                            "_",
                                            " "
                                        )}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {/* Description */}
                        <label className="mt-5 block">
                            <span className="label">
                                Description
                            </span>

                            <textarea
                                required
                                rows="6"
                                className="field"
                                value={form.description}
                                onChange={(e) =>
                                    updateField(
                                        "description",
                                        e.target.value
                                    )
                                }
                                placeholder="Describe the item, its condition, age, defects, etc."
                            />
                        </label>
                    </div>

                    {/* Photos */}
                    <div className="rounded-3xl border bg-white p-6 sm:p-8">

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-bold">
                                    Photos
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Upload up to 5 images.
                                </p>
                            </div>

                            <span className="text-sm font-semibold text-slate-500">
                                {form.imageUrls.length}/5
                            </span>
                        </div>

                        {/* Upload */}
                        {form.imageUrls.length < 5 && (
                            <label
                                className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                                    uploading
                                        ? "cursor-not-allowed border-indigo-300 bg-indigo-50"
                                        : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50"
                                }`}
                            >
                                <Upload
                                    size={28}
                                    className="mb-3 text-slate-400"
                                />

                                <p className="font-bold text-slate-700">
                                    {uploading
                                        ? "Uploading image..."
                                        : "Click to upload an image"}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    JPG, PNG, WEBP • Maximum 5 MB
                                </p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={uploadImage}
                                    disabled={uploading}
                                />
                            </label>
                        )}

                        {/* Preview */}
                        {form.imageUrls.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-3">
                                {form.imageUrls.map(
                                    (url, index) => (
                                        <div
                                            key={`${url}-${index}`}
                                            className="group relative aspect-video overflow-hidden rounded-2xl bg-slate-100"
                                        >
                                            <img
                                                src={url}
                                                alt={`Product ${
                                                    index + 1
                                                }`}
                                                className="h-full w-full object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(
                                                        index
                                                    )
                                                }
                                                className="absolute right-2 top-2 rounded-full bg-white p-2 text-rose-500 shadow hover:bg-rose-50"
                                            >
                                                <Trash2
                                                    size={15}
                                                />
                                            </button>

                                            <span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white">
                                                {index + 1}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={
                            busy ||
                            uploading ||
                            categories.length === 0
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={18} />

                        {busy
                            ? "Saving..."
                            : edit
                              ? "Save changes"
                              : "Publish listing"}
                    </button>
                </form>
            </div>
        </div>
    );
}