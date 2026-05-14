'use client';

import { FormEvent, useState } from 'react';

type ForgotResponse = {
  error?: string;
  message?: string;
  resetUrl?: string;
  requestId?: string;
  delivery?: {
    status?: 'sent' | 'not_configured' | 'failed' | 'in_app_link';
    provider?: 'smtp' | 'none';
    reason?: string;
    requestId?: string;
  };
};

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [diagnostic, setDiagnostic] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setDiagnostic('');

    if (!email) {
      setError('Ingresa tu email para continuar.');
      return;
    }

    setIsSubmitting(true);

    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = (await response.json().catch(() => ({}))) as ForgotResponse;

    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error || 'No se pudo procesar la solicitud.');
      return;
    }

    setMessage(data.message || 'Revisa tu correo para continuar.');
    setResetUrl(data.resetUrl || '');

    if (data.delivery) {
      const statusLabel =
        data.delivery.status === 'sent'
          ? 'Email enviado'
          : data.delivery.status === 'not_configured'
            ? 'SMTP no configurado'
            : data.delivery.status === 'failed'
              ? 'Fallo al enviar email'
              : 'Entrega por link en app';

      const requestId = data.delivery.requestId || data.requestId || 'n/a';
      const reason = data.delivery.reason || 'Sin detalle';

      setDiagnostic(`${statusLabel} · ${reason} · requestId: ${requestId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          autoComplete="email"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {diagnostic ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
          Diagnostico de entrega: {diagnostic}
        </p>
      ) : null}

      {resetUrl ? (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800">
          Link de recupero: <a href={resetUrl} className="font-semibold underline">{resetUrl}</a>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        {isSubmitting ? 'Generando link...' : 'Recuperar contrasena'}
      </button>
    </form>
  );
}
