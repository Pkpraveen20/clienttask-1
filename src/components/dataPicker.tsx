import { useState } from "react";

interface DateInputProps {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}

export default function DateInput({
  id,
  name,
  label,
  value,
  placeholder = "dd-mm-yyyy",
  required = false,
  onChange,
}: DateInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="block mb-1 font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={showPicker ? "date" : "text"}
        placeholder={placeholder}
        value={value}
        onFocus={() => setShowPicker(true)}
        onBlur={(e) => {
          if (!e.target.value) setShowPicker(false);
        }}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-200"
        required={required}
      />
    </div>
  );
}
