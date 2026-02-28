# Cloudflare R2 Integration & Media Library Pagination Plan

## 1. Backend Updates (Media Storage)
*   **Install Multer**: Install `multer` to handle `multipart/form-data` file uploads efficiently, especially for large video files.
*   **Update Route (`media.routes.js`)**: Add `multer` middleware to the `POST /` route to parse uploaded files (`req.file`). Move the static public path so we can serve local uploads from `/uploads`.
*   **Update Controller (`media.controller.js`)**:
    *   Change the upload handler to process `req.file` instead of base64 JSON.
    *   Implement **fallback logic**: Save the file using `multer.diskStorage` first in `backend/public/uploads/`. Attempt to upload the file to Cloudflare R2 using the provided AWS SDK logic.
    *   If R2 succeeds, use the R2 URL. If R2 fails (or is not configured), use the local file path as the URL (`/uploads/filename`), and serve it statically from the backend.
*   **Update Controllers for Pagination (`media.controller.js`)**:
    *   Modify `getAdminMedia` and `getPublicMedia` to accept `page` and `limit` query parameters.
    *   Return a paginated response structure: `{ media: [...], pagination: { total, page, totalPages } }`.

## 2. Frontend Updates (Upload & Pagination)
*   **Update API Hooks (`useMedia.js`)**:
    *   Modify `useAdminMedia` to accept pagination parameters (`page`, `limit`).
    *   Modify `useCreateMedia` to support sending `FormData` so we can upload files instead of base64 JSON (while maintaining support for standard JSON if not uploading a local file, like a YouTube URL).
*   **Update UI (`MediaLibrary.jsx`)**:
    *   Change the file upload logic to append `file` to a `FormData` object instead of reading as base64.
    *   Implement a pagination component (Prev/Next buttons) at the bottom of the grid/list to navigate through media pages.
    *   Ensure search and filter work well with pagination (resetting to page 1 on new search/filter).

## 3. R2 Credentials Setup
*   User has provided S3 credentials for R2.
*   User will provide the Public Access URL later to complete the picture. We will add a fallback default route in `r2.js` until it's provided.
