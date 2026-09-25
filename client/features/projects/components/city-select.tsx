"use client";

import * as React from "react";
import { CaretDown, Check, MagnifyingGlass, PencilSimple, X } from "@phosphor-icons/react";
import { COUNTRIES_DATA, findCountry, type CountryOption, type CityOption } from "../lib/geo-countries";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface CitySelectProps {
  country: CountryOption | string | undefined;
  value: string;
  onChange: (cityName: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function CitySelect({
  country,
  value,
  onChange,
  label,
  placeholder,
  required = false,
  className,
}: CitySelectProps) {
  const { isRTL } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isCustomMode, setIsCustomMode] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const customInputRef = React.useRef<HTMLInputElement>(null);

  // Resolve country object
  const activeCountry = React.useMemo(() => {
    if (!country) return COUNTRIES_DATA[0]; // default Egypt
    if (typeof country === "string") {
      return findCountry(country) || COUNTRIES_DATA[0];
    }
    return country;
  }, [country]);

  // List of cities for this country
  const cityList: CityOption[] = React.useMemo(() => {
    return activeCountry?.cities || [];
  }, [activeCountry]);

  // Check if current value is in cityList
  const matchedCity = React.useMemo(() => {
    if (!value) return null;
    return (
      cityList.find(
        (c) =>
          c.nameEn.toLowerCase() === value.toLowerCase() ||
          c.nameAr === value ||
          c.nameAr.toLowerCase().includes(value.toLowerCase()) ||
          c.nameEn.toLowerCase().includes(value.toLowerCase())
      ) || null
    );
  }, [cityList, value]);

  // Filter cities by search
  const filteredCities = React.useMemo(() => {
    if (!search.trim()) return cityList;
    const q = search.trim().toLowerCase();
    return cityList.filter(
      (c) => c.nameEn.toLowerCase().includes(q) || c.nameAr.includes(q)
    );
  }, [cityList, search]);

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
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCity = (c: CityOption) => {
    onChange(isRTL ? c.nameAr : c.nameEn);
    setIsCustomMode(false);
    setIsOpen(false);
    setSearch("");
  };

  const handleEnableCustom = () => {
    setIsCustomMode(true);
    setIsOpen(false);
    setTimeout(() => {
      customInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)} ref={dropdownRef}>
      {label && (
        <label className="text-xs font-medium text-[#503C2C] flex items-center justify-between">
          <span>{label}</span>
          {required && <span className="text-[#B88460] text-[11px]">*</span>}
        </label>
      )}

      {isCustomMode ? (
        /* Manual Custom Input with Back to List button */
        <div className="flex items-center gap-1.5">
          <input
            ref={customInputRef}
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              placeholder || (isRTL ? "أدخل اسم المدينة..." : "Enter city name...")
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#B88460] bg-background text-[#1C1917] text-xs font-normal focus:outline-none focus:ring-1 focus:ring-[#B88460]"
          />
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(false);
              setIsOpen(true);
            }}
            title={isRTL ? "العودة للقائمة" : "Choose from list"}
            className="px-2.5 py-2.5 rounded-xl border border-border bg-card text-[#78716C] hover:text-[#1C1917] hover:border-[#B88460] text-xs transition-colors cursor-pointer"
          >
            <CaretDown size={14} />
          </button>
        </div>
      ) : (
        /* Dropdown Trigger */
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl border bg-background text-[#1C1917] text-xs font-normal transition-all duration-200 flex items-center justify-between gap-2 shadow-2xs hover:border-[#B88460]/60 cursor-pointer text-start",
            isOpen
              ? "border-[#B88460] ring-1 ring-[#B88460]/30"
              : "border-border"
          )}
        >
          <span className="truncate font-medium text-[#1C1917]">
            {matchedCity
              ? isRTL
                ? matchedCity.nameAr
                : matchedCity.nameEn
              : value ||
                placeholder ||
                (isRTL ? "اختر المدينة..." : "Select city...")}
          </span>
          <CaretDown
            size={14}
            className={cn(
              "text-[#78716C] shrink-0 transition-transform duration-200",
              isOpen && "rotate-180 text-[#B88460]"
            )}
          />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1.5 w-full min-w-[260px] max-w-[340px] rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150",
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
                placeholder={isRTL ? "بحث عن مدينة..." : "Search city..."}
                className={cn(
                  "w-full py-1.5 text-xs bg-card border border-border rounded-lg text-[#1C1917] placeholder:text-[#78716C]/70 focus:outline-none focus:border-[#B88460]",
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

          {/* List of Cities */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
            {filteredCities.map((c, idx) => {
              const isSelected =
                value === c.nameEn ||
                value === c.nameAr ||
                (isRTL ? value === c.nameAr : value === c.nameEn);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCity(c)}
                  className={cn(
                    "w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer text-start",
                    isSelected
                      ? "bg-[#503C2C] text-[#FAF7F2]"
                      : "hover:bg-secondary/70 text-[#1C1917]"
                  )}
                >
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

                  {isSelected && (
                    <Check size={14} weight="bold" className="text-[#B88460] shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredCities.length === 0 && (
              <div className="py-4 text-center text-xs text-[#78716C]">
                {isRTL ? "لم يتم العثور على مدينة مطابقة" : "No matching cities"}
              </div>
            )}
          </div>

          {/* Bottom Action: Custom Entry */}
          <div className="p-2 border-t border-border/80 bg-background/40">
            <button
              type="button"
              onClick={handleEnableCustom}
              className="w-full py-1.5 px-2.5 rounded-lg border border-dashed border-border hover:border-[#B88460] text-[11px] text-[#503C2C] hover:text-[#1C1917] flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium"
            >
              <PencilSimple size={13} className="text-[#B88460]" />
              <span>
                {isRTL ? "مدينة أخرى (كتابة يدوية)..." : "Other city (Custom type)..."}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
