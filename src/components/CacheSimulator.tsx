import { useState, useEffect, useRef } from 'react';

interface CacheSimulatorProps {
  s?: number; // bits de tag
  w?: number; // bits de word offset
}

type Scene = 
  | 'address-generated'
  | 'line-selection'
  | 'comparison'
  | 'hit-result'
  | 'miss-result'
  | 'block-load'
  | 'successful-read'
  | 'loop';

const CacheSimulator = ({ s = 4, w = 2 }: CacheSimulatorProps) => {
  const [currentScene, setCurrentScene] = useState<Scene>('address-generated');
  const [isHit, setIsHit] = useState(false);
  const [selectedLine, setSelectedLine] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(2000); // ms entre escenas
  const intervalRef = useRef<number | null>(null);
  
  // Ejemplo de dirección: 10110110 (s=4, line=2, w=2)
  const tagBits = '1011';
  const lineBits = '01';
  const wordBits = '10';
  const fullAddress = tagBits + lineBits + wordBits;
  
  // Estado de la caché (simulado)
  const [cacheLines, setCacheLines] = useState([
    { valid: false, tag: '0000', data: ['00', '01', '10', '11'] },
    { valid: true, tag: '1011', data: ['AA', 'BB', 'CC', 'DD'] },
    { valid: false, tag: '0000', data: ['00', '00', '00', '00'] },
    { valid: false, tag: '0000', data: ['00', '00', '00', '00'] },
  ]);

  const scenes: Scene[] = [
    'address-generated',
    'line-selection',
    'comparison',
    isHit ? 'hit-result' : 'miss-result',
    ...(isHit ? [] : ['block-load' as Scene]),
    'successful-read',
    'loop'
  ];

  useEffect(() => {
    // Al llegar a la comparación, determinar si es hit o miss
    if (currentScene === 'comparison') {
      const lineIndex = parseInt(lineBits, 2);
      const cacheLine = cacheLines[lineIndex];
      const hit = cacheLine.valid && cacheLine.tag === tagBits;
      setIsHit(hit);
      setSelectedLine(lineIndex);
    }
  }, [currentScene]);

  const nextScene = () => {
    const currentIndex = scenes.indexOf(currentScene);
    if (currentIndex < scenes.length - 1) {
      setCurrentScene(scenes[currentIndex + 1]);
    } else {
      // Reiniciar
      setCurrentScene('address-generated');
      setIsHit(false);
    }
  };

  const prevScene = () => {
    const currentIndex = scenes.indexOf(currentScene);
    if (currentIndex > 0) {
      setCurrentScene(scenes[currentIndex - 1]);
    }
  };

  const reset = () => {
    setCurrentScene('address-generated');
    setIsHit(false);
    setIsAutoPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentScene(currentScene => {
          const currentIndex = scenes.indexOf(currentScene);
          if (currentIndex < scenes.length - 1) {
            return scenes[currentIndex + 1];
          } else {
            // Reiniciar automáticamente
            setIsHit(false);
            return 'address-generated';
          }
        });
      }, autoPlaySpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, autoPlaySpeed, scenes]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  // Actualizar caché en la escena de carga de bloque
  useEffect(() => {
    if (currentScene === 'block-load') {
      setTimeout(() => {
        const newCacheLines = [...cacheLines];
        newCacheLines[selectedLine] = {
          valid: true,
          tag: tagBits,
          data: ['A0', 'A1', 'A2', 'A3']
        };
        setCacheLines(newCacheLines);
      }, 500);
    }
  }, [currentScene]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 rounded-lg" style={{
      background: '#1e1e1e',
      border: '2px solid #2a2a2a'
    }}>
      <h1 className="text-3xl font-bold text-center mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
        Simulador de Memoria Caché
      </h1>

      {/* Indicador de estado */}
      <div className="mb-6 flex justify-center gap-4">
        <div className={`px-4 py-2 rounded-lg font-semibold uppercase tracking-wide`} style={{
          background: isAutoPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(160, 160, 160, 0.2)',
          color: isAutoPlaying ? '#10b981' : '#a0a0a0',
          border: `2px solid ${isAutoPlaying ? '#10b981' : '#2a2a2a'}`
        }}>
          {isAutoPlaying ? '▶ Reproducción Automática' : '⏸ Modo Manual'}
        </div>
        <div className="px-4 py-2 rounded-lg font-semibold uppercase tracking-wide" style={{
          background: 'rgba(255, 215, 0, 0.2)',
          color: '#ffd700',
          border: '2px solid #ffd700'
        }}>
          Escena {scenes.indexOf(currentScene) + 1} de {scenes.length}
        </div>
      </div>

      {/* Escena 1: Dirección generada */}
      {currentScene === 'address-generated' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold text-blue-600">
            1. Dirección Generada
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="p-4 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#3b82f6' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#ffd700' }}>CPU</p>
              <div className="text-3xl font-mono" style={{ color: '#fff' }}>{fullAddress}</div>
            </div>
            <div className="text-4xl" style={{ color: '#ffd700' }}>→</div>
            <div className="flex gap-2">
              <div className="p-4 rounded border-2" style={{ background: '#23272a', borderColor: '#ef4444' }}>
                <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Tag ({s} bits)</p>
                <div className="font-mono text-xl" style={{ color: '#fff' }}>{tagBits}</div>
              </div>
              <div className="p-4 rounded border-2" style={{ background: '#23272a', borderColor: '#10b981' }}>
                <p className="text-xs font-semibold" style={{ color: '#10b981' }}>Line</p>
                <div className="font-mono text-xl" style={{ color: '#fff' }}>{lineBits}</div>
              </div>
              <div className="p-4 rounded border-2" style={{ background: '#23272a', borderColor: '#ffd700' }}>
                <p className="text-xs font-semibold" style={{ color: '#ffd700' }}>Word ({w} bits)</p>
                <div className="font-mono text-xl" style={{ color: '#fff' }}>{wordBits}</div>
              </div>
            </div>
          </div>
          <p className="text-center text-gray-600">
            La CPU genera una dirección que se divide en Tag, Línea y Word offset
          </p>
        </div>
      )}

      {/* Escena 2: Selección de línea */}
      {currentScene === 'line-selection' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#10b981' }}>
            2. Selección de Línea
          </h2>
          <div className="flex items-start justify-center gap-8">
            <div className="p-4 rounded border-2" style={{ background: '#23272a', borderColor: '#10b981' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#10b981' }}>Line bits</p>
              <div className="font-mono text-2xl" style={{ color: '#fff' }}>{lineBits}</div>
            </div>
            <div className="text-4xl self-center" style={{ color: '#ffd700' }}>→</div>
            <div className="space-y-2">
              <p className="font-semibold text-center" style={{ color: '#ffd700' }}>Caché</p>
              {cacheLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 p-3 rounded border-2 transition-all"
                  style={{
                    background: idx === parseInt(lineBits, 2) ? 'rgba(16,185,129,0.15)' : '#23272a',
                    borderColor: idx === parseInt(lineBits, 2) ? '#10b981' : '#2a2a2a',
                    boxShadow: idx === parseInt(lineBits, 2) ? '0 0 10px #10b981' : 'none',
                  }}
                >
                  <div className="text-xs" style={{ color: '#ffd700' }}>L{idx}</div>
                  <div className="font-mono text-sm" style={{ color: '#fff' }}>{line.tag}</div>
                  <div className="flex gap-1">
                    {line.data.map((d, i) => (
                      <div key={i} className="px-2 py-1 text-xs font-mono rounded" style={{ background: '#1e1e1e', color: '#ffd700' }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center" style={{ color: '#e0e0e0' }}>
            Los bits de línea ({lineBits}) seleccionan la línea {parseInt(lineBits, 2)} de la caché
          </p>
        </div>
      )}

      {/* Escena 3: Comparación */}
      {currentScene === 'comparison' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#a855f7' }}>
            3. Comparación de Tags
          </h2>
          <div className="flex items-center justify-center gap-8">
            <div className="space-y-4">
              <div className="p-4 rounded border-2" style={{ background: '#23272a', borderColor: '#ef4444' }}>
                <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>Tag de dirección</p>
                <div className="font-mono text-2xl" style={{ color: '#fff' }}>{tagBits}</div>
              </div>
              <div className="text-4xl text-center" style={{ color: '#ffd700' }}>⬇</div>
              <div className="p-4 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#a855f7' }}>
                <p className="font-semibold" style={{ color: '#a855f7' }}>Comparador</p>
                <p className="text-2xl" style={{ color: '#fff' }}>≟</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-center" style={{ color: '#ffd700' }}>Línea seleccionada (L{parseInt(lineBits, 2)})</p>
              <div className="p-4 rounded border-2" style={{ background: '#23272a', borderColor: '#ffd700' }}>
                <div className="flex gap-2 items-center">
                  <span className="text-xs" style={{ color: '#ffd700' }}>Valid:</span>
                  <span className="font-mono" style={{ color: '#fff' }}>{cacheLines[parseInt(lineBits, 2)].valid ? '1' : '0'}</span>
                  <span className="text-xs ml-4" style={{ color: '#ffd700' }}>Tag:</span>
                  <span className="font-mono text-xl" style={{ color: '#fff' }}>{cacheLines[parseInt(lineBits, 2)].tag}</span>
                </div>
              </div>
              <div className="text-2xl text-center" style={{ color: '#ffd700' }}>⬆</div>
            </div>
          </div>
          <p className="text-center" style={{ color: '#e0e0e0' }}>
            Se compara el Tag de la dirección con el Tag almacenado en la línea
          </p>
        </div>
      )}

      {/* Escena 4: Resultado Hit */}
      {currentScene === 'hit-result' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#10b981' }}>
            4. ¡Cache Hit! ✓
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="p-6 rounded-lg border-4" style={{ background: '#23272a', borderColor: '#10b981', boxShadow: '0 0 10px #10b981' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#10b981' }}>Tag Match!</p>
              <p className="text-sm mb-2" style={{ color: '#ffd700' }}>Línea {selectedLine}</p>
              <div className="flex gap-2">
                {cacheLines[selectedLine].data.map((d, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 font-mono text-lg rounded"
                    style={{
                      background: i === parseInt(wordBits, 2) ? '#10b981' : '#1e1e1e',
                      color: i === parseInt(wordBits, 2) ? '#fff' : '#ffd700',
                      border: i === parseInt(wordBits, 2) ? '4px solid #10b981' : '2px solid #2a2a2a',
                      transform: i === parseInt(wordBits, 2) ? 'scale(1.1)' : 'none',
                      boxShadow: i === parseInt(wordBits, 2) ? '0 0 10px #10b981' : 'none',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: '#e0e0e0' }}>Word offset: {wordBits} = posición {parseInt(wordBits, 2)}</p>
            </div>
            <div className="text-4xl animate-pulse" style={{ color: '#ffd700' }}>→</div>
            <div className="p-6 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#3b82f6' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#3b82f6' }}>A la CPU</p>
              <div className="text-4xl font-mono" style={{ color: '#10b981' }}>
                {cacheLines[selectedLine].data[parseInt(wordBits, 2)]}
              </div>
            </div>
          </div>
          <p className="text-center" style={{ color: '#e0e0e0' }}>
            ¡Dato encontrado! Se envía la palabra directamente a la CPU
          </p>
        </div>
      )}

      {/* Escena 5: Resultado Miss */}
      {currentScene === 'miss-result' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#ef4444' }}>
            5. Cache Miss ✗
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="p-6 rounded-lg border-4" style={{ background: '#23272a', borderColor: '#ef4444', boxShadow: '0 0 10px #ef4444' }}>
              <p className="text-xl font-bold mb-2" style={{ color: '#ef4444' }}>No Match</p>
              <p className="text-sm" style={{ color: '#ffd700' }}>Tag esperado: {tagBits}</p>
              <p className="text-sm" style={{ color: '#ffd700' }}>Tag en caché: {cacheLines[selectedLine].tag}</p>
              <p className="text-sm" style={{ color: '#ffd700' }}>Valid: {cacheLines[selectedLine].valid ? '1' : '0'}</p>
            </div>
            <div className="text-4xl animate-pulse" style={{ color: '#ffd700' }}>→</div>
            <div className="p-6 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#ff8c00' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#ff8c00' }}>Ir a RAM</p>
              <div className="text-6xl" style={{ color: '#ffd700' }}>🗄️</div>
              <p className="text-xs mt-2" style={{ color: '#e0e0e0' }}>Memoria Principal</p>
            </div>
          </div>
          <p className="text-center" style={{ color: '#e0e0e0' }}>
            ¡Dato no encontrado! Se debe cargar desde la memoria principal
          </p>
        </div>
      )}

      {/* Escena 6: Carga de bloque */}
      {currentScene === 'block-load' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#ff8c00' }}>
            6. Carga de Bloque
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="p-6 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#3b82f6' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#3b82f6' }}>RAM</p>
              <div className="text-5xl mb-2" style={{ color: '#ffd700' }}>🗄️</div>
              <div className="p-3 rounded border-2" style={{ background: '#23272a', borderColor: '#ff8c00' }}>
                <p className="text-xs mb-1" style={{ color: '#ff8c00' }}>Bloque cargado:</p>
                <div className="flex gap-1">
                  {['A0', 'A1', 'A2', 'A3'].map((d, i) => (
                    <div key={i} className="px-2 py-1 text-xs font-mono rounded" style={{ background: '#1e1e1e', color: '#ffd700' }}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-4xl animate-bounce" style={{ color: '#ffd700' }}>→</div>
            <div className="space-y-2">
              <p className="font-semibold text-center" style={{ color: '#ffd700' }}>Caché (actualizada)</p>
              {cacheLines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex gap-2 p-3 rounded border-2 transition-all"
                  style={{
                    background: idx === selectedLine ? 'rgba(255,140,0,0.15)' : '#23272a',
                    borderColor: idx === selectedLine ? '#ff8c00' : '#2a2a2a',
                    boxShadow: idx === selectedLine ? '0 0 10px #ff8c00' : 'none',
                  }}
                >
                  <div className="text-xs" style={{ color: '#ffd700' }}>L{idx}</div>
                  <div className="text-xs" style={{ color: '#ffd700' }}>V:{line.valid ? '1' : '0'}</div>
                  <div className="font-mono text-sm" style={{ color: '#fff' }}>{line.tag}</div>
                  <div className="flex gap-1">
                    {line.data.map((d, i) => (
                      <div key={i} className="px-2 py-1 text-xs font-mono rounded" style={{ background: '#1e1e1e', color: '#ffd700' }}>
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center" style={{ color: '#e0e0e0' }}>
            El bloque completo se carga en la línea {selectedLine} y se actualiza el Tag
          </p>
        </div>
      )}

      {/* Escena 7: Nueva lectura exitosa */}
      {currentScene === 'successful-read' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#10b981' }}>
            7. Lectura Exitosa
          </h2>
          <div className="flex items-center justify-center gap-6">
            <div className="p-6 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#10b981' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#10b981' }}>Caché actualizada</p>
              <div className="flex gap-2 p-3 rounded border-2" style={{ background: 'rgba(16,185,129,0.15)', borderColor: '#10b981' }}>
                <div className="text-xs" style={{ color: '#ffd700' }}>L{selectedLine}</div>
                <div className="font-mono text-sm" style={{ color: '#fff' }}>{tagBits}</div>
                <div className="flex gap-1">
                  {cacheLines[selectedLine].data.map((d, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 text-xs font-mono rounded"
                      style={{
                        background: i === parseInt(wordBits, 2) ? '#10b981' : '#1e1e1e',
                        color: i === parseInt(wordBits, 2) ? '#fff' : '#ffd700',
                        transform: i === parseInt(wordBits, 2) ? 'scale(1.1)' : 'none',
                        boxShadow: i === parseInt(wordBits, 2) ? '0 0 10px #10b981' : 'none',
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-4xl animate-pulse" style={{ color: '#10b981' }}>✓ →</div>
            <div className="p-6 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#3b82f6' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#3b82f6' }}>CPU</p>
              <div className="text-4xl font-mono" style={{ color: '#10b981' }}>
                {cacheLines[selectedLine].data[parseInt(wordBits, 2)]}
              </div>
              <p className="text-xs mt-2" style={{ color: '#e0e0e0' }}>Dato recibido</p>
            </div>
          </div>
          <p className="text-center" style={{ color: '#e0e0e0' }}>
            ¡Ahora el dato solicitado está en caché y se envía a la CPU!
          </p>
        </div>
      )}

      {/* Escena 8: Loop */}
      {currentScene === 'loop' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-2xl font-semibold" style={{ color: '#3b82f6' }}>
            8. Próximo Acceso
          </h2>
          <div className="flex flex-col items-center gap-6">
            <div className="p-8 rounded-lg border-4" style={{ background: '#23272a', borderColor: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }}>
              <p className="text-xl font-bold mb-4" style={{ color: '#3b82f6' }}>CPU genera nueva dirección</p>
              <div className="text-4xl font-mono mb-4" style={{ color: '#ffd700' }}>????????</div>
              <p className="text-sm" style={{ color: '#e0e0e0' }}>
                El proceso se repite para cada acceso a memoria
              </p>
            </div>
            <div className="p-6 rounded-lg border-2" style={{ background: '#23272a', borderColor: '#10b981' }}>
              <p className="text-lg font-semibold mb-2" style={{ color: '#10b981' }}>Beneficio de la Caché</p>
              <p className="text-sm" style={{ color: '#10b981' }}>✓ Próximos accesos a estos datos serán HIT</p>
              <p className="text-sm" style={{ color: '#ffd700' }}>✓ Mucho más rápido que acceder a RAM</p>
              <p className="text-sm" style={{ color: '#3b82f6' }}>✓ Mejora el rendimiento del sistema</p>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="mt-8 space-y-4">
        {/* Controles principales */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={prevScene}
            disabled={scenes.indexOf(currentScene) === 0 || isAutoPlaying}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <button
            onClick={toggleAutoPlay}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isAutoPlaying 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isAutoPlaying ? '⏸ Pausar' : '▶ Auto'}
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            ⟲ Reiniciar
          </button>
          <button
            onClick={nextScene}
            disabled={isAutoPlaying}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>

        {/* Control de velocidad */}
        <div className="flex justify-center items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Velocidad:</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={autoPlaySpeed}
            onChange={(e) => setAutoPlaySpeed(Number(e.target.value))}
            className="w-48"
          />
          <span className="text-sm text-gray-600">{autoPlaySpeed / 1000}s</span>
        </div>

        {/* Botón de ayuda */}
        <div className="flex justify-center">
          <button
            onClick={toggleHelp}
            className="px-6 py-2 text-white rounded-lg transition-colors uppercase tracking-wide"
            style={{ background: '#ffd700', color: '#000' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff8c00';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 140, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffd700';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {showHelp ? '✕ Cerrar Ayuda' : '? Ver Explicación Detallada'}
          </button>
        </div>
      </div>

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="mt-6 p-6 rounded-lg animate-fade-in" style={{ background: '#1e1e1e', border: '2px solid #ffd700' }}>
          <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>📚 Guía Completa del Simulador</h3>
          
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '2px solid #3b82f6' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#3b82f6' }}> Escena 1: Dirección Generada</h4>
              <p style={{ color: '#ffffff' }}>
                La CPU genera una dirección de memoria en binario que se divide en tres partes:
              </p>
              <ul className="list-disc ml-6 mt-2" style={{ color: '#e0e0e0' }}>
                <li><strong>Tag</strong>: Identifica de manera única el bloque de memoria</li>
                <li><strong>Line</strong>: Selecciona qué línea de la caché revisar</li>
                <li><strong>Word</strong>: Indica qué palabra dentro del bloque queremos</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#10b981' }}> Escena 2: Selección de Línea</h4>
              <p style={{ color: '#ffffff' }}>
                Los bits de "Line" se usan como índice para acceder directamente a una línea específica 
                de la caché. Esto hace la búsqueda muy rápida (acceso directo).
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(168, 85, 247, 0.1)', border: '2px solid #a855f7' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#a855f7' }}> Escena 3: Comparación</h4>
              <p style={{ color: '#ffffff' }}>
                Se compara el Tag de la dirección solicitada con el Tag almacenado en la línea seleccionada.
                También se verifica que el bit "Valid" esté en 1 (línea contiene datos válidos).
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#10b981' }}> Escena 4: Cache Hit</h4>
              <p style={{ color: '#ffffff' }}>
                ¡Coincidencia! El Tag coincide y el bit Valid es 1. Se usa el Word offset para extraer 
                la palabra exacta del bloque y se envía directamente a la CPU. <strong>Muy rápido</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px solid #ef4444' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#ef4444' }}> Escena 5: Cache Miss</h4>
              <p style={{ color: '#ffffff' }}>
                No hay coincidencia (Tag diferente o Valid = 0). El dato no está en caché, 
                por lo que debemos ir a la memoria principal (RAM). <strong>Más lento</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 140, 0, 0.1)', border: '2px solid #ff8c00' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#ff8c00' }}> Escena 6: Carga de Bloque</h4>
              <p style={{ color: '#ffffff' }}>
                Se carga el bloque completo desde la RAM a la línea de caché correspondiente. 
                Se actualiza el Tag y se marca el bit Valid como 1. Ahora la caché tiene el dato.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#10b981' }}> Escena 7: Lectura Exitosa</h4>
              <p style={{ color: '#ffffff' }}>
                Ahora que el dato está en caché, se extrae la palabra solicitada usando el Word offset 
                y se envía a la CPU. Los próximos accesos a este bloque serán hits.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '2px solid #3b82f6' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#3b82f6' }}> Escena 8: Ciclo Continuo</h4>
              <p style={{ color: '#ffffff' }}>
                El proceso se repite con cada acceso a memoria. Gracias al principio de 
                <strong> localidad temporal y espacial</strong>, muchos accesos resultan en hits, 
                mejorando significativamente el rendimiento del sistema.
              </p>
            </div>

            <div className="p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '2px solid #ffd700' }}>
              <h4 className="font-bold mb-2 uppercase tracking-wide" style={{ color: '#ffd700' }}> Conceptos Clave</h4>
              <ul className="list-disc ml-6" style={{ color: '#ffffff' }}>
                <li><strong>Hit Rate</strong>: Porcentaje de accesos que encuentran el dato en caché</li>
                <li><strong>Miss Rate</strong>: Porcentaje de accesos que deben ir a RAM</li>
                <li><strong>Localidad Temporal</strong>: Datos usados recientemente se usarán pronto</li>
                <li><strong>Localidad Espacial</strong>: Datos cercanos se usan juntos</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de progreso */}
      <div className="mt-6">
        <div className="flex justify-center gap-2">
          {scenes.map((scene, idx) => (
            <div
              key={idx}
              className={`h-2 w-12 rounded ${
                currentScene === scene ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">
          Escena {scenes.indexOf(currentScene) + 1} de {scenes.length}
        </p>
      </div>
    </div>
  );
};

export default CacheSimulator;
