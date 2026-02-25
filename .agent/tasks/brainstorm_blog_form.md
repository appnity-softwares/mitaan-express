## 🧠 Brainstorm: Separate Blog Form for Admin

### Context
The user wants a dedicated form for "My Blogs" in the Admin Panel. Currently, the "Write New Blog" button redirects to the full "Article Editor", which contains complex fields like SEO, Breaking News, Trending, and generic styling that might be overwhelming or unnecessary for a personal blog flow. The goal is to create a focused, simplified writing experience found in platforms like Medium or WordPress (Simple Editor).

---

### Option A: Simplified Independent Editor (Recommended)
Create a new component `BlogEditor.jsx` specifically for personal blogs.
*   **Structure:**
    *   **Main Area:** Title (clean input), Content (Rich Text).
    *   **Sidebar:** Featured Image, Category (Dropdown), Status (Draft/Publish).
    *   **Hidden/Defaulted:** SEO (auto-generated), Flags (Breaking/Trending defaulted to false), Priority (Normal).
*   **Routing:** `/admin/my-blogs/new` and `/admin/my-blogs/edit/:id`.

✅ **Pros:**
- **Clean Experience:** No distracting fields. Focus on writing.
- **Separation of Concerns:** Updates to the main "News Article" editor won't break the personal "Blog" flow.
- **Customization:** Can add "Author Note" or specific blog-only fields later without cluttering the main editor.

❌ **Cons:**
- **Code Duplication:** Some logic (save/fetch) is similar to ArticleEditor.

📊 **Effort:** Medium

---

### Option B: 'Mode-Based' Article Editor
Reuse `ArticleEditor.jsx` but pass a prop `mode="blog"`.
*   **Logic:** If `mode === 'blog'`, hide specific sections (SEO tab, Flags) using CSS or conditional rendering.

✅ **Pros:**
- **Single Source of Truth:** One file to maintain for all editing logic.
- **Less Code:** No need to duplicate fetch/save functions.

❌ **Cons:**
- **Complexity:** The `ArticleEditor` is already complex. Adding conditional logic for every field makes it harder to read and maintain.
- **Risk:** Changing a shared component might accidentally bug the main News Editor.

📊 **Effort:** Low

---

### Option C: Modal-Based Quick Post
A popup modal on the "My Blogs" page to write a quick post.

✅ **Pros:**
- **Fast:** Good for short updates.

❌ **Cons:**
- **UX:** Bad for writing long articles (cramped space).
- **Features:** Hard to implement rich text editing well in a modal.

📊 **Effort:** High (for good UX)

---

## 💡 Recommendation

**Option A (Simplified Independent Editor)** is the best choice.
It fulfills the user's request for a *separate* form most effectively ("mera blog ka alg se form banae"). It ensures the Admin Panel feels professional for News (complex) but personal for Blogs (simple).

### Implementation Plan
1.  **Create `BlogEditor.jsx`**: A streamlined clone of ArticleEditor.
2.  **Route Config**: Add `/my-blogs/new` routes in `AdminPage.jsx`.
3.  **Update UI**: Connect the "Write" buttons in `MyBlogs.jsx` to the new route.
