import React, { useEffect, useRef, useState } from 'react';
import { t, useLanguage } from '../i18n';
import { createPortal } from 'react-dom';
import { Icon } from '../ui';
import { BlogRepository, postURL, useBlogs } from './repository';
import { ArticleBody, articleSections, BlogImage, PostMeta } from './blog-ui';
import { seoTitle, seoDescription } from './seo';
import './blogs.css';

function useEditorialMotion(ref, key, progressRef) {
  useEffect(()=>{
    const root=ref.current;if(!root)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    const nodes=[...root.querySelectorAll('.journal-reveal')];
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.dataset.entered='true';observer.unobserve(entry.target);}}),{threshold:.08});
    const setup=()=>nodes.forEach(node=>{node.dataset.entered=media.matches||node.getBoundingClientRect().top<innerHeight*.95?'true':'false';if(!media.matches)observer.observe(node);});
    let frame=0;
    const paint=()=>{
      frame=0;const box=root.getBoundingClientRect();
      if(box.bottom<0||box.top>innerHeight)return;
      const body=root.querySelector('.journal-reading-body');
      if(body){const b=body.getBoundingClientRect();const value=Math.max(0,Math.min(1,(innerHeight*.3-b.top)/Math.max(1,b.height-innerHeight*.4)));root.style.setProperty('--reading-progress',value);progressRef?.current?.style.setProperty('--reading-progress',value);}
      root.style.setProperty('--journal-drift',media.matches?'0px':`${Math.max(-20,Math.min(20,-box.top*.022))}px`);
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    const header=document.querySelector('.header');
    const measure=()=>{const height=`${header?.getBoundingClientRect().height||96}px`;root.style.setProperty('--journal-header',height);progressRef?.current?.style.setProperty('--journal-header',height);scroll();};
    const resize=new ResizeObserver(measure);if(header)resize.observe(header);resize.observe(root);
    setup();measure();window.addEventListener('scroll',scroll,{passive:true});media.addEventListener('change',setup);
    return()=>{observer.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);media.removeEventListener('change',setup);};
  },[ref,key,progressRef]);
}
function StoryRow({ post, index }) {
  return <article className="journal-row journal-reveal"><span className="journal-row-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><a href={postURL(post)} className="journal-row-image" tabIndex={-1} aria-hidden="true"><BlogImage post={post}/></a><div className="journal-row-copy"><PostMeta post={post}/><h3><a href={postURL(post)}>{post.title}</a></h3><p>{post.excerpt}</p><a className="journal-text-link" href={postURL(post)}>{t('Read article')}<Icon/></a></div></article>;
}
export function BlogsPage() {
  const {posts,error}=useBlogs();const [category,setCategory]=useState('');const root=useRef(null);const language=useLanguage();
  const published=posts.filter(p=>p.status==='published').sort((a,b)=>b.publishDate.localeCompare(a.publishDate));
  const categories=[...new Set(published.map(p=>p.category))];
  const filtered=category?published.filter(p=>p.category===category):published;
  const lead=filtered.find(p=>p.featured)||filtered[0];const remaining=filtered.filter(p=>p.id!==lead?.id);
  useEditorialMotion(root,`${category}-${posts.length}`);
  useEffect(()=>{document.title=`${t('Blogs')} | Sakhi`;},[language]);
  useEffect(()=>{if(category&&!posts.some(p=>p.status==='published'&&p.category===category))setCategory('');},[posts,category]);
  return <div className="journal-page" ref={root} data-own-motion>
    <header className="journal-masthead"><div className="journal-kicker"><span>{t('Blogs')}</span><span>{t('Ideas for everyday progress')}</span></div><h1>{t('The Sakhi Journal.')}<span aria-hidden="true">✳</span></h1><div className="journal-masthead-bottom"><p>{t('A little clarity. A wider perspective.')}</p><span>{t('READ. REFLECT. MOVE FORWARD.')}</span></div></header>
    {published.length>0&&<nav className="journal-filters" aria-label={t('Filter articles by category')}><span>{t('Explore')}</span><div><button aria-pressed={!category} onClick={()=>setCategory('')}>{t('All articles')}<small>{published.length}</small></button>{categories.map(value=><button key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}</div></nav>}
    {lead?<div className="journal-edition" key={category}>
      <section className="journal-lead" aria-labelledby="journal-feature-title">
        <a href={postURL(lead)} className="journal-lead-image" tabIndex={-1} aria-hidden="true"><BlogImage post={lead} eager/><span className="journal-cover-arrow" aria-hidden="true"><Icon/></span></a>
        <div className="journal-lead-copy"><span className="journal-feature-label"><i/>{t('Featured article')}</span><PostMeta post={lead} reading/><h2 id="journal-feature-title"><a href={postURL(lead)}>{lead.title}</a></h2><p>{lead.excerpt}</p><a className="journal-read-button" href={postURL(lead)}>{t('Read article')}<span><Icon/></span></a><div className="journal-byline"><span>{t('By')}</span> {lead.author}</div></div>
      </section>
      {remaining.length>0&&<section className="journal-index" aria-labelledby="journal-index-title"><div className="journal-index-heading"><span className="journal-section-label">{t('KEEP EXPLORING')}</span><h2 id="journal-index-title">{t('On the reading list.')}</h2><span className="journal-index-mark" aria-hidden="true">↘</span></div><div>{remaining.map((post,index)=><StoryRow post={post} index={index+1} key={post.id}/>)}</div></section>}
    </div>:<div className="journal-empty" role="status"><span aria-hidden="true">✳</span><h2>{t(error?'Stories are temporarily unavailable.':'New stories are on their way.')}</h2><p>{t('There is always another perspective to discover. Check back soon.')}</p><a className="journal-text-link" href="/">{t('Back to Home')}<Icon/></a></div>}
    <div className="journal-endnote journal-reveal"><span aria-hidden="true">✳</span><p>{t('Every next step starts with a little understanding.')}</p><a href="/contact" className="journal-text-link">{t('Talk to Sakhi')}<Icon/></a></div>
  </div>;
}
export function ArticleLayout({post,preview=false}) {
  const sections=articleSections(post.blocks,post.content);
  return <>
    <header className="journal-story-heading"><div className="journal-story-top"><a className="journal-text-link" href="/blogs">← {t('Back to Blogs')}</a><span>{t(preview?'Article preview':'The Sakhi Journal.')}</span></div><PostMeta post={post} reading/><h1>{post.title}</h1><div className="journal-story-deck"><p>{post.excerpt}</p><div><span>{t('Written by')}</span><strong>{post.author}</strong></div></div></header>
    <BlogImage post={post} className="journal-story-cover" eager/>
    <div className="journal-reading-body"><aside className="journal-contents"><span className="journal-section-label">{t('IN THIS ARTICLE')}</span>{sections.map(section=><a href={`#${section.id}`} key={section.id}>{section.title}</a>)}<a href="/blogs" className="journal-text-link">← {t('Back to Blogs')}</a></aside><ArticleBody blocks={post.blocks} content={post.content}/></div>
  </>;
}
export function BlogArticlePage({slug}) {
  const {posts}=useBlogs();const root=useRef(null),progress=useRef(null);const language=useLanguage();const post=BlogRepository.getPostBySlug(slug);
  useEditorialMotion(root,post?.id,progress);
  useEffect(()=>{
    document.title=post?seoTitle(post):`${t('Article not found')} | Sakhi`;
    if(!post)return;
    let meta=document.querySelector('meta[name="description"]');const existing=!!meta,previous=meta?.content;
    if(!meta){meta=document.createElement('meta');meta.name='description';document.head.append(meta);}
    meta.content=seoDescription(post);
    return()=>{if(existing)meta.content=previous;else meta.remove();};
  },[post,language]);
  const others=post?posts.filter(p=>p.id!==post.id&&p.status==='published').sort((a,b)=>Number(b.category===post.category)-Number(a.category===post.category)||b.publishDate.localeCompare(a.publishDate)).slice(0,2):[];
  return <div className="journal-page journal-story" data-own-motion ref={root}>
    {post?<>{createPortal(<div className="journal-reading-progress" ref={progress} aria-hidden="true"><i/></div>,document.body)}<article><ArticleLayout post={post}/></article>{others.length>0&&<section className="journal-related" aria-labelledby="journal-related-title"><h2 id="journal-related-title">{t('Another perspective.')}</h2><div>{others.map((p,i)=><StoryRow post={p} index={i} key={p.id}/>)}</div></section>}</>:<div className="journal-empty"><span aria-hidden="true">↗</span><h1>{t('Article not found')}</h1><p>{t('This story is not available. Explore the latest published articles instead.')}</p><a className="journal-read-button" href="/blogs">{t('Back to Blogs')}<span><Icon/></span></a></div>}
  </div>;
}
