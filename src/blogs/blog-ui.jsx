import React, { useEffect, useState } from 'react';
import { t } from '../i18n';
import { safeImage } from './repository';
import { blocksText, inlineRuns, normalizeBlocks, runText } from './blocks';
import { useAssetImage } from './use-asset-image';

// Raw React is intentional: authored text must never pass through automatic translation.
export function BlogImage({ post, className = '', eager = false }) {
  const asset = useAssetImage(post.featuredImageId);
  const source = post.featuredImageId ? asset.src : safeImage(post.image);
  const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false);
  useEffect(() => { setLoaded(false); setFailed(false); }, [source]);
  const variant = [...post.id || post.slug || 'sakhi'].reduce((sum,c) => sum+c.charCodeAt(0),0)%4;
  return <div className={`journal-image journal-image--${variant} ${className}`}>
    <div className="journal-placeholder" aria-hidden={loaded || undefined} role="img" aria-label={t('Article image placeholder')}>
      <span className="journal-image-label">{t('Image placeholder')}<i aria-hidden="true">↗</i></span>
      <svg className="journal-paper-art" viewBox="0 0 800 560" fill="none" aria-hidden="true">
        <ellipse cx="415" cy="457" rx="245" ry="40" fill="#082b4f" opacity=".12"/>
        {[24,18,12,6].map(n=><path key={n} d={`M154 ${116+n} 405 ${176+n} 649 ${103+n}v298L405 ${474+n} 154 ${414+n}Z`} fill="#c7d3c0" stroke="#9dab9b" strokeWidth="1"/>)}
        <path d="m154 116 251 60v298l-251-60Z" fill="#f4f6ed"/>
        <path d="m405 176 244-73v298l-244 73Z" fill="#fff"/>
        <path d="M405 176v298" stroke="#bcc9b9" strokeWidth="2"/>
        <path d="m183 155 70 17m-70 12 118 28" stroke="#66813a" strokeWidth="4"/>
        <path d="m447 212 156-47m-156 63 128-39m-128 55 151-45" stroke="#aab8c1" strokeWidth="2"/>
        <path d="m184 354 154 37m-154-21 121 29m-121-13 150 36" stroke="#a4b29a" strokeWidth="2"/>
        <ellipse cx="281" cy="285" rx="63" ry="56" transform="rotate(14 281 285)" stroke="#004ca3" strokeWidth="25"/>
        <path d="M242 333a63 56 14 0 0 81-7" stroke="#829d50" strokeWidth="25"/>
        <path d="m456 379 28-39 26 6 39-77 19 16 35-71" stroke="#66813a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m584 222 19-8 4 19" stroke="#66813a" strokeWidth="4"/>
        <path d="m382 165 23 11v101l-12-9-11 3Z" fill="#e5a934"/>
        <path d="m147 467-28 8m-13-8 9 29M670 69l21-5m-13-10 5 27" stroke="currentColor" strokeOpacity=".5" strokeWidth="2"/>
      </svg>
      <span className="journal-image-signature" aria-hidden="true">SAKHI <span>／</span> JOURNAL</span>
    </div>
    {source && !failed && <img src={source} alt={post.featuredImageAlt || ''} loading={eager ? 'eager' : 'lazy'} decoding="async" onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)} style={{opacity:loaded?1:0}}/>}
  </div>;
}
export const readingMinutes = content => Math.max(1, Math.ceil((Array.isArray(content)?blocksText(content):String(content)).trim().split(/\s+/).length/190));
export const formatDate = date => {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat(document.documentElement.lang, {day:'numeric',month:'short',year:'numeric'}).format(parsed);
};
export function PostMeta({ post, reading = false }) {
  return <div className="journal-meta"><span className="journal-category">{post.category}</span><span aria-hidden="true">·</span><time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>{reading&&<><span aria-hidden="true">·</span><span>{readingMinutes(post.blocks || post.content)} {t('min read')}</span></>}</div>;
}
export function InlineContent({value}) {
  return inlineRuns(value).map((run,index)=>{
    let node=run.text.split('\n').map((line,n)=><React.Fragment key={n}>{n>0&&<br/>}{line}</React.Fragment>);
    if(run.bold)node=<strong>{node}</strong>;
    if(run.italic)node=<em>{node}</em>;
    if(run.href)node=<a href={run.href} {...(/^https?:/.test(run.href)?{target:'_blank',rel:'noopener noreferrer'}:{})}>{node}</a>;
    return <React.Fragment key={index}>{node}</React.Fragment>;
  });
}
function InlineImage({block}) {
  const asset=useAssetImage(block.imageId),[failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[asset.src]);
  if(asset.loading&&block.width&&block.height)return <div className="journal-inline-image journal-image-pending" style={{aspectRatio:`${block.width}/${block.height}`}} aria-hidden="true"/>;
  if(!asset.src||failed)return null;
  return <figure className="journal-inline-image"><img src={asset.src} alt={block.alt} width={block.width||undefined} height={block.height||undefined} onError={()=>setFailed(true)}/>{block.caption.trim()&&<figcaption>{block.caption}</figcaption>}</figure>;
}
export const articleSections=(blocks,content)=>normalizeBlocks(blocks,content).filter(block=>block.type==='heading').map((block,index)=>({id:`article-section-${index}`,title:runText(block.content)}));
export function ArticleBody({blocks,content}) {
  let heading=0;
  return <div className="journal-prose">{normalizeBlocks(blocks,content).map(block=>{
    if(block.type==='image')return <InlineImage block={block} key={block.id}/>;
    if(block.items){const List=block.type==='numberedList'?'ol':'ul';return <List key={block.id}>{block.items.map((item,n)=><li key={n}><InlineContent value={item}/></li>)}</List>;}
    const Element=block.type==='heading'?`h${block.level}`:block.type==='quote'?'blockquote':'p';
    return <Element key={block.id} id={block.type==='heading'?`article-section-${heading++}`:undefined}><InlineContent value={block.content}/></Element>;
  })}</div>;
}
