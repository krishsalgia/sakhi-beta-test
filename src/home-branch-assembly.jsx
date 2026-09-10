import React from './i18n/react';
import { useLayoutEffect, useRef } from 'react';
import { BranchNetwork } from './branch-network';
import { Icon } from './ui';
import './home-branch-assembly.css';

// One existing India SVG serves the spatial scene and the interactive explorer.
const regions = [
  ['IN-GJ','IN-MP','IN-MH','IN-RJ'],
  ['IN-KA','IN-TG','IN-AP','IN-TN','IN-KL','IN-GA'],
  ['IN-CT','IN-OR','IN-JH','IN-BR','IN-WB','IN-UP'],
  ['IN-PB','IN-HR','IN-UT','IN-HP','IN-JK','IN-DL','IN-CH'],
  ['IN-AS','IN-AR','IN-SK','IN-ML','IN-NL','IN-MN','IN-MZ','IN-TR'],
  ['IN-DD','IN-DN','IN-PY','IN-AN','IN-LD'],
];
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
const between=(p,a,b)=>smooth((p-a)/(b-a));
const mix=(a,b,t)=>a+(b-a)*t;
const color=(a,b,t)=>`rgb(${a.map((v,i)=>mix(v,b[i],t)).join(',')})`;

export function HomeBranchAssembly() {
  const root=useRef(null),skip=useRef(null);
  useLayoutEffect(()=>{
    const host=root.current,pin=host.querySelector('.cinema-pin'),section=host.querySelector('.branch-network');
    const svg=host.querySelector('.india-map'),map=host.querySelector('.india-map-wrap'),choices=host.querySelector('.territory-tabs');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,locked=false,previous=-1,pieces=[],camera={x:0,y:0,scale:1};
    const rings=[];
    const set=(name,value)=>host.style.setProperty(name,String(value));
    const available=value=>[map,choices].forEach(node=>{node.inert=!value;node.setAttribute('aria-hidden',String(!value));});
    const measure=()=>{
      const header=document.querySelector('.header').getBoundingClientRect(),rect=host.getBoundingClientRect();
      set('--cinema-pin-top',`${header.bottom+12}px`);
      set('--cinema-height',`${Math.max(480,innerHeight-header.bottom-24)}px`);
      set('--cinema-outset',`${Math.max(0,rect.left-12)}px`);
      if(locked)return;
      const transform=svg.style.transform;svg.style.transform='none';
      const box=svg.getBoundingClientRect(),scene=pin.getBoundingClientRect();
      const sceneHeight=Math.max(480,innerHeight-header.bottom-24),mobile=innerWidth<=600;
      const widthFit=(scene.width+2*Math.max(0,rect.left-12)-(mobile?60:100))/Math.min(box.width,box.height*612/696);
      camera={x:scene.width*.5-(box.left-scene.left+box.width/2),y:sceneHeight*.49-(box.top-scene.top+box.height/2),scale:Math.min(sceneHeight*(mobile?.66:.74)/box.height,mobile?1.12:1.85,widthFit),maxScale:widthFit};
      svg.style.transform=transform;
      pieces=[...svg.querySelectorAll('use')].map(node=>{const id=node.getAttribute('href').split('#')[1],region=regions.findIndex(ids=>ids.includes(id)),index=regions[region].indexOf(id);return {node,id,region,index,box:node.getBBox()};});
      previous=-1;requestUpdate();
    };
    const paint=p=>{
      if(p===previous)return;previous=p;
      const compact=innerWidth<=600,tablet=innerWidth<=1100;
      const dock=between(p,.84,1),title=between(p,.07,.36),rise=between(p,.10,.74),payoff=between(p,.73,.82);
      host.dataset.assembly=p>=1?'ready':'assembling';host.dataset.scenePhase=p<.73?'india':p<.88?'presence':'explore';
      set('--cinema-progress',p);set('--cinema-dock',dock);set('--cinema-title-out',title);set('--cinema-title-opacity',(1-title)*.94);
      set('--cinema-field-opacity',1-dock);set('--cinema-latitude',rise);set('--cinema-panel',between(p,.88,1));
      set('--cinema-labels',payoff*(1-between(p,.87,.94)));set('--cinema-mh',between(p,.735,.79));set('--cinema-ka',between(p,.78,.835));
      available(p>=1);
      const tilt=reduced.matches?0:(compact?12:27)*(1-between(p,.24,.73));
      const push=reduced.matches?0:Math.sin(Math.PI*between(p,.1,.77))*(compact?.05:.17);
      const scale=reduced.matches?1:mix(Math.min(camera.scale+push,camera.maxScale),1,dock);
      svg.style.transform=reduced.matches?'none':`perspective(1400px) translate3d(${camera.x*(1-dock)}px,${camera.y*(1-dock)}px,0) rotateX(${tilt}deg) rotateZ(${-7*(1-rise)}deg) scale(${scale})`;
      const arrivals=[];
      for(const {node,id,region,index} of pieces){
        const start=.13+region*.051+(index%4)*.009,local=clamp((p-start)/(.25+(index%2)*.026));
        const flight=1-Math.pow(1-clamp(local/.82),3),remainder=1-flight,lock=Math.sin(Math.PI*clamp((local-.78)/.22));
        const side=region===0?-1:region===2||region===4?1:(index%2?-1:1),reach=compact?52:tablet?145:240;
        const x=side*reach*(.8+(index%3)*.12)*remainder;
        const y=(region===1?1:region===3?-1:(index%2?.22:-.22))*(compact?65:185)*remainder;
        const depth=(index%2?1:-1)*(compact?65:tablet?210:380)*remainder,rotation=(compact?28:tablet?48:68)*remainder;
        const mh=id==='IN-MH',ka=id==='IN-KA',emphasis=mh?between(p,.735,.79):ka?between(p,.78,.835):0;
        const lift=(mh||ka)&&p<(mh?.85:.89)?Math.sin(Math.PI*between(p,mh?.735:.78,mh?.85:.89)):0;
        node.style.opacity=between(local,.025,.26);
        node.style.transform=reduced.matches?'none':local>=1&&lift===0?'none':`perspective(900px) translate3d(${x}px,${y}px,${depth+lift*42}px) rotateX(${rotation*(region===1?-.8:.45)}deg) rotateY(${-side*rotation}deg) rotateZ(${side*remainder*(compact?9:22)}deg) scale(${1+remainder*.18-lock*.035+lift*.075})`;
        if(!reduced.matches&&p<.74&&local>0&&local<1)arrivals.push({node,opacity:between(local,.025,.26)});
        const border=between(local,.64,1);node.style.strokeOpacity=border;node.style.strokeDasharray=local>=1?'none':'2200';node.style.strokeDashoffset=local>=1?'0':String(2200*(1-border));
        const neutral=color([171,197,217],[220,231,238],between(p,.70,1));
        node.style.fill=mh||ka?color([197,216,230],mh?[0,76,163]:[102,129,58],emphasis):neutral;
        node.style.stroke=mh||ka?color([238,246,250],mh?[0,76,163]:[102,129,58],emphasis*.65):'#f5faff';node.style.strokeWidth=String(1.3+lift*2.2);
      }
      // One batched geometry read after all transform writes. Real SVG bounds
      // account for nested perspective and external use references; the field
      // fades in foreground pieces before they can cross its edge.
      if(arrivals.length){
        const field=host.querySelector('.cinema-field').getBoundingClientRect();
        const bounds=arrivals.map(item=>({...item,box:item.node.getBoundingClientRect()}));
        bounds.forEach(({node,box,opacity})=>{
          const edge=Math.min(box.left-field.left-16,field.right-16-box.right,box.top-field.top-55,field.bottom-62-box.bottom);
          node.style.opacity=opacity*smooth(edge/30);
        });
      }
      rings.forEach(({node,id})=>{const beat=clamp((p-(id==='IN-MH'?.75:.795))/.105);node.style.opacity=String(Math.sin(Math.PI*beat)*.65);node.style.transform=`scale(${.65+beat*.9})`;});
      if(p>=1){svg.style.transform='none';pieces.forEach(({node})=>node.removeAttribute('style'));}
    };
    const update=()=>{frame=0;if(locked)return;const top=parseFloat(host.style.getPropertyValue('--cinema-pin-top')),runway=parseFloat(getComputedStyle(host,'::after').height),lead=innerHeight*.20;const progress=clamp((top-host.getBoundingClientRect().top+lead)/(runway+lead));paint(progress>.999?1:progress);};
    const requestUpdate=()=>{if(!frame&&!locked)frame=requestAnimationFrame(update);};
    const finish=()=>{if(locked)return;paint(1);locked=true;host.dataset.assembly='exploring';svg.style.removeProperty('transform');pieces.forEach(({node})=>node.removeAttribute('style'));rings.forEach(({node})=>node.style.opacity='0');[map,choices].forEach(node=>node.removeAttribute('aria-hidden'));};
    const activate=event=>{if(previous>=1&&event.target.closest('.map-state,.territory-tabs button'))finish();};
    const focus=event=>{if(event.target.closest('.branch-network'))finish();};
    const skipScene=()=>{const top=host.getBoundingClientRect().top+scrollY,runway=parseFloat(getComputedStyle(host,'::after').height);finish();scrollTo({top:top+runway-parseFloat(host.style.getPropertyValue('--cinema-pin-top')),behavior:'instant'});section.querySelector('.network-navigation').focus({preventScroll:true});};
    available(false);measure();cancelAnimationFrame(frame);update();
    const setupRings=()=>{measure();if(rings.length)return;pieces.filter(p=>['IN-MH','IN-KA'].includes(p.id)).forEach(({id,box})=>{const node=document.createElementNS('http://www.w3.org/2000/svg','circle');node.setAttribute('class',`cinema-presence-ring ${id==='IN-MH'?'is-mh':'is-ka'}`);node.setAttribute('cx',String(box.x+box.width/2));node.setAttribute('cy',String(box.y+box.height/2));node.setAttribute('r','78');node.setAttribute('aria-hidden','true');svg.appendChild(node);rings.push({node,id});});previous=-1;requestUpdate();};
    const asset=new Image();asset.onload=setupRings;asset.src='/assets/india-states.svg';
    const observer=new ResizeObserver(measure);observer.observe(section);
    window.addEventListener('scroll',requestUpdate,{passive:true});window.addEventListener('resize',measure,{passive:true});reduced.addEventListener('change',measure);
    host.addEventListener('click',activate,true);host.addEventListener('focusin',focus);const skipButton=skip.current;skipButton.addEventListener('click',skipScene);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();asset.onload=null;rings.forEach(({node})=>node.remove());window.removeEventListener('scroll',requestUpdate);window.removeEventListener('resize',measure);reduced.removeEventListener('change',measure);host.removeEventListener('click',activate,true);host.removeEventListener('focusin',focus);skipButton.removeEventListener('click',skipScene);};
  },[]);
  return <div className="home-branch-assembly" ref={root} data-own-motion data-assembly="assembling" data-scene-phase="india"><div className="cinema-pin">
    <div className="cinema-field" aria-hidden="true"><div className="cinema-horizon"/><div className="cinema-meridian"/><div className="cinema-light"/></div>
    <div className="cinema-title" aria-hidden="true"><span>Find Sakhi</span><em>near you.</em></div>
    <div className="cinema-scene-top"><span>OUR BRANCH NETWORK</span><button ref={skip}>Explore the map <Icon/></button></div>
    <div className="cinema-presence" aria-hidden="true"><div><span>MH</span><strong>Maharashtra</strong></div><div><span>KA</span><strong>Karnataka</strong></div></div>
    <BranchNetwork/>
    <div className="cinema-rail" aria-hidden="true"><div><span>India</span><span>Our presence.</span><span>Your branch</span></div><i/></div>
  </div></div>;
}
