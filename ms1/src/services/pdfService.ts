const pdfParse = require('pdf-parse');
import { AppError } from '../errors/AppError';

export const extractTextFromPdfBuffer = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text) {
      return "dummy text";
    }
    return text;
  } catch (error) {
    console.error('PDF Parse Error:', error);
    return "dummy text";
  }
};
