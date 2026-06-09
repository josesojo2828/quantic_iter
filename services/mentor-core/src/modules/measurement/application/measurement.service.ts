import { Injectable } from '@nestjs/common';
import { MeasurementRepository } from '../infrastructure/persistence/measurement.repository';
import { Measurement } from '../domain/measurement.entity';
import { QueryScope } from '../../../common/persistence/base.repository';

@Injectable()
export class MeasurementService {
  constructor(private readonly repository: MeasurementRepository) {}

  async createMeasurement(data: Partial<Measurement>): Promise<Measurement> {
    return this.repository.create(data);
  }

  async getMenteeMeasurements(menteeId: string, scope: QueryScope): Promise<Measurement[]> {
    return this.repository.findByMentee(menteeId, scope);
  }

  async getAllMeasurements(scope: QueryScope): Promise<Measurement[]> {
    return this.repository.findAll(scope);
  }

  async deleteMeasurement(id: string, scope: QueryScope): Promise<boolean> {
    return this.repository.delete(id, scope);
  }
}
