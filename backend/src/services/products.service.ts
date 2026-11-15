import { pool } from '../config/db';
import { deleteObject, getImageUrl, uploadProductImage } from './storage.service';

type ProductInput = { name: string; description: string; price: number };
type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_key: string | null;
  created_at: Date;
  updated_at: Date;
};

async function serialize(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: await getImageUrl(row.image_key),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listProducts() {
  const result = await pool.query<ProductRow>('SELECT * FROM products ORDER BY created_at DESC');
  return Promise.all(result.rows.map(serialize));
}

export async function findProduct(id: string) {
  const result = await pool.query<ProductRow>('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] ? serialize(result.rows[0]) : null;
}

export async function createProduct(input: ProductInput, file?: Express.Multer.File) {
  const imageKey = file ? await uploadProductImage(file) : null;
  try {
    const result = await pool.query<ProductRow>(
      `INSERT INTO products (name, description, price, image_key)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.name, input.description, input.price, imageKey]
    );
    return serialize(result.rows[0]);
  } catch (error) {
    if (imageKey) await deleteObject(imageKey).catch(() => undefined);
    throw error;
  }
}

export async function updateProduct(id: string, input: ProductInput, file?: Express.Multer.File) {
  const existing = await pool.query<ProductRow>('SELECT * FROM products WHERE id = $1', [id]);
  if (!existing.rows[0]) return null;

  const oldKey = existing.rows[0].image_key;
  const newKey = file ? await uploadProductImage(file) : oldKey;

  try {
    const result = await pool.query<ProductRow>(
      `UPDATE products
       SET name = $1, description = $2, price = $3, image_key = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [input.name, input.description, input.price, newKey, id]
    );
    if (file && oldKey) await deleteObject(oldKey).catch(() => undefined);
    return serialize(result.rows[0]);
  } catch (error) {
    if (file && newKey) await deleteObject(newKey).catch(() => undefined);
    throw error;
  }
}

export async function removeProduct(id: string) {
  const result = await pool.query<ProductRow>('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
  const row = result.rows[0];
  if (!row) return false;
  if (row.image_key) await deleteObject(row.image_key).catch(() => undefined);
  return true;
}
