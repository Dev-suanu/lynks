// src/components/CreditIcon.tsx
import { CircleDollarSign, Coins } from "lucide-react";

export const CreditIcon = ({ className = "w-4 h-4" }: { className?: string }) => {
  return (
    <CircleDollarSign
      className={`${className} text-lime-400 inline-block mb-0.5`} 
      strokeWidth={2.5} 
    />
  );
};