export interface QueryScope {
  userId: string;
  role: string;
  tenantId: string;
  coachId?: string;
  menteeId?: string;
}

export abstract class BaseRepository<T> {
  protected applyScope(
    where: any,
    scope: QueryScope,
    options?: { menteeField?: string | null; coachField?: string | null }
  ) {
    const baseWhere = {
      ...where,
      tenantId: scope.tenantId,
    };

    const menteeField = options?.menteeField === undefined ? 'menteeId' : options.menteeField;
    const coachField = options?.coachField === undefined ? 'coachId' : options.coachField;

    // Aislamiento para Estudiantes: Solo ven lo que les pertenece
    if (scope.role === 'mentee') {
      if (menteeField === null) {
        return baseWhere;
      }
      return {
        ...baseWhere,
        [menteeField]: scope.userId,
      };
    }

    // Aislamiento para Coaches: Ven sus programas o todo el tenant si son dueños
    if (scope.coachId && scope.role === 'mentor') {
      if (coachField === null) {
        return baseWhere;
      }
      return {
        ...baseWhere,
        [coachField]: scope.coachId,
      };
    }

    return baseWhere;
  }
}

