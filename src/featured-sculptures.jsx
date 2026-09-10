import React from './i18n/react';

// The four sculptures are illustrative, not charts or representations of returns.
export function FeaturedSculpture({ type }) {
  const prefix = `atlas-${type}`;
  return <svg className={`atlas-sculpture atlas-sculpture--${type}`} viewBox="0 0 640 560" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${prefix}-blue`} x1="100" y1="100" x2="480" y2="470" gradientUnits="userSpaceOnUse"><stop stopColor="#468ed1"/><stop offset=".35" stopColor="#004ca3"/><stop offset="1" stopColor="#082b4f"/></linearGradient>
      <linearGradient id={`${prefix}-green`} x1="140" y1="80" x2="440" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#b4c689"/><stop offset=".5" stopColor="#829d50"/><stop offset="1" stopColor="#425822"/></linearGradient>
      <linearGradient id={`${prefix}-paper`} x1="170" y1="100" x2="460" y2="480" gradientUnits="userSpaceOnUse"><stop stopColor="#fff"/><stop offset="1" stopColor="#e1e8d6"/></linearGradient>
      <linearGradient id={`${prefix}-edge`} x1="80" y1="200" x2="570" y2="390" gradientUnits="userSpaceOnUse"><stop stopColor="#c1d3df"/><stop offset=".5" stopColor="#faffff"/><stop offset="1" stopColor="#7d9bb4"/></linearGradient>
    </defs>
    {type === 'saving' && <>
      <path className="atlas-drawing" d="M65 455C158 484 486 366 540 116" stroke="#66813a" strokeWidth="1.5" strokeDasharray="3 7"/>
      {Array.from({length:7},(_,index) => {
        const x=125+index*61,y=414-index*42;
        return <g className="atlas-piece" style={{'--piece':index}} key={index}>
          <ellipse cx={x+6} cy={y+41} rx="68" ry="20" fill="#082b4f" opacity=".055"/>
          <path d={`M${x-65} ${y}v20a65 24 0 0 0 130 0v-20`} fill={`url(#${prefix}-${index%3===0?'blue':'green'})`}/>
          <ellipse cx={x} cy={y} rx="65" ry="24" fill={index%3===0?'#367cbc':'#b9cc99'}/>
          <ellipse cx={x} cy={y} rx="52" ry="17" stroke={index%3===0?'#85acd6':'#e3eccf'} strokeOpacity=".7"/>
          <path d={`M${x-43} ${y+29}q43 14 86 0`} stroke="#fff" strokeOpacity=".22"/>
        </g>;
      })}
      <circle cx="511" cy="121" r="5" fill="#66813a"/>
      <path d="M520 87v-22m-11 11h22" stroke="#004ca3" strokeWidth="2"/>
    </>}
    {type === 'growth' && <>
      <ellipse cx="327" cy="423" rx="207" ry="31" fill="#082b4f" opacity=".045"/>
      <g className="atlas-piece" style={{'--piece':1}}>
        <path d="M120 345C-1 247 104 106 223 185L416 343C537 433 614 251 484 208C346 161 299 476 120 345Z" transform="translate(0 16)" stroke="#193d33" strokeWidth="52"/>
        <path className="atlas-loop" d="M120 345C-1 247 104 106 223 185L416 343C537 433 614 251 484 208C346 161 299 476 120 345Z" stroke={`url(#${prefix}-green)`} strokeWidth="52"/>
        <path d="M120 338C3 242 107 115 220 191L413 349C524 431 601 251 482 215C349 174 301 470 120 338Z" stroke="#e4edcc" strokeOpacity=".6" strokeWidth="2"/>
        <path d="M218 181 418 345" stroke={`url(#${prefix}-blue)`} strokeWidth="54"/>
        <path d="M204 169 405 333" stroke="#7da4c6" strokeOpacity=".8" strokeWidth="2"/>
      </g>
      <path className="atlas-drawing" d="M170 421C205 359 242 360 276 293S350 209 390 108" stroke="#004ca3" strokeWidth="2" strokeDasharray="3 7"/>
      <path d="m374 116 16-8 5 17" stroke="#004ca3" strokeWidth="2"/>
      <circle cx="170" cy="421" r="5" fill="#66813a"/>
    </>}
    {type === 'days' && <>
      <ellipse cx="321" cy="451" rx="214" ry="33" fill="#082b4f" opacity=".045"/>
      <g className="atlas-piece atlas-calendar-back" style={{'--piece':0}}><g transform="rotate(-12 248 266)">
        <rect x="112" y="91" width="241" height="328" rx="17" fill="#082b4f"/>
        <rect x="112" y="81" width="241" height="328" rx="17" fill={`url(#${prefix}-blue)`}/>
        <path d="M136 142h193" stroke="#abc9e7" strokeOpacity=".55"/>
        <path d="M164 69v32m140-32v32" stroke="#c1d3df" strokeWidth="9" strokeLinecap="round"/>
        <text x="137" y="270" fill="#fff" fontSize="102" fontWeight="500" letterSpacing="-7">100</text>
        <g stroke="#ffffff35">{[0,1,2].map(row=><path key={row} d={`M141 ${317+row*20}h53m12 0h53m12 0h53`}/>)}</g>
      </g></g>
      <g className="atlas-piece atlas-calendar-front" style={{'--piece':3}}><g transform="rotate(10 405 330)">
        <path d="M294 177h211a17 17 0 0 1 17 17v246l-45 52H294a17 17 0 0 1-17-17V194a17 17 0 0 1 17-17" fill="#bdc9ae"/>
        <path d="M294 168h211a17 17 0 0 1 17 17v246l-45 52H294a17 17 0 0 1-17-17V185a17 17 0 0 1 17-17" fill={`url(#${prefix}-paper)`}/>
        <path d="M278 217h244" stroke="#66813a" strokeWidth="2"/>
        <path d="M323 156v32m150-32v32" stroke="#66813a" strokeWidth="9" strokeLinecap="round"/>
        <text x="299" y="352" fill="#425822" fontSize="100" fontWeight="500" letterSpacing="-7">200</text>
        <g stroke="#66813a55">{[0,1,2].map(row=><path key={row} d={`M304 ${392+row*19}h52m12 0h52m12 0h52`}/>)}</g>
        <path d="M477 483v-36a16 16 0 0 1 16-16h29" fill="#c5d3b1"/>
      </g></g>
      <path className="atlas-drawing" d="M77 355C32 529 546 532 574 252" stroke="#66813a" strokeWidth="1.5" strokeDasharray="3 7"/>
    </>}
    {type === 'together' && <>
      <ellipse cx="320" cy="450" rx="200" ry="31" fill="#082b4f" opacity=".04"/>
      <path className="atlas-drawing" d="m167 310 91-136 141 27 68 144-148 60Z" stroke="#66813a" strokeWidth="1.5" strokeDasharray="3 7"/>
      {[[258,174,'green'],[399,201,'blue'],[167,310,'blue'],[467,345,'green'],[319,405,'paper']].map(([x,y,color],index)=><g className="atlas-piece" style={{'--piece':index}} key={index}>
        <ellipse cx={x} cy={y+13} rx="74" ry="67" stroke={color==='paper'?'#8fa481':color==='blue'?'#082b4f':'#425822'} strokeWidth="32"/>
        <ellipse cx={x} cy={y} rx="74" ry="67" stroke={`url(#${prefix}-${color})`} strokeWidth="32"/>
        <path d={`M${x-73} ${y-14}a74 67 0 0 1 144 0`} stroke={color==='paper'?'#fff':'#ffffff60'} strokeWidth="2"/>
      </g>)}
      <circle cx="321" cy="292" r="7" fill="#66813a"/>
    </>}
  </svg>;
}
