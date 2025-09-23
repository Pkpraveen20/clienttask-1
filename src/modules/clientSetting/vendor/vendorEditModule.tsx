import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DateInput from "../../../components/dataPicker";
import Select, { MultiValue } from "react-select";
import AddressForm from "./addressvendor";
import ContactForm from "./contactVendor";

type ClientOption = { value: string; label: string };
type VendorTypeOption = { value: string; label: string };
type Contact = {
  contactType: string;
  contactName: string;
  contactEmail: string;
  dba: string;
  website: string;
  facebookURL: string;
  instagram: string;
};

type Address = {
  addressType: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  phoneNumber: string;
  email: string;
};

function emptyAddress(): Address {
  return {
    addressType: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phoneNumber: "",
    email: "",
  };
}

export default function VendorEditModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const [showAddress2, setShowAddress2] = useState(false);
  const [showAddress3, setShowAddress3] = useState(false);

  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () =>
      axios.get("http://localhost:3000/clients").then((res) => res.data),
  });

  const { data: vendorTypes } = useQuery({
    queryKey: ["vendortype"],
    queryFn: () =>
      axios.get("http://localhost:3000/vendorTypes").then((res) => res.data),
  });

  const { data: addressTypes } = useQuery({
    queryKey: ["addresstype"],
    queryFn: () =>
      axios.get("http://localhost:3000/addressTypes").then((res) => res.data),
  });

  const { data: cities } = useQuery({
    queryKey: ["citys"],
    queryFn: () =>
      axios.get("http://localhost:3000/citys").then((res) => res.data),
  });

  const { data: states } = useQuery({
    queryKey: ["states"],
    queryFn: () =>
      axios.get("http://localhost:3000/states").then((res) => res.data),
  });

  const { data: countries } = useQuery({
    queryKey: ["countrys"],
    queryFn: () =>
      axios.get("http://localhost:3000/countrys").then((res) => res.data),
  });

  const { data: contactTypes } = useQuery({
    queryKey: ["contactTypes"],
    queryFn: () =>
      axios.get("http://localhost:3000/contactTypes").then((res) => res.data),
  });

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:3000/vendor/${id}`);
      return res.data;
    },
  });

  const [form, setForm] = useState<{
    vendorName: string;
    vendorStatus: string;
    vendorStartDate: string;
    vendorEndDate: string;
    vendorType: VendorTypeOption | null;
    vendorDefinition: string;
    vendorClient: MultiValue<ClientOption>;
    address1: Address;
    address2: Address;
    address3: Address;
    contacts: Contact[];
  }>({
    vendorName: "",
    vendorStatus: "Active",
    vendorStartDate: "",
    vendorEndDate: "",
    vendorType: null,
    vendorDefinition: "",
    vendorClient: [],
    address1: emptyAddress(),
    address2: emptyAddress(),
    address3: emptyAddress(),
    contacts: [
      {
        contactType: "",
        contactName: "",
        contactEmail: "",
        dba: "",
        website: "",
        facebookURL: "",
        instagram: "",
      },
    ],
  });

  useEffect(() => {
    if (vendor) {
      setForm((prev) => ({
        ...prev,
        vendorName: vendor.vendorName || "",
        vendorStatus: vendor.vendorStatus || "Active",
        vendorStartDate: vendor.vendorStartDate || "",
        vendorEndDate: vendor.vendorEndDate || "",
        vendorDefinition: vendor.vendorDefinition || "",
        address1: vendor.address1 ? vendor.address1 : emptyAddress(),
        address2: vendor.address2 ? vendor.address2 : emptyAddress(),
        address3: vendor.address3 ? vendor.address3 : emptyAddress(),
        vendorClient: Array.isArray(vendor.vendorClient)
          ? vendor.vendorClient.map((p: string) => ({ value: p, label: p }))
          : [],
        vendorType: vendor.vendorType
          ? { value: vendor.vendorType, label: vendor.vendorType }
          : null,
        contacts:
          Array.isArray(vendor.contacts) && vendor.contacts.length > 0
            ? vendor.contacts
            : [
                {
                  contactType: "",
                  contactName: "",
                  contactEmail: "",
                  dba: "",
                  website: "",
                  facebookURL: "",
                  instagram: "",
                },
              ],
      }));
    }
  }, [vendor]);

  const updatevendor = useMutation({
    mutationFn: async (updatevendor: typeof form) => {
      return axios.put(`http://localhost:3000/vendor/${id}`, updatevendor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      onClose();
    },
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
      vendorStartDate: formatDateForDB(form.vendorStartDate),
      vendorEndDate: formatDateForDB(form.vendorEndDate),
      vendorType: form.vendorType?.value || "",
      vendorClient: (form.vendorClient as MultiValue<ClientOption>).map(
        (c) => c.value
      ),
    };

    updatevendor.mutate(formattedForm);
  }

  if (isLoading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  const clientOptions =
    clients?.map((client: any) => ({
      value: client.name,
      label: client.name,
    })) || [];
  const vendorTypeOptions =
    vendorTypes?.map((vt: any) => ({ value: vt.name, label: vt.name })) || [];
  const addressTypeOptions =
    addressTypes?.map((at: any) => ({ value: at.name, label: at.name })) || [];
  const cityOptions =
    cities?.map((c: any) => ({ value: c.name, label: c.name })) || [];
  const stateOptions =
    states?.map((s: any) => ({ value: s.name, label: s.name })) || [];
  const countryOptions =
    countries?.map((c: any) => ({ value: c.name, label: c.name })) || [];
  const contactOptions =
    contactTypes?.map((s: any) => ({ value: s.name, label: s.name })) || [];
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-0 shadow-none rounded-none"
    >
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Vendor Name</label>
          <input
            name="vendorName"
            value={form.vendorName}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Vendor Type</label>
          <Select
            options={vendorTypeOptions}
            value={form.vendorType}
            onChange={(val) => setForm({ ...form, vendorType: val })}
            placeholder="Select Vendor Type"
          />
        </div>

        <div className="flex gap-4">
          <DateInput
            id="vendorStartDate"
            name="vendorStartDate"
            label="Start Date"
            value={form.vendorStartDate}
            onChange={(val) => setForm({ ...form, vendorStartDate: val })}
            required
          />
          <DateInput
            id="vendorEndDate"
            name="vendorEndDate"
            label="End Date"
            value={form.vendorEndDate}
            onChange={(val) => setForm({ ...form, vendorEndDate: val })}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Definition</label>
          <textarea
            name="vendorDefinition"
            value={form.vendorDefinition}
            onChange={(e) =>
              setForm({ ...form, vendorDefinition: e.target.value })
            }
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Aligned Clients</label>
          <Select
            isMulti
            options={clientOptions}
            value={form.vendorClient}
            onChange={(selected) =>
              setForm({ ...form, vendorClient: selected })
            }
          />
        </div>

        <div>
          {/* <h3 className="font-semibold">Address 1</h3> */}
          <AddressForm
            title="Address 1"
            address={form.address1}
            onChange={(updated) => setForm({ ...form, address1: updated })}
            addressTypeOptions={addressTypeOptions}
            cityOptions={cityOptions}
            stateOptions={stateOptions}
            countryOptions={countryOptions}
          />
        </div>

        {showAddress2 ? (
          <div>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Address 2</h3>
              <button
                type="button"
                className="text-red-600"
                onClick={() => {
                  setShowAddress2(false);
                  setForm({
                    ...form,
                    address2: emptyAddress(),
                    address3: emptyAddress(),
                  });
                  setShowAddress3(false);
                }}
              >
                ✕
              </button>
            </div>
            <AddressForm
              title="Address 2"
              address={form.address2}
              onChange={(updated) => setForm({ ...form, address2: updated })}
              addressTypeOptions={addressTypeOptions}
              cityOptions={cityOptions}
              stateOptions={stateOptions}
              countryOptions={countryOptions}
            />
          </div>
        ) : (
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => setShowAddress2(true)}
          >
            + Add Address
          </button>
        )}

        {showAddress2 ? (
          showAddress3 ? (
            <div>
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Address 3</h3>
                <button
                  type="button"
                  className="text-red-600"
                  onClick={() => {
                    setShowAddress3(false);
                    setForm({ ...form, address3: emptyAddress() });
                  }}
                >
                  ✕
                </button>
              </div>
              <AddressForm
                title="Address 3"
                address={form.address3}
                onChange={(updated) => setForm({ ...form, address3: updated })}
                addressTypeOptions={addressTypeOptions}
                cityOptions={cityOptions}
                stateOptions={stateOptions}
                countryOptions={countryOptions}
              />
            </div>
          ) : (
            <button
              type="button"
              className="text-blue-600 underline"
              onClick={() => setShowAddress3(true)}
            >
              + Add Address
            </button>
          )
        ) : null}

        <div>
          <h3 className="font-semibold">Contacts</h3>
          {form.contacts.map((c, i) => (
            <div key={i} className=" justify-between items-center">
              <ContactForm
                contacts={form.contacts}
                onChange={(updated) => setForm({ ...form, contacts: updated })}
                contactOptions={contactOptions}
              />
            </div>
          ))}
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
