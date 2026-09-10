import { useSyncExternalStore } from 'react';
import { demoPosts } from './demo-posts';

// Single persistence boundary. Replace this repository with an API before production.
const KEY = 'sakhi.blogs.v1';
let snapshot;
const subscribers = new Set();
export const slugify = text => String(text).normalize('NFC').trim().toLowerCase().replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-|-$/g, '');
export const postURL = post => `/blogs/${encodeURIComponent(post.slug)}`;
export function safeImage(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^\/(?!\/)/.test(text)) return text;
  if (/^(?:assets|images)\//.test(text)) return `/${text}`;
  try { const url = new URL(text); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; } catch { return null; }
}
function shape(post) {
  const fields = ['id','title','slug','excerpt','content','image','author','category','publishDate'];
  return { ...Object.fromEntries(fields.map(key => [key, typeof post[key] === 'string' ? post[key] : ''])), status: post.status === 'published' ? 'published' : 'draft', featured: post.featured === true };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      const posts = demoPosts.map(shape);
      localStorage.setItem(KEY, JSON.stringify(posts));
      return { posts, error: '' };
    }
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.some(post => !post || typeof post !== 'object' || !post.id || !post.slug)) throw new Error();
    return { posts: data.map(shape), error: '' };
  } catch { return { posts: [], error: 'Blog storage is unavailable. Check browser storage settings and try again.' }; }
}
function getSnapshot() { return snapshot ??= load(); }
function emit() { subscribers.forEach(fn => fn()); }
function subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); }
if (typeof window !== 'undefined') window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) { snapshot = load(); emit(); }
});
export const useBlogs = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
function persist(posts) {
  if (getSnapshot().error) throw new Error(getSnapshot().error);
  try { localStorage.setItem(KEY, JSON.stringify(posts)); }
  catch { throw new Error('The blog could not be saved. Check available browser storage and try again.'); }
  snapshot = { posts, error: '' }; emit();
}
export function validatePost(values, existingID) {
  const errors = {};
  for (const key of ['title','slug','excerpt','content','author','category','publishDate']) if (!String(values[key] || '').trim()) errors[key] = 'This field is required.';
  const slug = slugify(values.slug);
  if (!slug) errors.slug = 'Use letters or numbers for the slug.';
  else if (getSnapshot().posts.some(p => p.id !== existingID && p.slug.toLowerCase() === slug)) errors.slug = 'This slug is already in use. Choose another.';
  if (values.publishDate && (!/^\d{4}-\d{2}-\d{2}$/.test(values.publishDate) || Number.isNaN(Date.parse(`${values.publishDate}T12:00:00`)))) errors.publishDate = 'Enter a valid date.';
  if (safeImage(values.image) === null) errors.image = 'Use an http or https image URL, or a local path beginning with /.';
  return errors;
}
function prepare(values, id) {
  const errors = validatePost(values, id);
  if (Object.keys(errors).length) { const error = new Error('Please check the highlighted fields.'); error.fields = errors; throw error; }
  // Authored text is kept verbatim. Only the routing slug and image location are normalised.
  return shape({ ...values, id: id || crypto.randomUUID(), slug: slugify(values.slug), image: safeImage(values.image) });
}
export const BlogRepository = {
  getPosts: () => getSnapshot().posts,
  getPublishedPosts: () => getSnapshot().posts.filter(post => post.status === 'published').sort((a,b) => b.publishDate.localeCompare(a.publishDate)),
  getPostBySlug: slug => getSnapshot().posts.find(post => post.slug === slug && post.status === 'published') || null,
  createPost(values) { const post = prepare(values); persist([...getSnapshot().posts.map(p => post.featured && post.status === 'published' ? {...p, featured: false} : p), post]); return post; },
  updatePost(id, values) {
    if (!getSnapshot().posts.some(post => post.id === id)) throw new Error('This blog no longer exists. Return to the list and try again.');
    const post = prepare(values, id); persist(getSnapshot().posts.map(p => p.id === id ? post : post.featured && post.status === 'published' ? {...p, featured: false} : p)); return post;
  },
  deletePost(id) { persist(getSnapshot().posts.filter(post => post.id !== id)); },
};
