import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DateInput from "../../components/dataPicker";

export default function RoleForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    rolename: "",
    roletype: "",
    rolestatus: "Active",
    rolestartdate: "",
    roleenddate: "",
    roledescription: "",
  });
  const queryClient = useQueryClient();

  const createrole = useMutation({
    mutationFn: (newRole: typeof form) =>
      axios.post("http://localhost:3000/roles", newRole),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      rolestartdate: formatDateForDB(form.rolestartdate),
      roleenddate: formatDateForDB(form.roleenddate),
    };
    createrole.mutate(formattedForm);
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="rolename"
            className="block mb-1 font-medium text-gray-700"
          >
            Role Name
          </label>
          <input
            id="rolename"
            name="rolename"
            placeholder="Role Name"
            value={form.rolename}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label
            htmlFor="roletype"
            className="block mb-1 font-medium text-gray-700"
          >
            Role Type
          </label>
          <input
            id="roletype"
            name="roletype"
            placeholder="Role Type"
            value={form.roletype}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="rolestartdate"
              name="rolestartdate"
              label="Start Date"
              value={form.rolestartdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, rolestartdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="roleenddate"
              name="roleenddate"
              label="End Date"
              value={form.roleenddate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, roleenddate: val }))
              }
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="roledescription"
            className="block mb-1 font-medium text-gray-700"
          >
            Role Description
          </label>
          <textarea
            id="roledescription"
            name="roledescription"
            placeholder="Role Description"
            value={form.roledescription}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
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
