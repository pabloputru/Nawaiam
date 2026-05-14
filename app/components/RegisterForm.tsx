'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password) {
      setError('Completa los campos obligatorios.');
      return;
    }

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('La confirmacion de contrasena no coincide.');
      return;
    }

    setIsSubmitting(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        birthDate: birthDate || undefined,
        position: position || undefined,
        company: company || undefined,
        email,
        password,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setIsSubmitting(false);
      setError(data.error || 'No se pudo crear el usuario.');
      return;
    }

    const loginResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/profile',
    });

    setIsSubmitting(false);

    if (loginResult?.error) {
      router.push('/login');
      return;
    }

    router.push(loginResult?.url || '/profile');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="Juan"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">
            Apellido
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="Perez"
          />
        </div>
      </div>

      <div>
        <label htmlFor="birthDate" className="mb-2 block text-sm font-medium text-slate-700">
          Fecha de nacimiento
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="position" className="mb-2 block text-sm font-medium text-slate-700">
            Puesto
          </label>
          <input
            id="position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="Analista de talento"
          />
        </div>

        <div>
          <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">
            Empresa
          </label>
          <input
            id="company"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="Nawaiam"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
          placeholder="tuemail@empresa.com"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
            Contrasena
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
            placeholder="Minimo 8 caracteres"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
            Confirmar contrasena
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        {isSubmitting ? 'Creando usuario...' : 'Crear usuario'}
      </button>

      <p className="text-sm text-slate-600">
        Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
          Inicia sesion
        </Link>
      </p>
    </form>
  );
}
