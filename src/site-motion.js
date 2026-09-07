import { useEffect } from 'react';

export function useSiteMotion(routeKey) {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealTargets = [...document.querySelectorAll('main section:not(.hero):not(.loan-hero):not(.deposit-hero), .product-card, .reason, .metrics > div')].filter(element => !element.closest('[data-own-motion]'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.siteReveal = 'visible';
        observer.unobserve(entry.target);
      });
    }, { threshold: .04, rootMargin: '0px 0px -4% 0px' });
    revealTargets.forEach((element, index) => {
      element.style.setProperty('--site-delay', `${Math.min(index % 4, 3) * 55}ms`);
      element.dataset.siteReveal = reduced.matches ? 'visible' : 'waiting';
      if (!reduced.matches) observer.observe(element);
    });
    const revealFocus = event => {
      const target = event.target.closest('[data-site-reveal]');
      if (target) { target.dataset.siteReveal = 'visible'; observer.unobserve(target); }
    };
    const pointer = event => {
      if (reduced.matches || event.pointerType !== 'mouse') return;
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
      const card = event.target.closest('.product-card, .catalog-card, .reason, .service-directory button, .contact-method, .branch-card');
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
    };
    document.addEventListener('focusin', revealFocus);
    window.addEventListener('pointermove', pointer, { passive: true });
    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', revealFocus);
      window.removeEventListener('pointermove', pointer);
    };
  }, [routeKey]);
}
