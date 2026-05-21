#!/bin/bash

# ==============================================================================
# 🚀 ECOSYSTEM DEPLOYMENT SCRIPT (Quantic Iter - Production)
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${GREEN}   🚀 Iniciando Despliegue de Producción de Quantic ${NC}"
echo -e "${CYAN}======================================================${NC}"

# 1. Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo .env en la raíz.${NC}"
    echo -e "${YELLOW}Por favor, creá el archivo .env con tus variables antes de continuar.${NC}"
    exit 1
fi

# 2. Cargar variables del .env para validación básica
export $(grep -v '^#' .env | xargs)

# 3. Crear red externa de Docker si no existe
echo -e "\n${YELLOW}1️⃣  Verificando red de Docker 'mentor_network'...${NC}"
if ! docker network inspect mentor_network >/dev/null 2>&1; then
    echo -e "${YELLOW}Red 'mentor_network' no encontrada. Creándola...${NC}"
    docker network create mentor_network
    echo -e "${GREEN}✓ Red 'mentor_network' creada correctamente.${NC}"
else
    echo -e "${GREEN}✓ Red 'mentor_network' ya existe.${NC}"
fi

# 4. Levantar infraestructura (Bases de datos, Kafka, Redis, MinIO)
echo -e "\n${YELLOW}2️⃣  Levantando Infraestructura...${NC}"
docker compose -f ./infra/docker/docker-compose.infra.yml up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Falló el inicio de los servicios de infraestructura.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Infraestructura levantada correctamente.${NC}"

# 5. Esperar a que MongoDB esté listo y su Replica Set iniciado
echo -e "\n${YELLOW}⏳ Esperando que MongoDB esté disponible e inicialice su Replica Set...${NC}"
sleep 5
for i in {1..10}; do
    if docker exec mentor_mongo mongosh --quiet --eval "rs.status().ok" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Replica Set de MongoDB inicializado y listo.${NC}"
        break
    else
        echo -e "${YELLOW}Aún esperando Replica Set... ($i/10)${NC}"
        sleep 3
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}⚠️ Advertencia: MongoDB tarda en responder. Procediendo de todas formas...${NC}"
    fi
done

# 6. Levantar servicios y aplicaciones de producción
echo -e "\n${YELLOW}3️⃣  Compilando y Levantando Aplicaciones y Microservicios (Modo Producción)...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Falló la construcción o despliegue de los servicios productivos.${NC}"
    exit 1
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   🎉 ¡DESPLIEGUE FINALIZADO EXITOSAMENTE! ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "${YELLOW}Servicios activos:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo -e "${CYAN}======================================================${NC}"
