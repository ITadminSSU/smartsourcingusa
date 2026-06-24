"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
};

export default function PasswordField({
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  className,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          className ??
          "w-full rounded-lg border border-gray-300 pl-3 pr-12 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2c84c4]"
        }
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
