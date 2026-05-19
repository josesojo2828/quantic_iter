import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { AuthProvider } from '@/core/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
  title: 'Quantic Ecosystem | Portal',
  description: 'Enterprise Mentor & Client Management Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster 
          position="bottom-right" 
          reverseOrder={false}
          gutter={8}
          containerClassName="quantic-toaster"
          containerStyle={{
            bottom: 40,
            right: 40,
            zIndex: 99999,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(27, 39, 35, 0.85)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              border: '1px solid rgba(195, 206, 162, 0.15)',
              color: '#C3CEA2',
              borderRadius: '20px',
              padding: '16px 28px',
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxWidth: '420px',
            },
            success: {
              iconTheme: {
                primary: '#608A25',
                secondary: '#1B2723',
              },
              style: {
                borderLeft: '5px solid #608A25',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff4b4b',
                secondary: '#1B2723',
              },
              style: {
                borderLeft: '5px solid #ff4b4b',
                background: 'rgba(50, 10, 10, 0.9)',
              },
            },
          }}
        />

      </body>


    </html>
  );
}

