import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Données invalides.', errors: error.flatten() });
    return;
  }
  if (error instanceof Error && error.message.includes('Format non autorisé')) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof Error && error.message.includes('File too large')) {
    res.status(413).json({ message: 'Image trop volumineuse (maximum 5 Mo).' });
    return;
  }
  console.error(error);
  res.status(500).json({ message: 'Une erreur interne est survenue.' });
};
