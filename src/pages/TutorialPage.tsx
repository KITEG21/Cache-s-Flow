import { Link } from 'react-router-dom';
import CacheSimulator from '../components/CacheSimulator';

const TutorialPage = () => {
  return (
    <div className="min-h-screen py-8" style={{ background: '#0a0a0a' }}>
      {/* Header con navegación */}
      <div className="max-w-6xl mx-auto px-6 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md uppercase tracking-wide font-semibold"
          style={{
            background: '#1e1e1e',
            color: '#ffd700',
            border: '2px solid #ffd700'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffd700';
            e.currentTarget.style.color = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1e1e1e';
            e.currentTarget.style.color = '#ffd700';
          }}
        >
          ← Volver al Simulador Principal
        </Link>
      </div>

      {/* Componente del tutorial */}
      <CacheSimulator s={4} w={2} />

      {/* Información adicional */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        <div className="p-6 rounded-lg shadow-lg" style={{
          background: '#1e1e1e',
          border: '2px solid #2a2a2a'
        }}>
          <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
            Acerca de este Tutorial
          </h3>
          <p className="mb-4" style={{ color: '#a0a0a0' }}>
            Este tutorial animado te guía a través del proceso completo de acceso a una
            caché de mapeo directo, desde que la CPU genera una dirección hasta que
            recibe el dato solicitado.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg" style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '2px solid #3b82f6'
            }}>
              <h4 className="font-bold mb-2" style={{ color: '#3b82f6' }}>Modo Automático</h4>
              <p style={{ color: '#a0a0a0' }}>
                Presiona "▶ Auto" para ver una animación continua del proceso. Ajusta la
                velocidad según tu preferencia.
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10b981'
            }}>
              <h4 className="font-bold mb-2" style={{ color: '#10b981' }}>Modo Manual</h4>
              <p style={{ color: '#a0a0a0' }}>
                Usa los botones "Anterior" y "Siguiente" para controlar cada paso del
                proceso a tu propio ritmo.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg" style={{
            background: 'rgba(168, 85, 247, 0.15)',
            border: '2px solid #a855f7'
          }}>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>
              <strong style={{ color: '#ffd700' }}>Consejo:</strong> Para practicar con direcciones personalizadas
              y explorar los 3 tipos de caché,{' '}
              <Link to="/" className="font-semibold hover:underline" style={{ color: '#ffd700' }}>
                regresa al simulador principal
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
