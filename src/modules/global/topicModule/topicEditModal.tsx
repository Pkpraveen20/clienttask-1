import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DateInput from "../../../components/dataPicker";
import Select, { MultiValue } from "react-select";

type TopicOption = { value: string; label: string };

export default function TopicEditModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const { data: product } = useQuery({
    queryKey: ["product"],
    queryFn: () =>
      axios.get("http://localhost:3000/product").then((res) => res.data),
  });

  const queryClient = useQueryClient();
  const { data: topic, isLoading } = useQuery({
    queryKey: ["topic", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/topic/${id}`);
      return res.data;
    },
  });

  const [form, setForm] = useState<{
    topicname: string;
    topicstatus: string;
    topicstartdate: string;
    topicenddate: string;
    topicimage: string;
    topicdescription: string;
    topicproduct: MultiValue<TopicOption>;
  }>({
    topicname: "",
    topicstatus: "Active",
    topicstartdate: "",
    topicenddate: "",
    topicimage: "",
    topicdescription: "",
    topicproduct: [],
  });

  const [imageError, setImageError] = useState<string>("");

  useEffect(() => {
    if (topic) {
      setForm({
        topicname: topic.topicname || "",
        topicstatus: topic.topicstatus || "Active",
        topicstartdate: topic.topicstartdate || "",
        topicenddate: topic.topicenddate || "",
        topicimage: topic.topicimage || "",
        topicdescription: topic.topicdescription || "",
        topicproduct: Array.isArray(topic.topicproduct)
          ? topic.topicproduct.map((p: string) => ({
              value: p,
              label: p,
            }))
          : [],
      });
    }
  }, [topic]);

  const updateTopic = useMutation({
    mutationFn: async (updatedTopic: typeof form) => {
      return axios.put(`http://localhost:3000/topic/${id}`, updatedTopic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic"] });
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
      setForm((prev) => ({ ...prev, topicimage: reader.result as string }));
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
      topicstartdate: formatDateForDB(form.topicstartdate),
      topicenddate: formatDateForDB(form.topicenddate),
      topicproduct: (form.topicproduct as MultiValue<TopicOption>).map(
        (c) => c.value
      ),
    };
    updateTopic.mutate(formattedForm);
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  const topicOptions: TopicOption[] = Array.isArray(product)
    ? product.map((p: any) => ({
        value: p.productname,
        label: p.productname,
      }))
    : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="topicname"
            className="block mb-1 font-medium text-gray-700"
          >
            Topic Name
          </label>
          <input
            id="topicname"
            name="topicname"
            placeholder="Topic Name"
            value={form.topicname}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="topicdescription"
            className="block mb-1 font-medium text-gray-700"
          >
            Topic Description
          </label>
          <textarea
            id="topicdescription"
            name="topicdescription"
            placeholder="Topic Description"
            value={form.topicdescription}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="topicstartdate"
              name="topicstartdate"
              label="Start Date"
              value={form.topicstartdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, topicstartdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="topicenddate"
              name="topicenddate"
              label="End Date"
              value={form.topicenddate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, topicenddate: val }))
              }
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="topicproduct"
            className="block mb-1 font-medium text-gray-700"
          >
            Product Name
          </label>
          <Select
            isMulti
            name="topicproduct"
            options={topicOptions}
            value={form.topicproduct}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                topicproduct: (selected ?? []) as MultiValue<TopicOption>,
              }))
            }
            placeholder="Select Product"
            className="text-sm"
          />
          {Array.isArray(form.topicproduct) &&
            form.topicproduct.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                Selected:{" "}
                {form.topicproduct.map((p) => String(p.label)).join(", ")}
              </div>
            )}
        </div>

        <div>
          <label
            htmlFor="topicimage"
            className="block mb-1 font-medium text-gray-700"
          >
            Topic Image (JPG, JPEG, PNG, max 100MB)
          </label>
          <input
            id="topicimage"
            name="topicimage"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
          />
          {imageError && (
            <div className="text-red-500 text-sm mt-1">{imageError}</div>
          )}
          {form.topicimage && !imageError && (
            <img
              src={form.topicimage}
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
