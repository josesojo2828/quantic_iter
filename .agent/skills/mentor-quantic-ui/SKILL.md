# MentorQuantic UI/UX Standard Skill (Aura "Chill" Edition v2.0)

Esta skill define la identidad visual evolucionada del ecosistema MentorQuantic: una estética de **alta fidelidad** que combina la seriedad administrativa con la calidez del diseño moderno (Chill UI).

## 1. Filosofía Visual: "Chill Clarity & Soft Precision"
La interfaz debe sentirse como una herramienta de precisión que "respira". Evitamos el ruido visual, los bordes duros y los colores planos. Buscamos superficies que floten y elementos que inviten a la interacción.

## 2. Design Tokens (Aura Chill Palette)

| Token | Valor / Gradiente | Aplicación |
|-------|-------------------|------------|
| `--mq-bg` | `linear-gradient(135deg, #F8F9FD 0%, #F1F4FF 100%)` | Fondo global profundo |
| `--mq-surface` | `rgba(255, 255, 255, 0.8)` | Tarjetas con efecto Glass |
| `--mq-primary` | `linear-gradient(135deg, #818CF8 0%, #6366F1 100%)` | Acciones principales y acentos |
| `--mq-secondary` | `#94A3B8` | Íconos de soporte y texto soft |
| `--mq-accent` | `#C084FC` | Detalles de gamificación y realces |
| `--mq-glass-blur` | `blur(12px)` | Filtro para superficies translúcidas |

## 3. Geometría Aura (The "Sweet Spot" Radius)
- **Main Containers/Cards:** `24px` a `32px` (Homogéneo en todo el sistema).
- **Secondary Elements (Inputs/Mini-cards):** `16px`.
- **Buttons:** `14px` (Ni muy redondo, ni muy cuadrado).
- **Borders:** `1px solid rgba(255, 255, 255, 0.5)` (Bordes de "cristal" sutiles).

## 4. Sombras y Profundidad (Soft Depth)
- **Card Shadow:** `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.03);`
- **Hover Elevation:** `box-shadow: 0 30px 60px -12px rgba(99, 102, 241, 0.12);`
- **Floating Effect:** Las tarjetas deben parecer que flotan sobre el gradiente de fondo.

## 5. Tipografía y Lectura
- **Headings:** `Inter` o `Outfit`, peso `900` (Black), tracking `tighter`.
- **Labels:** `Uppercase`, tracking `widest`, peso `black`, tamaño `10px`.
- **Body:** `Inter`, peso `500`, color `Slate 600`.

## 6. Implementación Base (Tailwind/CSS)
```tsx
// Ejemplo de Card "Aura Chill"
<div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] shadow-soft p-8">
   {/* Content */}
</div>

// Ejemplo de Botón "Aura Chill"
<button className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">
   Confirmar Acción
</button>
```

---
**REGLA DE ORO:** Si se ve aburrido o plano, NO es Aura Edition. Debe haber profundidad, suavidad y una paleta de colores que de paz (Chill).
