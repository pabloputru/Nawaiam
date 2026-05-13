import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';

import GamesClient from '../components/GamesClient';

export default async function GamesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  const userName = session.user.name || session.user.email.split('@')[0] || 'usuario';

  return <GamesClient userName={userName} />;
}
