import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AuthProvider from '@/components/SessionProvider';
import './globals.css';

export const metadata = {
  title: 'Flipkart Price Tracker',
  description: 'Track Flipkart product prices and get notified on price drops',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
