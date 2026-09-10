import React,{useEffect,useRef} from 'react';
import {t} from '../i18n';
export function AdminDialog({title,children,onClose,wide=false}){
  const ref=useRef(null);
  useEffect(()=>{const node=ref.current,previous=document.body.style.overflow;node.showModal();document.body.style.overflow='hidden';return()=>{node.close();document.body.style.overflow=previous;};},[]);
  return <dialog ref={ref} className={`blog-modal ${wide?'blog-modal--wide':''}`} aria-labelledby="blog-modal-title" onCancel={event=>{event.preventDefault();onClose();}}><div className="blog-modal-heading"><h2 id="blog-modal-title">{t(title)}</h2><button type="button" onClick={onClose} aria-label={t('Close dialog')}>×</button></div>{children}</dialog>;
}
