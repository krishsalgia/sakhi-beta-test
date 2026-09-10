import React,{useId,useState} from 'react';
import {t} from '../i18n';
import {slugify} from './repository';
import {seoChecks,seoDescription,seoTitle} from './seo';

export function TagInput({label,value,onChange,help}){
  const [draft,setDraft]=useState(''),id=useId();
  function commit(){const next=draft.split(',').map(text=>text.trim()).filter(Boolean);if(next.length)onChange([...new Set([...value,...next])]);setDraft('');}
  return <div className="editor-tags"><label htmlFor={id}>{t(label)}</label><div className="editor-tag-values">{value.map(tag=><span key={tag}>{tag}<button type="button" aria-label={`${t('Remove')} ${tag}`} onClick={()=>onChange(value.filter(item=>item!==tag))}>×</button></span>)}</div><div className="editor-tag-entry"><input id={id} value={draft} maxLength={80} onChange={e=>setDraft(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();commit();}}}/><button type="button" onClick={commit}>{t('Add')}</button></div><small>{t(help||'Type a phrase and press Enter to add it.')}</small></div>;
}
export function SEOPanel({values,change,field}){
  const checks=seoChecks(values);
  return <details className="editor-seo" id="editor-seo"><summary><span><strong>SEO</strong><small>{t('Help people find your article.')}</small></span><span aria-hidden="true">+</span></summary><div className="editor-seo-body">
    {field('focusKeyword','Focus Keyword',{maxLength:150,help:'What phrase should people search to find this article?',required:false})}
    {field('seoTitle','SEO Title',{maxLength:500,help:'This is the title that may appear in search results.',required:false,counter:60})}
    {field('metaDescription','Meta Description',{textarea:true,rows:4,maxLength:1000,help:'Write a short summary that may appear under your Blog title in search results.',required:false,counter:160})}
    <TagInput label="Related Keywords" value={values.relatedKeywords} onChange={value=>change('relatedKeywords',value)} help="Optional supporting phrases for planning your article."/>
    <div className="editor-search-preview"><h3>{t('Search Preview')}</h3><div><span>Sakhi Multistate Co-operative Credit Society</span><small>sakhimultistate.com/blogs/{slugify(values.slug)||'…'}</small><strong>{seoTitle(values)}</strong><p>{seoDescription(values)||t('Your article summary will appear here.')}</p></div><small>{t('A helpful preview. Search engines may display different text.')}</small></div>
    <div className="editor-seo-check"><h3>{t('SEO Check')}</h3><p>{t('Helpful reminders. These do not prevent publishing or promise search rankings.')}</p><ul>{checks.map(check=><li key={check.label} data-seo-status={check.status}><span className="editor-check-mark" aria-hidden="true">{check.status==='Good'?'✓':check.status==='Missing'?'○':'!'}</span><div><strong>{t(check.label)}</strong>{check.hint&&<p>{t(check.hint)}</p>}</div><span className="editor-check-status">{t(check.status)}</span></li>)}</ul></div>
  </div></details>;
}
