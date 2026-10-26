"use client";
import { useState } from "react";
import { Clock3, MapPin, CalendarDays } from "lucide-react";
export interface AgendaItem {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  room: string;
  course: string;
}
export function WeekAgenda({
  days,
  today,
  items,
}: {
  days: { weekday: number; label: string; day: number; iso: string }[];
  today: number;
  items: AgendaItem[];
}) {
  const [selected, setSelected] = useState(today);
  const active = days.find((d) => d.weekday === selected)!;
  const classes = items
    .filter((item) => item.weekday === selected)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  return (
    <section className="agenda-panel">
      <div className="section-heading">
        <h2>Tu semana</h2>
        <CalendarDays size={19} />
      </div>
      <p className="agenda-month">
        {new Date(active.iso + "T12:00:00Z").toLocaleDateString("es-PE", {
          month: "long",
          year: "numeric",
          timeZone: "America/Lima",
        })}
      </p>
      <div className="week-picker" aria-label="Elegir día de la semana">
        {days.map((day) => (
          <button
            key={day.weekday}
            onClick={() => setSelected(day.weekday)}
            aria-pressed={selected === day.weekday}
            aria-label={day.label + " " + day.day}
          >
            <span>{day.label}</span>
            <strong>{day.day}</strong>
            {items.some((item) => item.weekday === day.weekday) && <i aria-hidden="true" />}
          </button>
        ))}
      </div>
      <div className="agenda-classes" aria-live="polite">
        {classes.length ? (
          classes.map((item) => (
            <article key={item.id} className="agenda-class">
              <div className="agenda-class-time">{item.startTime}</div>
              <div>
                <h3>{item.course}</h3>
                <p>
                  <Clock3 size={13} />
                  {item.startTime}–{item.endTime}
                </p>
                <p>
                  <MapPin size={13} />
                  {item.room}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="agenda-empty">
            <CalendarDays size={24} />
            <p>No tienes clases programadas para este día.</p>
          </div>
        )}
      </div>
    </section>
  );
}
