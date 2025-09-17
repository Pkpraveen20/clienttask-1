import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type PermissionOption = { value: string; label: string };
type RoleOption = { value: string; label: string };

export default function PermissionGroupForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [form, setForm] = useState<{
    permissiongroupname: string;
    permissiongroupstatus: string;
    permissiongroupstartdate: string;
    permissiongroupenddate: string;
    permissiongroupdefinition: string;
    permissionGroupPname: MultiValue<PermissionOption>;
    permissiongrouprole: MultiValue<RoleOption>;
  }>({
    permissiongroupname: "",
    permissiongroupstatus: "Active",
    permissiongroupstartdate: "",
    permissiongroupenddate: "",
    permissiongroupdefinition: "",
    permissionGroupPname: [],
    permissiongrouprole: [],
  });

  const queryClient = useQueryClient();

  const { data: permission } = useQuery({
    queryKey: ["permission"],
    queryFn: () =>
      axios.get("http://localhost:3000/permission").then((res) => res.data),
  });

  const { data: roles, error: rolesError } = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      axios.get("http://localhost:3000/roles").then((res) => res.data),
  });

  if (rolesError) console.error("Roles fetch error:", rolesError);
  const [nextId, setNextId] = useState<number>(1);

  useEffect(() => {
    axios.get("http://localhost:3000/permissiongroup").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createPermission = useMutation({
    mutationFn: async (newPermissionGroup: any) => {
      return axios.post("http://localhost:3000/permissiongroup", {
        id: nextId,
        ...newPermissionGroup,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissiongroup"] });
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
      permissiongroupstartdate: formatDateForDB(form.permissiongroupstartdate),
      permissiongroupenddate: formatDateForDB(form.permissiongroupenddate),
      permissionGroupPname: (
        form.permissionGroupPname as MultiValue<PermissionOption>
      ).map((c) => c.value),
      permissiongrouprole: (
        form.permissiongrouprole as MultiValue<RoleOption>
      ).map((c) => c.value),
    };

    createPermission.mutate(formattedForm);
    onClose();
  }

  const PermissionOption =
    permission
      ?.filter((permission: any) => permission.permissionstatus === "Active")
      .map((permission: any) => ({
        value: permission.permissionname,
        label: permission.permissionname,
      })) || [];

  const roleOptions =
    roles
      ?.filter((role: any) => role.rolestatus === "Active")
      .map((role: any) => ({
        value: role.rolename,
        label: role.rolename,
      })) || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="permissionname"
            className="block mb-1 font-medium text-gray-700"
          >
            Permission Group Name
          </label>
          <input
            id="permissiongroupname"
            name="permissiongroupname"
            placeholder="Permission Group Name"
            value={form.permissiongroupname}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="permissiongroupstartdate"
              name="permissiongroupstartdate"
              label="Start Date"
              value={form.permissiongroupstartdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, permissiongroupstartdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="permissiongroupenddate"
              name="permissiongroupenddate"
              label="End Date"
              value={form.permissiongroupenddate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, permissiongroupenddate: val }))
              }
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="permissiongroupdefinition"
            className="block mb-1 font-medium text-gray-700"
          >
            Definition
          </label>
          <textarea
            id="permissiongroupdefinition"
            name="permissiongroupdefinition"
            placeholder="Definition"
            value={form.permissiongroupdefinition}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="permissionclient"
            className="block mb-1 font-medium text-gray-700"
          >
           Permission Name
          </label>
          <Select
            isMulti
            name="permissionGroupPname"
            options={PermissionOption}
            value={form.permissionGroupPname}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                permissionGroupPname: selected,
              }))
            }
            placeholder="Select Clients"
            className="text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="permissiongrouprole"
            className="block mb-1 font-medium text-gray-700"
          >
            Role
          </label>
          <Select
            isMulti
            name="permissiongrouprole"
            options={roleOptions}
            value={form.permissiongrouprole}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                permissiongrouprole: selected,
              }))
            }
            placeholder={"Select role"}
            className="text-sm"
          />
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
