import React from './i18n/react';
import { useEffect, useRef, useState } from 'react';
import { products } from './content';
import { Icon } from './ui';
import { FeaturedSculpture } from './featured-sculptures';
import './featured-atlas.css';

const desktopQuery = '(min-width: 1101px) and (min-height: 780px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const n = clamp(value); return n * n * (3 - 2 * n); };
const centers = [.11, .35, .59, .83];
const destinations = ['/products/deposits#daily-deposit', '/products/loans#loan-against-deposits', '/products/loans#daily-loan', '/products/loans#jlg-loan'];

export function FeaturedJourney() {
  const root = useRef(null), navigation = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const section = root.current;
    const pin = section.querySelector('.atlas-pin');
    const scenes = [...section.querySelectorAll('.atlas-scene')];
    const media = matchMedia(desktopQuery), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, current = -1, pinTop = 112, runway = 0, lead = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight * 1.5) return;
      let next = 0;
      if (media.matches) {
        const progress = clamp((pinTop - rect.top + lead) / (runway + lead));
        const position = (progress - centers[0]) / .24;
        const entrance = smooth(progress / .085);
        const ending = smooth((progress - .91) / .09);
        next = Math.max(0, Math.min(3, Math.round(position)));
        section.style.setProperty('--atlas-progress', progress);
        section.style.setProperty('--atlas-entrance', entrance);
        section.style.setProperty('--atlas-ending', ending);
        scenes.forEach((scene, index) => {
          const local = index === 3 ? Math.min(0, position - index) : position - index;
          const distance = Math.abs(local);
          const opacity = 1 - smooth((distance - .36) / .38);
          const travel = Math.sign(local) * smooth((distance - .18) / .68);
          scene.style.setProperty('--scene-opacity', opacity);
          scene.style.setProperty('--scene-x', `${travel * 38}%`);
          scene.style.setProperty('--scene-z', `${-Math.abs(travel) * 520}px`);
          scene.style.setProperty('--scene-turn', `${-travel * 64}deg`);
          scene.style.setProperty('--scene-roll', `${travel * 13}deg`);
          scene.style.setProperty('--build', smooth((position - index + .62) / .96));
          scene.style.visibility = opacity > .001 ? 'visible' : 'hidden';
          scene.inert = index !== next || opacity < .2;
        });
      } else {
        const positions = scenes.map(scene => scene.getBoundingClientRect());
        let closest = Infinity;
        scenes.forEach((scene, index) => {
          const box = positions[index];
          const distance = Math.abs(box.top + Math.min(box.height / 2, innerHeight * .35) - innerHeight * .5);
          if (distance < closest) { closest = distance; next = index; }
          scene.style.setProperty('--build', reduced.matches ? 1 : smooth((innerHeight * .95 - box.top) / (innerHeight * .75)));
          scene.style.removeProperty('visibility');
          scene.inert = false;
        });
      }
      if (next !== current) { current = next; setActive(next); }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      pinTop = document.querySelector('.header').getBoundingClientRect().bottom + 16;
      section.style.setProperty('--atlas-top', `${pinTop}px`);
      runway = Math.max(0, section.offsetHeight - pin.offsetHeight);
      lead = innerHeight * .22;
      section.dataset.mode = media.matches ? 'cinematic' : reduced.matches ? 'reduced' : 'flow';
      if (!media.matches) scenes.forEach(scene => { scene.inert = false; scene.style.removeProperty('visibility'); });
      schedule();
    };
    navigation.current = index => {
      const top = media.matches
        ? scrollY + section.getBoundingClientRect().top - pinTop - lead + centers[index] * (runway + lead)
        : scrollY + scenes[index].getBoundingClientRect().top - pinTop - 12;
      // Navigation is a direct, reversible shortcut; ordinary scrolling is never intercepted.
      window.scrollTo({ top, behavior: 'instant' });
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(pin);
    observer.observe(document.querySelector('.header'));
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    media.addEventListener('change', measure);
    reduced.addEventListener('change', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure);
      media.removeEventListener('change', measure); reduced.removeEventListener('change', measure);
      navigation.current = null;
    };
  }, []);

  return <section className="possibility-atlas" id="featured" aria-labelledby="featured-title" data-own-motion ref={root}>
    <div className="atlas-pin">
      <div className="atlas-heading">
        <h2 id="featured-title"><span>Get the most out</span><br/><span>of every possibility.</span></h2>
        <span className="atlas-cue"><span>Scroll to explore</span><span className="atlas-cue-arrow" aria-hidden="true">↓</span></span>
      </div>
      <div className="atlas-stage">
        <div className="atlas-environment" aria-hidden="true"><div className="atlas-orbit"/><div className="atlas-axis"/><span className="atlas-coordinate">+<i/>+</span></div>
        {products.map((product, index) => <article className={`atlas-scene atlas-scene--${product.art}`} id={`featured-product-${index+1}`} key={product.title} data-active={active === index ? 'true' : 'false'} aria-labelledby={`atlas-title-${index}`}>
          <div className="atlas-copy">
            <span className="atlas-chapter" aria-hidden="true"><i/>0{index + 1}<span>/ 04</span></span>
            <h3 id={`atlas-title-${index}`}>{product.title}</h3>
            <p>{product.copy}</p>
            <a className="atlas-details" href={destinations[index]} aria-label={`View ${product.title}`}><span>View details</span><span className="atlas-link-arrow"><Icon/></span></a>
          </div>
          <div className="atlas-art" aria-hidden="true"><span className="atlas-ghost-number">0{index+1}</span><FeaturedSculpture type={product.art}/></div>
        </article>)}
      </div>
      <nav className="atlas-navigation" aria-label="Featured products">
        {products.map((product,index)=><button type="button" key={product.title} onClick={()=>navigation.current?.(index)} aria-current={active===index?'step':undefined} aria-controls={`featured-product-${index+1}`}><span className="atlas-nav-number">0{index+1}</span><span>{product.title}</span><i aria-hidden="true"/></button>)}
      </nav>
      <div className="atlas-resolution" aria-hidden="true"><span/><i>↓</i><span/></div>
    </div>
  </section>;
}
