import { Injectable } from '@nestjs/common';
import { MeasurementRepository } from '../infrastructure/persistence/measurement.repository';
import { QueryScope } from '../../../common/persistence/base.repository';
import { Measurement } from '../domain/measurement.entity';

@Injectable()
export class MeasurementAnalyticsService {
  constructor(private readonly repository: MeasurementRepository) {}

  async getEvolution(menteeId: string, indicator: string, scope: QueryScope, startDate?: Date, endDate?: Date) {
    const measurements = await this.repository.findByMentee(menteeId, scope);
    
    // Filtrar por rango de fechas si se proporciona
    const timeFiltered = measurements.filter((m: Measurement) => {
      if (startDate && m.date < startDate) return false;
      if (endDate && m.date > endDate) return false;
      return true;
    });

    // Filtrar por tipo (indicator) si se proporciona (soporta múltiples separados por coma)
    const indicators = indicator ? indicator.split(',') : [];
    const filtered = indicators.length > 0
      ? timeFiltered.filter((m: Measurement) => indicators.includes(m.type))
      : timeFiltered;

    // Agrupar por indicador y fecha
    const result: Record<string, any> = {};

    filtered.forEach((m: Measurement) => {
      const date = m.date.toISOString().split('T')[0];
      const key = m.type;
      
      if (!result[key]) result[key] = {};
      if (!result[key][date]) {
        result[key][date] = { date, value: 0, count: 0 };
      }
      result[key][date].value += m.value;
      result[key][date].count += 1;
    });

    // Formatear para el front (datasets)
    return Object.keys(result).map(type => ({
      indicator: type,
      data: Object.values(result[type])
        .map((g: any) => ({
          date: g.date,
          value: Number((g.value / g.count).toFixed(2)),
        }))
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
    }));
  }

  async getComparison(indicator: string, scope: QueryScope) {
    const measurements = await this.repository.findAll(scope);
    // Filtrar por tipo (indicator)
    const filtered = measurements.filter((m: Measurement) => m.type === indicator);
    if (filtered.length === 0) return { average: 0 };

    const total = filtered.reduce((sum, m: Measurement) => sum + m.value, 0);
    return {
      indicator,
      average: Number((total / filtered.length).toFixed(2)),
      totalMeasurements: filtered.length,
    };
  }
}
