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

const SetAssociativeCache = () => {
  // Store the actual 2^x values that user will edit
  const [blockSize, setBlockSize] = useState(4);        // 2^w palabras por bloque
  const [numSets, setNumSets] = useState(4);            // 2^r número de conjuntos
  const [waysPerSet, setWaysPerSet] = useState(2);      // 2^v vías por conjunto
  const [totalBlocks, setTotalBlocks] = useState(64);   // 2^s bloques en memoria
  const [showConfig, setShowConfig] = useState(false);

  // Calculate w, r, v, s from the 2^x values
  const w = Math.log2(blockSize);          // word offset bits
  const r = Math.log2(numSets);            // set index bits (parte de s)
  const v = Math.log2(waysPerSet);         // ways bits
  const s = Math.log2(totalBlocks);        // bits para identificar el bloque

  // Calculated values
  const BLOCK_SIZE = blockSize;
  const NUM_SETS = numSets;
  const WAYS_PER_SET = waysPerSet;
  const TOTAL_BLOCKS = totalBlocks;
  const ADDRESS_BITS = s + w;              // Total de bits: s + w
  const TAG_BITS = s - r;                  // Tag bits: s - r
  const SET_BITS = r;                      // Set index: r (parte de s)
  const WORD_BITS = w;                     // Word offset: w

  const [address, setAddress] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize cache sets dynamically
  const initializeCacheSets = () => {
    const sets: CacheLine[][] = [];
    for (let i = 0; i < NUM_SETS; i++) {
      const ways: CacheLine[] = [];
      for (let j = 0; j < WAYS_PER_SET; j++) {
        ways.push({
          valid: i === 0 && j === 0, // Only first way of first set has data initially
          tag: i === 0 && j === 0 ? '1011' : '0'.repeat(TAG_BITS),
          data: i === 0 && j === 0 ? ['AA', 'BB', 'CC', 'DD'].slice(0, BLOCK_SIZE) : Array(BLOCK_SIZE).fill('00')
        });
      }
      sets.push(ways);
    }
    return sets;
  };
  
  const [cacheSets, setCacheSets] = useState<CacheLine[][]>(initializeCacheSets());
  
  const [selectedSet, setSelectedSet] = useState<number | null>(null);
  const [selectedWay, setSelectedWay] = useState<number | null>(null);
  const [parsedAddress, setParsedAddress] = useState({ tag: '', set: '', word: '' });
  const [isHit, setIsHit] = useState<boolean | null>(null);
  const [comparisonResults, setComparisonResults] = useState<boolean[]>([]);

  // Helper function to check if a number is a power of 2
  const isPowerOf2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const handleConfigUpdate = () => {
    // Validate that all values are powers of 2
    if (!isPowerOf2(blockSize)) {
      alert('Palabras por bloque debe ser potencia de 2');
      return;
    }
    if (!isPowerOf2(numSets)) {
      alert('Número de conjuntos debe ser potencia de 2');
      return;
    }
    if (!isPowerOf2(waysPerSet)) {
      alert('Vías por conjunto debe ser potencia de 2');
      return;
    }
    if (!isPowerOf2(totalBlocks)) {
      alert('Total de bloques debe ser potencia de 2');
      return;
    }
    
    // Calculate w, r, v, s
    const calcW = Math.log2(blockSize);
    const calcR = Math.log2(numSets);
    const calcV = Math.log2(waysPerSet);
    const calcS = Math.log2(totalBlocks);
    
    // Validate ranges
    if (calcW < 1 || calcW > 4) {
      alert('Palabras por bloque debe estar entre 2 y 16 (2^1 a 2^4)');
      return;
    }
    if (calcR < 1 || calcR > 8) {
      alert('Número de conjuntos debe estar entre 2 y 256 (2^1 a 2^8)');
      return;
    }
    if (calcV < 1 || calcV > 4) {
      alert('Vías por conjunto debe estar entre 2 y 16 (2^1 a 2^4)');
      return;
    }
    if (calcS < calcR) {
      alert('Total de bloques (2^s) debe ser >= número de conjuntos (2^r)');
      return;
    }
    if (calcS < 1 || calcS > 16) {
      alert('Total de bloques debe estar entre 2 y 65536 (2^1 a 2^16)');
      return;
    }
    if (calcS + calcW > 20) {
      alert('La dirección total (s+w) no puede exceder 20 bits');
      return;
    }

    // Reinitialize cache with new configuration
    setCacheSets(initializeCacheSets());
    setAddress('');
    setIsSimulating(false);
    setCurrentStep(0);
    setSteps([]);
    setSelectedSet(null);
    setSelectedWay(null);
    setParsedAddress({ tag: '', set: '', word: '' });
    setIsHit(null);
    setComparisonResults([]);
    setShowConfig(false);
  };

  const simulateAccess = () => {
    if (address.length !== ADDRESS_BITS) {
      alert(`La dirección debe tener exactamente ${ADDRESS_BITS} bits (s+r+w = ${s}+${r}+${w})`);
      return;
    }

    setIsSimulating(true);
    setCurrentStep(0);
    setSelectedSet(null);
    setSelectedWay(null);
    setIsHit(null);
    setComparisonResults([]);

    // Parsear: Tag + Set + Word
    const wordBits = address.slice(address.length - WORD_BITS, address.length);
    const setBits = address.slice(address.length - WORD_BITS - SET_BITS, address.length - WORD_BITS);
    const tagBits = address.slice(0, TAG_BITS);

    setParsedAddress({ tag: tagBits, set: setBits, word: wordBits });

    const setIndex = parseInt(setBits, 2);
    const selectedSetLines = cacheSets[setIndex];

    const stepsArray: StepMessage[] = [];

    // Paso 1: Dirección recibida
    stepsArray.push({
      title: '1. Dirección de Memoria Recibida',
      description: `La CPU solicita acceso a la dirección: ${address}. En caché asociativa por conjuntos, el bloque puede ir a cualquier vía dentro de UN conjunto específico.`,
      type: 'info',
    });

    // Paso 2: Decodificación
    stepsArray.push({
      title: '2. Decodificación de la Dirección',
      description: `Tag: ${tagBits} (${parseInt(tagBits, 2)}), Conjunto: ${setBits} (Set ${setIndex}), Word: ${wordBits} (pos ${parseInt(wordBits, 2)}). Combina ventajas del mapeo directo y totalmente asociativo.`,
      type: 'info',
    });

    // Paso 3: Selección de conjunto
    stepsArray.push({
      title: '3. Selección de Conjunto',
      description: `Los bits de conjunto (${setBits}) seleccionan el Conjunto ${setIndex}. El bloque DEBE estar en este conjunto si está en caché, pero puede estar en CUALQUIER vía del conjunto.`,
      type: 'warning',
    });

    setSelectedSet(setIndex);

    // Paso 4: Búsqueda paralela en las vías del conjunto
    stepsArray.push({
      title: `4. Búsqueda Paralela en las ${WAYS_PER_SET} Vías del Conjunto ${setIndex}`,
      description: `Se compara el Tag (${tagBits}) con el Tag de cada vía del conjunto ${setIndex} simultáneamente. Solo se usan ${WAYS_PER_SET} comparadores (menos hardware que totalmente asociativo).`,
      type: 'info',
    });

    // Paso 5: Comparaciones en el conjunto
    const comparisons = selectedSetLines.map((line) => line.valid && line.tag === tagBits);
    setComparisonResults(comparisons);

    let matchFound = false;
    let matchWay = -1;
    comparisons.forEach((match, idx) => {
      if (match) {
        matchFound = true;
        matchWay = idx;
      }
    });

    const comparisonDetails = selectedSetLines
      .map((line, idx) => {
        if (!line.valid) return `Vía ${idx}: Inválida (V=0) → No comparar`;
        return `Vía ${idx}: Tag=${line.tag} ${
          line.tag === tagBits ? '✓ MATCH' : '✗ No match'
        }`;
      })
      .join('\n');

    stepsArray.push({
      title: '5. Resultados de Comparación',
      description: `Comparaciones en Conjunto ${setIndex}:\n${comparisonDetails}`,
      type: 'info',
    });

    setIsHit(matchFound);
    setSelectedWay(matchWay);

    if (matchFound) {
      // Cache Hit
      const wordIndex = parseInt(wordBits, 2);
      stepsArray.push({
        title: '6. ¡CACHE HIT! 🎉',
        description: `Tag encontrado en Conjunto ${setIndex}, Vía ${matchWay}. El dato está en caché. Se extrae la palabra en posición ${wordIndex}: ${selectedSetLines[matchWay].data[wordIndex]}`,
        type: 'success',
      });

      stepsArray.push({
        title: '7. Entrega del Dato',
        description: `El dato ${selectedSetLines[matchWay].data[wordIndex]} se envía a la CPU. La organización por conjuntos reduce conflictos comparada con mapeo directo.`,
        type: 'success',
      });
    } else {
      // Cache Miss
      stepsArray.push({
        title: '6. CACHE MISS ❌',
        description: `El Tag ${tagBits} no se encontró en ninguna vía del Conjunto ${setIndex}. Se debe cargar desde memoria principal.`,
        type: 'error',
      });

      stepsArray.push({
        title: '7. Acceso a Memoria Principal',
        description: `Se solicita el bloque desde la RAM. Tiempo: ~100-200 ciclos.`,
        type: 'warning',
      });

      // Encontrar una vía para reemplazar en el conjunto
      let replacementWay = selectedSetLines.findIndex((line) => !line.valid);
      if (replacementWay === -1) {
        // Si todas válidas, usar la primera (simplificado - normalmente LRU)
        replacementWay = 0;
      }

      stepsArray.push({
        title: '8. Política de Reemplazo',
        description: `Se debe elegir una vía en el Conjunto ${setIndex} para el nuevo bloque. Vía seleccionada: ${replacementWay}. ${
          selectedSetLines[replacementWay].valid
            ? 'Se reemplaza el bloque existente (política: LRU/FIFO).'
            : 'Se usa una vía vacía.'
        }`,
        type: 'warning',
      });

      // Actualizar caché
      const newCache = [...cacheSets];
      newCache[setIndex][replacementWay] = {
        valid: true,
        tag: tagBits,
        data: ['N0', 'N1', 'N2', 'N3'],
      };
      setCacheSets(newCache);
      setSelectedWay(replacementWay);

      const wordIndex = parseInt(wordBits, 2);
      stepsArray.push({
        title: '9. Actualización de Caché',
        description: `Bloque cargado en Conjunto ${setIndex}, Vía ${replacementWay}. Tag actualizado a ${tagBits}, Valid = 1.`,
        type: 'info',
      });

      stepsArray.push({
        title: '10. Entrega del Dato',
        description: `Dato extraído y enviado a la CPU: N${wordIndex}. Próximos accesos a este Tag en el conjunto ${setIndex} serán HIT.`,
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
    setSelectedSet(null);
    setSelectedWay(null);
    setIsHit(null);
    setParsedAddress({ tag: '', set: '', word: '' });
    setComparisonResults([]);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg shadow-lg" style={{
        background: '#1e1e1e',
        border: '2px solid #ffd700'
      }}>
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide" style={{ color: '#ffd700' }}>
          Caché Asociativa por Conjuntos ({WAYS_PER_SET}-way)
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                <div>
                  <span style={{ color: '#a0a0a0' }}>2<sup>w</sup> (Palabras/Bloque): </span>
                  <span style={{ color: '#fff' }} className="font-mono font-bold">{BLOCK_SIZE}</span>
                  <span style={{ color: '#666' }} className="ml-1">(w={w})</span>
                </div>
                <div>
                  <span style={{ color: '#a0a0a0' }}>2<sup>r</sup> (Conjuntos): </span>
                  <span style={{ color: '#fff' }} className="font-mono font-bold">{NUM_SETS}</span>
                  <span style={{ color: '#666' }} className="ml-1">(r={r})</span>
                </div>
                <div>
                  <span style={{ color: '#a0a0a0' }}>2<sup>v</sup> (Vías/Conjunto): </span>
                  <span style={{ color: '#fff' }} className="font-mono font-bold">{WAYS_PER_SET}</span>
                  <span style={{ color: '#666' }} className="ml-1">(v={v})</span>
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
                  <span style={{ color: '#10b981' }} className="font-mono">Set({SET_BITS}b=r)</span>
                  <span style={{ color: '#666' }}> | </span>
                  <span style={{ color: '#ffd700' }} className="font-mono">Word({WORD_BITS}b=w)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
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
                  <label className="text-xs" style={{ color: '#10b981' }}>Conjuntos</label>
                  <input
                    type="number"
                    min="2"
                    max="256"
                    value={numSets}
                    onChange={(e) => setNumSets(parseInt(e.target.value) || 2)}
                    className="w-full px-2 py-1 rounded text-sm font-mono"
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #10b981' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#666' }}>2<sup>{r}</sup> = {NUM_SETS} (r={r})</p>
                </div>
                <div>
                  <label className="text-xs" style={{ color: '#9333ea' }}>Vías/Conjunto</label>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={waysPerSet}
                    onChange={(e) => setWaysPerSet(parseInt(e.target.value) || 2)}
                    className="w-full px-2 py-1 rounded text-sm font-mono"
                    style={{ background: '#2a2a2a', color: '#fff', border: '1px solid #9333ea' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#666' }}>2<sup>{v}</sup> = {WAYS_PER_SET} (v={v})</p>
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
                • Set index = r = {SET_BITS} (conjunto, parte de s)<br/>
                • Word offset = w = {WORD_BITS} (palabra)<br/>
                • Total líneas = 2<sup>r</sup> × 2<sup>v</sup> = {NUM_SETS * WAYS_PER_SET}
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
          La caché se divide en conjuntos. Cada bloque se mapea a UN conjunto específico
          (como mapeo directo), pero puede ir a CUALQUIER vía dentro de ese conjunto
          (como totalmente asociativo). Mejor balance flexibilidad/hardware.
        </p>

        {/* Input de dirección */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder={`Ingrese dirección binaria (${ADDRESS_BITS} bits, ej: ${'1'.repeat(ADDRESS_BITS)})`}
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
            disabled={isSimulating || address.length < 5}
            className="px-6 py-2 rounded-lg uppercase tracking-wide font-bold transition-all"
            style={{
              background: isSimulating || address.length < 5 ? '#2a2a2a' : '#ffd700',
              color: isSimulating || address.length < 5 ? '#666666' : '#0a0a0a',
              border: '2px solid',
              borderColor: isSimulating || address.length < 5 ? '#2a2a2a' : '#ffd700',
              cursor: isSimulating || address.length < 5 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isSimulating && address.length >= 5) {
                e.currentTarget.style.background = '#ff8c00';
                e.currentTarget.style.borderColor = '#ff8c00';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSimulating && address.length >= 5) {
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
              <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>Tag ({TAG_BITS} bits)</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.tag}</p>
            </div>
            <div className="px-4 py-2 rounded" style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '2px solid #10b981'
            }}>
              <p className="text-xs font-semibold" style={{ color: '#10b981' }}>Conjunto ({SET_BITS} bits)</p>
              <p className="font-mono text-lg" style={{ color: '#ffffff' }}>{parsedAddress.set}</p>
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

        {/* Visualización de la caché por conjuntos */}
        <div className="p-4 rounded-lg" style={{ background: '#1a1a1a' }}>
          <h3 className="font-semibold mb-3 uppercase tracking-wide" style={{ color: '#ffd700' }}>
            Estado de la Caché ({WAYS_PER_SET}-way, {NUM_SETS} conjuntos)
          </h3>
          <div className="space-y-4">
            {cacheSets.map((set, setIdx) => (
              <div
                key={setIdx}
                className="p-3 rounded-lg transition-all"
                style={{
                  border: '2px solid',
                  borderColor: selectedSet === setIdx ? '#ffd700' : '#2a2a2a',
                  background: selectedSet === setIdx ? 'rgba(255, 215, 0, 0.1)' : '#1e1e1e',
                  boxShadow: selectedSet === setIdx ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'
                }}
              >
                <div className="font-semibold text-sm mb-2 uppercase tracking-wide" style={{ color: '#ffd700' }}>
                  Conjunto {setIdx}
                </div>
                <div className="space-y-2">
                  {set.map((line, wayIdx) => (
                    <div key={wayIdx} className="flex items-center gap-3">
                      {/* Comparador (solo para el conjunto seleccionado) */}
                      {isSimulating && selectedSet === setIdx && currentStep >= 4 && (
                        <div
                          className="rounded-full flex items-center justify-center text-sm font-bold transition-all"
                          style={{
                            width: '40px',
                            height: '40px',
                            border: '2px solid',
                            borderColor: comparisonResults[wayIdx] ? '#10b981' : '#ef4444',
                            background: comparisonResults[wayIdx] ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: comparisonResults[wayIdx] ? '#10b981' : '#ef4444',
                            boxShadow: comparisonResults[wayIdx] ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(239, 68, 68, 0.3)'
                          }}
                          title={comparisonResults[wayIdx] ? 'Match' : 'No match'}
                        >
                          {comparisonResults[wayIdx] ? '✓' : '✗'}
                        </div>
                      )}

                      {/* Línea de caché */}
                      <div
                        className="flex-1 flex items-center gap-3 p-2 rounded transition-all"
                        style={{
                          border: '2px solid',
                          borderColor: selectedSet === setIdx && selectedWay === wayIdx ? 
                            (isHit ? '#10b981' : '#ffd700') : 
                            '#2a2a2a',
                          background: selectedSet === setIdx && selectedWay === wayIdx ? 
                            (isHit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 215, 0, 0.1)') : 
                            '#1a1a1a',
                          boxShadow: selectedSet === setIdx && selectedWay === wayIdx ? 
                            (isHit ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(255, 215, 0, 0.3)') : 
                            'none'
                        }}
                      >
                        <div className="font-semibold text-xs uppercase tracking-wide" style={{ width: '60px', color: '#ffd700' }}>Vía {wayIdx}</div>
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
                                background: selectedSet === setIdx && selectedWay === wayIdx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                                  ? 'rgba(255, 215, 0, 0.3)' : '#2a2a2a',
                                color: selectedSet === setIdx && selectedWay === wayIdx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                                  ? '#ffd700' : '#ffffff',
                                border: '1px solid',
                                borderColor: selectedSet === setIdx && selectedWay === wayIdx && wIdx === parseInt(parsedAddress.word || '0', 2) 
                                  ? '#ffd700' : '#1a1a1a',
                                fontWeight: selectedSet === setIdx && selectedWay === wayIdx && wIdx === parseInt(parsedAddress.word || '0', 2) 
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

export default SetAssociativeCache;
