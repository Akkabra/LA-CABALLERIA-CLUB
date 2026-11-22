import React, { useEffect, useRef, useState } from 'react';

export type ScrollRevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: ScrollRevealVariant;
  distance?: number;
  threshold?: number;
}

function getHiddenTransform(variant: ScrollRevealVariant, distance: number): string {
  switch (variant) {
    case 'up':
      return `translate3d(0, ${distance}px, 0)`;
    case 'down':
      return `translate3d(0, -${distance}px, 0)`;
    case 'left':
      return `translate3d(${distance}px, 0, 0)`;
    case 'right':
      return `translate3d(-${distance}px, 0, 0)`;
    case 'scale':
      return 'translate3d(0, 18px, 0) scale(0.96)';
  }
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 720,
  variant = 'up',
  distance = 28,
  threshold = 0.03,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const currentRef = domRef.current;
    if (!currentRef) return;

    // Immediately reveal if already inside or above current viewport
    const rect = currentRef.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.96) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -24px 0px',
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : getHiddenTransform(variant, distance),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
      className={`motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!transition-none ${className}`}
    >
      {children}
    </div>
  );
};

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const FadeInSection: React.FC<FadeInSectionProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <ScrollReveal
      className={className}
      delay={delay}
      duration={760}
      variant="up"
      distance={32}
      threshold={0.02}
    >
      {children}
    </ScrollReveal>
  );
};
