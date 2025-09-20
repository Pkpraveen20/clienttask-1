import { useState } from "react";
import Select, { SingleValue } from "react-select";

export type AddressTypeOption = { value: string; label: string };
export type CityOption = { value: string; label: string };
export type StateOption = { value: string; label: string };
export type CountryOption = { value: string; label: string };

export type Address = {
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

interface AddressFormProps {
  title: string;
  address: Address;
  onChange: (updated: Address) => void;
  addressTypeOptions: AddressTypeOption[];
  cityOptions: CityOption[];
  stateOptions: StateOption[];
  countryOptions: CountryOption[];
}

export default function AddressForm({
  title,
  address,
  onChange,
  addressTypeOptions,
  cityOptions,
  stateOptions,
  countryOptions,
}: AddressFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg mb-4 shadow-sm bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg"
      >
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Address Type
            </label>
            <Select
              options={addressTypeOptions}
              value={
                address.addressType
                  ? { value: address.addressType, label: address.addressType }
                  : null
              }
              onChange={(val: SingleValue<AddressTypeOption>) =>
                onChange({ ...address, addressType: val?.value || "" })
              }
              placeholder="Select Address Type"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Address Line 1
            </label>
            <input
              placeholder="Enter address line 1"
              value={address.address1}
              onChange={(e) =>
                onChange({ ...address, address1: e.target.value })
              }
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Address Line 2
            </label>
            <input
              placeholder="Enter address line 2"
              value={address.address2}
              onChange={(e) =>
                onChange({ ...address, address2: e.target.value })
              }
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              City
            </label>
            <Select
              options={cityOptions}
              value={
                address.city
                  ? { value: address.city, label: address.city }
                  : null
              }
              onChange={(val: SingleValue<CityOption>) =>
                onChange({ ...address, city: val?.value || "" })
              }
              placeholder="Select City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              State
            </label>
            <Select
              options={stateOptions}
              value={
                address.state
                  ? { value: address.state, label: address.state }
                  : null
              }
              onChange={(val: SingleValue<StateOption>) =>
                onChange({ ...address, state: val?.value || "" })
              }
              placeholder="Select State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Zipcode
            </label>
            <input
              placeholder="Enter zipcode"
              value={address.zipcode}
              onChange={(e) =>
                onChange({ ...address, zipcode: e.target.value })
              }
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Country
            </label>
            <Select
              options={countryOptions}
              value={
                address.country
                  ? { value: address.country, label: address.country }
                  : null
              }
              onChange={(val: SingleValue<CountryOption>) =>
                onChange({ ...address, country: val?.value || "" })
              }
              placeholder="Select Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone Number
            </label>
            <input
              placeholder="Enter phone number"
              value={address.phoneNumber}
              onChange={(e) =>
                onChange({ ...address, phoneNumber: e.target.value })
              }
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              placeholder="Enter email address"
              value={address.email}
              onChange={(e) => onChange({ ...address, email: e.target.value })}
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
