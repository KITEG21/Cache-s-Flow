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

const DirectMappedCache = () => {
  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [cacheLines, setCacheLines] = useState<CacheLine[]>([
    { valid: false, tag: '0000', data: ['00', '01', '10', '11'] },
    { valid: true, tag: '1011', data: ['AA', 'BB', 'CC', 'DD'] },
    { valid: false, tag: '0000', data: ['00', '00', '00', '00'] },
    { valid: false, tag: '0000', data: ['00', '00', '00', '00'] },
  ]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [parsedAddress, setParsedAddress] = useState({ tag: '', line: '', word: '' });
  const [isHit, setIsHit] = useState<boolean | null>(null);

  const simulateAccess = () => {
    if (address.length < 6) {
      alert('La dirección debe tener al menos 6 bits');
      return;
    }

    setIsSimulating(true);
    setCurrentStep(0);
    setSelectedLine(null);
    setIsHit(null);

    // Parsear dirección (ejemplo: 4 bits tag, 2 bits line, 2 bits word)
    const tagBits = address.slice(0, address.length - 4);
    const lineBits = address.slice(address.length - 4, address.length - 2);
    const wordBits = address.slice(address.length - 2);

    setParsedAddress({ tag: tagBits, line: lineBits, word: wordBits });

    const lineIndex = parseInt(lineBits, 2);
    const cacheLine = cacheLines[lineIndex];

    const stepsArray: StepMessage[] = [];

    // Paso 1: Dirección recibida
    stepsArray.push({
      title: '1. Dirección de Memoria Recibida',
      description: `La CPU solicita acceso a la dirección: ${address}. Se divide en componentes para el mapeo directo.`,
      type: 'info',
    });

    // Paso 2: Decodificación
    stepsArray.push({
      title: '2. Decodificación de la Dirección',
      description: `Tag: ${tagBits} (${parseInt(tagBits, 2)}), Línea: ${lineBits} (L${lineIndex}), Word: ${wordBits} (pos ${parseInt(wordBits, 2)})`,
      type: 'info',
    });

    // Paso 3: Selección de línea
    stepsArray.push({
      title: '3. Selección de Línea',
      description: `Los bits de línea (${lineBits}) seleccionan directamente la línea L${lineIndex} de la caché. En mapeo directo, cada dirección se mapea a UNA única línea.`,
      type: 'warning',
    });

    // Paso 4: Verificación del bit Valid
    stepsArray.push({
      title: '4. Verificación del Bit Valid',
      description: cacheLine.valid
        ? `✓ Bit Valid = 1. La línea L${lineIndex} contiene datos válidos.`
        : `✗ Bit Valid = 0. La línea L${lineIndex} está vacía o inválida. Esto causa un MISS automático.`,
      type: cacheLine.valid ? 'success' : 'error',
    });

    // Paso 5: Comparación de Tag
    const tagMatch = cacheLine.tag === tagBits;
    if (cacheLine.valid) {
      stepsArray.push({
        title: '5. Comparación de Tags',
        description: tagMatch
          ? `✓ Tag Match! Tag de dirección (${tagBits}) = Tag en caché (${cacheLine.tag})`
          : `✗ Tag Mismatch! Tag de dirección (${tagBits}) ≠ Tag en caché (${cacheLine.tag})`,
        type: tagMatch ? 'success' : 'error',
      });
    }

    const hit = cacheLine.valid && tagMatch;
    setIsHit(hit);

    if (hit) {
      // Cache Hit
      const wordIndex = parseInt(wordBits, 2);
      stepsArray.push({
        title: '6. ¡CACHE HIT! 🎉',
        description: `Dato encontrado en caché. Se extrae la palabra en posición ${wordIndex}: ${cacheLine.data[wordIndex]}`,
        type: 'success',
      });

      stepsArray.push({
        title: '7. Entrega del Dato',
        description: `El dato ${cacheLine.data[wordIndex]} se envía a la CPU. Tiempo de acceso: ~1-2 ciclos. ¡Muy rápido!`,
        type: 'success',
      });
    } else {
      // Cache Miss
      stepsArray.push({
        title: '6. CACHE MISS ❌',
        description: `El dato no está en caché. Razón: ${
          !cacheLine.valid ? 'Línea inválida' : 'Tag no coincide'
        }. Se debe acceder a memoria principal.`,
        type: 'error',
      });

      stepsArray.push({
        title: '7. Acceso a Memoria Principal',
        description: `Se solicita el bloque de memoria que contiene la dirección ${address} desde la RAM. Tiempo: ~100-200 ciclos. Mucho más lento.`,
        type: 'warning',
      });

      stepsArray.push({
        title: '8. Actualización de Caché',
        description: `El bloque cargado desde RAM se almacena en L${lineIndex}. Se actualiza el Tag a ${tagBits} y Valid = 1.`,
        type: 'info',
      });

      // Actualizar caché
      const newCache = [...cacheLines];
      newCache[lineIndex] = {
        valid: true,
        tag: tagBits,
        data: ['A0', 'A1', 'A2', 'A3'],
      };
      setCacheLines(newCache);

      const wordIndex = parseInt(wordBits, 2);
      stepsArray.push({
        title: '9. Entrega del Dato',
        description: `Ahora el dato está en caché. Se extrae y envía a la CPU: A${wordIndex}. Próximos accesos serán HIT.`,
        type: 'success',
      });
    }

    setSteps(stepsArray);
    setSelectedLine(lineIndex);
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
    setParsedAddress({ tag: '', line: '', word: '' });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg shadow-lg" style={{
        background: '#1e1e1e',
        border: '2px solid #ffd700'
      }}>
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
          Caché de Mapeo Directo
        </h2>
        <p className="mb-4" style={{ color: '#a0a0a0' }}>
          Cada bloque de memoria se mapea a exactamente UNA línea de la caché.
          Línea = (Dirección) mod (Número de líneas)
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
            disabled={isSimulating || address.length < 6}
            className="px-6 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
            style={{
              background: isSimulating || address.length < 6 ? '#2a2a2a' : '#ffd700',
              color: isSimulating || address.length < 6 ? '#666666' : '#0a0a0a',
              border: '2px solid',
              borderColor: isSimulating || address.length < 6 ? '#2a2a2a' : '#ffd700',
              cursor: isSimulating || address.length < 6 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSimulating && address.length >= 6) {
                e.currentTarget.style.background = '#ff8c00';
                e.currentTarget.style.borderColor = '#ff8c00';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSimulating && address.length >= 6) {
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
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid #ef4444'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Tag</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.tag}</p>
            </div>
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#10b981' }}>Línea</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.line}</p>
            </div>
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(255, 215, 0, 0.2)',
              border: '2px solid #ffd700'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#ffd700' }}>Word</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.word}</p>
            </div>
          </div>
        )}

        {/* Visualización de la caché */}
        <div className="p-4 rounded-lg" style={{ background: '#1a1a1a' }}>
          <h3 className="font-semibold mb-3 uppercase tracking-wide" style={{ color: '#ffd700' }}>
            Estado de la Caché
          </h3>
          <div className="space-y-2">
            {cacheLines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg transition-all"
                style={{
                  background: selectedLine === idx 
                    ? (isHit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                    : '#2a2a2a',
                  border: '2px solid',
                  borderColor: selectedLine === idx
                    ? (isHit ? '#10b981' : '#ef4444')
                    : '#2a2a2a',
                  boxShadow: selectedLine === idx
                    ? (isHit ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(239, 68, 68, 0.3)')
                    : 'none',
                  transform: selectedLine === idx ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div className="font-semibold text-sm w-12" style={{ color: '#ffd700' }}>L{idx}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#a0a0a0' }}>V:</span>
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: line.valid ? '#10b981' : '#ef4444' }}
                  >
                    {line.valid ? '1' : '0'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#a0a0a0' }}>Tag:</span>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#ffffff'
                  }}>
                    {line.tag}
                  </span>
                </div>
                <div className="flex gap-1">
                  {line.data.map((word, wIdx) => (
                    <div
                      key={wIdx}
                      className="px-2 py-1 text-xs font-mono rounded"
                      style={{
                        background: selectedLine === idx && wIdx === parseInt(parsedAddress.word, 2)
                          ? '#ffd700'
                          : '#1a1a1a',
                        border: selectedLine === idx && wIdx === parseInt(parsedAddress.word, 2)
                          ? '2px solid #ff8c00'
                          : '1px solid #2a2a2a',
                        color: selectedLine === idx && wIdx === parseInt(parsedAddress.word, 2)
                          ? '#0a0a0a'
                          : '#ffffff',
                        fontWeight: selectedLine === idx && wIdx === parseInt(parsedAddress.word, 2)
                          ? 'bold'
                          : 'normal'
                      }}
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mensajes paso a paso */}
      {isSimulating && steps.length > 0 && (
        <div className="p-6 rounded-lg shadow-lg animate-fade-in" style={{
          background: '#1e1e1e',
          border: '2px solid #2a2a2a'
        }}>
          <div
            className="p-4 rounded-lg"
            style={{
              background: steps[currentStep].type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : steps[currentStep].type === 'error'
                ? 'rgba(239, 68, 68, 0.15)'
                : steps[currentStep].type === 'warning'
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(59, 130, 246, 0.15)',
              border: '2px solid',
              borderColor: steps[currentStep].type === 'success'
                ? '#10b981'
                : steps[currentStep].type === 'error'
                ? '#ef4444'
                : steps[currentStep].type === 'warning'
                ? '#f59e0b'
                : '#3b82f6'
            }}
          >
            <h3 className="text-xl font-bold mb-2 uppercase tracking-wide" style={{
              color: steps[currentStep].type === 'success'
                ? '#10b981'
                : steps[currentStep].type === 'error'
                ? '#ef4444'
                : steps[currentStep].type === 'warning'
                ? '#f59e0b'
                : '#3b82f6'
            }}>
              {steps[currentStep].title}
            </h3>
            <p style={{ color: '#ffffff' }}>{steps[currentStep].description}</p>
          </div>

          {/* Controles de navegación */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
              style={{
                background: currentStep === 0 ? '#2a2a2a' : 'transparent',
                color: currentStep === 0 ? '#666666' : '#a0a0a0',
                border: '2px solid',
                borderColor: currentStep === 0 ? '#2a2a2a' : '#ffd700',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Anterior
            </button>
            <div className="text-sm font-semibold" style={{ color: '#ffd700' }}>
              Paso {currentStep + 1} de {steps.length}
            </div>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-4 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
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
                Siguiente →
              </button>
            ) : (
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: '2px solid #10b981'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
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
                  background: idx === currentStep
                    ? '#ffd700'
                    : idx < currentStep
                    ? '#10b981'
                    : '#2a2a2a'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMappedCache;
