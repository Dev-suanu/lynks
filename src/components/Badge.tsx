// src/components/ui/Badge.tsx
export default function Badge({ count, children }: { count: number, children: React.ReactNode }) {
  return (
    <div className="relative inline-block">
      {children}
      {count > 0 && (
        <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-lime-500 text-[10px] font-bold text-black ring-2 ring-[#050505]">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </div>
  );
}