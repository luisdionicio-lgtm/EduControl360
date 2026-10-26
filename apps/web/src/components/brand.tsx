import Link from "next/link";
import { Layers3 } from "lucide-react";
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="EduControl 360, inicio">
      <span className="brand-mark">
        <Layers3 size={23} strokeWidth={1.8} />
      </span>
      <span>
        educontrol<span className="brand-number">360</span>
      </span>
    </Link>
  );
}
