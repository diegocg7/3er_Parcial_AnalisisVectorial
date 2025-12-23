# Documentación Técnica: Explorador de Campos Escalares

## 1. Introducción
Esta aplicación web es una herramienta interactiva diseñada para la visualización y análisis de campos escalares $f(x, y)$, útiles en el estudio de Cálculo Vectorial. Permite renderizar superficies en 3D, mapas de contorno, campos vectoriales de gradiente y trayectorias paramétricas.

## 2. Tecnologías Utilizadas
El proyecto se ha construido utilizando tecnologías web estándar sin dependencia de servidores backend (Arquitectura Client-Side):

*   **HTML5 / CSS3**: Para la estructura semántica y el diseño visual "Light & Vivid".
*   **Vanilla JavaScript (ES6)**: Para la lógica de control.
*   **Math.js**: Motor matemático para el análisis sintáctico (parsing) de expresiones de usuario y evaluación numérica.
*   **Plotly.js**: Motor de renderizado gráfico basado en WebGL para visualizaciones 3D y 2D de alto rendimiento.

## 3. Implementación Matemática

### 3.1. Evaluación de Funciones
Las funciones ingresadas por el usuario (texto) se compilan en tiempo de ejecución utilizando `math.compile()`. Esto crea un árbol de sintaxis abstracta (AST) optimizado para evaluaciones repetitivas en la malla.

### 3.2. Diferenciación Numérica (Cálculo del Gradiente)
El gradiente $\nabla f(x, y) = \langle \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y} \rangle$ no se calcula simbólicamente, sino **numéricamente** utilizando el Método de Diferencias Finitas Centrales.

Para una variable $x$ y un paso $h$ muy pequeño ($0.001$):
$$ \frac{\partial f}{\partial x} \approx \frac{f(x+h, y) - f(x-h, y)}{2h} $$

Este método permite calcular derivadas de cualquier función que el usuario ingrese, incluso si no tiene una forma cerrada simple, siempre que sea suave en el dominio.

### 3.3. Generación de Malla
Se discretiza el dominio rectangular $[x_{min}, x_{max}] \times [y_{min}, y_{max}]$ en una rejilla de $N \times N$ puntos.
*   Complejidad computacional: $O(N^2)$ por cada renderizado.
*   Para cada nodo $(i, j)$, se calculan $z = f(x_i, y_j)$, $u = \partial_x f$, $v = \partial_y f$.

## 4. Visualización

### 4.1. Superficie 3D
Utiliza el tipo de trazo `surface` de Plotly. Se ha configurado para proyección ortográfica y colorización basada en la altura Z (mapa de color 'Viridis').

### 4.2. Campo Vectorial (Gradiente)
Se implementa mediante dos técnicas:
1.  **Enrejado (Malla)**: Flechas pequeñas distribuidas uniformemente sobre el plano XY (componentes proyectadas).
2.  **Punto Singular**: Un vector 3D construido manualmente usando un trazo `scatter3d` (línea) y `cone` (cabeza), permitiendo inspeccionar el gradiente en coordenadas específicas $(x_0, y_0)$.

### 4.3. Trayectorias Paramétricas
Se evalúa una curva $\vec{r}(t) = \langle x(t), y(t) \rangle$ en el intervalo $t \in [t_{min}, t_{max}]$.
*   Se proyecta sobre la superficie calculando $z(t) = f(x(t), y(t))$.
*   Visualización simultánea en 3D (camino sobre la montaña) y 2D (perfil de corte).

## 5. Arquitectura de Archivos
*   `index.html`: Punto de entrada y definición del layout.
*   `css/style.css`: Hojas de estilo con variables CSS para el tema y diseño responsivo.
*   `js/math_utils.js`: Módulo "puro" encargado de los cálculos numéricos. No tiene acceso al DOM.
*   `js/script.js`: Controlador principal. Maneja eventos del usuario, llama a `math_utils` y actualiza las gráficas de Plotly.
