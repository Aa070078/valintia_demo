"use client";

import * as React from "react";
import { CaretDown, Check, MagnifyingGlass, Phone, X } from "@phosphor-icons/react";
import { COUNTRIES_DATA, findCountryByDialCode, type CountryOption } from "../lib/geo-countries";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface PhoneInputWithCountryProps {
  phone: string;
  countryCode: string; // e.g. "+20", "+966"
  onChangePhone: (phone: string) => void;
  onChangeCountryCode: (code: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  description?: string;
}

export function PhoneInputWithCountry({
  phone,
  countryCode,
  onChangePhone,
  onChangeCountryCode,
  label,
  placeholder,
  required = false,
  className,
  description,
}: PhoneInputWithCountryProps) {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Active country matching dialCode
  const activeCountry = React.useMemo(() => {
    return findCountryByDialCode(countryCode) || COUNTRIES_DATA[0]; // fallback to Egypt
  }, [countryCode]);

  // Filter countries for dial code dropdown
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

  // Close dropdown on outside click
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
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCountry = (country: CountryOption) => {
    onChangeCountryCode(country.dialCode);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-[#503C2C] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Phone size={13} className="text-[#B88460]" />
            <span>{label}</span>
          </span>
          {required && <span className="text-[#B88460] text-[11px]">*</span>}
        </label>
      )}

      {/* Unified Input Container */}
      <div
        className={cn(
          "relative flex items-center rounded-xl border border-border bg-background transition-all shadow-2xs focus-within:border-[#B88460] focus-within:ring-1 focus-within:ring-[#B88460]/40",
          isOpen && "border-[#B88460]"
        )}
      >
        {/* Country Code Trigger Button */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#1C1917] hover:bg-secondary/50 rounded-s-xl transition-colors cursor-pointer select-none"
            title={isRTL ? "تغيير كود الدولة" : "Change country code"}
          >
            <span className="text-base leading-none">{activeCountry.flag}</span>
            <span className="font-mono text-xs font-medium text-[#503C2C] ltr:direction-ltr" dir="ltr">
              {activeCountry.dialCode}
            </span>
            <CaretDown
              size={12}
              className={cn(
                "text-[#78716C] transition-transform duration-200",
                isOpen && "rotate-180 text-[#B88460]"
              )}
            />
          </button>

          {/* Dial Code Dropdown Menu */}
          {isOpen && (
            <div
              className={cn(
                "absolute top-full z-50 mt-1.5 w-[290px] rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150",
                isRTL ? "right-0" : "left-0"
              )}
            >
              {/* Search Header */}
              <div className="p-2 border-b border-border/80 bg-background/50">
                <div className="relative flex items-center">
                  <MagnifyingGlass
                    size={13}
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
                      isRTL ? "ابحث بالدولة أو الكود..." : "Search country or code..."
                    }
                    className={cn(
                      "w-full py-1.5 text-xs bg-card border border-border rounded-lg text-[#1C1917] placeholder:text-[#78716C]/70 focus:outline-none focus:border-[#B88460]",
                      isRTL ? "pr-7 pl-6 text-right" : "pl-7 pr-6 text-left"
                    )}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className={cn(
                        "absolute text-[#78716C] hover:text-[#1C1917]",
                        isRTL ? "left-2" : "right-2"
                      )}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Country List */}
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                {filteredCountries.map((c) => {
                  const isSelected = activeCountry.dialCode === c.dialCode && activeCountry.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCountry(c)}
                      className={cn(
                        "w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer text-start",
                        isSelected
                          ? "bg-[#503C2C] text-[#FAF7F2]"
                          : "hover:bg-secondary/70 text-[#1C1917]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0 leading-none">{c.flag}</span>
                        <span className="truncate font-medium">
                          {isRTL ? c.nameAr : c.nameEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded",
                            isSelected
                              ? "bg-white/20 text-[#FAF7F2]"
                              : "bg-secondary text-[#78716C]"
                          )}
                          dir="ltr"
                        >
                          {c.dialCode}
                        </span>
                        {isSelected && (
                          <Check size={13} weight="bold" className="text-[#B88460]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-border/80 shrink-0" />

        {/* Telephone Number Input */}
        <input
          type="tel"
          required={required}
          value={phone || ""}
          onChange={(e) => onChangePhone(e.target.value)}
          placeholder={
            placeholder ||
            (isRTL ? "010 1234 5678" : "e.g. 10 1234 5678")
          }
          dir="ltr"
          className={cn(
            "w-full px-3.5 py-2.5 bg-transparent text-[#1C1917] text-xs font-normal focus:outline-none placeholder:text-[#78716C]/60",
            isRTL ? "text-right" : "text-left"
          )}
        />
      </div>

      {description && (
        <span className="text-[#78716C] text-[10px] font-normal leading-tight">
          {description}
        </span>
      )}
    </div>
  );
}
