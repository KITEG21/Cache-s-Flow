# 🎓 Simulador Interactivo de Memoria Caché

Aplicación educativa completa para aprender sobre los diferentes tipos de correspondencia de memoria caché mediante simulaciones interactivas paso a paso.

## 🌟 Características Principales

### 📍 Página Principal - Simuladores Interactivos
Simula el funcionamiento de los **3 tipos de correspondencia de caché**:

1. **Caché de Mapeo Directo (Direct Mapped)**
   - Cada bloque se mapea a exactamente UNA línea
   - Hardware simple, búsqueda rápida
   - Mayor probabilidad de conflictos

2. **Caché Totalmente Asociativa (Fully Associative)**
   - Un bloque puede ir a CUALQUIER línea
   - Comparación paralela de todos los tags
   - Máxima flexibilidad, hardware más complejo

3. **Caché Asociativa por Conjuntos (Set Associative)**
   - Balance entre mapeo directo y totalmente asociativo
   - Cada bloque va a un conjunto específico, pero puede ocupar cualquier vía dentro del conjunto
   - Mejor relación costo/rendimiento

### 📚 Tutorial Animado
- Animación paso a paso del proceso de acceso a caché
- Modo automático con velocidad ajustable
- Explicaciones detalladas de cada concepto
- Ideal para aprender los fundamentos

## 🚀 Cómo Usar

### Instalación
```bash
npm install
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`

### Compilar para Producción
```bash
npm run build
```

## 📖 Guía de Uso

### Simuladores Principales (Página `/`)

1. **Selecciona un tipo de caché**: Usa las pestañas superiores
2. **Ingresa una dirección binaria**: Por ejemplo: `10110110`
3. **Presiona "Simular Acceso"**: El sistema procesará la dirección
4. **Navega por los pasos**: Lee cada mensaje explicativo
5. **Observa las animaciones**: Elementos resaltados muestran el flujo

#### Características de los Simuladores:

- ✅ **Entrada personalizada**: Ingresa cualquier dirección binaria
- ✅ **Explicaciones paso a paso**: Mensajes de texto claros
- ✅ **Visualización animada**: Elementos resaltados y coloreados
- ✅ **Comparadores visuales**: Muestra el proceso de comparación
- ✅ **Resultados HIT/MISS**: Indica si el dato está en caché
- ✅ **Actualización de caché**: Muestra cómo se cargan nuevos bloques

#### Ejemplos de Direcciones:

**Mapeo Directo** (8 bits):
- `10110110` - Debería dar HIT en línea 1
- `11001100` - Probablemente MISS
- `00110100` - Depende del estado actual

**Totalmente Asociativa** (8 bits):
- `10110110` - Busca en todas las líneas
- `11100010` - Comparación paralela

**Asociativa por Conjuntos** (8 bits):
- `10110110` - Busca en conjunto 1, vías 0 y 1
- `11001110` - Busca en conjunto 1

### Tutorial Animado (Página `/tutorial`)

1. **Modo Automático**:
   - Presiona "▶ Auto"
   - Ajusta la velocidad con el slider
   - Observa el ciclo completo

2. **Modo Manual**:
   - Usa "Siguiente →" para avanzar
   - Usa "← Anterior" para retroceder
   - Lee las explicaciones con calma

3. **Panel de Ayuda**:
   - Presiona "? Ver Explicación Detallada"
   - Revisa conceptos clave
   - Aprende sobre Hit/Miss, localidad, etc.


## 🔧 Tecnologías Utilizadas

- **React 19** - Framework UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Navegación entre páginas
- **Tailwind CSS 4** - Estilos utilitarios

## 📊 Comparación de Técnicas

| Característica | Mapeo Directo | Totalmente Asociativa | Por Conjuntos |
|----------------|---------------|----------------------|---------------|
| Flexibilidad | Baja | Alta | Media |
| Hardware | Simple | Complejo | Moderado |
| Comparadores | 1 | N (todas) | K (vías/conjunto) |
| Conflictos | Altos | Bajos | Medios |
| Uso típico | Caches L1 | Caches pequeñas | Caches L2/L3 |

## 📚 Conceptos Enseñados

### Fundamentales
- Bits de Tag, Línea/Conjunto, y Word offset
- Bit Valid y su importancia
- Cache Hit vs Cache Miss
- Políticas de reemplazo (LRU, FIFO)

### Avanzados
- Localidad temporal y espacial
- Hit Rate y Miss Rate
- Conflictos de mapeo
- Trade-offs hardware vs rendimiento

## 🎯 Objetivos de Aprendizaje

Al usar este simulador, los estudiantes podrán:

1. ✅ Comprender cómo se divide una dirección de memoria
2. ✅ Entender el proceso de búsqueda en cada tipo de caché
3. ✅ Identificar cuándo ocurre un HIT o MISS
4. ✅ Visualizar el proceso de carga de bloques desde RAM
5. ✅ Comparar ventajas y desventajas de cada técnica
6. ✅ Aplicar conceptos en ejercicios prácticos

## 🎓 Uso Académico

### Para Profesores
- Use el **Tutorial Animado** para introducir conceptos en clase
- Use los **Simuladores Interactivos** para ejercicios prácticos
- Proyecte en pantalla y ajuste la velocidad según el nivel
- Genere ejercicios con diferentes direcciones binarias

### Para Estudiantes
- Complete primero el **Tutorial Animado**
- Practique con los **Simuladores** usando sus propias direcciones
- Compare resultados entre los 3 tipos de caché
- Use como referencia durante estudio de exámenes

## 🔗 Navegación

- **`/`** - Página principal con simuladores interactivos
- **`/tutorial`** - Tutorial animado educativo

Usa el botón "📚 Tutorial Animado" para ir al tutorial.
Usa "← Volver al Simulador Principal" para regresar.

## 📝 Notas de Implementación

- Los estados de caché son temporales (se resetean al recargar)
- Las políticas de reemplazo están simplificadas con fines educativos
- Los tiempos de acceso son aproximados y relativos
- El número de bits puede variar según el ejemplo

## 🤝 Contribuciones

Este es un proyecto educativo. Sientanse libres de sugerir mejoras

---

**¡Aprende, Experimenta y Domina las Memorias Caché!** 🚀
