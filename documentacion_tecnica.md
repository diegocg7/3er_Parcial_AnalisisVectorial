# Documentación Técnica Detallada: Explorador de Campos Escalares y Gradiente

Este documento proporciona una referencia técnica exhaustiva del código fuente del proyecto. Se detalla la arquitectura, los módulos y la lógica matemática implementada función por función.

## 1. Arquitectura General
El proyecto sigue una arquitectura **MVC simplificada (Modelo-Vista-Controlador)** implementada en el lado del cliente (Client-Side):
*   **Modelo (`math_utils.js`)**: Encapsula la lógica matemática pura. No tiene dependencias de la UI ni del DOM.
*   **Vista (`index.html` + `style.css`)**: Define la estructura y el estilo visual interactivo.
*   **Controlador (`script.js`)**: Gestiona la interacción del usuario, coordina los cálculos con el Modelo y renderiza los resultados con Plotly.js.

## 2. Módulo Matemático (`math_utils.js`)
Este archivo contiene el núcleo algorítmico del proyecto. Utiliza `math.js` para el análisis simbólico.

### 2.1. `calcularDerivadaParcial(exprCompilada, ambito, variable, h)`
Calcula numéricamente la derivada parcial de la función $f$ con respecto a una `variable` ($x$ o $y$) en un punto dado.

*   **Algoritmo**: Método de Diferencias Finitas Centrales.
*   **Fórmula**: 
    $$ \frac{\partial f}{\partial v} \approx \frac{f(v+h) - f(v-h)}{2h} $$
*   **Parámetros**:
    *   `exprCompilada`: Objeto `math.compile()` optimizado.
    *   `ambito`: Objeto con los valores actuales `{x: ..., y: ...}`.
    *   `variable`: String `'x'` o `'y'`.
    *   `h`: Paso de diferenciación (default $0.001$).
*   **Retorno**: Valor numérico aproximado de la pendiente.

### 2.2. `generarDatosDeCampo(exprStr, rangoX, rangoY, pasos)`
Genera las matrices de datos necesarias para las gráficas 3D y de contorno muestreando la función en una rejilla regular.

*   **Proceso**:
    1.  Compila la expresión `exprStr`.
    2.  Genera vectores lineales para $x$ e $y$ usando la resolución `pasos`.
    3.  Itera sobre cada par $(x_i, y_j)$ de la malla:
        *   Evalúa $z_{ij} = f(x_i, y_j)$.
        *   Calcula el gradiente $\nabla f = \langle u, v \rangle$ llamando dos veces a `calcularDerivadaParcial`.
*   **Retorno**: Objeto `{x, y, z, u, v}` donde $z, u, v$ son matrices 2D. Esta estructura es compatible directamente con `Plotly.surface` y `Plotly.cone`.

### 2.3. `evaluarTrayectoria(fExprStr, xtExprStr, ytExprStr, rangoT, pasos)`
Calcula la evolución de una curva paramétrica $\vec{r}(t)$ sobre la superficie.

*   **Proceso**:
    1.  Compila las tres funciones: $f(x,y)$, $x(t)$, $y(t)$.
    2.  Discretiza el tiempo $t$ en el intervalo `rangoT`.
    3.  Para cada $t_k$:
        *   Calcula posición plana: $x_k = x(t_k)$, $y_k = y(t_k)$.
        *   Calcula altura en la superficie: $z_k = f(x_k, y_k)$.
*   **Retorno**: Vectores lineales `{t, x, y, z}` listos para gráficas `scatter3d` (líneas).

## 3. Controlador de UI (`script.js`)
Maneja la lógica de la aplicación y la integración con Plotly.js.

### 3.1. `actualizarGraficas()`
Función maestra que se ejecuta al cargar la página o pulsar "Graficar".

*   **Responsabilidades**:
    1.  **Lectura del DOM**: Extrae valores de los inputs (fórmulas, rangos, densidad).
    2.  **Validación**: Verifica que las fórmulas sean sintácticamente correctas (bloque `try-catch`).
    3.  **Generación de Datos**: Llama a `MathUtils` para obtener las matrices numéricas.
    4.  **Construcción de "Traces" (Trazos Visuales)**:
        *   `surface`: Crea la montaña 3D.
        *   `cone`: Genera la visualización del campo vectorial gradiente (flechas rojas). *Nota: Se realiza un submuestreo (`pasoFlechas`) para evitar saturación visual.*
        *   `contour`: Genera el mapa de nivel 2D.
        *   `quiver`: Genera manualmente líneas para el campo vectorial 2D (ya que Plotly JS no tiene un tipo nativo simple para esto combinado con contornos).
        *   `scatter3d`: Dibuja la trayectoria $\vec{r}(t)$ y el vector gradiente puntual.
    5.  **Renderizado**: Llama a `Plotly.newPlot()` para dibujar los 3 gráficos en sus respectivos contenedores (`divs`).

### 3.2. Visualización Puntual (Flecha Naranja)
Dentro de `actualizarGraficas`, hay una lógica específica para el "Punto de Análisis $(x_0, y_0)$".
*   Se calcula el gradiente localmente para ese único punto.
*   Se construye una flecha "compuesta" para máxima elegancia:
    *   **Cuerpo**: Una línea `scatter3d` desde el origen hasta la punta.
    *   **Cabeza**: Un `cone` pequeño situado exactamente al final de la línea.
    *   Esto permite un control estético superior al de usar solo un cono estirado.

## 4. Estilos y Diseño (`style.css`)
El diseño utiliza CSS Grid y Flexbox para la responsividad.
*   **Desktop**: Grid de 2 columnas. La gráfica 3D tiene prioridad de espacio.
*   **Mobile (<900px)**: 
    *   Cambia a `Flex` vertical (`column`).
    *   Elimina `overflow: hidden` del `body` para permitir scroll nativo.
    *   Ajusta tamaños de fuente y padding para interacción táctil (inputs min-height 44px).
*   **Tema**: Variables CSS (`:root`) definen una paleta "Light & Vivid" (Azul Índigo/Naranja/Blanco), facilitando cambios globales de color.
