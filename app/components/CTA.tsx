export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">¿Te gustaría probar los beneficios de nuestra herramienta?</h2>
        <p className="text-xl text-blue-100 mb-8">
          Comienza hoy sin necesidad de tarjeta de crédito
        </p>
        <a
          href="https://store.nawaiam.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition"
        >
          Acceder a Nawaiam
        </a>
        <p className="text-sm text-blue-100 mt-4">*No es necesario tarjeta de crédito</p>
      </div>
    </section>
  );
}
