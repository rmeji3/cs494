import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gravity Sim',
  description: '2D N-body gravity simulation using WebGPU',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
