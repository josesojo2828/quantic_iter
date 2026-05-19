#!/bin/bash

# Script para listar estudiantes (contacts) asociados a un usuario mentor
# Basado en el email del mentor para encontrar su Tenant ID.

EMAIL=${1:-"josesojo2828@gmail.com"}

echo "🔍 Buscando estudiantes para: $EMAIL..."

# Paso 1: Obtener el Tenant ID desde auth_db
# Usamos docker exec porque mongosh está dentro del contenedor mentor_mongo
TENANT_ID=$(docker exec mentor_mongo mongosh --quiet --eval "
  db = db.getSiblingDB('auth_db');
  user = db.users.findOne({email: '$EMAIL'});
  if (user) {
    // Retornamos el ID como string limpio
    print(user.lastTenantId ? user.lastTenantId.toString() : user._id.toString());
  }
")

# Limpiar salida de posibles caracteres especiales de la terminal
TENANT_ID=$(echo $TENANT_ID | tr -d '\r' | xargs)

if [ -z "$TENANT_ID" ] || [ "$TENANT_ID" == "null" ]; then
  echo "❌ Error: No se encontró el usuario o un Tenant ID asociado a $EMAIL"
  exit 1
fi

echo "✅ Tenant ID detectado: $TENANT_ID"
echo "--------------------------------------------------------"

# Paso 2: Listar los contactos en crm_db que coincidan con ese tenant_id
# Probamos buscando tanto como String (mapeo de Prisma) como por ObjectId
docker exec mentor_mongo mongosh --quiet --eval "
  db = db.getSiblingDB('crm_db');
  
  // Intento 1: Como String (Prisma default @map)
  let query = { tenant_id: '$TENANT_ID' };
  let contacts = db.contacts.find(query).toArray();
  
  // Intento 2: Como ObjectId (Compatibilidad si se creó nativamente)
  if (contacts.length === 0) {
    try {
      contacts = db.contacts.find({ tenant_id: ObjectId('$TENANT_ID') }).toArray();
    } catch(e) {}
  }

  if (contacts.length === 0) {
    print('⚠️  No hay estudiantes (contacts) registrados para este Tenant en crm_db.');
  } else {
    print('👥 Estudiantes encontrados: ' + contacts.length);
    printjson(contacts.map(c => ({
      nombre: (c.firstName || '') + ' ' + (c.lastName || ''),
      email: c.email,
      id: c._id.toString()
    })));
  }
"
