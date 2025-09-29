import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type topicOption = { value: string; label: string };

export default function TopicForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<{
    topicname: string;
    topicstatus: string;
    topicstartdate: string;
    topicenddate: string;
    topicdescription: string;
    topicimage: string;
    topicproduct: MultiValue<topicOption>;
    engagementTypes: string[];
    // any
  }>({
    topicname: "",
    topicstatus: "Active",
    topicstartdate: "",
    topicenddate: "",
    topicdescription: "",
    topicimage: "",
    topicproduct: [],
    engagementTypes: [] as string[],
  });
  const [nextId, setNextId] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: engagementTypes = [] } = useQuery({
    queryKey: ["engagementTypes"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/engagementTypes");
      return res.data;
    },
  });
  const { data: engagements } = useQuery({
    queryKey: ["engagements"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/engagements");
      return res.data;
    },
  });

  const { data: product } = useQuery({
    queryKey: ["product"],
    queryFn: () =>
      axios.get("http://localhost:3000/product").then((res) => res.data),
  });

  const [imageError, setImageError] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    axios.get("http://localhost:3000/topic").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createTopic = useMutation({
    mutationFn: async (newtopic: typeof form) => {
      return axios.post("http://localhost:3000/topic", {
        id: nextId,
        ...newtopic,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topic"] });
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

  function validateStepOne(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.topicname.trim()) {
      newErrors.productname = "Topic Name is required";
    }
    if (!form.topicdescription.trim()) {
      newErrors.productdescription = "Topic Description is required";
    }
    if (!form.topicstartdate) {
      newErrors.topicstartdate = "Start Date is required";
    }
    if (!form.topicenddate) {
      newErrors.topicenddate = "End Date is required";
    }
    if (!form.topicimage) {
      newErrors.topicimage = "Topic Image is required";
    }
    if (!form.topicstatus) {
      newErrors.topicstatus = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStepTwo(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.engagementTypes || form.engagementTypes.length === 0) {
      newErrors.engagementTypes = "Please select at least one Engagement Type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (validateStepOne()) setStep(2);
  }
  function handleBack() {
    setStep(1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageError) return;
    if (!validateStepTwo()) return;
    const formattedForm = {
      ...form,
      topicstartdate: formatDateForDB(form.topicstartdate),
      topicenddate: formatDateForDB(form.topicenddate),
      topicproduct: (form.topicproduct as MultiValue<topicOption>).map(
        (c) => c.value
      ),
    };
    createTopic.mutate(formattedForm);
    onClose();
  }

  const topicOptions =
    product
      ?.filter((product: any) => product.status === "Active")
      .map((product: any) => ({
        value: product.productname,
        label: product.productname,
      })) || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
            step === 1 ? "bg-blue-600" : "bg-blue-300"
          }`}
        >
          1
        </div>
        <span
          className={`text-sm ${
            step === 1 ? "text-blue-700 font-medium" : "text-gray-600"
          }`}
        >
          Basic Info
        </span>
        <span className="text-gray-400">→</span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm ${
            step === 2 ? "bg-blue-600" : "bg-blue-300"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            step === 2 ? "text-blue-700 font-medium" : "text-gray-600"
          }`}
        >
          Engagement Type
        </span>
      </div>
      <br></br>
      {step === 1 && (
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
              htmlFor="topicdescription"
              className="block mb-1 font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="topicdescription"
              name="topicdescription"
              placeholder="Description"
              value={form.topicdescription}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
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
                  topicproduct: selected,
                }))
              }
              placeholder="Select Product"
              className="text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="topicimage"
              className="block mb-1 font-medium text-gray-700"
            >
              Product Image (JPG, JPEG, PNG, max 100MB)
            </label>
            <input
              id="topicimage"
              name="topicimage"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
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
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Choose Engagement Type(s)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {engagementTypes.map((et: any, idx: number) => {
              const title = et.title || `Type ${idx + 1}`;
              // Only allow checkbox if engagement with this title is active in engagements
              const isActiveInEngagements = Array.isArray(engagements)
                ? engagements.some(
                    (eng: any) =>
                      eng.engagementType === title && eng.status === "Active"
                  )
                : false;
              return (
                <label
                  key={title}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isActiveInEngagements ? "cursor-pointer" : "text-gray-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="engagementTypes"
                    value={title}
                    checked={form.engagementTypes.includes(title)}
                    onChange={(e) => {
                      if (!isActiveInEngagements) return;
                      setForm((prev) => {
                        const checked = e.target.checked;
                        const prevTypes = prev.engagementTypes;
                        return {
                          ...prev,
                          engagementTypes: checked
                            ? [...prevTypes, title]
                            : prevTypes.filter((t) => t !== title),
                        };
                      });
                    }}
                    disabled={!isActiveInEngagements}
                  />
                  <span>{title}</span>
                </label>
              );
            })}
          </div>
          {errors.engagementTypes && (
            <p className="text-red-500 text-sm mt-1">
              {errors.engagementTypes}
            </p>
          )}
          {form.engagementTypes.length > 0 && (
            <div className="mt-6">
              <table className="w-full border border-gray-300 rounded">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Engagement Type</th>
                    <th className="p-2 text-left">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {form.engagementTypes.map((type) => {
                    const et = engagementTypes.find(
                      (et: any) => (et.title || "") === type
                    );
                    return (
                      <tr key={type} className="border-t">
                        <td className="p-2 font-medium">{type}</td>
                        <td className="p-2">
                          {et?.description || "No definition available."}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <div className="flex gap-3 justify-end pt-4">
        {step === 2 && (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {step === 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Next
          </button>
        )}
        {step === 2 && (
          <button
            type="submit"
            disabled={createTopic.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            {createTopic.isPending ? "Saving..." : "Save Product"}
          </button>
        )}
      </div>
    </form>
  );
}



// firstname: string;
//     middlename: string;
//     lastname: string;
//     preferedname: string;
//     username: string;
//     email: string;
//     profilestatus: string;
//     profilestartdate: string;
//     profileenddate: string;
//     profiletitle: string;
//     profileimage: string;
//     profileclient: MultiValue<profileOption>;

//     profilefunctional: MultiValue<functionalOption>;
    // profilerole: MultiValue<roleOption>;
    // profilepermission: MultiValue<permissionOption>;
    // profilepermissiongroup: MultiValue<pergroupOption>;