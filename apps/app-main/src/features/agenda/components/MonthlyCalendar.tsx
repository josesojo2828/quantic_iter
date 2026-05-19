'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthlyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  busyDates?: string[]; // Array of YYYY-MM-DD
  onMonthChange?: (month: number, year: number) => void;
}

export function MonthlyCalendar({ selectedDate, onDateSelect, busyDates = [], onMonthChange }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 }),
  });

  const prevMonth = () => {
    animateTransition('prev', () => {
      const newMonth = subMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth.getMonth() + 1, newMonth.getFullYear());
    });
  };

  const nextMonth = () => {
    animateTransition('next', () => {
      const newMonth = addMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      onMonthChange?.(newMonth.getMonth() + 1, newMonth.getFullYear());
    });
  };

  const animateTransition = (dir: 'next' | 'prev', callback: () => void) => {
    if (!gridRef.current) {
        callback();
        return;
    }

    gsap.to(gridRef.current, {
      x: dir === 'next' ? -20 : 20,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        callback();
        gsap.fromTo(gridRef.current, 
          { x: dir === 'next' ? 20 : -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
      }
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.calendar-header', { opacity: 0, y: -10, duration: 0.5 });
      gsap.from('.calendar-day', { 
        opacity: 0, 
        scale: 0.8, 
        stagger: 0.005, 
        duration: 0.4, 
        ease: 'back.out(1.7)' 
      });
    }, containerRef);
    return () => ctx.revert();
  }, [currentMonth]);

  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  return (
    <div ref={containerRef} className="glass-card bg-white/40 backdrop-blur-3xl border border-white/40 p-5 rounded-[2.5rem] shadow-2xl shadow-slate-900/5 select-none overflow-hidden">
      {/* Header */}
      <div className="calendar-header flex items-center justify-between mb-6 px-2">
        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h4>
        <div className="flex items-center gap-1">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white/50 rounded-xl transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white/50 rounded-xl transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 mb-3">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div ref={gridRef} className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrMonth = isSameMonth(day, currentMonth);
          const isTodayDay = isToday(day);
          const dayKey = format(day, 'yyyy-MM-dd');
          const hasEvents = busyDates.includes(dayKey);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={`calendar-day relative w-full aspect-square rounded-xl text-[11px] font-bold transition-all flex items-center justify-center
                ${!isCurrMonth ? 'text-slate-300' : 'text-slate-700'}
                ${isSelected 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105 z-10' 
                  : 'hover:bg-white/60 hover:text-slate-900'
                }
              `}
            >
              {format(day, 'd')}
              
              {/* Event Indicator */}
              {hasEvents && (
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]'}`} />
              )}

              {isTodayDay && !isSelected && (
                <div className="absolute bottom-1.5 w-1 h-1 bg-cyan-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
