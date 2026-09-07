import React from './i18n/react';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { branchLocations, getAreaBranches } from './branch-geography';
import { t, useLanguage } from './i18n';

const tileUrl=import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export default function CityBranchMap({area,selected,onChoose}) {
  const language = useLanguage();
  const container=useRef(null),mapRef=useRef(null),markers=useRef(new Map()),chooseRef=useRef(onChoose),resetRef=useRef(()=>{});
  const [tileError,setTileError]=useState(false);
  chooseRef.current=onChoose;
  useEffect(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const map=L.map(container.current,{scrollWheelZoom:false,zoomControl:false,zoomSnap:.25,zoomAnimation:!reduced.matches,fadeAnimation:!reduced.matches,markerZoomAnimation:!reduced.matches});
    mapRef.current=map;
    L.control.zoom({position:'bottomright'}).addTo(map);
    L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);
    const tiles=L.tileLayer(tileUrl,{maxZoom:19,keepBuffer:1,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    tiles.on('tileerror',()=>setTileError(true));
    const visible=getAreaBranches(area);
    const bounds=L.latLngBounds(visible.map(branch=>branchLocations[branch.id].point));
    const fit=animate=>map.fitBounds(bounds,{padding:[42,42],maxZoom:visible.length===1?14:12,animate:animate&&!reduced.matches,duration:.5});
    fit(false);resetRef.current=()=>fit(true);
    visible.forEach((branch,index)=>{
      const marker=L.marker(branchLocations[branch.id].point,{
        icon:L.divIcon({className:'branch-marker geo-branch-marker',html:`<span class="geo-pin" style="--pin-delay:${index*65}ms">${index+1}</span>`,iconSize:[40,40],iconAnchor:[20,20]}),
        keyboard:true,autoPanOnFocus:false,title:branch.name,
      }).addTo(map);
      const element=marker.getElement();
      element.setAttribute('aria-label',`Select ${branch.name} branch`);element.setAttribute('aria-pressed','false');element.dataset.branchMarker=branch.id;
      element.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();chooseRef.current(branch.id);}});
      const label=document.createElement('span');label.textContent=branch.name;
      marker.bindTooltip(label,{direction:'top',offset:[0,-20],className:'branch-map-tooltip'});
      marker.on('click',()=>chooseRef.current(branch.id));markers.current.set(branch.id,marker);
    });
    const resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe(container.current);
    const reduce=()=>{map.stop();map.options.zoomAnimation=!reduced.matches;map.options.fadeAnimation=!reduced.matches;};
    reduced.addEventListener('change',reduce);
    return()=>{resize.disconnect();reduced.removeEventListener('change',reduce);markers.current.clear();map.remove();mapRef.current=null;};
  },[area]);
  useEffect(()=>{
    // Update Leaflet's imperative labels in place, preserving camera and selection.
    for (const branch of getAreaBranches(area)) {
      const marker = markers.current.get(branch.id);
      if (!marker) continue;
      marker.getElement().title = t(branch.name);
      marker.getElement().setAttribute('aria-label', t(`Select ${branch.name} branch`));
      const label = document.createElement('span'); label.textContent = t(branch.name);
      marker.setTooltipContent(label);
    }
    for (const [selector, label] of [['.leaflet-control-zoom-in','Zoom in'],['.leaflet-control-zoom-out','Zoom out']]) {
      const button = container.current.querySelector(selector);
      if (button) { button.title=t(label); button.setAttribute('aria-label',t(label)); }
    }
    const attribution = container.current.querySelector('.leaflet-control-attribution');
    if (attribution) for (const node of attribution.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && /contributors|योगदानकर्ता|योगदानकर्ते/.test(node.textContent)) node.textContent = ` ${t('contributors')}`;
    }
  },[language,area]);
  useEffect(()=>{
    for(const [id,marker] of markers.current) {
      const active=id===selected;
      marker.getElement().classList.toggle('is-selected',active);marker.getElement().setAttribute('aria-pressed',String(active));marker.setZIndexOffset(active?1000:0);
      if(active) {marker.openTooltip();mapRef.current.flyTo(marker.getLatLng(),Math.max(mapRef.current.getZoom(),13),{animate:!window.matchMedia('(prefers-reduced-motion: reduce)').matches,duration:.65});}
      else marker.closeTooltip();
    }
  },[selected]);
  return <div className="city-map-frame"><div ref={container} className="city-geographic-map" role="region" aria-label={`${area.name} area geographic branch map`} /><button className="map-fit-all" onClick={()=>resetRef.current()}>Show all branches</button>{tileError && <div className="map-tile-message" role="status">Map tiles are unavailable. You can still explore every branch using the list.</div>}</div>;
}
