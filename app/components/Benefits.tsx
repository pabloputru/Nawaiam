import { TrendingUp, Clock, Brain } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Ahorro operacional',
      description: '30% reducción en costos operacionales',
      stat: '30%'
    },
    {
      icon: Clock,
      title: 'Reducción de tiempo',
      description: '49% menos tiempo en procesos de RRHH',
      stat: '49%'
    },
    {
      icon: Brain,
      title: 'Identificación',
      description: '91% de las personas se sienten identificadas',
      stat: '91%'
    },
  ];

  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">Beneficios Comprobados</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg text-center hover:shadow-lg transition">
                <div className="flex justify-center mb-6">
                  <Icon size={48} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">{benefit.stat}</h3>
                <p className="text-xl font-semibold text-blue-800 mb-3">{benefit.title}</p>
                <p className="text-gray-700">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-blue-600 text-white p-12 rounded-lg">
          <h3 className="text-3xl font-bold mb-4">El test gamificado</h3>
          <p className="text-lg text-blue-100 mb-6">
            Con tan solo 15 minutos, el algoritmo detecta el comportamiento natural de cada persona a partir de las decisiones tomadas en una emocionante misión.
          </p>
          <p className="text-lg">
            Basado en el modelo <span className="font-semibold">DISC de William Marston</span> publicado en "Emotions of Normal People"
          </p>
        </div>
      </div>
    </section>
  );
}
