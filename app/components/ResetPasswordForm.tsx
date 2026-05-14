'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('El link no incluye token de recupero.');
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

    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error || 'No se pudo actualizar la contrasena.');
      return;
    }

    setMessage(data.message || 'Contrasena actualizada. Ya puedes iniciar sesion.');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!token ? (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800">
          Link invalido. Vuelve a solicitar recupero de contrasena.
        </p>
      ) : null}

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
          Nueva contrasena
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || !token}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isSubmitting ? 'Actualizando...' : 'Guardar nueva contrasena'}
      </button>

      <p className="text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
          Volver a login
        </Link>
      </p>
    </form>
  );
}
