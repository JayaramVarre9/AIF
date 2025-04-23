// components/ui/select.tsx
import React from "react";

export const Select = ({
  children,
  defaultValue,
  className,
}: {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
}) => {
  return (
    <select
      defaultValue={defaultValue}
      className={`w-full p-2 rounded border text-black ${className}`}
    >
      {children}
    </select>
  );
};

export const SelectItem = ({
  value,
  children,
  disabled = false,
}: {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  return (
    <option value={value} disabled={disabled}>
      {children}
    </option>
  );
};
