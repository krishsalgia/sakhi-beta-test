import React from './i18n/react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { branches } from './branch-data';
import { branchAreas, branchLocations, getAreaBranches, projectStatePoint, stateShapes } from './branch-geography';
import { Icon } from './ui';
import './branch-map.css';

const CityBranchMap=lazy(()=>import('./city-branch-map'));
const states=[{id:'IN-MH',name:'Maharashtra',short:'MH'},{id:'IN-KA',name:'Karnataka',short:'KA'}];
const inactiveStates=['IN-AN','IN-AP','IN-AR','IN-AS','IN-BR','IN-CH','IN-CT','IN-DD','IN-DL','IN-DN','IN-GA','IN-GJ','IN-HP','IN-HR','IN-JH','IN-JK','IN-KL','IN-LD','IN-ML','IN-MN','IN-MP','IN-MZ','IN-NL','IN-OR','IN-PB','IN-PY','IN-RJ','IN-SK','IN-TG','IN-TN','IN-TR','IN-UP','IN-UT','IN-WB'];
const keySelect=callback=>event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();callback();}};

function IndiaMap({onState,highlighted,onHighlight}) {
  return <div className="india-map-wrap"><svg className="india-map" viewBox="0 0 612 696" role="group" aria-labelledby="india-map-title india-map-desc">
    <title id="india-map-title">India — choose a state</title><desc id="india-map-desc">Select Maharashtra or Karnataka to explore Sakhi locations. Individual branches appear only on city maps.</desc>
    <g className="inactive-states" aria-hidden="true">{inactiveStates.map(id=><use key={id} href={`/assets/india-states.svg#${id}`} />)}</g>
    {states.map(state=><g key={state.id} className={`map-state ${state.id==='IN-MH'?'map-state-verified':'map-state-territory'} ${highlighted===state.id?'is-selected':''}`} role="button" tabIndex="0" aria-label={`Explore ${state.name}`} onPointerEnter={()=>onHighlight(state.id)} onPointerLeave={()=>onHighlight(null)} onFocus={()=>onHighlight(state.id)} onBlur={()=>onHighlight(null)} onClick={()=>onState(state.id)} onKeyDown={keySelect(()=>onState(state.id))}><use href={`/assets/india-states.svg#${state.id}`} /></g>)}
    </svg><div className="map-orbit orbit-a" aria-hidden="true" /><div className="map-orbit orbit-b" aria-hidden="true" /><div className="map-location-label"><span>01</span><p>Start with a state.<br />Find your local Sakhi.</p></div></div>;
}
function StateMap({state,onCity,highlighted,onHighlight}) {
  const hasCities=state.id==='IN-MH';
  return <div className={`state-map-wrap ${hasCities?'':'state-pending'}`}><svg className="state-detail-map" viewBox="0 0 800 680" role="group" aria-labelledby="state-map-title">
    <title id="state-map-title">{state.name}{hasCities?' — choose a city or area':' — branch information is being updated'}</title>
    <path className="state-outline" d={stateShapes[state.name].path} /><text className="state-map-name" x="465" y="235" textAnchor="middle">{state.name.toUpperCase()}</text>
    <g className="map-north" transform="translate(722 50)" aria-hidden="true"><path d="M0 26V0m-6 9 6-9 6 9" /><text y="43" textAnchor="middle">N</text></g>
    {hasCities && branchAreas.map((area,index)=>{const [x,y]=projectStatePoint(state.name,branchLocations[area.anchor].point);const [lx,ly]=area.label;return <g key={area.id} className={`city-marker ${highlighted===area.id?'is-selected':''}`} role="button" tabIndex="0" aria-label={`Explore ${area.name}, ${area.branches.length} ${area.branches.length===1?'location':'locations'}`} style={{'--city-delay':`${index*65+220}ms`}} onPointerEnter={()=>onHighlight(area.id)} onPointerLeave={()=>onHighlight(null)} onFocus={()=>onHighlight(area.id)} onBlur={()=>onHighlight(null)} onClick={()=>onCity(area.id)} onKeyDown={keySelect(()=>onCity(area.id))}>
      <path className="city-leader" d={`M${x} ${y} L${lx<x?lx+150:lx} ${ly+24}`} /><circle className="city-point-halo" cx={x} cy={y} r="12" /><circle className="city-point" cx={x} cy={y} r="5" /><rect className="city-label-surface" x={lx} y={ly} width="150" height="48" rx="12" /><text className="city-label" x={lx+15} y={ly+29}>{area.name}</text><text className="city-count" x={lx+132} y={ly+29} textAnchor="end">{area.branches.length}</text>
    </g>;})}
    </svg>{!hasCities && <div className="state-map-pending"><span className="pending-dot" />Branch information is being updated.</div>}</div>;
}
function BranchDetails({branch}) {
  return <article className="selected-branch" key={branch.id} aria-live="polite"><div className="selected-branch-top"><span>{branch.city} / {branch.state}</span><span>BRANCH DETAILS</span></div><h3>{branch.name}</h3><span className="branch-locality">{branchLocations[branch.id].locality}</span><p>{branch.address}</p><div>{branch.phone && <a href={`tel:${branch.phone}`}>{branch.phone}<Icon /></a>}{branch.email && <a href={`mailto:${branch.email}`}>{branch.email}<Icon /></a>}</div></article>;
}

export function BranchNetwork({ dedicated = false }) {
  const [view,setView]=useState({state:null,city:null}),[selected,setSelected]=useState(null),[highlighted,setHighlighted]=useState(null),[motion,setMotion]=useState('idle');
  const timer=useRef(null),navigation=useRef(null),list=useRef(null);
  const state=states.find(item=>item.id===view.state),area=branchAreas.find(item=>item.id===view.city),branch=branches.find(item=>item.id===selected);
  const level=area?'city':state?'state':'india';
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  const navigate=next=>{
    if(timer.current||(next.state===view.state&&next.city===view.city))return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setHighlighted(next.city||next.state);setMotion('leaving');
    const commit=()=>{setView(next);setSelected(null);setHighlighted(null);setMotion('entering');timer.current=null;requestAnimationFrame(()=>{navigation.current?.focus({preventScroll:true});if(innerWidth<=1000)navigation.current?.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});});};
    if(reduced)commit();else timer.current=setTimeout(commit,240);
  };
  const chooseState=id=>navigate({state:id,city:null});
  const chooseCity=id=>navigate({state:'IN-MH',city:id});
  const chooseBranch=id=>{setSelected(id);requestAnimationFrame(()=>{const card=list.current?.querySelector(`[data-branch="${id}"]`);if(card&&list.current.scrollWidth>list.current.clientWidth)list.current.scrollTo({left:card.offsetLeft-list.current.offsetLeft-16,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});};
  return <section className="branch-network" aria-labelledby="branch-network-title" data-map-level={level}>
    <div className="network-heading"><div><span className="network-kicker"><i /> VERIFIED BRANCH NETWORK</span><h2 id="branch-network-title">Find Sakhi<br /><em>near you.</em></h2></div><div><p>Explore the locations we could verify for the correct Sakhi Multi State Co-operative Credit Society.</p><span>India-wide research · verified locations only</span></div></div>
    <div className="network-navigation" ref={navigation} tabIndex="-1"><nav className="network-breadcrumbs" aria-label="Branch map navigation"><button onClick={()=>navigate({state:null,city:null})} aria-current={!state?'location':undefined}>India</button>{state&&<><span aria-hidden="true">/</span><button onClick={()=>chooseState(state.id)} aria-current={!area?'location':undefined}>{state.name}</button></>}{area&&<><span aria-hidden="true">/</span><span aria-current="location">{area.name}</span></>}</nav>{state&&<button className="network-back" onClick={()=>area?chooseState(state.id):navigate({state:null,city:null})}><Icon />Back to {area?state.name:'India'}</button>}</div>
    <p className="network-announcement" role="status">{area?`${area.name}. ${area.branches.length} Sakhi locations. Select a branch.`:state?`${state.name}. ${state.id==='IN-MH'?'Choose a city or area.':'Branch information is being updated.'}`:'Choose Maharashtra or Karnataka to explore Sakhi locations.'}</p>
    <div className="network-workspace" data-level={level} data-motion={motion} data-target={highlighted}>
      <div className="map-panel"><div className="map-panel-top"><span>{area?`${area.name} / BRANCH LOCATIONS`:state?`${state.name} / ${state.id==='IN-MH'?'CITIES & AREAS':'OUR PRESENCE'}`:'INDIA / CHOOSE A STATE'}</span><span><i />{area?'03':state?'02':'01'} / 03</span></div>
        <div className="network-map-stage" key={`${view.state}-${view.city}`}>{!state?<IndiaMap onState={chooseState} highlighted={highlighted} onHighlight={setHighlighted} />:!area?<StateMap state={state} onCity={chooseCity} highlighted={highlighted} onHighlight={setHighlighted} />:<Suspense fallback={<div className="city-map-loading" role="status">Opening the {area.name} map…</div>}><CityBranchMap area={area} selected={selected} onChoose={chooseBranch} /></Suspense>}</div>
        <p className="map-credit">{area?'Markers indicate branch localities; use the full address when visiting. Drag to explore.':state?'Geographic state view. Choose a city or area to see individual branches.':<>Stylized administrative map. Map geometry adapted from the MIT-licensed <a href="https://github.com/vishalvoid/react-india-map" target="_blank" rel="noreferrer">React India Map project</a>.</>}</p>
      </div>
      <div className="branch-panel"><div className="network-panel-stage" key={`${view.state}-${view.city}`}>
        {!state?<><div className="network-level-intro"><span className="network-kicker">A LITTLE CLOSER TO YOU</span><h3>Our presence.</h3><p>Choose a state to explore Sakhi locations.</p></div>
          <div className="territory-tabs" role="group" aria-label="Choose a state">{states.map(item=><button key={item.id} aria-label={`Choose ${item.name}`} className={highlighted===item.id?'is-highlighted':''} onPointerEnter={()=>setHighlighted(item.id)} onPointerLeave={()=>setHighlighted(null)} onFocus={()=>setHighlighted(item.id)} onBlur={()=>setHighlighted(null)} onClick={()=>chooseState(item.id)}><span>{item.short}</span><div><strong>{item.name}</strong><small>{item.id==='IN-MH'?'12 locations · 6 cities & areas':'Branch information being updated'}</small></div><Icon /></button>)}</div><div className="network-path" aria-hidden="true"><span>State</span><i /><span>City</span><i /><span>Your branch</span></div></>
          :!area?<><div className="network-level-intro"><span className="network-kicker">EXPLORE BY CITY & AREA</span><h3>{state.name}.</h3><p>{state.id==='IN-MH'?'Explore Sakhi locations across Maharashtra.':'Karnataka branch information is being updated.'}</p></div>
            {state.id==='IN-MH'?<div className="area-list" role="group" aria-label="Choose a city or area">{branchAreas.map(item=><button className={`area-choice ${highlighted===item.id?'is-highlighted':''}`} key={item.id} onPointerEnter={()=>setHighlighted(item.id)} onPointerLeave={()=>setHighlighted(null)} onFocus={()=>setHighlighted(item.id)} onBlur={()=>setHighlighted(null)} onClick={()=>chooseCity(item.id)} aria-label={`Choose ${item.name}`}><span className="area-number">{String(item.branches.length).padStart(2,'0')}</span><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><Icon /></button>)}</div>:<div className="territory-empty"><span>STAY CONNECTED</span><h4>Your connection<br />to Sakhi.</h4><p>Our verified directory does not yet include Karnataka branch addresses.</p><button onClick={()=>chooseState('IN-MH')}>Explore Maharashtra <Icon /></button></div>}</>
          :<><div className="network-level-intro city-level-intro"><span className="network-kicker">{area.subtitle}</span><h3>{area.name}.</h3><p>{area.branches.length} Sakhi {area.branches.length===1?'location':'locations'} · choose your branch.</p></div>
            <div className="city-branch-content">{branch?<BranchDetails branch={branch}/>:<div className="branch-selection-hint"><span className="hint-pin"><Icon /></span><p>Select a map marker or branch card for the full address and contact details.</p></div>}
              <div className="branch-list" ref={list} aria-label={`${area.name} Sakhi branches`}>{getAreaBranches(area).map((item,index)=><button key={item.id} data-branch={item.id} className={`branch-card ${selected===item.id?'is-selected':''}`} aria-pressed={selected===item.id} onClick={()=>chooseBranch(item.id)}><span>{String(index+1).padStart(2,'0')}</span><strong>{item.name}</strong><small>{item.city} · {item.district}</small><Icon /></button>)}</div>
            </div></>}
      </div></div>
    </div>
    {!dedicated && <div className="network-page-link"><span>Your local Sakhi, a little closer.</span><a className="text-link" href="/branches">View all branches <Icon /></a></div>}
  </section>;
}
