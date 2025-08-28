import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type ClientOption = { value: string; label: string };

export default function FunctionalAreaForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [form, setForm] = useState<{
    functionalname: string;
    functionaltype: string;
    functionalstatus: string;
    functionalstartdate: string;
    functionalenddate: string;
    functionaldescription: string;
    functionalclient: MultiValue<ClientOption>;
  }>({
    functionalname: "",
    functionaltype: "",
    functionalstatus: "Active",
    functionalstartdate: "",
    functionalenddate: "",
    functionaldescription: "",
    functionalclient: [],
  });

  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios.get("http://localhost:3000/clients").then((res) => res.data),
  });

  const createFunctionalArea = useMutation({
    mutationFn: (newFunctionalArea: any) =>
      axios.post("http://localhost:3000/functionalarea", newFunctionalArea),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["functionalareas"] }),
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
      functionalstartdate: formatDateForDB(form.functionalstartdate),
      functionalenddate: formatDateForDB(form.functionalenddate),
      functionalclient: (form.functionalclient as MultiValue<ClientOption>).map(
        (c) => c.value
      ),
    };

    createFunctionalArea.mutate(formattedForm);
    onClose();
  }

  const clientOptions =
    clients
      ?.filter((client: any) => client.status === "Active")
      .map((client: any) => ({
        value: client.name,
        label: client.name,
      })) || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="functionalname"
            className="block mb-1 font-medium text-gray-700"
          >
            Functional Area Name
          </label>
          <input
            id="functionalname"
            name="functionalname"
            placeholder="Functional Area Name"
            value={form.functionalname}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div>
          <label
            htmlFor="functionaltype"
            className="block mb-1 font-medium text-gray-700"
          >
            Functional Area Type
          </label>
          <input
            id="functionaltype"
            name="functionaltype"
            placeholder="Functional Area Type"
            value={form.functionaltype}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <DateInput
              id="functionalstartdate"
              name="functionalstartdate"
              label="Start Date"
              value={form.functionalstartdate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, functionalstartdate: val }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <DateInput
              id="functionalenddate"
              name="functionalenddate"
              label="End Date"
              value={form.functionalenddate}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, functionalenddate: val }))
              }
              required
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="functionaldescription"
            className="block mb-1 font-medium text-gray-700"
          >
            Definition
          </label>
          <textarea
            id="functionaldescription"
            name="functionaldescription"
            placeholder="Definition"
            value={form.functionaldescription}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        <div>
          <label
            htmlFor="functionalclient"
            className="block mb-1 font-medium text-gray-700"
          >
            Aligned Clients
          </label>
          <Select
            isMulti
            name="functionalclient"
            options={clientOptions}
            value={form.functionalclient}
            onChange={(selected) =>
              setForm((prev) => ({
                ...prev,
                functionalclient: selected,
              }))
            }
            placeholder="Select Clients"
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
