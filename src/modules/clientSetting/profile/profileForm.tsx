import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type profileOption = { value: string; label: string };
type functionalOption = { value: string; label: string };
type roleOption = { value: string; label: string };
type permissionOption = { value: string; label: string };
type pergroupOption = { value: string; label: string };

export default function ProfileForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<{
    firstname: string;
    middlename: string;
    lastname: string;
    preferedname: string;
    username: string;
    email: string;
    profilestatus: string;
    profilestartdate: string;
    profileenddate: string;
    profiletitle: string;
    profileimage: string;
    profileclient: MultiValue<profileOption>;
    profilefunctional: MultiValue<functionalOption>;
    profilerole: MultiValue<roleOption>;
    profilepermission: MultiValue<permissionOption>;
    profilepermissiongroup: MultiValue<pergroupOption>;
  }>({
    firstname: "",
    middlename: "",
    lastname: "",
    preferedname: "",
    username: "",
    email: "",
    profilestatus: "Active",
    profilestartdate: "",
    profileenddate: "",
    profiletitle: "",
    profileimage: "",
    profileclient: [],
    profilefunctional: [],
    profilerole: [],
    profilepermission: [],
    profilepermissiongroup: [],
  });
  const [nextId, setNextId] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios.get("http://localhost:3000/clients").then((res) => res.data),
  });

  const { data: functionalarea } = useQuery({
    queryKey: ["functionalarea"],
    queryFn: () =>
      axios.get("http://localhost:3000/functionalarea").then((res) => res.data),
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      axios.get("http://localhost:3000/roles").then((res) => res.data),
  });

  const { data: permission } = useQuery({
    queryKey: ["permission"],
    queryFn: () =>
      axios.get("http://localhost:3000/permission").then((res) => res.data),
  });

  const { data: permissiongroup } = useQuery({
    queryKey: ["permissiongroup"],
    queryFn: () =>
      axios
        .get("http://localhost:3000/permissiongroup")
        .then((res) => res.data),
  });

  const [imageError, setImageError] = useState<string>("");
  const queryClient = useQueryClient();

  useEffect(() => {
    axios.get("http://localhost:3000/profile").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createprofile = useMutation({
    mutationFn: async (newprofile: typeof form) => {
      return axios.post("http://localhost:3000/profile", {
        id: nextId,
        ...newprofile,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
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
      setForm((prev) => ({ ...prev, profileimage: reader.result as string }));
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

    if (!form.username.trim()) {
      newErrors.username = "Topic Name is required";
    }
    if (!form.profiletitle.trim()) {
      newErrors.profiletitle = "Topic Description is required";
    }
    if (!form.profilestartdate) {
      newErrors.profilestartdate = "Start Date is required";
    }
    if (!form.profileenddate) {
      newErrors.profileenddate = "End Date is required";
    }
    if (!form.profileimage) {
      newErrors.profileimage = "Topic Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  //   function validateStepTwo(): boolean {
  //     const newErrors: Record<string, string> = {};
  //     if (!form.engagementTypes || form.engagementTypes.length === 0) {
  //       newErrors.engagementTypes = "Please select at least one Engagement Type";
  //     }
  //     setErrors(newErrors);
  //     return Object.keys(newErrors).length === 0;
  //   }

  function handleNext() {
    if (validateStepOne()) setStep(2);
  }
  function handleBack() {
    setStep(1);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (imageError) return;
    // if (!validateStepTwo()) return;
    const formattedForm = {
      ...form,
      profilestartdate: formatDateForDB(form.profilestartdate),
      profileenddate: formatDateForDB(form.profileenddate),
      profileclient: (form.profileclient as MultiValue<profileOption>).map(
        (c) => c.value
      ),
      profilefunctional: (
        form.profilefunctional as MultiValue<functionalOption>
      ).map((c) => c.value),
      profilerole: (form.profilerole as MultiValue<roleOption>).map(
        (c) => c.value
      ),
      profilepermission: (
        form.profilepermission as MultiValue<permissionOption>
      ).map((c) => c.value),
      profilepermissiongroup: (
        form.profilepermissiongroup as MultiValue<pergroupOption>
      ).map((c) => c.value),
    };
    createprofile.mutate(formattedForm);
    onClose();
  }

  const profileOptions =
    clients
      ?.filter((clients: any) => clients.status === "Active")
      .map((clients: any) => ({
        value: clients.name,
        label: clients.name,
      })) || [];

  const functionalOption =
    functionalarea
      ?.filter(
        (functionalarea: any) => functionalarea.functionalstatus === "Active"
      )
      .map((functionalarea: any) => ({
        value: functionalarea.functionalname,
        label: functionalarea.functionalname,
      })) || [];

  const roleOption =
    roles
      ?.filter((roles: any) => roles.rolestatus === "Active")
      .map((roles: any) => ({
        value: roles.rolename,
        label: roles.rolename,
      })) || [];

      console.log(roleOption);
      console.log(roles);
      
      

  const permissionOption =
    permission
      ?.filter((permission: any) => permission.permissionstatus === "Active")
      .map((permission: any) => ({
        value: permission.permissionname,
        label: permission.permissionname,
      })) || [];
  const pergroupOption =
    permissiongroup
      ?.filter(
        (permissiongroup: any) =>
          permissiongroup.permissiongroupstatus === "Active"
      )
      .map((permissiongroup: any) => ({
        value: permissiongroup.permissiongroupname,
        label: permissiongroup.permissiongroupname,
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
          Profile Information
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
          Functional,Role & permisssion
        </span>
      </div>
      <br></br>
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="firstname"
              className="block mb-1 font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              id="firstname"
              name="firstname"
              placeholder="First Name"
              value={form.firstname}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="middlename"
              className="block mb-1 font-medium text-gray-700"
            >
              Middle Name
            </label>
            <input
              id="middlename"
              name="middlename"
              placeholder="Middle Name"
              value={form.middlename}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastname"
              className="block mb-1 font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              id="lastname"
              name="lastname"
              placeholder="Last Name"
              value={form.lastname}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="preferedname"
              className="block mb-1 font-medium text-gray-700"
            >
              Prefered Name
            </label>
            <input
              id="preferedname"
              name="preferedname"
              placeholder="Prefered Name"
              value={form.preferedname}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="block mb-1 font-medium text-gray-700"
            >
              UserName
            </label>
            <input
              id="username"
              name="username"
              placeholder="UserName"
              value={form.username}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-1 font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              placeholder="email"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <DateInput
                id="profilestartdate"
                name="profilestartdate"
                label="Start Date"
                value={form.profilestartdate}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, profilestartdate: val }))
                }
                required
              />
            </div>
            <div className="flex-1">
              <DateInput
                id="profileenddate"
                name="profileenddate"
                label="End Date"
                value={form.profileenddate}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, profileenddate: val }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="profiletitle"
              className="block mb-1 font-medium text-gray-700"
            >
              Title
            </label>
            <textarea
              id="profiletitle"
              name="profiletitle"
              placeholder="Title"
              value={form.profiletitle}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label
              htmlFor="profileclient"
              className="block mb-1 font-medium text-gray-700"
            >
              Client Name
            </label>
            <Select
              isMulti
              name="profileclient"
              options={profileOptions}
              value={form.profileclient}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  profileclient: selected,
                }))
              }
              placeholder="Select Client"
              className="text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="profileimage"
              className="block mb-1 font-medium text-gray-700"
            >
              Profile Image (JPG, JPEG, PNG, max 100MB)
            </label>
            <input
              id="profileimage"
              name="profileimage"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
              required
            />
            {imageError && (
              <div className="text-red-500 text-sm mt-1">{imageError}</div>
            )}
            {form.profileimage && !imageError && (
              <img
                src={form.profileimage}
                alt="Preview"
                className="mt-2 max-h-32"
              />
            )}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="profilefunctional"
              className="block mb-1 font-medium text-gray-700"
            >
              Functional Area Name
            </label>
            <Select
              isMulti
              name="profilefunctional"
              options={functionalOption}
              value={form.profilefunctional}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  profilefunctional: selected,
                }))
              }
              placeholder="Select Functional"
              className="text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="profilerole"
              className="block mb-1 font-medium text-gray-700"
            >
              Roles
            </label>
            <Select
              isMulti
              name="profilerole"
              options={roleOption}
              value={form.profilerole}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  profilerole: selected,
                }))
              }
              placeholder="Select Role"
              className="text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="profilepermission"
              className="block mb-1 font-medium text-gray-700"
            >
              Permission Name
            </label>
            <Select
              isMulti
              name="profilepermission"
              options={permissionOption}
              value={form.profilepermission}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  profilepermission: selected,
                }))
              }
              placeholder="Select Permission"
              className="text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="profilepermissiongroup"
              className="block mb-1 font-medium text-gray-700"
            >
              Permission Group Name
            </label>
            <Select
              isMulti
              name="profilepermissiongroup"
              options={pergroupOption}
              value={form.profilepermissiongroup}
              onChange={(selected) =>
                setForm((prev) => ({
                  ...prev,
                  profilepermissiongroup: selected,
                }))
              }
              placeholder="Select Permission Group"
              className="text-sm"
            />
          </div>
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
            disabled={createprofile.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
          >
            {createprofile.isPending ? "Saving..." : "Save Product"}
          </button>
        )}
      </div>
    </form>
  );
}
