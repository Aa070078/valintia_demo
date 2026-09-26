"use client";

import * as React from "react";
import { Plus } from "@phosphor-icons/react";
import type { SpaceItem } from "../types";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export const DEFAULT_SPACES: Array<{
  id: string;
  name: string;
  imageSrc: string;
  defaultIncluded: boolean;
  defaultCount: number;
}> = [
  {
    id: "living",
    name: "Living Room",
    imageSrc:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: true,
    defaultCount: 1,
  },
  {
    id: "dining",
    name: "Dining Room",
    imageSrc:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: true,
    defaultCount: 1,
  },
  {
    id: "kitchen",
    name: "Kitchen",
    imageSrc:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: true,
    defaultCount: 1,
  },
  {
    id: "master_bedroom",
    name: "Master Bedroom",
    imageSrc:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: true,
    defaultCount: 1,
  },
  {
    id: "bedroom",
    name: "Bedroom",
    imageSrc:
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: false,
    defaultCount: 1,
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    imageSrc:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: true,
    defaultCount: 2,
  },
  {
    id: "terrace",
    name: "Terrace",
    imageSrc:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: false,
    defaultCount: 1,
  },
  {
    id: "outdoor",
    name: "Outdoor",
    imageSrc:
      "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=300&q=80",
    defaultIncluded: false,
    defaultCount: 1,
  },
];

interface SpacesSelectorProps {
  spaces: SpaceItem[];
  onChange: (spaces: SpaceItem[]) => void;
}

export function SpacesSelector({ spaces, onChange }: SpacesSelectorProps) {
  const { t } = useLanguage();
  const [showAddCustom, setShowAddCustom] = React.useState(false);
  const [customName, setCustomName] = React.useState("");

  const handleToggle = (id: string, name?: string) => {
    const existing = spaces.find((s) => s.id === id);
    if (existing) {
      onChange(
        spaces.map((s) => (s.id === id ? { ...s, included: !s.included } : s))
      );
    } else {
      onChange([...spaces, { id, name: name || id, spaceType: id, quantity: 1, count: 1, included: true }]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newId = `custom_${Date.now()}`;
    onChange([
      ...spaces,
      {
        id: newId,
        name: customName.trim(),
        customName: customName.trim(),
        spaceType: "custom",
        included: true,
        count: 1,
        quantity: 1,
      },
    ]);
    setCustomName("");
    setShowAddCustom(false);
  };

  const activeCount = spaces.filter((s) => s.included).length;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
      {/* Left Column: Visual Architectural Isometric Floorplan (Reference Screen 3) */}
      <div className="overflow-hidden rounded-3xl border border-border/70 bg-card p-4 sm:p-6 lg:col-span-6 flex flex-col shadow-editorial">
        {/* Isometric 3D Model Floorplan View */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#EDE7DF]/30 flex items-center justify-center border border-border/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
            alt="Architectural Spatial Model"
            className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
          />

          {/* Floating Subtle Spatial Badge */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-card/90 px-4 py-2.5 backdrop-blur-md border border-white/60 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("step4.spatial_badge")}
            </span>
            <span className="text-xs font-semibold text-foreground">
              {activeCount} {t("step4.selected_count")}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Spaces Toggle List (Reference Screen 3) */}
      <div className="flex flex-col gap-2.5 lg:col-span-6">
        {DEFAULT_SPACES.map((spaceDef) => {
          const activeSpace = spaces.find((s) => s.id === spaceDef.id);
          const isIncluded = activeSpace ? activeSpace.included : spaceDef.defaultIncluded;
          const localizedName = t(`space.${spaceDef.id}`) || spaceDef.name;

          return (
            <div
              key={spaceDef.id}
              onClick={() => handleToggle(spaceDef.id, localizedName)}
              className={cn(
                "group flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 transition-all duration-200 cursor-pointer select-none active:scale-[0.99]",
                isIncluded
                  ? "border-foreground/60 bg-card shadow-xs ring-1 ring-foreground/10 -translate-y-0.5"
                  : "border-border/70 bg-card/60 opacity-80 hover:opacity-100 hover:border-foreground/30 hover:-translate-y-0.5"
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={spaceDef.imageSrc}
                    alt={localizedName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className={cn(
                  "text-sm font-semibold tracking-tight transition-colors",
                  isIncluded ? "text-foreground" : "text-muted-foreground"
                )}>
                  {localizedName}
                </span>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={isIncluded}
                  onCheckedChange={() =>
                    handleToggle(spaceDef.id, localizedName)
                  }
                  aria-label={`Toggle ${localizedName}`}
                />
              </div>
            </div>
          );
        })}

        {/* Custom spaces added by user */}
        {spaces
          .filter((s) => s.id.startsWith("custom_"))
          .map((customSpace) => (
            <div
              key={customSpace.id}
              onClick={() => handleToggle(customSpace.id, customSpace.name)}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-foreground/60 bg-card px-4 py-3 shadow-xs cursor-pointer select-none ring-1 ring-foreground/10 active:scale-[0.99] -translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-foreground/10 text-foreground">
                  <span className="font-serif text-sm font-bold">Custom</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {customSpace.name}
                </span>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={customSpace.included}
                  onCheckedChange={() =>
                    handleToggle(customSpace.id, customSpace.name)
                  }
                  aria-label={`Toggle ${customSpace.name}`}
                />
              </div>
            </div>
          ))}

        {/* Add Custom Space Control (Reference Screen 3 button at bottom) */}
        {showAddCustom ? (
          <form
            onSubmit={handleAddCustom}
            className="flex items-center gap-3 rounded-2xl border border-foreground/40 bg-card p-3 shadow-xs animate-in fade-in duration-200"
          >
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={t("step4.custom_placeholder")}
              autoFocus
              className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground outline-none focus:border-foreground"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {t("step4.add_btn")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddCustom(false);
                setCustomName("");
              }}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 transition-colors"
            >
              {t("step4.cancel_btn")}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-background/50 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-all duration-200 hover:border-foreground/50 hover:bg-card hover:text-foreground hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus
              size={14}
              weight="bold"
              className="transition-transform duration-300 group-hover:rotate-90 text-foreground"
            />
            <span>{t("step4.add_custom")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
