import React, { useEffect, useState } from 'react';
import { t, useLanguage } from '../i18n';
import { LanguageControl } from '../i18n/language-control';
import { Icon } from '../ui';
import { BlogRepository, useBlogs } from './repository';
import { formatDate } from './blog-ui';
import { AdminDialog } from './admin-dialog';
import { BlogEditor } from './blog-editor';
import { AdminSession } from './admin-auth';
import './admin.css';

function LoginForm({onLogin}) {
  const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[visible,setVisible]=useState(false),[error,setError]=useState('');
  function submit(event) {event.preventDefault();try{if(AdminSession.login(username.trim(),password)){onLogin();}else setError('Incorrect username or password. Please try again.');}catch(e){setError(e.message);}}
  return <div className="blog-login-layout"><div className="blog-login-intro"><span className="blog-admin-kicker">{t('SAKHI EDITORIAL')}</span><h1>{t('A place for your next story.')}</h1><p>{t('Sign in to manage the Sakhi Journal.')}</p><div className="blog-login-symbol" aria-hidden="true"><i/><i/><span>↗</span></div></div><form className="blog-login-form" onSubmit={submit}><span className="blog-admin-kicker">{t('EDITOR ACCESS')}</span><h2>{t('Welcome back.')}</h2><label htmlFor="admin-username">{t('Username')}<input id="admin-username" name="username" autoComplete="username" required value={username} onChange={e=>{setUsername(e.target.value);setError('');}} aria-invalid={!!error} aria-describedby={error?'login-error':undefined}/></label><label htmlFor="admin-password">{t('Password')}<span className="blog-password-field"><input id="admin-password" name="password" type={visible?'text':'password'} autoComplete="current-password" required value={password} onChange={e=>{setPassword(e.target.value);setError('');}} aria-invalid={!!error} aria-describedby={error?'login-error':undefined}/><button type="button" aria-label={t(visible?'Hide password':'Show password')} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{t(visible?'Hide':'Show')}</button></span></label>{error&&<p className="blog-form-error" id="login-error" role="alert">{t(error)}</p>}<button className="blog-admin-primary" type="submit">{t('Login')}<Icon/></button></form></div>;
}
export default function BlogAdminPage() {
  const [authenticated,setAuthenticated]=useState(AdminSession.isAuthenticated),[editing,setEditing]=useState(null),[deleting,setDeleting]=useState(null),[notice,setNotice]=useState(''),[filter,setFilter]=useState('all');
  const {posts,error}=useBlogs();const language=useLanguage();
  useEffect(()=>{document.title=`${t(authenticated?'Blog management':'Login')} | Sakhi`;},[language,authenticated]);
  const sorted=[...posts].sort((a,b)=>b.publishDate.localeCompare(a.publishDate));const shown=sorted.filter(post=>filter==='all'||post.status===filter);
  function toggle(post){try{BlogRepository.updatePost(post.id,{...post,status:post.status==='published'?'draft':'published'});setNotice(post.status==='published'?'Blog moved to drafts.':'Blog published.');}catch(e){setNotice(e.fields?'Complete the article details before publishing.':e.message);}}
  function remove(){try{BlogRepository.deletePost(deleting.id);setDeleting(null);setNotice('Blog deleted.');}catch(e){setNotice(e.message);setDeleting(null);}}
  return <div className="blog-admin-shell"><header className="blog-admin-header"><a href="/" className="blog-admin-logo" aria-label={t('Sakhi home')}><img src="/assets/sakhi-logo.png" alt="Sakhi Multi State Co Operative Credit Society Ltd." width="646" height="152"/></a><div><a href="/blogs" className="blog-admin-site-link">{t('View public Blogs')}<Icon/></a><LanguageControl/>{authenticated&&<button className="blog-admin-logout" onClick={()=>{AdminSession.logout();setAuthenticated(false);setEditing(null);setNotice('');}}>{t('Log out')}</button>}</div></header><main className="blog-admin-main" data-own-motion>
      {!authenticated?<LoginForm onLogin={()=>setAuthenticated(true)}/>:editing?<BlogEditor key={editing.id||'new'} post={editing.id?editing:null} onDone={post=>{setEditing(null);setNotice(post.status==='published'?'Blog saved and published.':'Draft saved.');}} onCancel={()=>setEditing(null)}/>:<>
        <div className="blog-dashboard-heading"><div><span className="blog-admin-kicker">{t('SAKHI EDITORIAL')}</span><h1>{t('Blog management')}</h1><p>{t('Make room for the next perspective.')}</p></div><button className="blog-admin-primary" onClick={()=>{setEditing({});setNotice('');}}>+ {t('Create blog')}</button></div>
        <div className="blog-dashboard-summary"><span><strong>{posts.length}</strong>{t('Total blogs')}</span><span><strong>{posts.filter(p=>p.status==='published').length}</strong>{t('Published')}</span><span><strong>{posts.filter(p=>p.status==='draft').length}</strong>{t('Draft')}</span></div>
        {(notice||error)&&<p className={`blog-admin-notice ${error?'is-error':''}`} role="status">{t(error||notice)}</p>}
        <div className="blog-management-tabs" aria-label={t('Filter blogs by status')}>{[['all','All blogs'],['published','Published'],['draft','Draft']].map(([value,label])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{t(label)}</button>)}</div>
        <div className="blog-management-list">{shown.map(post=><article className="blog-management-row" key={post.id}><div className="blog-management-title"><span className={`blog-status blog-status--${post.status}`}>{t(post.status==='published'?'Published':'Draft')}</span>{post.featured&&<span className="blog-featured-label">{t('Featured')}</span>}<h2>{post.title}</h2><p>{post.category||'—'} <span>·</span> {formatDate(post.publishDate)}</p></div><div className="blog-management-actions"><button className="blog-admin-secondary" onClick={()=>{setEditing(post);setNotice('');}}>{t('Edit')}</button><button className="blog-admin-text" onClick={()=>toggle(post)}>{t(post.status==='published'?'Unpublish':'Publish')}</button><button className="blog-admin-delete" onClick={()=>setDeleting(post)}>{t('Delete')}</button></div></article>)}</div>
        {shown.length===0&&<div className="blog-admin-empty"><h2>{t('No blogs here yet.')}</h2><p>{t('Create a story or choose another status.')}</p></div>}
      </>}
    </main><div className="blog-admin-footnote">Sakhi <span>／</span> {t('Editorial workspace')}</div>
    {deleting&&<AdminDialog title="Delete this blog?" onClose={()=>setDeleting(null)}><h3 className="blog-delete-title">{deleting.title}</h3><p>{t('This removes the blog from this browser and the public listing. This action cannot be undone.')}</p><div className="blog-modal-actions"><button className="blog-admin-secondary" autoFocus onClick={()=>setDeleting(null)}>{t('Cancel')}</button><button className="blog-admin-danger" onClick={remove}>{t('Delete blog')}</button></div></AdminDialog>}
  </div>;
}
