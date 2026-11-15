'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createProduct, deleteProduct, getProducts, updateProduct } from '@/lib/api';
import type { Product } from '@/types/product';

const emptyForm = { name: '', description: '', price: '' };

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    try { setProducts(await getProducts()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Chargement impossible.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, []);

  function resetForm() {
    setForm(emptyForm);
    setImage(null);
    setEditingId(null);
    const input = document.getElementById('image') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description, price: String(product.price) });
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    if (image) data.append('image', image);

    try {
      if (editingId) await updateProduct(editingId, data);
      else await createProduct(data);
      resetForm();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally { setSaving(false); }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Supprimer le produit « ${product.name} » ?`)) return;
    setError('');
    try { await deleteProduct(product.id); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Suppression impossible.'); }
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1>Gestion des produits</h1>
          <p className="muted">Mini CRUD — Next.js, Express, PostgreSQL et MinIO</p>
        </div>
        <span className="muted">{products.length} produit(s)</span>
      </header>

      <section className="panel">
        <h2>{editingId ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">Nom du produit
              <input required minLength={2} maxLength={120} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">Prix
              <input required type="number" min="0" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
            </label>
            <label className="field full">Description
              <textarea value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="field full">Image (JPG, PNG, WEBP ou AVIF — 5 Mo maximum)
              <input id="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={e => setImage(e.target.files?.[0] ?? null)} />
              {editingId && <small className="muted">Laisse vide pour conserver l'image actuelle.</small>}
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <div className="actions">
            <button className="btn" disabled={saving}>{saving ? 'Enregistrement…' : editingId ? 'Enregistrer les modifications' : 'Créer le produit'}</button>
            {editingId && <button type="button" className="btn secondary" onClick={resetForm}>Annuler</button>}
          </div>
        </form>
      </section>

      <section>
        <h2>Catalogue</h2>
        {loading ? <p className="muted">Chargement…</p> : products.length === 0 ? (
          <div className="panel muted">Aucun produit pour le moment. Ajoute ton premier produit ci-dessus.</div>
        ) : (
          <div className="grid">
            {products.map(product => (
              <article className="product" key={product.id}>
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div style={{height:170,display:'grid',placeItems:'center',background:'#eef2f7'}} className="muted">Sans image</div>}
                <div className="product-body">
                  <h3>{product.name}</h3>
                  <p className="muted">{product.description || 'Aucune description.'}</p>
                  <p className="price">{product.price.toLocaleString('fr-FR', { style:'currency', currency:'XAF', maximumFractionDigits:0 })}</p>
                  <div className="actions">
                    <button className="btn secondary" onClick={() => startEdit(product)}>Modifier</button>
                    <button className="btn danger" onClick={() => void handleDelete(product)}>Supprimer</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
