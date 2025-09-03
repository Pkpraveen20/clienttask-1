import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DateInput from "../../../components/dataPicker";
import Select, { MultiValue } from "react-select";

type productOption = { value: string; label: string };
type topicOption = { value: string; label: string };

export default function ContentEditModal({
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

  const { data: topic, error: topicError } = useQuery({
    queryKey: ["topic"],
    queryFn: () =>
      axios.get("http://localhost:3000/topic").then((res) => res.data),
  });
  if (topicError) console.error("Topic fetch error:", topicError);

  const queryClient = useQueryClient();
  const { data: content, isLoading } = useQuery({
    queryKey: ["topic", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/content/${id}`);
      return res.data;
    },
  });

  const [form, setForm] = useState<{
    contentname: string;
    contentstatus: string;
    contentstartdate: string;
    contentenddate: string;
    contentdefinition: string;
    contentimage: string;
    contentfilename: string;
    contentfiletype: string;
    contentproduct: MultiValue<productOption>;
    contenttopic: MultiValue<topicOption>;
  }>({
    contentname: "",
    contentstatus: "Active",
    contentstartdate: "",
    contentenddate: "",
    contentdefinition: "",
    contentimage: "",
    contentfilename: "",
    contentfiletype: "",
    contentproduct: [],
    contenttopic: [],
  });

  const [imageError, setImageError] = useState<string>("");

  useEffect(() => {
    if (content) {
      setForm({
        contentname: content.contentname || "",
        contentstatus: content.contentstatus || "Active",
        contentstartdate: content.contentstartdate || "",
        contentenddate: content.contentenddate || "",
        contentimage: content.contentimage || "",
        contentfilename: content.contentfilename || "",
        contentfiletype: content.contentfiletype || "",
        contentdefinition: content.contentdefinition || "",
        contentproduct: Array.isArray(content.contentproduct)
          ? content.contentproduct.map((p: string) => ({
              value: p,
              label: p,
            }))
          : [],
        contenttopic: Array.isArray(content.contenttopic)
          ? content.contenttopic.map((T: string) => ({
              value: T,
              label: T,
            }))
          : [],
      });
    }
  }, [content]);

  const updateContent = useMutation({
    mutationFn: async (updateContent: typeof form) => {
      return axios.put(`http://localhost:3000/content/${id}`, updateContent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      onClose();
    },
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
      "video/quicktime",
    ];
    if (!validTypes.includes(file.type)) {
      setImageError(
        "Only JPG, JPEG, PNG, PDF, DOC, DOCX, PPT, PPTX, MP4, MOV files are allowed."
      );
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setImageError("Max file size is 100MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        contentimage: reader.result as string,
        contentfilename: file.name,
        contentfiletype: file.type,
      }));
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
      contentstartdate: formatDateForDB(form.contentstartdate),
      contentenddate: formatDateForDB(form.contentenddate),
      contentproduct: (form.contentproduct as MultiValue<productOption>).map(
        (c) => c.value
      ),
      contenttopic: (form.contenttopic as MultiValue<topicOption>).map(
        (c) => c.value
      ),
    };
    updateContent.mutate(formattedForm);
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  const productOptions: productOption[] = Array.isArray(product)
    ? product.map((p: any) => ({
        value: p.productname,
        label: p.productname,
      }))
    : [];
      const topicOptions: topicOption[] = Array.isArray(topic)
    ? topic.map((T: any) => ({
        value: T.topicname,
        label: T.topicname,
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
            htmlFor="contentname"
            className="block mb-1 font-medium text-gray-700"
          >
            Content Name
          </label>
          <input
            id="contentname"
            name="contentname"
            placeholder="Content Name"
            value={form.contentname}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="contentstartdate"
              name="contentstartdate"
              label="Start Date"
              value={form.contentstartdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, contentstartdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="contentenddate"
              name="contentenddate"
              label="End Date"
              value={form.contentenddate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, contentenddate: val }))
              }
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="contentdefinition"
            className="block mb-1 font-medium text-gray-700"
          >
            Definition
          </label>
          <textarea
            id="contentdefinition"
            name="contentdefinition"
            placeholder=" Definition"
            value={form.contentdefinition}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="contentproduct"
            className="block mb-1 font-medium text-gray-700"
          >
            Content Product
          </label>
          <Select
            isMulti
            name="contentproduct"
            options={productOptions}
            value={form.contentproduct}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                contentproduct: (selected ?? []) as MultiValue<productOption>,
              }))
            }
            placeholder="Select Product"
            className="text-sm"
          />
          {Array.isArray(form.contentproduct) &&
            form.contentproduct.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                Selected:{" "}
                {form.contentproduct
                  .map((p) =>
                    typeof p === "object"
                      ? p.label || p.value || String(p)
                      : String(p)
                  )
                  .join(", ")}
              </div>
            )}
        </div>
        <div>
          <label
            htmlFor="contenttopic"
            className="block mb-1 font-medium text-gray-700"
          >
            Content Topic
          </label>
          <Select
            isMulti
            name="contenttopic"
            options={topicOptions}
            value={form.contenttopic}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                contenttopic: (selected ?? []) as MultiValue<topicOption>,
              }))
            }
            placeholder={"Select topic"}
            className="text-sm"
          />
          {Array.isArray(form.contenttopic) && form.contenttopic.length > 0 && (
            <div className="text-xs text-gray-600 mt-1">
              Selected:{" "}
              {form.contenttopic
                .map((T) =>
                  typeof T === "object"
                    ? T.label || T.value || String(T)
                    : String(T)
                )
                .join(", ")}
            </div>
          )}
        </div>
        <div>
          <label
            htmlFor="contentimage"
            className="block mb-1 font-medium text-gray-700"
          >
            Content File (JPG, JPEG, PNG, PDF, DOC, DOCX, PPT, PPTX, MP4, MOV;
            max 100MB)
          </label>
          <input
            id="contentimage"
            name="contentimage"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov"
            onChange={handleFileChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
          {imageError && (
            <div className="text-red-500 text-sm mt-1">{imageError}</div>
          )}
          {form.contentimage && !imageError && (
            <div className="mt-2">
              {form.contentfiletype.startsWith("image/") ? (
                <img
                  src={form.contentimage}
                  alt="Preview"
                  className="max-h-32"
                />
              ) : form.contentfiletype.startsWith("video/") ? (
                <video src={form.contentimage} controls className="max-h-32" />
              ) : (
                <div className="text-green-600">
                  {form.contentfilename} uploaded
                </div>
              )}
            </div>
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
