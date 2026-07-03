import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  className?: string;
  /** Which of the site's two typefaces drives the trigger + option list. */
  font?: "sans" | "mono";
  chevronClassName?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  className = "",
  font = "sans",
  chevronClassName = "h-4 w-4 text-brand-neutral/50",
}) => {
  const fontClass = font === "mono" ? "font-mono" : "font-sans";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${fontClass} w-full flex items-center justify-between gap-2 text-left cursor-pointer ${className}`}
      >
        <span className={`truncate ${selected ? "" : "text-brand-neutral/50"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`shrink-0 transition-transform ${chevronClassName} ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`${fontClass} absolute z-30 mt-1.5 w-full max-h-64 overflow-y-auto bg-white border border-brand-secondary/15 rounded-sm shadow-lg py-1 scrollbar-thin`}
        >
          {options.map((opt) => (
            <li
              key={opt.value || "__placeholder__"}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                opt.value === value
                  ? "bg-brand-secondary/10 text-brand-secondary font-semibold"
                  : "text-brand-text hover:bg-brand-secondary/5"
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
