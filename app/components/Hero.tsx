export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          ¡Encuentra al talento ideal con un juego de solo 15 minutos!
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-blue-100">
          Con el test gamificado de Nawaiam descubrirás el perfil conductual del talento que invites a jugar
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="https://store.nawaiam.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Prueba Gratis
          </a>
          <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
            Descubre Más
          </button>
        </div>
        <p className="text-sm text-blue-100 mt-4">*No es necesario tarjeta de crédito</p>
      </div>
    </section>
  );
}
