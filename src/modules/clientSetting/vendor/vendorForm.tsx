import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Select, { MultiValue, SingleValue } from "react-select";
import DateInput from "../../../components/dataPicker";

type ClientOption = { value: string; label: string };
type VendorTypeOption = { value: string; label: string };
type AddressTypeOption = { value: string; label: string };
type CityOption = { value: string; label: string };
type StateOption = { value: string; label: string };
type ContryOption = { value: string; label: string };
type ContactOption = { value: string; label: string };

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

type Contact = {
  contactType: string;
  contactName: string;
  contactEmail: string;
  dba: string;
  website: string;
  facebookURL: string;
  instagram: string;
};

export default function VendorForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<{
    vendorName: string;
    vendorStatus: string;
    vendorStartDate: string;
    vendorEndDate: string;
    vendorType: VendorTypeOption | null;
    vendorDefinition: string;
    vendorClient: MultiValue<ClientOption>;
    addresses: Address[];
    contacts: Contact[];
  }>({
    vendorName: "",
    vendorStatus: "Active",
    vendorStartDate: "",
    vendorEndDate: "",
    vendorType: null,
    vendorDefinition: "",
    vendorClient: [],
    addresses: [
      {
        addressType: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phoneNumber: "",
        email: "",
      },
    ],
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

  const { data: countrys } = useQuery({
    queryKey: ["countrys"],
    queryFn: () =>
      axios.get("http://localhost:3000/countrys").then((res) => res.data),
  });

  const { data: contactTypes } = useQuery({
    queryKey: ["contactTypes"],
    queryFn: () =>
      axios.get("http://localhost:3000/contactTypes").then((res) => res.data),
  });

  const [nextId, setNextId] = useState<number>(1);

  useEffect(() => {
    axios.get("http://localhost:3000/vendor").then((res) => {
      const all = res.data as any[];
      const numericIds = (Array.isArray(all) ? all : [])
        .map((e) => Number(e?.id))
        .filter((n) => Number.isFinite(n)) as number[];
      setNextId((numericIds.length ? Math.max(...numericIds) : 0) + 1);
    });
  }, []);

  const createVendor = useMutation({
    mutationFn: async (newVendor: any) => {
      return axios.post("http://localhost:3000/vendor", {
        id: nextId,
        ...newVendor,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      vendorStartDate: formatDateForDB(form.vendorStartDate),
      vendorEndDate: formatDateForDB(form.vendorEndDate),
      vendorType: form.vendorType?.value || "",
      vendorClient: (form.vendorClient as MultiValue<ClientOption>).map(
        (c) => c.value
      ),
    };

    createVendor.mutate(payload);
  }

  function formatDateForDB(date: string) {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const clientOptions =
    clients?.map((client: any) => ({
      value: client.name,
      label: client.name,
    })) || [];

  const vendorTypeOptions =
    vendorTypes?.map((vt: any) => ({
      value: vt.name,
      label: vt.name,
    })) || [];

  const addressTypeOptions =
    addressTypes?.map((at: any) => ({
      value: at.name,
      label: at.name,
    })) || [];

  const cityOptions =
    cities?.map((c: any) => ({
      value: c.name,
      label: c.name,
    })) || [];
  const StateOption =
    states?.map((s: any) => ({
      value: s.name,
      label: s.name,
    })) || [];
  const ContryOption =
    countrys?.map((c: any) => ({
      value: c.name,
      label: c.name,
    })) || [];
  const ContactOption =
    contactTypes?.map((s: any) => ({
      value: s.name,
      label: s.name,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 shadow rounded space-y-4 overflow-y h-100"
    >
      <div>
        <label className="block mb-1 font-medium">Vendor Name</label>
        <input
          name="vendorName"
          value={form.vendorName}
          onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
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
          onChange={(selected) => setForm({ ...form, vendorClient: selected })}
        />
      </div>

      <div>
        <h3 className="font-semibold flex items-center justify-between">
          Addresses
          {form.addresses.length < 3 && (
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  addresses: [
                    ...form.addresses,
                    {
                      addressType: "",
                      address1: "",
                      address2: "",
                      city: "",
                      state: "",
                      zipcode: "",
                      country: "",
                      phoneNumber: "",
                      email: "",
                    },
                  ],
                })
              }
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              + Add Address
            </button>
          )}
        </h3>

        {form.addresses.map((addr, i) => (
          <div key={i} className="border p-3 rounded mb-2 space-y-2 relative">
            {i > 0 && (
              <button
                type="button"
                onClick={() => {
                  const updated = [...form.addresses];
                  updated.splice(i, 1);
                  setForm({ ...form, addresses: updated });
                }}
                className="absolute top-2 right-2 text-red-500 text-sm"
              >
                ✕
              </button>
            )}

            <Select
              options={addressTypeOptions}
              value={
                addr.addressType
                  ? { value: addr.addressType, label: addr.addressType }
                  : null
              }
              onChange={(val: SingleValue<AddressTypeOption>) => {
                const updated = [...form.addresses];
                updated[i].addressType = val?.value || "";
                setForm({ ...form, addresses: updated });
              }}
              placeholder="Select Address Type"
            />
            <input
              placeholder="Address-1"
              value={addr.address1}
              onChange={(e) => {
                const updated = [...form.addresses];
                updated[i].address1 = e.target.value;
                setForm({ ...form, addresses: updated });
              }}
              className="border p-2 rounded w-full"
              required={i === 0} // first one compulsory
            />
            <input
              placeholder="Address-2"
              value={addr.address2}
              onChange={(e) => {
                const updated = [...form.addresses];
                updated[i].address2 = e.target.value;
                setForm({ ...form, addresses: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <Select
              options={cityOptions}
              value={addr.city ? { value: addr.city, label: addr.city } : null}
              onChange={(val: SingleValue<CityOption>) => {
                const updated = [...form.addresses];
                updated[i].city = val?.value || "";
                setForm({ ...form, addresses: updated });
              }}
              placeholder="Select City"
            />
            <Select
              options={StateOption}
              value={
                addr.state ? { value: addr.state, label: addr.state } : null
              }
              onChange={(val: SingleValue<StateOption>) => {
                const updated = [...form.addresses];
                updated[i].state = val?.value || "";
                setForm({ ...form, addresses: updated });
              }}
              placeholder="Select State"
            />
            <input
              placeholder="Zipcode"
              value={addr.zipcode}
              onChange={(e) => {
                const updated = [...form.addresses];
                updated[i].zipcode = e.target.value;
                setForm({ ...form, addresses: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <Select
              options={ContryOption}
              value={
                addr.country
                  ? { value: addr.country, label: addr.country }
                  : null
              }
              onChange={(val: SingleValue<ContryOption>) => {
                const updated = [...form.addresses];
                updated[i].country = val?.value || "";
                setForm({ ...form, addresses: updated });
              }}
              placeholder="Select Country"
            />
            <input
              placeholder="Phone Number"
              value={addr.phoneNumber}
              onChange={(e) => {
                const updated = [...form.addresses];
                updated[i].phoneNumber = e.target.value;
                setForm({ ...form, addresses: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Email"
              value={addr.email}
              onChange={(e) => {
                const updated = [...form.addresses];
                updated[i].email = e.target.value;
                setForm({ ...form, addresses: updated });
              }}
              className="border p-2 rounded w-full"
            />
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold">Contacts</h3>
        {form.contacts.map((c, i) => (
          <div key={i} className="border p-3 rounded mb-2 space-y-2">
            <Select
              options={ContactOption}
              value={
                c.contactType
                  ? { value: c.contactType, label: c.contactType }
                  : null
              }
              onChange={(val: SingleValue<ContactOption>) => {
                const updated = [...form.contacts];
                updated[i].contactType = val?.value || "";
                setForm({ ...form, contacts: updated });
              }}
              placeholder="Select Contact Type"
            />

            <input
              placeholder="Contact Name"
              value={c.contactName}
              onChange={(e) => {
                const updated = [...form.contacts];
                updated[i].contactName = e.target.value;
                setForm({ ...form, contacts: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Contact Email"
              value={c.contactEmail}
              onChange={(e) => {
                const updated = [...form.contacts];
                updated[i].contactEmail = e.target.value;
                setForm({ ...form, contacts: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="DBA"
              value={c.dba}
              onChange={(e) => {
                const updated = [...form.contacts];
                updated[i].dba = e.target.value;
                setForm({ ...form, contacts: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Website"
              value={c.website}
              onChange={(e) => {
                const updated = [...form.contacts];
                updated[i].website = e.target.value;
                setForm({ ...form, contacts: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Facebook URL"
              value={c.facebookURL}
              onChange={(e) => {
                const updated = [...form.contacts];
                updated[i].facebookURL = e.target.value;
                setForm({ ...form, contacts: updated });
              }}
              className="border p-2 rounded w-full"
            />
            <input
              placeholder="Instagram"
              value={c.instagram}
              onChange={(e) => {
                const updated = [...form.contacts];
                updated[i].instagram = e.target.value;
                setForm({ ...form, contacts: updated });
              }}
              className="border p-2 rounded w-full"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded border"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
