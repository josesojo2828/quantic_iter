import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { MongoClient } from 'mongodb';

let cachedCrmClient: MongoClient | null = null;

async function getCrmContactIdByGlobalUserId(globalUserId: string): Promise<string | null> {
  try {
    if (!cachedCrmClient) {
      const url = (process.env.DATABASE_URL || 'mongodb://mentor_mongo:27017/mentor_core_db').replace('/mentor_core_db', '/crm_db');
      cachedCrmClient = new MongoClient(url, {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      });
      await cachedCrmClient.connect();
    }
    const db = cachedCrmClient.db();
    const contact = await db.collection('contacts').findOne({ global_user_id: globalUserId });
    return contact ? contact._id.toString() : null;
  } catch (error) {
    console.error('[ScopeGuard] Error looking up CRM contact, attempting reconnect:', error);
    if (cachedCrmClient) {
      try {
        await cachedCrmClient.close();
      } catch (e) {}
      cachedCrmClient = null;
    }
    return null;
  }
}

@Injectable()
export class ScopeGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si el usuario es Super Admin, tiene acceso total (bypass scope)
    if (user?.role === 'super_admin') return true;

    let userId = user?.sub;
    let menteeId = user?.role === 'mentee' ? user?.sub : undefined;

    if (user?.role === 'mentee' && user?.sub) {
      const crmContactId = await getCrmContactIdByGlobalUserId(user.sub);
      if (crmContactId) {
        console.log(`[ScopeGuard] Mapping global_user_id ${user.sub} to CRM Contact ID ${crmContactId}`);
        userId = crmContactId;
        menteeId = crmContactId;
      } else {
        console.warn(`[ScopeGuard] No CRM Contact found for global_user_id ${user.sub}, fallback to sub`);
      }
    }

    request.scope = {
      userId,
      role: user?.role,
      tenantId: user?.tenantId,
      coachId: user?.mentorId || (user?.role === 'mentor' ? user?.sub : undefined),
      menteeId,
    };

    return !!request.scope.tenantId;
  }
}

