import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos-png/logo-ver.png"
            alt="Nawaiam"
            width={120}
            height={120}
            priority
            className="h-10 w-auto md:hidden"
          />
          <Image
            src="/logos-png/logo-hor.png"
            alt="Nawaiam"
            width={180}
            height={48}
            priority
            className="hidden h-9 w-auto md:block"
          />
        </Link>
        <div className="hidden md:flex gap-8">
          <Link href="#features" className="text-gray-700 hover:text-blue-600 transition">
            Características
          </Link>
          <Link href="#benefits" className="text-gray-700 hover:text-blue-600 transition">
            Beneficios
          </Link>
          <Link href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">
            Testimonios
          </Link>
        </div>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Iniciar sesion
        </Link>
      </nav>
    </header>
  );
}
