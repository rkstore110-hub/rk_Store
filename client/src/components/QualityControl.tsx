// components/QuantityControl.jsx
import React from "react";
import { Button } from "./ui/button";
import { Plus, Minus } from "lucide-react";

export const QuantityControl = ({ quantity, onDecrease, onIncrease, disabled }) => (
  <div className="flex items-center gap-1">
    <span className="text-[10px] xs:text-xs text-gray-500">Qty:</span>
    <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
      <button
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3 text-gray-600" />
      </button>
      
      <span className="w-7 text-center text-sm font-semibold bg-white border-x border-gray-300 leading-6">
        {quantity}
      </span>
      
      <button
        className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3 text-gray-600" />
      </button>
    </div>
  </div>
);
