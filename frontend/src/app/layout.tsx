import './globals.css';
import type { Metadata } from 'next'; // Importa el tipo Metadata

export const metadata: Metadata = { // Dfine el tipo para metadatae
  title: 'NFT Customizer Next.js TS',
  description: 'Customize your Primal NFTs with Next.js and TypeScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // Define el tipo para children
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
