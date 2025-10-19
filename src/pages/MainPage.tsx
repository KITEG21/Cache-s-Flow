import { useState } from 'react';
import { Link } from 'react-router-dom';
import DirectMappedCache from '../components/DirectMappedCache';
import FullyAssociativeCache from '../components/FullyAssociativeCache';
import SetAssociativeCache from '../components/SetAssociativeCache';

type CacheType = 'direct' | 'fully' | 'set';

const MainPage = () => {
  const [activeTab, setActiveTab] = useState<CacheType>('direct');

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="shadow-lg border-b-4" style={{ 
        background: '#1a1a1a', 
        borderBottomColor: '#ffd700' 
      }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#ffd700' }}>
                Simulador de Memoria Caché
              </h1>
              <p className="text-gray-400 mt-2">
                Aprende cómo funcionan los 3 tipos de correspondencia de caché
              </p>
            </div>
            <Link
              to="/tutorial"
              className="px-6 py-3 rounded-lg transition-all shadow-lg font-semibold uppercase tracking-wide"
              style={{
                background: '#ffd700',
                color: '#0a0a0a',
                border: '2px solid #ffd700'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ff8c00';
                e.currentTarget.style.borderColor = '#ff8c00';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffd700';
                e.currentTarget.style.borderColor = '#ffd700';
              }}
            >
              Tutorial Animado
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all uppercase tracking-wide ${
              activeTab === 'direct'
                ? 'shadow-lg scale-105'
                : 'hover:scale-102'
            }`}
            style={{
              background: activeTab === 'direct' ? '#1e1e1e' : '#2a2a2a',
              color: activeTab === 'direct' ? '#ffd700' : '#a0a0a0',
              border: `2px solid ${activeTab === 'direct' ? '#ffd700' : '#2a2a2a'}`,
              boxShadow: activeTab === 'direct' ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'
            }}
          >
            <div className="text-2xl mb-1"></div>
            Mapeo Directo
            <div className="text-xs mt-1 opacity-80">Direct Mapped</div>
          </button>
          <button
            onClick={() => setActiveTab('fully')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all uppercase tracking-wide ${
              activeTab === 'fully'
                ? 'shadow-lg scale-105'
                : 'hover:scale-102'
            }`}
            style={{
              background: activeTab === 'fully' ? '#1e1e1e' : '#2a2a2a',
              color: activeTab === 'fully' ? '#ffd700' : '#a0a0a0',
              border: `2px solid ${activeTab === 'fully' ? '#ffd700' : '#2a2a2a'}`,
              boxShadow: activeTab === 'fully' ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'
            }}
          >
            <div className="text-2xl mb-1"></div>
            Totalmente Asociativa
            <div className="text-xs mt-1 opacity-80">Fully Associative</div>
          </button>
          <button
            onClick={() => setActiveTab('set')}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all uppercase tracking-wide ${
              activeTab === 'set'
                ? 'shadow-lg scale-105'
                : 'hover:scale-102'
            }`}
            style={{
              background: activeTab === 'set' ? '#1e1e1e' : '#2a2a2a',
              color: activeTab === 'set' ? '#ffd700' : '#a0a0a0',
              border: `2px solid ${activeTab === 'set' ? '#ffd700' : '#2a2a2a'}`,
              boxShadow: activeTab === 'set' ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'
            }}
          >
            <div className="text-2xl mb-1"></div>
            Asociativa por Conjuntos
            <div className="text-xs mt-1 opacity-80">Set Associative</div>
          </button>
        </div>

        {/* Comparison Info */}
        <div className="p-6 rounded-lg shadow-lg mb-6" style={{ 
          background: '#1e1e1e', 
          border: '2px solid #2a2a2a' 
        }}>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
            Comparación de Técnicas de Mapeo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                activeTab === 'direct'
                  ? 'shadow-lg'
                  : ''
              }`}
              style={{
                background: activeTab === 'direct' ? 'rgba(255, 215, 0, 0.1)' : '#2a2a2a',
                borderColor: activeTab === 'direct' ? '#ffd700' : '#2a2a2a'
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: '#ffd700' }}>Mapeo Directo</h4>
              <ul className="text-sm space-y-1" style={{ color: '#a0a0a0' }}>
                <li style={{ color: '#10b981' }}>✓ Hardware simple</li>
                <li style={{ color: '#10b981' }}>✓ Búsqueda rápida</li>
                <li style={{ color: '#ef4444' }}>✗ Más conflictos de mapeo</li>
                <li>• 1 comparador por línea</li>
              </ul>
            </div>
            <div
              className={`p-4 rounded-lg border-2 ${
                activeTab === 'fully'
                  ? 'shadow-lg'
                  : ''
              }`}
              style={{
                background: activeTab === 'fully' ? 'rgba(255, 215, 0, 0.1)' : '#2a2a2a',
                borderColor: activeTab === 'fully' ? '#ffd700' : '#2a2a2a'
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: '#ffd700' }}>Totalmente Asociativa</h4>
              <ul className="text-sm space-y-1" style={{ color: '#a0a0a0' }}>
                <li style={{ color: '#10b981' }}>✓ Máxima flexibilidad</li>
                <li style={{ color: '#10b981' }}>✓ Mínimos conflictos</li>
                <li style={{ color: '#ef4444' }}>✗ Hardware complejo y costoso</li>
                <li>• N comparadores (todos)</li>
              </ul>
            </div>
            <div
              className={`p-4 rounded-lg border-2 ${
                activeTab === 'set'
                  ? 'shadow-lg'
                  : ''
              }`}
              style={{
                background: activeTab === 'set' ? 'rgba(255, 215, 0, 0.1)' : '#2a2a2a',
                borderColor: activeTab === 'set' ? '#ffd700' : '#2a2a2a'
              }}
            >
              <h4 className="font-bold mb-2" style={{ color: '#ffd700' }}>Por Conjuntos</h4>
              <ul className="text-sm space-y-1" style={{ color: '#a0a0a0' }}>
                <li style={{ color: '#10b981' }}>✓ Balance flexibilidad/costo</li>
                <li style={{ color: '#10b981' }}>✓ Menos conflictos que directo</li>
                <li style={{ color: '#10b981' }}>✓ Más simple que asociativo</li>
                <li>• K comparadores (vías/conjunto)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pb-8">
          {activeTab === 'direct' && <DirectMappedCache />}
          {activeTab === 'fully' && <FullyAssociativeCache />}
          {activeTab === 'set' && <SetAssociativeCache />}
        </div>
      </div>

      {/* Footer with instructions */}
      <div className="py-8 mt-12" style={{ background: '#1a1a1a', borderTop: '2px solid #ffd700' }}>
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
            Cómo Usar el Simulador
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#ff8c00' }}>
                1. Selecciona un tipo de caché
              </h4>
              <p style={{ color: '#a0a0a0' }}>
                Usa las pestañas superiores para cambiar entre los 3 tipos de
                correspondencia de caché.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#ff8c00' }}>
                2. Ingresa una dirección binaria
              </h4>
              <p style={{ color: '#a0a0a0' }}>
                Escribe una dirección en binario (solo 0s y 1s). Ejemplo: 10110110
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#ff8c00' }}>
                3. Simula el acceso
              </h4>
              <p style={{ color: '#a0a0a0' }}>
                Presiona "Simular Acceso" para ver cómo la caché procesa la dirección
                paso a paso.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#ff8c00' }}>
                4. Avanza por los pasos
              </h4>
              <p style={{ color: '#a0a0a0' }}>
                Lee cada paso con atención. Usa los botones para avanzar, retroceder o
                finalizar.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 text-center" style={{ 
            borderTop: '1px solid #2a2a2a',
            color: '#a0a0a0'
          }}>
            <p>
              ¿Necesitas una explicación visual más detallada?{' '}
              <Link to="/tutorial" style={{ color: '#ffd700' }} className="hover:underline">
                Visita el Tutorial Animado →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
