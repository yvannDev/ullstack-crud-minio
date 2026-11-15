import { Request, Response, NextFunction } from 'express';
import { productSchema } from '../validators/product';
import * as products from '../services/products.service';

function parseInput(req: Request) {
  return productSchema.parse({
    name: req.body.name,
    description: req.body.description ?? '',
    price: req.body.price
  });
}

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ data: await products.listProducts() }); } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
const product = await products.updateProduct(String(req.params.id), parseInput(req), req.file);    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json({ data: product });
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await products.createProduct(parseInput(req), req.file);
    res.status(201).json({ data: product });
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
const product = await products.updateProduct(String(req.params.id), parseInput(req), req.file);    if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
    res.json({ data: product });
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
const removed = await products.removeProduct(String(req.params.id));    if (!removed) return res.status(404).json({ message: 'Produit introuvable.' });
    res.status(204).send();
  } catch (e) { next(e); }
}
