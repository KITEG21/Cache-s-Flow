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
  // Store the actual 2^x values that user will edit
  const [blockSize, setBlockSize] = useState(4);        // 2^w palabras por bloque
  const [numLines, setNumLines] = useState(8);          // 2^r líneas en caché
  const [totalBlocks, setTotalBlocks] = useState(512);  // 2^s bloques en memoria
  const [showConfig, setShowConfig] = useState(false);
  
  // Calculate w, r, s from the 2^x values
  const w = Math.log2(blockSize);           // word offset bits
  const r = Math.log2(numLines);            // index bits (parte de s)
  const s = Math.log2(totalBlocks);         // bits para identificar el bloque
  
  // Calculated values
  const BLOCK_SIZE = blockSize;
  const NUM_LINES = numLines;
  const TOTAL_BLOCKS = totalBlocks;
  const ADDRESS_BITS = s + w;               // Total bits: s + w
  const TAG_BITS = s - r;                   // Tag bits: s - r
  const INDEX_BITS = r;                     // Index bits: r (parte de s)
  const WORD_BITS = w;                      // Word offset bits: w
  
  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Initialize cache lines based on NUM_LINES
  const initializeCacheLines = (): CacheLine[] => {
  const lines: CacheLine[] = [];
  const tagLength = TAG_BITS;

  for (let i = 0; i < NUM_LINES; i++) {
    const randomTag = Array(tagLength)
      .fill(0)
      .map(() => Math.random() > 0.5 ? '1' : '0') // Genera un tag aleatorio
      .join('');

    const randomData = Array(BLOCK_SIZE)
      .fill(0)
      .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random() * 10)); // Genera datos aleatorios

    lines.push({
      valid: Math.random() > 0, // 70% de probabilidad de que sea válido
      tag: randomTag,
      data: randomData,
    });
  }
  return lines;
};
  
  const [cacheLines, setCacheLines] = useState<CacheLine[]>(initializeCacheLines());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [parsedAddress, setParsedAddress] = useState({ tag: '', line: '', word: '' });
  const [isHit, setIsHit] = useState<boolean | null>(null);
  
  // Helper function to check if a number is a power of 2
  const isPowerOf2 = (n: number) => n > 0 && (n & (n - 1)) === 0;
  
  // Update cache when configuration changes
  const handleConfigUpdate = () => {
    // Validate that all values are powers of 2
    if (!isPowerOf2(blockSize)) {
      alert('Palabras por bloque debe ser potencia de 2 (2, 4, 8, 16)');
      return;
    }
    if (!isPowerOf2(numLines)) {
      alert('Número de líneas debe ser potencia de 2 (2, 4, 8, ..., 256)');
      return;
    }
    if (!isPowerOf2(totalBlocks)) {
      alert('Total de bloques debe ser potencia de 2');
      return;
    }
    
    // Calculate w, r, s
    const calcW = Math.log2(blockSize);
    const calcR = Math.log2(numLines);
    const calcS = Math.log2(totalBlocks);
    
    // Validate ranges
    if (calcW < 1 || calcW > 4) {
      alert('Palabras por bloque debe estar entre 2 y 16 (2^1 a 2^4)');
      return;
    }
    if (calcR < 1 || calcR > 8) {
      alert('Número de líneas debe estar entre 2 y 256 (2^1 a 2^8)');
      return;
    }
    if (calcS < calcR) {
      alert('Total de bloques (2^s) debe ser >= número de líneas (2^r)');
      return;
    }
    if (calcS < 1 || calcS > 16) {
      alert('Total de bloques debe estar entre 2 y 65536 (2^1 a 2^16)');
      return;
    }
    if (calcS + calcW > 20) {
      alert('La dirección total (s+w) no debe exceder 20 bits');
      return;
    }
    
    // Reset simulation
    setIsSimulating(false);
    setCurrentStep(0);
    setSteps([]);
    setSelectedLine(null);
    setIsHit(null);
    setAddress('');
    setParsedAddress({ tag: '', line: '', word: '' });
    
    // Reinitialize cache lines
    setCacheLines(initializeCacheLines());
    setShowConfig(false);
  };

  const simulateAccess = () => {
    // Validate address length
    if (address.length !== ADDRESS_BITS) {
      alert(`La dirección debe tener exactamente ${ADDRESS_BITS} bits`);
      return;
    }

    setIsSimulating(true);
    setCurrentStep(0);
    setSelectedLine(null);
    setIsHit(null);

    // Parse address based on cache configuration
    // Format: [TAG | INDEX | WORD]
    let bitPosition = 0;
    
    // Extract TAG bits
    const tagBits = address.slice(bitPosition, bitPosition + TAG_BITS);
    bitPosition += TAG_BITS;
    
    // Extract INDEX bits
    const indexBits = address.slice(bitPosition, bitPosition + INDEX_BITS);
    bitPosition += INDEX_BITS;
    
    // Extract WORD bits
    const wordBits = address.slice(bitPosition, bitPosition + WORD_BITS);

    setParsedAddress({ tag: tagBits, line: indexBits, word: wordBits });

    const lineIndex = parseInt(indexBits, 2);
    const cacheLine = cacheLines[lineIndex];

    const stepsArray: StepMessage[] = [];

    // Paso 1: Dirección recibida
    stepsArray.push({
      title: '1. Dirección de Memoria Recibida',
      description: `La CPU solicita acceso a la dirección de ${ADDRESS_BITS} bits: ${address}. Se divide en componentes según el diseño de la caché.`,
      type: 'info',
    });

    // Paso 2: Decodificación
    stepsArray.push({
      title: '2. Decodificación de la Dirección',
      description: `Tag: ${tagBits} (${TAG_BITS} bits = ${parseInt(tagBits, 2)}), Índice: ${indexBits} (${INDEX_BITS} bits = L${lineIndex}), Word: ${wordBits} (${WORD_BITS} bits = pos ${parseInt(wordBits, 2)})`,
      type: 'info',
    });

    // Paso 3: Selección de línea
    stepsArray.push({
      title: '3. Selección de Línea',
      description: `Los ${INDEX_BITS} bits de índice (${indexBits}) seleccionan directamente la línea L${lineIndex} de las ${NUM_LINES} líneas de caché. En mapeo directo, cada dirección se mapea a UNA única línea.`,
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
        
        {/* Cache Configuration Info */}
        <div className="mb-4 p-3 rounded-lg" style={{ background: '#1a1a1a', border: '2px solid #2a2a2a' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#ffd700' }}>
              Configuración de la Caché
            </h3>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-3 py-1 rounded text-xs uppercase tracking-wide transition-all"
              style={{
                background: '#ffd700',
                color: '#000',
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
              {showConfig ? '✓ Guardar' : '⚙ Editar'}
            </button>
          </div>
          
          {!showConfig ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-2">
                <div>
                  <span style={{ color: '#a0a0a0' }}>2<sup>w</sup> (Palabras/Bloque): </span>
                  <span style={{ color: '#fff' }} className="font-mono font-bold">{BLOCK_SIZE}</span>
                  <span style={{ color: '#666' }} className="ml-1">(w={w})</span>
                </div>
                <div>
                  <span style={{ color: '#a0a0a0' }}>2<sup>r</sup> (Líneas): </span>
                  <span style={{ color: '#fff' }} className="font-mono font-bold">{NUM_LINES}</span>
                  <span style={{ color: '#666' }} className="ml-1">(r={r})</span>
                </div>
                <div>
                  <span style={{ color: '#a0a0a0' }}>2<sup>s</sup> (Bloques Mem): </span>
                  <span style={{ color: '#fff' }} className="font-mono font-bold">{TOTAL_BLOCKS}</span>
                  <span style={{ color: '#666' }} className="ml-1">(s={s})</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t" style={{ borderColor: '#2a2a2a' }}>
                <div className="text-xs">
                  <span style={{ color: '#a0a0a0' }}>Dirección ({ADDRESS_BITS} bits = s+w): </span>
                  <span style={{ color: '#ef4444' }} className="font-mono">Tag({TAG_BITS}b=s-r)</span>
                  <span style={{ color: '#666' }}> | </span>
                  <span style={{ color: '#10b981' }} className="font-mono">Index({INDEX_BITS}b=r)</span>
                  <span style={{ color: '#666' }}> | </span>
                  <span style={{ color: '#ffd700' }} className="font-mono">Word({WORD_BITS}b=w)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs" style={{ color: '#ffd700' }}>Palabras/Bloque</label>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={blockSize}
                    onChange={(e) => setBlockSize(parseInt(e.target.value) || 2)}
                    className="w-full px-2 py-1 rounded text-sm font-mono"
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #ffd700' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#666' }}>2<sup>{w}</sup> = {BLOCK_SIZE} (w={w})</p>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#10b981' }}>Líneas en Caché</label>
                  <input
                    type="number"
                    min="2"
                    max="256"
                    value={numLines}
                    onChange={(e) => setNumLines(parseInt(e.target.value) || 2)}
                    className="w-full px-2 py-1 rounded text-sm font-mono"
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #10b981' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#666' }}>2<sup>{r}</sup> = {NUM_LINES} (r={r})</p>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#ef4444' }}>Total Bloques Mem</label>
                  <input
                    type="number"
                    min="2"
                    max="65536"
                    value={totalBlocks}
                    onChange={(e) => setTotalBlocks(parseInt(e.target.value) || 2)}
                    className="w-full px-2 py-1 rounded text-sm font-mono"
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #ef4444' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#666' }}>2<sup>{s}</sup> = {TOTAL_BLOCKS} (s={s})</p>
                </div>
              </div>
              <div className="text-xs p-2 rounded" style={{ background: '#2a2a2a', color: '#a0a0a0' }}>
                <strong style={{ color: '#ffd700' }}>Fórmulas:</strong><br/>
                • Dirección total = s + w = {ADDRESS_BITS} bits<br/>
                • Tag bits = s - r = {TAG_BITS} (etiqueta)<br/>
                • Index bits = r = {INDEX_BITS} (línea, parte de s)<br/>
                • Word offset = w = {WORD_BITS} (palabra)<br/>
                • 2<sup>r</sup> = {NUM_LINES} líneas | 2<sup>s</sup> = {TOTAL_BLOCKS} bloques
              </div>
              <button
                onClick={handleConfigUpdate}
                className="w-full px-4 py-2 rounded uppercase tracking-wide font-bold"
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: '2px solid #10b981'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#10b981';
                }}
              >
                Aplicar Configuración
              </button>
            </div>
          )}
        </div>
        
        <p className="mb-4" style={{ color: '#a0a0a0' }}>
          Cada bloque de memoria se mapea a exactamente UNA línea de la caché.
          Línea = (Dirección) mod (Número de líneas)
        </p>

        {/* Input de dirección */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder={`Ingrese dirección binaria de ${ADDRESS_BITS} bits`}
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
            disabled={isSimulating || address.length !== ADDRESS_BITS}
            className="px-6 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
            style={{
              background: isSimulating || address.length !== ADDRESS_BITS ? '#2a2a2a' : '#ffd700',
              color: isSimulating || address.length !== ADDRESS_BITS ? '#666666' : '#0a0a0a',
              border: '2px solid',
              borderColor: isSimulating || address.length !== ADDRESS_BITS ? '#2a2a2a' : '#ffd700',
              cursor: isSimulating || address.length !== ADDRESS_BITS ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSimulating && address.length === ADDRESS_BITS) {
                e.currentTarget.style.background = '#ff8c00';
                e.currentTarget.style.borderColor = '#ff8c00';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSimulating && address.length === ADDRESS_BITS) {
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
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '2px solid #ef4444'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Tag ({TAG_BITS} bits)</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.tag}</p>
            </div>
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#10b981' }}>Index ({INDEX_BITS} bits)</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.line}</p>
            </div>
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(255, 215, 0, 0.2)',
              border: '2px solid #ffd700'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#ffd700' }}>Word ({WORD_BITS} bits)</p>
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
