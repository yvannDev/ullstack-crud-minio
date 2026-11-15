import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mini CRUD — Produits',
  description: 'Gestion de produits avec PostgreSQL et MinIO'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
