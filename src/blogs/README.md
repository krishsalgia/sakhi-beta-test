# Sakhi Journal — local prototype

Run the existing project with `npm run dev`, then open:

- Public listing: http://127.0.0.1:5173/blogs
- Public articles: `/blogs/:slug` (trailing slashes also work)
- Editorial login: http://127.0.0.1:5173/login

Local preview credentials are `krish` / `1153`. Authentication is **not secure or production-grade**. The credential/session module and admin interface are lazy-loaded only on `/login`. No public navigation advertises the admin route.

`repository.js` owns blog data, validation and storage. `sakhi.blogs.v1` in localStorage persists posts on this exact origin/browser profile. The four editable demo posts are seeded only if that key is absent; an intentionally empty collection stays empty. Same-tab subscriptions and storage events update the public listing/readers when the admin saves, unpublishes or deletes. Only published posts are returned by the public lookup. Storage errors surface without a false success state.

The local login session uses sessionStorage. Reloading the current tab keeps the session; logout removes it. The repository/session boundaries are not security controls. Same-origin client storage can be inspected or changed in developer tools. Data does not sync across devices, browser profiles or different hosts such as `localhost` versus `127.0.0.1`.

Before production:

- Remove frontend credentials and replace this local session with server-side authentication and authorization.
- Replace localStorage persistence with a real database/API; enforce draft/public separation and validate writes on the server.
- Move the admin to the intended protected subdomain.
- Supply approved real articles and media before publishing the demo content.

The editor stores ordered blocks: paragraphs, H2/H3 headings, uploaded images, bullet lists, numbered lists and quotes. Paragraphs, headings and quotes offer bold, italic and link controls. Formatting is stored as restricted text runs, never authored HTML; pasted content is plain text. Existing Markdown articles convert to blocks on read without changing the original stored record until a save. Titles, excerpts, captions, alt text and article blocks remain exactly authored across English/Hindi/Marathi switching.

Images are uploaded from the device as JPEG, PNG or WebP, with a 10 MB per-image limit and file-signature/decode validation. `asset-repository.js` centralizes native IndexedDB access (`sakhi-blog-assets`, `images` store). Posts reference `featuredImageId` and inline `imageId` values; image blobs never enter localStorage. Temporary Blob URLs are created only for display and revoked on replacement/unmount. Inline dimensions reserve reading space while media loads. Featured images fall back to the approved placeholder; missing inline media is omitted publicly and warned about in the editor.

Image cleanup runs after a successful post save or deletion. It checks all saved posts, including drafts, before deleting candidates. Replaced assets remain intact until the save succeeds. Unsaved uploads are cleaned when the editor is discarded or closed through the application. Cleanup is best effort: abruptly closing the browser can leave an unreferenced upload; there is intentionally no global sweep that could remove another tab's unsaved image. Existing image paths remain display-compatible, but the editor offers no image URL/path input.

The SEO section includes one focus phrase, SEO title, meta description, optional related keyword chips, a live search preview and advisory Good / Needs Attention / Missing checks. Tags and category are separate organization fields. Published article document titles use the SEO title (fallback: article title + Sakhi); descriptions use the meta description (fallback: excerpt). No keywords meta tag, indexing controls, schema configuration or ranking score is added. The SEO checks do not block publishing. SEO output remains client-rendered in this local prototype.

Before production, also replace IndexedDB with secure server-side upload/storage and serve Blog media through appropriate storage/CDN. The repository, asset service and session modules are deliberately separate replacement boundaries. Do not publish this local authentication/storage implementation as a production CMS.

No backend, external image service, editor library or other dependency was added.
