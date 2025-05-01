import React from 'react';

export const Select = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative w-full">{children}</div>;
};

export const SelectTrigger = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-2 border rounded bg-white text-left"
    >
      {children}
    </button>
  );
};

export const SelectValue = ({
  value,
}: {
  value: string | undefined;
}) => {
  return <span>{value ?? 'Select an option'}</span>;
};

export const SelectContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="absolute mt-1 w-full border rounded bg-white shadow z-10">
      {children}
    </div>
  );
};

export const SelectItem = ({
  value,
  children,
  onClick,
  disabled = false,
}: {
  value: string;
  children: React.ReactNode;
  onClick?: (value: string) => void;
  disabled?: boolean;
}) => {
  return (
    <div
      onClick={() => !disabled && onClick?.(value)}
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </div>
  );
};
