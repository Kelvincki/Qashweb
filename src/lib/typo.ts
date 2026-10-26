/**
 * Typographie française : espace insécable avant ? ! : ; et à l'intérieur des guillemets,
 * pour qu'un signe ne parte jamais seul à la ligne.
 */
export function nb(text: string): string {
  return text
    .replace(/ ([?!:;»])/g, ' $1')
    .replace(/« /g, '« ');
}
