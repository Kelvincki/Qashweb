/**
 * Préparation d'une image avant l'envoi dans le bucket « catalog » :
 * contrôle du type et de la taille, redimensionnement (côté long 1 024 px) et compression
 * dans le navigateur (WebP, ou JPEG si WebP n'est pas disponible), moins de 1 Mo.
 * L'image est décodée puis ré-encodée : ce qui part est toujours une image propre.
 */

export const MAX_SIDE = 1024;
/** Limite du bucket : 1 Mo. On vise un peu en dessous. */
export const MAX_BYTES = 1_000_000;
/** Fichier d'origine accepté (avant compression). */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class ImageError extends Error {}

export interface PreparedImage {
  blob: Blob;
  mime: 'image/webp' | 'image/jpeg';
  ext: 'webp' | 'jpg';
  width: number;
  height: number;
  /** Adresse locale pour l'aperçu (à libérer avec URL.revokeObjectURL). */
  previewUrl: string;
}

/** Dimensions réduites pour que le côté long ne dépasse pas `max` (jamais d'agrandissement). */
export function fitWithin(width: number, height: number, max: number = MAX_SIDE): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
}

/** Contrôle du fichier choisi ; renvoie un message en français, ou null s'il est acceptable. */
export function checkImageFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Format non accepté. Choisissez une image WebP, JPEG ou PNG.';
  if (file.size <= 0) return 'Ce fichier est vide.';
  if (file.size > MAX_INPUT_BYTES) return 'Ce fichier est trop volumineux (25 Mo au maximum avant compression).';
  return null;
}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
    } catch {
      // repli ci-dessous
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => undefined };
  } finally {
    URL.revokeObjectURL(url);
  }
}

const toBlob = (canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, mime, quality));

export async function prepareImage(file: File): Promise<PreparedImage> {
  const problem = checkImageFile(file);
  if (problem) throw new ImageError(problem);

  let decoded: Awaited<ReturnType<typeof decode>>;
  try {
    decoded = await decode(file);
  } catch {
    throw new ImageError("Impossible de lire cette image. Essayez avec une autre photo.");
  }

  try {
    if (decoded.width < 1 || decoded.height < 1) throw new ImageError('Cette image est vide.');

    // Un essai en WebP, sinon JPEG (fond blanc : le JPEG n'a pas de transparence)
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    const webp = probe.toDataURL('image/webp').startsWith('data:image/webp');
    const mime = webp ? 'image/webp' : 'image/jpeg';

    for (const scale of [1, 0.8, 0.64, 0.5]) {
      const target = fitWithin(decoded.width, decoded.height, Math.round(MAX_SIDE * scale));
      const canvas = document.createElement('canvas');
      canvas.width = target.width;
      canvas.height = target.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new ImageError("Ce navigateur ne peut pas préparer l'image.");
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, target.width, target.height);
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(decoded.source, 0, 0, target.width, target.height);

      for (const quality of [0.82, 0.7, 0.55]) {
        const blob = await toBlob(canvas, mime, quality);
        if (blob && blob.type === mime && blob.size > 0 && blob.size <= MAX_BYTES) {
          return {
            blob,
            mime,
            ext: webp ? 'webp' : 'jpg',
            width: target.width,
            height: target.height,
            previewUrl: URL.createObjectURL(blob),
          };
        }
      }
    }
    throw new ImageError('Impossible de réduire cette image à moins de 1 Mo. Choisissez une image plus simple ou plus petite.');
  } finally {
    decoded.close();
  }
}
