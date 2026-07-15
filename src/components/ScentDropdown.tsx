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
      <label className="block text-xs font-bold text-[#6e1329] uppercase tracking-wider mb-2 font-display">
        Select Premium Fragrance Profile
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-[#ecd1cc] rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-[#6e1329] transition duration-150 ease-in-out cursor-pointer shadow-sm hover:bg-[#fff9f8]"
        id="scent-select-btn"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6e1329] font-display text-sm">{currentScent.name}</span>
            {currentScent.popularity >= 95 && (
              <span className="bg-rose-100 text-[#6e1329] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Flame size={10} className="fill-current text-[#6e1329]" /> Hot Seller
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-600 mt-1">
            <span className="text-zinc-400 font-medium">Profile:</span> {currentScent.profile}
          </p>
          <p className="text-[11px] text-[#cca43b] font-semibold italic mt-0.5">
            Notes: {currentScent.notes}
          </p>
        </div>
        <span className="text-[#cca43b] font-bold ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-[#ecd1cc] rounded-xl shadow-xl max-h-64 overflow-y-auto divide-y divide-zinc-100">
          {SCENT_CATALOG.map((scent) => (
            <button
              key={scent.id}
              type="button"
              onClick={() => {
                onChange(scent);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-[#fff5f4] transition flex items-center justify-between cursor-pointer ${
                scent.id === selectedScentId ? "bg-[#fff0ef]" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#6e1329] text-sm font-display">{scent.name}</span>
                  <span className="text-[10px] bg-rose-50 text-[#6e1329] font-medium px-1.5 py-0.5 rounded">
                    Popularity: {scent.popularity}%
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">{scent.profile}</p>
                <p className="text-[10px] text-zinc-400 italic">Notes: {scent.notes}</p>
              </div>
              {scent.id === selectedScentId && (
                <Check size={16} className="text-[#cca43b] stroke-[3px]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
