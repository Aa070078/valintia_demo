/** The source filename is .png, but its current bytes are JPEG (JFIF).
 * Detect the format without rewriting the brand asset; strict clients use MIME.
 */
export function welcomeLogoFormat(content: Buffer): {
  filename: string;
  contentType: 'image/png' | 'image/jpeg';
} {
  if (
    content
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return { filename: 'valentia-logo.png', contentType: 'image/png' };
  if (
    content.length >= 3 &&
    content[0] === 255 &&
    content[1] === 216 &&
    content[2] === 255
  )
    return { filename: 'valentia-logo.jpg', contentType: 'image/jpeg' };
  throw new Error('Welcome logo must contain PNG or JPEG image data');
}
