import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type productOption = { value: string; label: string };
type topicOption = { value: string; label: string };

export default function ContentForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<{
    contentname: string;
    contentstatus: string;
    contentstartdate: string;
    contentenddate: string;
    contentdefinition: string;
    contentimage: string;
    contentfilename: string;
    contentfiletype: string;
    contentproduct: string[];
    contenttopic: string[];
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

  const [imageError, setImageError] = useState<string>("");
  const queryClient = useQueryClient();
  const [nextId, setNextId] = useState<number>(1);

  useEffect(() => {
    axios.get("http://localhost:3000/content").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createContent = useMutation({
    mutationFn: async (newcontent: {
      contentname: string;
      contentstatus: string;
      contentstartdate: string;
      contentenddate: string;
      contentdefinition: string;
      contentimage: string;
      contentfilename: string;
      contentfiletype: string;
      contentproduct: string[];
      contenttopic: string[];
    }) => {
      return axios.post("http://localhost:3000/content", {
        id: nextId,
        ...newcontent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      onClose();
    },
  });
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

    const formattedForm = {
      ...form,
      contentstartdate: formatDateForDB(form.contentstartdate),
      contentenddate: formatDateForDB(form.contentenddate),
    };
    createContent.mutate(formattedForm);
    onClose();
  }

  const productOptions =
    product
      ?.filter((product: any) => product.status === "Active")
      .map((product: any) => ({
        value: product.productname,
        label: product.productname,
      })) || [];

  const topicOptions =
    topic
      ?.filter((topic: any) => topic.topicstatus === "Active")
      .map((topic: any) => ({
        value: topic.topicname,
        label: topic.topicname,
      })) || [];

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
            placeholder="Definition"
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
            value={form.contentproduct.map((val) => ({
              value: val,
              label: val,
            }))}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                contentproduct: (selected as MultiValue<productOption>).map(
                  (c) => c.value
                ),
              }))
            }
            placeholder="Select Product"
            className="text-sm"
          />
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
            value={form.contenttopic.map((val) => ({ value: val, label: val }))}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                contenttopic: (selected as MultiValue<topicOption>).map(
                  (c) => c.value
                ),
              }))
            }
            placeholder={"Select topic"}
            className="text-sm"
          />
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
            Submit
          </button>
        </div>
      </div>
    </form>
  );
}
