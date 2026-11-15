import type { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.message ?? 'Une erreur est survenue.';
  } catch {
    return 'Une erreur est survenue.';
  }
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/products`, { cache: 'no-store' });
  if (!response.ok) throw new Error(await readError(response));
  const body = await response.json();
  return body.data;
}

export async function createProduct(formData: FormData): Promise<Product> {
  const response = await fetch(`${API_URL}/products`, { method: 'POST', body: formData });
  if (!response.ok) throw new Error(await readError(response));
  const body = await response.json();
  return body.data;
}

export async function updateProduct(id: string, formData: FormData): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`, { method: 'PUT', body: formData });
  if (!response.ok) throw new Error(await readError(response));
  const body = await response.json();
  return body.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(await readError(response));
}
