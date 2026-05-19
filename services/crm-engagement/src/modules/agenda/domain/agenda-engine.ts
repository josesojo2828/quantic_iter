export interface BusinessHours {
  start: string; // HH:mm
  end: string;   // HH:mm
  daysOff: number[]; // 0-6 (Sun-Sat)
}

export class AgendaEngine {
  static generateSlots(params: {
    date: Date;
    hours: BusinessHours;
    durationMinutes: number;
    gapMinutes?: number;
  }) {
    const { date, hours, durationMinutes, gapMinutes = 0 } = params;
    const slots: { start: Date; end: Date }[] = [];

    const [startH, startM] = hours.start.split(':').map(Number);
    const [endH, endM] = hours.end.split(':').map(Number);

    // Check if day is off
    if (hours.daysOff.includes(date.getDay())) {
      return [];
    }

    const current = new Date(date);
    current.setHours(startH, startM, 0, 0);

    const endLimit = new Date(date);
    endLimit.setHours(endH, endM, 0, 0);

    while (current.getTime() + durationMinutes * 60000 <= endLimit.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

      slots.push({
        start: slotStart,
        end: slotEnd,
      });

      // Move to next slot start
      current.setTime(slotEnd.getTime() + gapMinutes * 60000);
    }

    return slots;
  }
}
