import { Database, Users, BarChart3, Zap } from 'lucide-react';

export default function Suite() {
  const features = [
    {
      icon: Users,
      title: 'Ficha de Talento',
      description: 'Información completa y detallada de cada candidato en un perfil unificado'
    },
    {
      icon: BarChart3,
      title: 'Compatibilidad',
      description: 'Identifica a las personas que tengan características similares a otra'
    },
    {
      icon: Database,
      title: 'Gestión Centralizada',
      description: 'Accede a toda la información en un solo lugar y toma mejores decisiones'
    },
    {
      icon: Zap,
      title: 'Sin Sesgos',
      description: 'Elimina sesgos y mejora la atracción de talento joven'
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-4">La Suite: Tu herramienta de gestión</h2>
        <p className="text-center text-gray-600 text-lg mb-16">Diseñada por especialistas de RRHH para todas las personas</p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="flex gap-4 p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                <div className="flex-shrink-0">
                  <Icon size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-12 rounded-lg">
          <h3 className="text-3xl font-bold mb-8 text-center">El Informe completo te muestra:</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">¿Qué estilos muestra la persona?</h4>
                <p className="text-blue-100">Descubre cómo es el comportamiento en el ámbito laboral</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">¿Cómo es liderando equipos?</h4>
                <p className="text-blue-100">Conoce el estilo de liderazgo que tendrá en el trabajo</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2">¿Cómo es su comportamiento?</h4>
                <p className="text-blue-100">Porcentaje de cada uno de nuestros ejes</p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2">¿Cuáles son sus competencias?</h4>
                <p className="text-blue-100">Las capacidades que motivan a la persona</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
