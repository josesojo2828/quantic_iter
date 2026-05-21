'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { AgendaEvent } from '../services/agenda.service';
import { format, parseISO, differenceInMinutes, startOfDay } from 'date-fns';
import { User, Package, GraduationCap } from 'lucide-react';

interface TimeGridProps {
  events: AgendaEvent[];
  date: Date;
  onTimeClick: (time: Date) => void;
  onEventClick: (event: AgendaEvent) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

export const TimeGrid: React.FC<TimeGridProps> = ({ events, date, onTimeClick, onEventClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && events.length > 0) {
      gsap.fromTo(
        '.event-card',
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.05, ease: 'back.out(1.7)' }
      );
    }
  }, [events]);

  const getPosition = (timeStr: string) => {
    const time = parseISO(timeStr);
    const dayStart = startOfDay(time);
    dayStart.setHours(8, 0, 0, 0);
    const minutesSinceStart = differenceInMinutes(time, dayStart);
    return (minutesSinceStart / 60) * 100; // 100px per hour
  };

  const getDurationHeight = (startStr: string, endStr: string) => {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const duration = differenceInMinutes(end, start);
    return (duration / 60) * 100;
  };

  return (
    <div className="relative w-full h-[1300px] bg-primary-content border border-white/5 rounded-3xl overflow-y-auto custom-scrollbar" ref={containerRef}>
      {/* Hour Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="w-full border-t border-white/[0.03] flex items-start px-4 text-[10px] text-white/20 uppercase tracking-widest font-medium"
            style={{ height: '100px' }}
          >
            <span className="mt-3 shadow font-black text-primary px-2 py-1 rounded-md">{hour}:00</span>
          </div>
        ))}
      </div>

      {/* Clickable Tracks */}
      <div className="absolute inset-0 left-20">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="w-full h-[100px] cursor-crosshair hover:bg-primary transition-colors group relative"
            onClick={() => {
              const clickTime = new Date(date);
              clickTime.setHours(hour, 0, 0, 0);
              onTimeClick(clickTime);
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-primary/50 group-hover:bg-cyan-500/30 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.1)]" />

            {/* Click to add indicator */}
            <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded-full border border-cyan-500/30">
              AGENDAR +
            </div>
          </div>
        ))}
      </div>

      {/* Events Layer */}
      <div className="absolute inset-0 left-20 right-4">
        {events.map((event) => {
          const top = getPosition(event.start);
          const height = Math.max(getDurationHeight(event.start, event.end), 40); // Min height for visibility

          const typeStyles: Record<string, string> = {
            CUSTOMER: 'from-cyan-500/40 to-blue-600/40 border-cyan-500/30 text-cyan-200 shadow-[0_4px_20px_rgba(6,182,212,0.15)]',
            INVENTORY: 'from-amber-500/40 to-orange-600/40 border-amber-500/30 text-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
            INTERNAL: 'from-purple-500/40 to-pink-600/40 border-purple-500/30 text-purple-200 shadow-[0_4px_20px_rgba(168,85,247,0.15)]'
          };

          return (
            <div
              key={event.id}
              className={`event-card absolute inset-x-0 mx-2 p-3 rounded-2xl border bg-gradient-to-br backdrop-blur-2xl cursor-pointer hover:scale-[1.01] transition-all z-10 group overflow-hidden ${typeStyles[event.type || 'CUSTOMER']}`}
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm tracking-tight truncate text-black group-hover:text-primary transition-colors">
                      {event.type === 'CUSTOMER' ? (event.contact?.name || 'Sesión de Mentoría') : (event.title || 'Evento')}
                    </h4>
                    {height > 60 && (
                      <p className="text-gray-800 text-[12px] sm:text-xs mt-1 line-clamp-2 leading-relaxed">
                        {event.description || 'Sin notas adicionales'}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[12px] font-black uppercase tracking-tighter bg-black/90 px-2.5 py-0.5 rounded-lg">
                      {event.type}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex -space-x-1">
                    {/* Placeholder for avatars or icons */}
                    <div className="w-8 h-8 rounded-full bg-primary border flex items-center justify-center text-[12px] font-bold">
                      {event.type === 'CUSTOMER' && <User className="w-4 h-4 text-black" />}
                      {event.type === 'INVENTORY' && <Package className="w-4 h-4 text-black" />}
                      {event.type === 'INTERNAL' && <GraduationCap className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                  <div className="text-[12px] font-mono font-bold text-primary">
                    {format(parseISO(event.start), 'HH:mm')} - {format(parseISO(event.end), 'HH:mm')}
                  </div>
                </div>
              </div>

              {/* Glass Reflection Effect */}
              {/* <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" /> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
