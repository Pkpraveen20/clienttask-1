import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type ClientOption = { value: string; label: string };
type RoleOption = { value: string; label: string };

export default function PermissionForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<{
    permissionname: string;
    permissionstatus: string;
    permissionstartdate: string;
    permissionenddate: string;
    permissiondefinition: string;
    permissionclient: MultiValue<ClientOption>;
    permissionrole: MultiValue<RoleOption>;
  }>({
    permissionname: "",
    permissionstatus: "Active",
    permissionstartdate: "",
    permissionenddate: "",
    permissiondefinition: "",
    permissionclient: [],
    permissionrole: [],
  });

  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios.get("http://localhost:3000/clients").then((res) => res.data),
  });

  const { data: roles, error: rolesError } = useQuery({
    queryKey: ["roles"],
    queryFn: () =>
      axios.get("http://localhost:3000/roles").then((res) => res.data),
  });

  if (rolesError) console.error("Roles fetch error:", rolesError);
  const [nextId, setNextId] = useState<number>(1);

  useEffect(() => {
    axios.get("http://localhost:3000/permission").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createPermission = useMutation({
    mutationFn: async (newPermission: any) => {
      return axios.post("http://localhost:3000/permission", {
        id: nextId,
        ...newPermission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission"] });
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
      permissionstartdate: formatDateForDB(form.permissionstartdate),
      permissionenddate: formatDateForDB(form.permissionenddate),
      permissionclient: (form.permissionclient as MultiValue<ClientOption>).map(
        (c) => c.value
      ),
      permissionrole: (form.permissionrole as MultiValue<RoleOption>).map(
        (c) => c.value
      ),
    };

    createPermission.mutate(formattedForm);
    onClose();
  }

  const clientOptions =
    clients
      ?.filter((client: any) => client.status === "Active")
      .map((client: any) => ({
        value: client.name,
        label: client.name,
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
            Permission Name
          </label>
          <input
            id="permissionname"
            name="permissionname"
            placeholder="Permission Name"
            value={form.permissionname}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="permissionstartdate"
              name="permissionstartdate"
              label="Start Date"
              value={form.permissionstartdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, permissionstartdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="permissionenddate"
              name="permissionenddate"
              label="End Date"
              value={form.permissionenddate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, permissionenddate: val }))
              }
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="permissiondefinition"
            className="block mb-1 font-medium text-gray-700"
          >
            Definition
          </label>
          <textarea
            id="permissiondefinition"
            name="permissiondefinition"
            placeholder="Definition"
            value={form.permissiondefinition}
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
            Aligned Clients
          </label>
          <Select
            isMulti
            name="permissionclient"
            options={clientOptions}
            value={form.permissionclient}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                permissionclient: selected,
              }))
            }
            placeholder="Select Clients"
            className="text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="permissionrole"
            className="block mb-1 font-medium text-gray-700"
          >
            Role
          </label>
          <Select
            isMulti
            name="permissionrole"
            options={roleOptions}
            value={form.permissionrole}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                permissionrole: selected,
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
