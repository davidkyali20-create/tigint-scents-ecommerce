import React, { useState } from "react";
import { ScentOption } from "../types";
import { SCENT_CATALOG } from "../data";
import { Check, Flame, HelpCircle } from "lucide-react";

interface ScentDropdownProps {
  selectedScentId: string;
  onChange: (scent: ScentOption) => void;
}

export default function ScentDropdown({ selectedScentId, onChange }: ScentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentScent = SCENT_CATALOG.find((s) => s.id === selectedScentId) || SCENT_CATALOG[0];

  return (
    <div className="relative w-full">
      <label className="block text-xs font-medium text-yellow-500 uppercase tracking-wider mb-2 font-display">
        Select Premium Fragrance Profile
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-yellow-500 transition duration-150 ease-in-out cursor-pointer"
        id="scent-select-btn"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white font-display">{currentScent.name}</span>
            {currentScent.popularity >= 95 && (
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Flame size={10} className="fill-current" /> Hot Seller
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            <span className="text-zinc-500">Profile:</span> {currentScent.profile}
          </p>
          <p className="text-[11px] text-yellow-500/80 italic mt-0.5">
            Notes: {currentScent.notes}
          </p>
        </div>
        <span className="text-yellow-500 font-bold ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl max-h-64 overflow-y-auto divide-y divide-zinc-900">
          {SCENT_CATALOG.map((scent) => (
            <button
              key={scent.id}
              type="button"
              onClick={() => {
                onChange(scent);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-zinc-900 transition flex items-center justify-between cursor-pointer ${
                scent.id === selectedScentId ? "bg-zinc-900/60" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm font-display">{scent.name}</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                    Popularity: {scent.popularity}%
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{scent.profile}</p>
                <p className="text-[10px] text-zinc-500 italic">Notes: {scent.notes}</p>
              </div>
              {scent.id === selectedScentId && (
                <Check size={16} className="text-yellow-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
