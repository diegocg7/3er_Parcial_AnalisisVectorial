# Explicación Técnica y Analogías del Proyecto

Este documento explica las herramientas utilizadas para construir el **Explorador Vectorial** utilizando analogías sencillas para entender cómo funciona todo "bajo el capó".

---

## 1. El Equipo de Construcción (Las Tecnologías)

Imagina que estamos construyendo una maqueta interactiva de una montaña (nuestra superficie 3D). Para hacerlo, contratamos a un equipo de especialistas, cada uno con un rol muy específico:

### 🏗️ HTML (`index.html`): El Arquitecto
HTML es como los planos y el esqueleto del edificio. Define **qué** cosas existen, pero no cómo se ven ni qué hacen.
*   **Analogía**: El HTML dice: "Aquí va una ventana (input), aquí un cartel (título) y aquí una mesa grande para la maqueta (el contenedor del gráfico)". Sin HTML, no hay estructura, solo vacío.

### 🎨 CSS (`style.css`): El Decorador de Interiores
CSS se encarga de que todo se vea bonito, moderno y "premium". Toma el esqueleto feo del HTML y lo viste.
*   **Analogía**: El CSS decide: "Esa pared será de color azul oscuro profundo (modo oscuro), las ventanas tendrán bordes brillantes (glassmorphism) y las letras usarán una tipografía elegante". Es el responsable de que sientas que usas una app profesional y no un documento de texto aburrido.

### 🧠 JavaScript (`script.js`): El Director de Orquesta
JavaScript es el cerebro. Es quien escucha lo que pide el usuario y ordena a los demás qué hacer.
*   **Analogía**: Cuando presionas el botón "Graficar", el Director (JS) grita: "¡Atención todos! El usuario quiere ver la función $x^2$. ¡Matemático (Math.js), calcula los puntos! ¡Artista (Plotly), dibuja la montaña!". Sin JS, el botón no haría nada; sería como un timbre desconectado.

---

## 2. Las Herramientas Especializadas (Librerías)

Como programadores, no fabricamos los ladrillos desde cero. Usamos herramientas que otros ya perfeccionaron (Librerías).

### 🧮 Math.js (`math_utils.js`): La Calculadora Científica
Necesitamos evaluar fórmulas matemáticas complejas como $sin(x) * cos(y)$. Escribir un programa que "entienda" texto matemático es muy difícil.
*   **Analogía**: Math.js es un traductor experto. Nosotros le damos un papelito escrito en humano ("sin(t)") y él lo convierte instantáneamente en resultados numéricos precisos que la computadora entiende. También nos ayuda a compilar la fórmula una vez y reusarla mil veces para nuestra malla de puntos.

### 📊 Plotly.js: El Artista 3D
Dibujar miles de polígonos, luces y sombras para hacer una superficie 3D es matemáticamente muy pesado.
*   **Analogía**: Plotly es como un pintor renacentista muy veloz. Nosotros solo le damos una lista de números (coordenadas X, Y, Z) y le decimos "¡Píntalo!". Él se encarga de la perspectiva, de girar la cámara cuando arrastras el mouse y de poner los colores bonitos (mapa de calor).

---

## 3. Conceptos Matemáticos Implementados

### La Malla (Grid)
Para que la computadora dibuje una superficie suave, en realidad dibujamos muchos cuadraditos pequeños.
*   **Analogía**: Es como hacer un dibujo pixelado o tejer una red. Calculamos la altura $Z$ en puntos separados regularmente (por ejemplo, cada 0.5 metros). Si los puntos están muy cerca, la montaña se ve suave; si están lejos, se ve "cuadrada" (baja resolución).

### Diferencias Finitas (Derivadas)
El usuario pidió calcular el gradiente "numéricamente".
*   **El Problema**: La computadora no sabe cálculo simbólico (no sabe que la derivada de $x^2$ es $2x$ a menos que se lo enseñemos).
*   **La Solución (Diferencias Finitas)**: Para saber la inclinación (derivada) en un punto, miramos un pasito adelante y un pasito atrás.
*   **Analogía**: Imagina que estás en la montaña y quieres saber qué tan empinada está. No necesitas un satélite. Solo das un paso a la derecha y ves si subiste o bajaste.
    *   Pendiente $\approx \frac{\text{Altura(un paso adelante)} - \text{Altura(un paso atrás)}}{\text{Distancia de dos pasos}}$.
    *   Esto es lo que hace `calcularDerivadaParcial` millones de veces por segundo.

### El Gradiente ($\nabla f$)
Es un vector (una flecha) que apunta hacia donde la montaña sube más rápido.
*   **Analogía**: Si pones una pelota en el suelo, rodará hacia abajo. El gradiente es la flecha opuesta: te dice "¡Por allá es la cima más directa!". En nuestra app, dibujamos estas flechas sobre el mapa 2D para que sepas cómo "fluye" la función.
