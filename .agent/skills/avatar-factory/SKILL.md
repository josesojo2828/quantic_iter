---
name: avatar-factory
description: Sistema de generación y despliegue de avatares para el ecosistema Quantic.
---

# Avatar Factory Skill

Esta skill define el estándar visual y el proceso técnico para expandir la galería de avatares automáticos del SaaS.

## Estándar Visual

- **Estilo**: Flat design, minimalista, estilo vectorial.
- **Rasgos**: **FACLESS** (sin ojos, nariz ni boca). Esto asegura neutralidad y un look artístico.
- **Accesorios**: Se pueden incluir accesorios como lentes, audífonos, gorras, barba (estilizada), o peinados icónicos para dar personalidad sin usar facciones.
- **Forma**: Retratos circulares o con fondo circular suave.
- **Paleta**: Colores pastel, vibrantes pero corporativos (Azul Quantic, Esmeralda, Púrpura).
- **Proporciones**: Sujeto centrado, sin detalles excesivamente complejos.

## Proceso de Generación

Para generar nuevos avatares, usar el siguiente prompt base (siempre enfatizando 'faceless'):
`Flat design minimal FACELESS avatar of a [SUBJECT], no eyes, no mouth, [ACCESSORIES], professional style, [COLORS], circular background, clean vector illustration style.`

## Proceso de Despliegue

1. **Guardado**: Guardar las imágenes con el formato `avatar_[gender]_[number].png`.
2. **Distribución**: 
   - Copiar a `apps/admin-front/public/assets/avatars/`
   - Copiar a `apps/app-main/public/assets/avatars/`
3. **Registro en Backend**: Actualizar el array `AVATAR_POOL` en:
   - `services/auth-tenant/src/modules/auth/application/auth.service.ts`
   - `services/auth-tenant/src/modules/staff/application/staff.service.ts`

## Ejemplos de Prompts

- **Femenino**: `Flat design minimal FACELESS avatar of a woman, no eyes, no mouth, wearing stylish glasses, professional style, soft pastel colors, circular background, clean vector illustration style.`
- **Masculino**: `Flat design minimal FACELESS avatar of a man, no eyes, no mouth, wearing large headphones, modern hairstyle, fresh teal and white palette, circular background, vector illustration.`
- **Neutral**: `Flat design minimal abstract FACELESS avatar, wearing a baseball cap, geometric shapes, vibrant industrial colors, circular background, vector style.`
