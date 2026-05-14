import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Image from 'next/image';

import { authOptions } from '@/auth';

import LoginForm from '../components/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    redirect('/games');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 px-4 py-16">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-2xl bg-white p-8 shadow-xl md:grid-cols-2 md:p-12">
        <section>
          <Image
            src="/logos-png/logo-ver.png"
            alt="Nawaiam"
            width={120}
            height={120}
            className="mb-5 h-10 w-auto md:hidden"
            priority
          />
          <Image
            src="/logos-png/logo-hor.png"
            alt="Nawaiam"
            width={190}
            height={52}
            className="mb-5 hidden h-9 w-auto md:block"
            priority
          />
          <p className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            Acceso de Talento
          </p>
          <h1 className="text-4xl font-bold text-slate-900">Login de usuario</h1>
          <p className="mt-4 text-slate-600">
            Inicia sesion para ingresar al area de evaluaciones y lanzar 4 juegos web tipo test.
          </p>
          <ul className="mt-8 space-y-3 text-slate-700">
            <li>- Login real con Auth.js</li>
            <li>- Registro de usuario con ficha personal</li>
            <li>- Recupero de contrasena por link</li>
            <li>- Proteccion de ruta para juegos y perfil</li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-6 text-2xl font-semibold text-slate-900">Bienvenido</h2>
          <p className="mb-4 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-800">
            Demo: demo@nawaiam.com / demo1234
          </p>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
