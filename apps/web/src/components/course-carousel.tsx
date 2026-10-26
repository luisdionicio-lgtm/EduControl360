"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
export function CourseCarousel({ children, count }: { children: React.ReactNode; count: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  function go(next: number) {
    const el = ref.current;
    if (!el) return;
    const target = Math.max(0, Math.min(count - 1, next));
    const child = el.children[target] as HTMLElement | undefined;
    if (child)
      el.scrollTo({
        left: el.scrollLeft + child.getBoundingClientRect().left - el.getBoundingClientRect().left,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
  }
  return (
    <div className="course-carousel">
      <div className="carousel-toolbar">
        <span>Desliza para explorar tus cursos</span>
        <div>
          <button aria-label="Curso anterior" disabled={index === 0} onClick={() => go(index - 1)}>
            <ChevronLeft size={17} />
          </button>
          <button
            aria-label="Curso siguiente"
            disabled={index >= count - 1}
            onClick={() => go(index + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="course-grid carousel-track"
        onScroll={() => {
          const el = ref.current;
          if (el) {
            const width = (el.children[0] as HTMLElement)?.offsetWidth ?? 1;
            setIndex(Math.min(count - 1, Math.round(el.scrollLeft / (width + 14))));
          }
        }}
      >
        {children}
      </div>
      <div className="carousel-dots" aria-label="Seleccionar curso">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            aria-label={"Ir al curso " + (i + 1)}
            aria-pressed={index === i}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
