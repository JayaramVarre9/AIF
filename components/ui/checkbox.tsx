// components/ui/checkbox.tsx
import React from "react";

export const Checkbox = ({ checked, onCheckedChange }: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) => {
  return (
    <input
      type="checkbox"
      className="form-checkbox h-5 w-5 text-blue-600"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
};
