import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DateInput from "../../../components/dataPicker";

export default function ClientForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    status: "Active",
    startdate: "",
    enddate: "",
    address: "",
    description: "",
  });
  const queryClient = useQueryClient();

  const createClient = useMutation({
    mutationFn: (newClient: typeof form) =>
      axios.post("http://localhost:3000/clients", newClient),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
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
      startdate: formatDateForDB(form.startdate),
      enddate: formatDateForDB(form.enddate),
    };
    createClient.mutate(formattedForm);
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
            htmlFor="name"
            className="block mb-1 font-medium text-gray-700"
          >
            Client Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Client Name"
            value={form.name}
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
            htmlFor="roledescription"
            className="block mb-1 font-medium text-gray-700"
          >
            Client Address
          </label>
          <textarea
            id="address"
            name="address"
            placeholder="Client Address"
            value={form.address}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block mb-1 font-medium text-gray-700"
          >
            Client Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Client Description"
            value={form.description}
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
