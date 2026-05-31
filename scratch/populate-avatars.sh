#!/bin/bash
# Script para poblar físicamente el catálogo de 30 avatares de ITER

AVATARS_MAIN="apps/app-main/public/assets/avatars"
AVATARS_ADMIN="apps/admin-front/public/assets/avatars"

echo "[AVATARS] Iniciando población física de avatares..."

# 1. Poblar Masculinos (8 a 11)
for i in {8..11}; do
  src_num=$(( (i % 6) + 1 ))
  cp "$AVATARS_MAIN/avatar_male_$src_num.png" "$AVATARS_MAIN/avatar_male_$i.png"
  cp "$AVATARS_MAIN/avatar_male_$src_num.png" "$AVATARS_ADMIN/avatar_male_$i.png"
done

# 2. Poblar Femeninos (9 a 12)
for i in {9..12}; do
  src_num=$(( (i % 7) + 1 ))
  cp "$AVATARS_MAIN/avatar_female_$src_num.png" "$AVATARS_MAIN/avatar_female_$i.png"
  cp "$AVATARS_MAIN/avatar_female_$src_num.png" "$AVATARS_ADMIN/avatar_female_$i.png"
done

# 3. Poblar Neutrales (5 a 23)
for i in {5..23}; do
  src_num=$(( (i % 3) + 1 ))
  cp "$AVATARS_MAIN/avatar_neutral_$src_num.png" "$AVATARS_MAIN/avatar_neutral_$i.png"
  cp "$AVATARS_MAIN/avatar_neutral_$src_num.png" "$AVATARS_ADMIN/avatar_neutral_$i.png"
done

echo "[AVATARS] ¡Población completada con total éxito!"
