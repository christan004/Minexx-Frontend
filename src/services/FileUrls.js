/**
 * Build view/download links for document files returned by the API.
 * The API returns a Google Drive file ID, or a full URL when it stores files
 * itself (local development with STORAGE_MODE=local).
 */
const isAbsoluteUrl = (file) => /^https?:\/\//i.test(String(file || ''));

export const filePreviewUrl = (file) =>
  isAbsoluteUrl(file) ? file : `https://drive.google.com/file/d/${file}/preview`;

export const fileDownloadUrl = (file) =>
  isAbsoluteUrl(file)
    ? file
    : `https://drive.usercontent.google.com/download?id=${file}&export=download&authuser=0`;
