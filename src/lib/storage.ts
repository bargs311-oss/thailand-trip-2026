import { getSupabaseClient } from './supabase';

export interface UploadResult {
  url: string;
  fileName: string;
  isOffline?: boolean;
  error?: string;
}

/**
 * Converts a File object to a Base64 data URL string for offline LocalStorage persistence.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a document (PDF or image) to Supabase Storage 'trip-documents' bucket.
 * Falls back seamlessly to Base64 data URL for offline access if Supabase is offline or errors.
 */
export async function uploadTripDocument(
  file: File,
  folder: 'tickets' | 'hotels' | 'docs' = 'tickets'
): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const isAllowed = allowedTypes.includes(file.type) || 
    file.name.toLowerCase().endsWith('.pdf') ||
    file.name.toLowerCase().endsWith('.png') ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg') ||
    file.name.toLowerCase().endsWith('.webp');

  if (!isAllowed) {
    throw new Error('סוג קובץ לא נתמך. נא להעלות קובצי PDF או תמונות (PNG, JPG, WEBP).');
  }

  // Attempt Supabase Storage upload
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${folder}/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || undefined,
        });

      if (!uploadError) {
        const { data: publicData } = supabase.storage
          .from('trip-documents')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return {
            url: publicData.publicUrl,
            fileName: file.name,
            isOffline: false,
          };
        }
      } else {
        console.warn('Supabase storage upload failed, falling back to local base64:', uploadError.message);
      }
    } catch (err) {
      console.warn('Exception during Supabase storage upload, falling back to offline base64:', err);
    }
  }

  // Offline fallback: Convert file to Base64 data URL
  try {
    const base64Url = await fileToBase64(file);
    return {
      url: base64Url,
      fileName: file.name,
      isOffline: true,
    };
  } catch (err) {
    throw new Error('שגיאה בעיבוד הקובץ מקומית: ' + (err instanceof Error ? err.message : String(err)));
  }
}

/**
 * Helper to determine if a URL or data URI represents an image or a PDF document.
 */
export function getDocumentType(url?: string): 'image' | 'pdf' | 'link' | 'none' {
  if (!url) return 'none';
  const clean = url.toLowerCase();
  if (
    clean.startsWith('data:image/') ||
    clean.endsWith('.png') ||
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.webp') ||
    clean.includes('/images/') ||
    clean.includes('image')
  ) {
    return 'image';
  }
  if (
    clean.startsWith('data:application/pdf') ||
    clean.endsWith('.pdf') ||
    clean.includes('/pdf')
  ) {
    return 'pdf';
  }
  return 'link';
}
