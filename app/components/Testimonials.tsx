import { Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Mercedes Sillone',
      company: 'RRHH – Bimbo',
      quote: 'Pensamos el talento adecuado para el puesto correcto y Nawaiam nos facilitó acercarnos a esa realidad.',
      rating: 5
    },
    {
      name: 'Macarena Capurro',
      company: 'RRHH – ABInBev',
      quote: 'Nawaiam nos permitió hacer que nuestros postulantes vivan una experiencia diferenciadora y disruptiva.',
      rating: 5
    },
    {
      name: 'Martín P. Vidaurreta',
      company: 'RRHH – McDonald\'s',
      quote: 'Con Nawaiam incorporamos innovación y calidad a nuestros procesos y accedemos a información relevante.',
      rating: 5
    },
    {
      name: 'Maria Sol de Cabo',
      company: 'RRHH – Betterfly',
      quote: 'Me encanta que no haya perfiles buenos ni malos. Es una forma de sacar lo mejor de cada persona.',
      rating: 5
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4">Lo que dicen nuestros clientes</h2>
        <p className="text-center text-gray-600 text-lg mb-16">Empresas líderes confían en Nawaiam</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex gap-1 mb-4">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                  <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Empresas que confían en Nawaiam</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            {['Coca-Cola', 'Accenture', 'McDonald\'s', 'Movistar', 'Bimbo', 'AB InBev', 'Bayer', 'Natura', 'El Corte Inglés', 'Bridgestone'].map((company) => (
              <p key={company} className="text-center font-semibold">{company}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
