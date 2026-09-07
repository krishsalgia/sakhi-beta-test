import React from './i18n/react';
import { useEffect, useRef, useState } from 'react';

const desktopQuery = '(min-width: 1101px) and (min-height: 700px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const travelStart = .06, travelEnd = .88;

// The DOM keeps reading order; desktop lays the rail in reverse so downward
// scrolling moves it positively on X, from the first product to the fourth.
export function FeaturedJourney({ children }) {
  const root = useRef(null), rail = useRef(null), jump = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const section = root.current, track = rail.current;
    const media = matchMedia(desktopQuery);
    let frame = 0;
    const update = () => {
      frame = 0;
      const cards = [...track.children];
      if (!media.matches) {
        section.style.removeProperty('--pin-size');
        track.style.removeProperty('transform');
        track.parentElement.style.removeProperty('transform');
        cards.forEach(card => card.style.removeProperty('--focus'));
        const step = cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap);
        setActive(Math.min(3, Math.round(track.scrollLeft / step)));
        return;
      }
      const pin = section.firstElementChild;
      section.style.setProperty('--pin-size', `${pin.offsetHeight}px`);
      const top = parseFloat(getComputedStyle(pin).top);
      const runway = section.offsetHeight - pin.offsetHeight;
      const progress = Math.max(0, Math.min(1, (top - section.getBoundingClientRect().top) / runway));
      const travel = clamp((progress - travelStart) / (travelEnd - travelStart));
      // A single camera move: ease in, hold, then ease out after the last
      // product arrives. Pure scroll-derived values reverse without playback state.
      const zoom = 1 + .06 * smooth(progress / .12) * smooth((1 - progress) / .12);
      track.parentElement.style.transform = `scale(${zoom})`;
      const cardWidth = parseFloat(getComputedStyle(cards[0]).width);
      const step = cardWidth + parseFloat(getComputedStyle(track).gap);
      const inset = 24;
      // Increasing travel always increases X: products physically move right.
      // row-reverse preserves the requested first-to-fourth viewing sequence.
      // Compensate the camera scale so the first card's actual screen X
      // never retreats during zoom-out. Following cards continue moving right.
      track.style.transform = `translate3d(${(inset + travel * 3 * step) / zoom - 3 * step}px,0,0)`;
      const current = Math.min(3, Math.floor(travel * 3 + .0001));
      cards.forEach((card, index) => card.style.setProperty('--focus', index === current ? 1 : 0));
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    jump.current = index => {
      if (media.matches) {
        const pin = section.firstElementChild;
        const start = scrollY + section.getBoundingClientRect().top - parseFloat(getComputedStyle(pin).top);
        const progress = travelStart + index / 3 * (travelEnd - travelStart);
        window.scrollTo({ top: start + progress * (section.offsetHeight - pin.offsetHeight), behavior: 'instant' });
      } else {
        track.scrollTo({ left: index * (track.children[0].offsetWidth + parseFloat(getComputedStyle(track).gap)), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      }
      schedule();
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(section); resize.observe(track.parentElement);
    resize.observe(section.firstElementChild);
    window.addEventListener('scroll', schedule, { passive: true });
    track.addEventListener('scroll', schedule, { passive: true });
    media.addEventListener('change', schedule);
    update();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); window.removeEventListener('scroll', schedule); track.removeEventListener('scroll', schedule); media.removeEventListener('change', schedule); };
  }, []);
  return <section className="section featured featured-journey" id="featured" aria-labelledby="featured-title" ref={root} data-own-motion>
    <div className="featured-pin"><div className="featured-heading"><h2 id="featured-title">Get the most out<br />of every possibility.</h2><span className="journey-cue"><span className="desktop-cue">Scroll to explore</span><span className="touch-cue">Swipe to explore</span><span aria-hidden="true">→</span></span></div>
      <div className="featured-window"><div className="featured-composition"><div className="product-grid featured-track" ref={rail}>{React.Children.map(children, (child, index) => <div className="featured-stop" onFocusCapture={event => { if (event.target.matches(':focus-visible')) jump.current?.(index); }}>{child}</div>)}</div></div></div>
      <nav className="journey-progress" aria-label="Featured products">{React.Children.map(children, (child, index) => <button onClick={() => jump.current?.(index)} aria-label={`Show product ${index + 1}`} aria-current={active === index ? 'step' : undefined}><span>0{index + 1}</span><i /></button>)}</nav>
    </div>
  </section>;
}
