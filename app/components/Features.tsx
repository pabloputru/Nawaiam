import { CheckCircle2 } from 'lucide-react';

export default function Features() {
  const steps = [
    {
      number: 1,
      title: 'Invita a jugar',
      description: 'Invita a la persona que deseas conocer a jugar. Puedes enviar varias invitaciones a la vez.',
      benefits: ['Mejora la calidad del proceso', 'Reduce tiempo de entrevistas']
    },
    {
      number: 2,
      title: 'Recibe informe al instante',
      description: 'Obtén datos precisos y detallados del perfil conductual inmediatamente.',
      benefits: ['91% de identificación', 'Datos confiables y científicos']
    },
    {
      number: 3,
      title: 'Gestiona en la Suite',
      description: 'Accede a todos los datos en un solo lugar y toma mejores decisiones.',
      benefits: ['Elimina sesgos', 'Gestión centralizada']
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">Cómo funciona Nawaiam</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-4">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
              <p className="text-gray-600 mb-6">{step.description}</p>
              <ul className="space-y-2">
                {step.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-500 flex-shrink-0 mt-1" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
