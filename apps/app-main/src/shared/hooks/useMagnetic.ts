'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';

export const useMagnetic = (strength: number = 0.5) => {
  const ref = useRef<HTMLButtonElement | HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const xSetter = gsap.quickSetter(el, "x", "px");
    const ySetter = gsap.quickSetter(el, "y", "px");

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const radius = 100; // Activation radius

      if (distance < radius) {
        xSetter(deltaX * strength);
        ySetter(deltaY * strength);
      } else {
        xSetter(0);
        ySetter(0);
      }
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.3)"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
};
