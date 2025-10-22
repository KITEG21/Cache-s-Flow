# Diseño de Caché - Direct Mapped Cache

## Especificaciones del Sistema

### Parámetros de Configuración

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| **Tamaño de Dirección** | 16 bits | Espacio de direccionamiento de 64 KB (2^16 bytes) |
| **Número de Líneas** | 8 líneas | Caché pequeña y educativa, fácil de visualizar |
| **Tamaño de Bloque** | 4 palabras | Balance entre localidad espacial y complejidad |
| **Bytes por Palabra** | 4 bytes | Arquitectura de 32 bits estándar |

### Cálculo de Bits para División de Dirección

La dirección de memoria se divide en cuatro componentes:

#### 1. **Bits de Byte Offset**
- **Cantidad:** 2 bits
- **Cálculo:** log₂(4 bytes/palabra) = 2 bits
- **Función:** Selecciona qué byte dentro de una palabra (0-3)

#### 2. **Bits de Word Offset**
- **Cantidad:** 2 bits
- **Cálculo:** log₂(4 palabras/bloque) = 2 bits
- **Función:** Selecciona qué palabra dentro del bloque (0-3)

#### 3. **Bits de Index (Línea)**
- **Cantidad:** 3 bits
- **Cálculo:** log₂(8 líneas) = 3 bits
- **Función:** Selecciona directamente una de las 8 líneas de caché (0-7)

#### 4. **Bits de Tag**
- **Cantidad:** 9 bits
- **Cálculo:** 16 bits totales - 2 bits (byte) - 2 bits (word) - 3 bits (index) = 9 bits
- **Función:** Identifica de manera única el bloque de memoria almacenado

## Formato de Dirección

```
┌─────────┬────────┬──────┬──────┐
│   TAG   │ INDEX  │ WORD │ BYTE │
│ 9 bits  │ 3 bits │2 bits│2 bits│
└─────────┴────────┴──────┴──────┘
   15-7      6-4      3-2    1-0
```

### Ejemplo de Dirección: `1011011000110010`

| Componente | Bits | Valor Binario | Valor Decimal | Significado |
|------------|------|---------------|---------------|-------------|
| **Tag** | 9 bits | `101101100` | 364 | Identifica el bloque 364 |
| **Index** | 3 bits | `011` | 3 | Mapea a la línea L3 |
| **Word** | 2 bits | `00` | 0 | Selecciona la palabra 0 del bloque |
| **Byte** | 2 bits | `10` | 2 | Selecciona el byte 2 de la palabra |

## Estructura de la Caché

Cada línea de caché contiene:
- **Bit Valid (V):** 1 bit - Indica si la línea contiene datos válidos
- **Tag:** 9 bits - Almacena el tag del bloque cargado
- **Data:** 4 palabras × 4 bytes = 16 bytes de datos

```
Línea 0: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 1: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 2: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 3: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 4: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 5: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 6: [V|    TAG    | W0 | W1 | W2 | W3 ]
Línea 7: [V|    TAG    | W0 | W1 | W2 | W3 ]
```

## Proceso de Acceso a Caché

### 1. Recepción de Dirección
- La CPU genera una dirección de 16 bits

### 2. División de la Dirección
- Se extrae el Tag (9 bits superiores)
- Se extrae el Index (siguiente 3 bits)
- Se extrae el Word offset (siguiente 2 bits)
- Se extrae el Byte offset (2 bits inferiores)

### 3. Selección de Línea
- Los 3 bits de Index seleccionan directamente una de las 8 líneas
- **Mapeo Directo:** Cada dirección se mapea a UNA única línea
- Fórmula: `Línea = Index decimal`

### 4. Verificación de Hit/Miss
1. Verificar el **bit Valid**:
   - Si V = 0 → **MISS** (línea inválida)
   - Si V = 1 → Continuar

2. Comparar **Tags**:
   - Si Tag dirección = Tag caché → **HIT**
   - Si Tag dirección ≠ Tag caché → **MISS**

### 5. Extracción de Dato
- En caso de **HIT**:
  - Usar Word offset para seleccionar la palabra correcta
  - Usar Byte offset para seleccionar el byte correcto
  - Entregar dato a la CPU (1-2 ciclos)

- En caso de **MISS**:
  - Acceder a memoria principal (100-200 ciclos)
  - Cargar bloque completo en la línea correspondiente
  - Actualizar Tag y Valid = 1
  - Entregar dato a la CPU

## Ventajas del Diseño

1. **Simplicidad:** Mapeo directo es el más simple de implementar
2. **Velocidad:** No hay búsqueda, el index apunta directamente a la línea
3. **Hardware Mínimo:** No requiere comparadores complejos
4. **Predictibilidad:** Siempre se sabe dónde irá un bloque

## Desventajas

1. **Conflictos:** Dos bloques con el mismo index se reemplazan mutuamente
2. **Uso Ineficiente:** Una línea solo puede contener un bloque específico
3. **Thrashing:** Accesos alternados a bloques con mismo index causan muchos misses

## Ejemplos de Uso

### Ejemplo 1: Cache Hit
```
Dirección: 1011011000110010
Tag:       101101100 (364)
Index:     011 (3) → Línea L3
Word:      00 (0)
Byte:      10 (2)

Si L3 tiene V=1 y Tag=101101100 → HIT!
Dato extraído de L3, palabra 0, byte 2
```

### Ejemplo 2: Cache Miss
```
Dirección: 1010101011001101
Tag:       101010101 (341)
Index:     100 (4) → Línea L4
Word:      11 (3)
Byte:      01 (1)

Si L4 tiene V=0 o Tag≠101010101 → MISS!
Se carga bloque desde RAM a L4
Se actualiza Tag=101010101, V=1
```

## Resumen de Fórmulas

- **Index bits:** log₂(número de líneas) = log₂(8) = 3 bits
- **Word bits:** log₂(palabras por bloque) = log₂(4) = 2 bits
- **Byte bits:** log₂(bytes por palabra) = log₂(4) = 2 bits
- **Tag bits:** Dirección total - Index - Word - Byte = 16 - 3 - 2 - 2 = 9 bits
- **Línea destino:** Index en decimal (0-7)
