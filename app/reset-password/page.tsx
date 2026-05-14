import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/auth';

import ResetPasswordForm from '../components/ResetPasswordForm';

export default async function ResetPasswordPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    redirect('/profile');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl md:p-12">
        <p className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
          Recupero de acceso
        </p>
        <h1 className="text-4xl font-bold text-slate-900">Nueva contrasena</h1>
        <p className="mt-4 text-slate-600">Define una nueva contrasena para volver a ingresar.</p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
