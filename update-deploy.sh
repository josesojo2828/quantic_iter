#!/bin/bash

# ==============================================================================
# 🔄 ECOSYSTEM UPDATE & RE-DEPLOY SCRIPT (Quantic Iter - Production)
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${GREEN}   🔄 Actualizando Ecosistema y Re-Desplegando ${NC}"
echo -e "${CYAN}======================================================${NC}"

# 1. Verificar si estamos en un repositorio de Git
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse en la raíz de un repositorio Git.${NC}"
    exit 1
fi

# 2. Descargar últimos cambios de la rama principal (main)
echo -e "\n${YELLOW}1️⃣  Obteniendo últimos cambios de Git (rama main)...${NC}"
git fetch origin main

# Comparar si hay cambios locales contra el remote
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u} 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo -e "${GREEN}✓ El código ya está actualizado con la rama main de origin.${NC}"
    read -p "¿Querés forzar la reconstrucción y despliegue de todas formas? (s/n): " confirm
    if [[ ! $confirm =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}Cancelado. El sistema sigue corriendo sin cambios.${NC}"
        exit 0
    fi
else
    echo -e "${YELLOW}Nuevos cambios detectados. Realizando pull...${NC}"
    git pull origin main
    echo -e "${GREEN}✓ Código actualizado con éxito.${NC}"
fi

# 3. Re-construir imágenes y reiniciar servicios modificados
echo -e "\n${YELLOW}2️⃣  Re-construyendo imágenes modificadas y levantando servicios...${NC}"
# Docker Compose detecta automáticamente qué servicios cambiaron y solo rebuildeará y reiniciará esos
docker compose -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Falló la reconstrucción y despliegue de servicios.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Servicios actualizados y levantados correctamente.${NC}"

# 2.1. Hot-Reload del Gateway para actualizar la caché de DNS de Docker (Previene 502 Bad Gateway)
echo -e "\n${YELLOW}🔄 Recargando Nginx Gateway para actualizar rutas y DNS de Docker...${NC}"
docker exec mentor_gateway nginx -s reload
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Gateway Nginx recargado en caliente exitosamente (DNS actualizado).${NC}"
else
    echo -e "${YELLOW}⚠️ Advertencia: No se pudo recargar el gateway automáticamente. Recomendamos correr 'docker exec mentor_gateway nginx -s reload' manualmente.${NC}"
fi

# 4. Limpieza del sistema (Preventivo para no llenar el disco del VPS)
echo -e "\n${YELLOW}3️⃣  Haciendo limpieza de imágenes huérfanas y caché de compilación...${NC}"
docker image prune -f
docker builder prune -f --filter "until=24h"
echo -e "${GREEN}✓ Disco limpio. Imágenes huérfanas y caché antigua eliminadas.${NC}"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   🎉 ¡ACTUALIZACIÓN COMPLETADA CON ÉXITO! ${NC}"
echo -e "${CYAN}======================================================${NC}"
echo -e "${YELLOW}Estado actual del ecosistema:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo -e "${CYAN}======================================================${NC}"
