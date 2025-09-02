import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import DateInput from "../../../components/dataPicker";

export default function ProductEditModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/product/${id}`);
      return res.data;
    },
  });

  const [form, setForm] = useState({
    productname: "",
    status: "Active",
    startdate: "",
    enddate: "",
    productimage: "",
    productdescription: "",
  });
  const [imageError, setImageError] = useState<string>("");

  useEffect(() => {
    if (product) {
      setForm({
        productname: product.productname || "",
        status: product.status || "Active",
        startdate: product.startdate || "",
        enddate: product.enddate || "",
        productimage: product.productimage || "",
        productdescription: product.productdescription || "",
      });
    }
  }, [product]);

  const updateProduct = useMutation({
    mutationFn: async (updatedProduct: typeof form) => {
      return axios.put(`http://localhost:3000/product/${id}`, updatedProduct);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
      onClose();
    },
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, PNG files are allowed.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setImageError("Max file size is 100MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, productimage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function formatDateForDB(date: string) {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageError) return;
    const formattedForm = {
      ...form,
      startdate: formatDateForDB(form.startdate),
      enddate: formatDateForDB(form.enddate),
    };
    updateProduct.mutate(formattedForm);
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="productname"
            className="block mb-1 font-medium text-gray-700"
          >
            Product Name
          </label>
          <input
            id="productname"
            name="productname"
            placeholder="Product Name"
            value={form.productname}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label
            htmlFor="productdescription"
            className="block mb-1 font-medium text-gray-700"
          >
            Product Description
          </label>
          <textarea
            id="productdescription"
            name="productdescription"
            placeholder="Product Description"
            value={form.productdescription}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="startdate"
              name="startdate"
              label="Start Date"
              value={form.startdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, startdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="enddate"
              name="enddate"
              label="End Date"
              value={form.enddate}
              onChange={(val) => setForm((prev) => ({ ...prev, enddate: val }))}
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="productimage"
            className="block mb-1 font-medium text-gray-700"
          >
            Product Image (JPG, JPEG, PNG, max 100MB)
          </label>
          <input
            id="productimage"
            name="productimage"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
          />
          {imageError && (
            <div className="text-red-500 text-sm mt-1">{imageError}</div>
          )}
          {form.productimage && !imageError && (
            <img
              src={form.productimage}
              alt="Preview"
              className="mt-2 max-h-32"
            />
          )}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
