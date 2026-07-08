export const validatePdfMagicBytes = (buffer: Buffer): boolean => {
  if (buffer.length < 5) return false;
  const magic = buffer.toString('hex', 0, 5);
  return magic.toLowerCase() === '255044462d';
};
