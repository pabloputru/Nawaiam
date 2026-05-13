import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Nawaiam</h3>
            <p className="text-sm">LET'S GAME THE CHANGE</p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">La Suite</Link></li>
              <li><Link href="#" className="hover:text-white transition">El Juego</Link></li>
              <li><Link href="#" className="hover:text-white transition">Fundamentos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">Centro de Ayuda</Link></li>
              <li><Link href="#" className="hover:text-white transition">Preguntas Frecuentes</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contacto</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">Aviso Legal</Link></li>
              <li><Link href="#" className="hover:text-white transition">Términos y Condiciones</Link></li>
              <li><Link href="#" className="hover:text-white transition">Política de Cookies</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-sm">&copy; 2026 Nawaiam. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <a href="https://instagram.com/nawaiam" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Instagram
              </a>
              <a href="https://facebook.com/nawaiam" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Facebook
              </a>
              <a href="https://linkedin.com/company/nawaiam" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
