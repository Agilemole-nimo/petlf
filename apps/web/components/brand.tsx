import { Leaf } from "lucide-react";
export function Brand() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark">
        <Leaf size={23} />
      </span>
      <div className="leading-none">
        <div className="font-display text-2xl font-extrabold tracking-[-0.08em] text-white">
          栖序
        </div>
        <div className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-100">
          多站运营台
        </div>
      </div>
    </div>
  );
}
