import { useState } from 'react';

interface CacheLine {
  valid: boolean;
  tag: string;
  data: string[];
}

interface StepMessage {
  title: string;
  description: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

const FullyAssociativeCache = () => {
  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [cacheLines, setCacheLines] = useState<CacheLine[]>([
    { valid: true, tag: '101101', data: ['AA', 'BB', 'CC', 'DD'] },
    { valid: false, tag: '000000', data: ['00', '00', '00', '00'] },
    { valid: true, tag: '111000', data: ['E0', 'E1', 'E2', 'E3'] },
    { valid: false, tag: '000000', data: ['00', '00', '00', '00'] },
  ]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [parsedAddress, setParsedAddress] = useState({ tag: '', word: '' });
  const [isHit, setIsHit] = useState<boolean | null>(null);
  const [comparisonResults, setComparisonResults] = useState<boolean[]>([]);

  const simulateAccess = () => {
    if (address.length < 4) {
      alert('La dirección debe tener al menos 4 bits');
      return;
    }

    setIsSimulating(true);
    setCurrentStep(0);
    setSelectedLine(null);
    setIsHit(null);
    setComparisonResults([]);

    // En totalmente asociativa: Tag + Word (no hay bits de línea)
    const wordBits = address.slice(address.length - 2);
    const tagBits = address.slice(0, address.length - 2);

    setParsedAddress({ tag: tagBits, word: wordBits });

    const stepsArray: StepMessage[] = [];

    // Paso 1: Dirección recibida
    stepsArray.push({
      title: '1. Dirección de Memoria Recibida',
      description: `La CPU solicita acceso a la dirección: ${address}. En caché totalmente asociativa, el bloque puede estar en CUALQUIER línea.`,
      type: 'info',
    });

    // Paso 2: Decodificación
    stepsArray.push({
      title: '2. Decodificación de la Dirección',
      description: `Tag: ${tagBits} (${parseInt(tagBits, 2)}), Word: ${wordBits} (pos ${parseInt(wordBits, 2)}). NO hay bits de línea - se compara con TODAS las líneas simultáneamente.`,
      type: 'info',
    });

    // Paso 3: Búsqueda paralela
    stepsArray.push({
      title: '3. Búsqueda Paralela en TODAS las Líneas',
      description: `Se compara el Tag (${tagBits}) con el Tag de cada línea simultáneamente usando comparadores paralelos. Ventaja: Flexibilidad total. Desventaja: Hardware costoso.`,
      type: 'warning',
    });

    // Paso 4: Comparaciones individuales
    const comparisons = cacheLines.map((line) => line.valid && line.tag === tagBits);
    setComparisonResults(comparisons);

    let matchFound = false;
    let matchIndex = -1;
    comparisons.forEach((match, idx) => {
      if (match) {
        matchFound = true;
        matchIndex = idx;
      }
    });

    const comparisonDetails = cacheLines
      .map((line, idx) => {
        if (!line.valid) return `L${idx}: Inválida (V=0) → No comparar`;
        return `L${idx}: Tag=${line.tag} ${
          line.tag === tagBits ? '✓ MATCH' : '✗ No match'
        }`;
      })
      .join('\n');

    stepsArray.push({
      title: '4. Resultados de Comparación',
      description: `Comparaciones realizadas:\n${comparisonDetails}`,
      type: 'info',
    });

    setIsHit(matchFound);
    setSelectedLine(matchIndex);

    if (matchFound) {
      // Cache Hit
      const wordIndex = parseInt(wordBits, 2);
      stepsArray.push({
        title: '5. ¡CACHE HIT! 🎉',
        description: `Tag encontrado en la línea L${matchIndex}. El dato está en caché. Se extrae la palabra en posición ${wordIndex}: ${cacheLines[matchIndex].data[wordIndex]}`,
        type: 'success',
      });

      stepsArray.push({
        title: '6. Entrega del Dato',
        description: `El dato ${cacheLines[matchIndex].data[wordIndex]} se envía a la CPU. No hubo conflictos gracias a la flexibilidad del mapeo totalmente asociativo.`,
        type: 'success',
      });
    } else {
      // Cache Miss
      stepsArray.push({
        title: '5. CACHE MISS ❌',
        description: `El Tag ${tagBits} no se encontró en ninguna línea válida. Se debe cargar desde memoria principal.`,
        type: 'error',
      });

      stepsArray.push({
        title: '6. Acceso a Memoria Principal',
        description: `Se solicita el bloque desde la RAM. Tiempo: ~100-200 ciclos.`,
        type: 'warning',
      });

      // Encontrar una línea para reemplazar (primero inválida, o LRU/FIFO)
      let replacementIndex = cacheLines.findIndex((line) => !line.valid);
      if (replacementIndex === -1) {
        // Si todas válidas, usar la primera (simplificado)
        replacementIndex = 0;
      }

      stepsArray.push({
        title: '7. Política de Reemplazo',
        description: `Se debe elegir una línea para almacenar el nuevo bloque. Línea seleccionada: L${replacementIndex}. ${
          cacheLines[replacementIndex].valid
            ? 'Se reemplaza el bloque existente (política: FIFO/LRU).'
            : 'Se usa una línea vacía.'
        }`,
        type: 'warning',
      });

      // Actualizar caché
      const newCache = [...cacheLines];
      newCache[replacementIndex] = {
        valid: true,
        tag: tagBits,
        data: ['N0', 'N1', 'N2', 'N3'],
      };
      setCacheLines(newCache);
      setSelectedLine(replacementIndex);

      const wordIndex = parseInt(wordBits, 2);
      stepsArray.push({
        title: '8. Actualización de Caché',
        description: `Bloque cargado en L${replacementIndex}. Tag actualizado a ${tagBits}, Valid = 1.`,
        type: 'info',
      });

      stepsArray.push({
        title: '9. Entrega del Dato',
        description: `Dato extraído y enviado a la CPU: N${wordIndex}. Próximos accesos a este Tag serán HIT en cualquier línea donde esté.`,
        type: 'success',
      });
    }

    setSteps(stepsArray);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setIsSimulating(false);
    setCurrentStep(0);
    setSteps([]);
    setSelectedLine(null);
    setIsHit(null);
    setParsedAddress({ tag: '', word: '' });
    setComparisonResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg shadow-lg" style={{
        background: '#1e1e1e',
        border: '2px solid #ffd700'
      }}>
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
          Caché Totalmente Asociativa
        </h2>
        <p className="mb-4" style={{ color: '#a0a0a0' }}>
          Un bloque puede ir a CUALQUIER línea de la caché. Se comparan todos los tags
          simultáneamente. Mayor flexibilidad, menor tasa de miss por conflicto, pero
          hardware más complejo.
        </p>

        {/* Input de dirección */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Ingrese dirección binaria (ej: 10110110)"
            value={address}
            onChange={(e) => setAddress(e.target.value.replace(/[^01]/g, ''))}
            className="flex-1 px-4 py-2 rounded-lg font-mono focus:outline-none transition-all"
            style={{
              background: '#1a1a1a',
              border: '2px solid #2a2a2a',
              color: '#ffffff'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ffd700';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#2a2a2a';
              e.currentTarget.style.boxShadow = 'none';
            }}
            disabled={isSimulating}
          />
          <button
            onClick={simulateAccess}
            disabled={isSimulating || address.length < 4}
            className="px-6 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
            style={{
              background: isSimulating || address.length < 4 ? '#2a2a2a' : '#ffd700',
              color: isSimulating || address.length < 4 ? '#666666' : '#0a0a0a',
              border: '2px solid',
              borderColor: isSimulating || address.length < 4 ? '#2a2a2a' : '#ffd700',
              cursor: isSimulating || address.length < 4 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSimulating && address.length >= 4) {
                e.currentTarget.style.background = '#ff8c00';
                e.currentTarget.style.borderColor = '#ff8c00';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSimulating && address.length >= 4) {
                e.currentTarget.style.background = '#ffd700';
                e.currentTarget.style.borderColor = '#ffd700';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            Simular Acceso
          </button>
        </div>

        {/* Dirección parseada */}
        {isSimulating && parsedAddress.tag && (
          <div className="flex gap-2 mb-4 justify-center">
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(255, 215, 0, 0.2)',
              border: '2px solid #ffd700'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#ffd700' }}>Tag</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.tag}</p>
            </div>
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(255, 140, 0, 0.2)',
              border: '2px solid #ff8c00'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#ff8c00' }}>Word</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.word}</p>
            </div>
          </div>
        )}

        {/* Visualización de la caché con comparadores */}
        <div className="p-4 rounded-lg" style={{ background: '#1a1a1a' }}>
          <h3 className="font-semibold mb-3 uppercase tracking-wide" style={{ color: '#ffd700' }}>
            Estado de la Caché
          </h3>
          <div className="space-y-2">
            {cacheLines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {/* Comparador */}
                {isSimulating && currentStep >= 3 && (
                  <div
                    className="rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '2px solid',
                      borderColor: comparisonResults[idx] ? '#10b981' : '#ef4444',
                      background: comparisonResults[idx] ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: comparisonResults[idx] ? '#10b981' : '#ef4444',
                      boxShadow: comparisonResults[idx] ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(239, 68, 68, 0.3)'
                    }}
                    title={comparisonResults[idx] ? 'Match' : 'No match'}
                  >
                    {comparisonResults[idx] ? '✓' : '✗'}
                  </div>
                )}

                {/* Línea de caché */}
                <div
                  className="flex-1 flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{
                    border: '2px solid',
                    borderColor: selectedLine === idx ? 
                      (isHit ? '#10b981' : '#ffd700') : 
                      '#2a2a2a',
                    background: selectedLine === idx ? 
                      (isHit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 215, 0, 0.1)') : 
                      '#1e1e1e',
                    boxShadow: selectedLine === idx ? 
                      (isHit ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 0 20px rgba(255, 215, 0, 0.3)') : 
                      'none'
                  }}
                >
                  <div className="font-semibold text-sm uppercase tracking-wide" style={{ 
                    width: '48px', 
                    color: '#ffd700' 
                  }}>L{idx}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide" style={{ color: '#a0a0a0' }}>V:</span>
                    <span className="font-mono text-sm font-bold" style={{ 
                      color: line.valid ? '#10b981' : '#ef4444' 
                    }}>
                      {line.valid ? '1' : '0'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide" style={{ color: '#a0a0a0' }}>Tag:</span>
                    <span className="font-mono text-sm px-2 py-1 rounded" style={{ 
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      border: '1px solid #ef4444'
                    }}>
                      {line.tag}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {line.data.map((word, wIdx) => (
                      <div
                        key={wIdx}
                        className="px-2 py-1 text-xs font-mono rounded transition-all"
                        style={{
                          background: selectedLine === idx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                            ? 'rgba(255, 215, 0, 0.3)' : '#2a2a2a',
                          color: selectedLine === idx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                            ? '#ffd700' : '#ffffff',
                          border: '1px solid',
                          borderColor: selectedLine === idx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                            ? '#ffd700' : '#1a1a1a',
                          fontWeight: selectedLine === idx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                            ? 'bold' : 'normal'
                        }}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mensajes paso a paso */}
      {isSimulating && steps.length > 0 && (
        <div className="p-6 rounded-lg shadow-lg" style={{ background: '#1e1e1e', border: '2px solid #ffd700' }}>
          <div
            className="p-4 rounded-lg"
            style={{
              border: '2px solid',
              borderColor: steps[currentStep].type === 'success' ? '#10b981' :
                steps[currentStep].type === 'error' ? '#ef4444' :
                steps[currentStep].type === 'warning' ? '#ffd700' : '#3b82f6',
              background: steps[currentStep].type === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                steps[currentStep].type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                steps[currentStep].type === 'warning' ? 'rgba(255, 215, 0, 0.1)' : 'rgba(59, 130, 246, 0.1)'
            }}
          >
            <h3 className="text-xl font-bold mb-2 uppercase tracking-wide" style={{ color: '#ffd700' }}>{steps[currentStep].title}</h3>
            <p className="whitespace-pre-line" style={{ color: '#ffffff' }}>
              {steps[currentStep].description}
            </p>
          </div>

          {/* Controles de navegación */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
              style={{
                background: currentStep === 0 ? '#2a2a2a' : '#ffd700',
                color: currentStep === 0 ? '#666666' : '#0a0a0a',
                border: '2px solid',
                borderColor: currentStep === 0 ? '#2a2a2a' : '#ffd700',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (currentStep !== 0) {
                  e.currentTarget.style.background = '#ff8c00';
                  e.currentTarget.style.borderColor = '#ff8c00';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentStep !== 0) {
                  e.currentTarget.style.background = '#ffd700';
                  e.currentTarget.style.borderColor = '#ffd700';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              ← Anterior
            </button>
            <div className="text-sm uppercase tracking-wide" style={{ color: '#a0a0a0' }}>
              Paso {currentStep + 1} de {steps.length}
            </div>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
                style={{
                  background: '#ffd700',
                  color: '#0a0a0a',
                  border: '2px solid #ffd700',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ff8c00';
                  e.currentTarget.style.borderColor = '#ff8c00';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffd700';
                  e.currentTarget.style.borderColor = '#ffd700';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: '2px solid #10b981',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669';
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981';
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                ✓ Finalizar
              </button>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="flex gap-1 mt-4">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className="h-2 flex-1 rounded transition-all"
                style={{
                  background: idx === currentStep ? '#ffd700' : 
                    idx < currentStep ? '#10b981' : '#2a2a2a',
                  boxShadow: idx === currentStep ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullyAssociativeCache;
