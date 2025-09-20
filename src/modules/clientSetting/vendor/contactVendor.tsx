import { useState } from "react";
import Select, { SingleValue } from "react-select";

type ContactOption = { value: string; label: string };

export type Contact = {
  contactType: string;
  contactName: string;
  contactEmail: string;
  dba: string;
  website: string;
  facebookURL: string;
  instagram: string;
};

interface ContactFormProps {
  contacts: Contact[];
  onChange: (updated: Contact[]) => void;
  contactOptions: ContactOption[];
}

export default function ContactForm({
  contacts,
  onChange,
  contactOptions,
}: ContactFormProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      {contacts.map((c, i) => (
        <div
          key={i}
          className="border rounded-xl shadow-sm mb-4 bg-white transition-shadow duration-200"
        >
          <button
            type="button"
            onClick={() => toggleOpen(i)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg"
          >
            <span className="font-medium text-gray-700">Contact {i + 1}</span>
            <span className="text-gray-500">{openIndex === i ? "▲" : "▼"}</span>
          </button>

          {openIndex === i && (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contact Type
                </label>
                <Select
                  options={contactOptions}
                  value={
                    c.contactType
                      ? { value: c.contactType, label: c.contactType }
                      : null
                  }
                  onChange={(val: SingleValue<ContactOption>) => {
                    const updated = [...contacts];
                    updated[i].contactType = val?.value || "";
                    onChange(updated);
                  }}
                  placeholder="Select Contact Type"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contact Name
                </label>
                <input
                  placeholder="Enter contact name"
                  value={c.contactName}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].contactName = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Contact Email
                </label>
                <input
                  placeholder="Enter contact email"
                  value={c.contactEmail}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].contactEmail = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  DBA
                </label>
                <input
                  placeholder="Enter DBA"
                  value={c.dba}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].dba = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Website
                </label>
                <input
                  placeholder="Enter website URL"
                  value={c.website}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].website = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Facebook URL
                </label>
                <input
                  placeholder="Enter Facebook URL"
                  value={c.facebookURL}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].facebookURL = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Instagram
                </label>
                <input
                  placeholder="Enter Instagram handle or URL"
                  value={c.instagram}
                  onChange={(e) => {
                    const updated = [...contacts];
                    updated[i].instagram = e.target.value;
                    onChange(updated);
                  }}
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
