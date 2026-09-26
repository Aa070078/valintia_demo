"use client";

import * as React from "react";
import { CaretDown, Check, MagnifyingGlass, X } from "@phosphor-icons/react";
import { COUNTRIES_DATA, type CountryOption, findCountry } from "../lib/geo-countries";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface CountrySelectProps {
  value: string; // country name (either EN or AR) or code
  onChange: (country: CountryOption) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CountrySelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className,
}: CountrySelectProps) {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Find currently selected country
  const selectedCountry = React.useMemo(() => {
    return findCountry(value) || COUNTRIES_DATA[0]; // fallback to Egypt
  }, [value]);

  // Filter countries based on search
  const filteredCountries = React.useMemo(() => {
    if (!search.trim()) return COUNTRIES_DATA;
    const q = search.trim().toLowerCase();
    return COUNTRIES_DATA.filter(
      (c) =>
        c.nameEn.toLowerCase().includes(q) ||
        c.nameAr.includes(q) ||
        c.dialCode.includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [search]);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (country: CountryOption) => {
    onChange(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-medium text-[#503C2C] flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-[#B88460] text-[11px]">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border bg-background text-[#1C1917] text-xs font-normal transition-all duration-200 flex items-center justify-between gap-2 shadow-2xs hover:border-[#B88460]/60 cursor-pointer text-start min-h-[44px] touch-manipulation",
          isOpen
            ? "border-[#B88460] ring-1 ring-[#B88460]/30"
            : "border-border"
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          {value ? (
            <>
              <span className="text-base shrink-0 leading-none">
                {selectedCountry.flag}
              </span>
              <span className="truncate font-medium text-[#1C1917]">
                {isRTL ? selectedCountry.nameAr : selectedCountry.nameEn}
              </span>
              <span className="text-[10px] text-[#78716C] font-mono shrink-0">
                {selectedCountry.dialCode}
              </span>
            </>
          ) : (
            <span className="text-[#78716C] truncate">
              {placeholder || (isRTL ? "اختار البلد..." : "Select country...")}
            </span>
          )}
        </div>
        <CaretDown
          size={14}
          className={cn(
            "text-[#78716C] shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-[#B88460]"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1.5 w-full min-w-[280px] max-w-[380px] rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150",
            isRTL ? "right-0" : "left-0"
          )}
        >
          {/* Search Header */}
          <div className="p-2.5 border-b border-border/80 bg-background/50">
            <div className="relative flex items-center">
              <MagnifyingGlass
                size={14}
                className={cn(
                  "absolute text-[#78716C]",
                  isRTL ? "right-2.5" : "left-2.5"
                )}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isRTL ? "دور باسم البلد أو كود الاتصال..." : "Search country or code..."
                }
                className={cn(
                  "w-full py-2 sm:py-1.5 text-base sm:text-xs bg-card border border-border rounded-lg text-[#1C1917] placeholder:text-[#78716C]/70 focus:outline-none focus:border-[#B88460] touch-manipulation",
                  isRTL ? "pr-8 pl-7 text-right" : "pl-8 pr-7 text-left"
                )}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className={cn(
                    "absolute text-[#78716C] hover:text-[#1C1917]",
                    isRTL ? "left-2.5" : "right-2.5"
                  )}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* List of Countries */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#78716C] font-normal">
                {isRTL ? "ملقناش البلد دي" : "No countries found"}
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={cn(
                      "w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer text-start",
                      isSelected
                        ? "bg-[#503C2C] text-[#FAF7F2]"
                        : "hover:bg-secondary/70 text-[#1C1917]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base shrink-0 leading-none">{c.flag}</span>
                      <div className="truncate">
                        <span className="font-medium">
                          {isRTL ? c.nameAr : c.nameEn}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] mx-1.5 opacity-60",
                            isSelected ? "text-[#FAF7F2]" : "text-[#78716C]"
                          )}
                        >
                          {isRTL ? c.nameEn : c.nameAr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] font-mono px-1.5 py-0.5 rounded",
                          isSelected
                            ? "bg-white/20 text-[#FAF7F2]"
                            : "bg-secondary text-[#78716C]"
                        )}
                      >
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <Check size={14} weight="bold" className="text-[#B88460]" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
