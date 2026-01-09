/**
 * Lógica Principal de la Aplicación (Script.js)
 * Conecta la interfaz de usuario con math_utils.js y Plotly.
 */

// --- Referencias al DOM (Interfaz) ---
// Campos de función
const inputF = document.getElementById('func-f');
const inputXt = document.getElementById('func-xt');
const inputYt = document.getElementById('func-yt');

// Campos de rangos
const xMin = document.getElementById('x-min');
const xMax = document.getElementById('x-max');
const yMin = document.getElementById('y-min');
const yMax = document.getElementById('y-max');
const tMin = document.getElementById('t-min');
const tMax = document.getElementById('t-max');

// Campos de punto específico
const ptX = document.getElementById('pt-x');
const ptY = document.getElementById('pt-y');

// Control general
const inputDensidad = document.getElementById('densidad');
const btnGraficar = document.getElementById('btn-graficar');

// --- Configuración de Estilo Plotly (Tema Claro) ---
const layoutBase = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
        color: '#1e293b', // Texto oscuro
        family: 'Outfit, sans-serif'
    },
    margin: { t: 40, b: 30, l: 40, r: 20 },
    xaxis: {
        gridcolor: '#e2e8f0', // Rejilla gris claro
        zerolinecolor: '#94a3b8'
    },
    yaxis: {
        gridcolor: '#e2e8f0',
        zerolinecolor: '#94a3b8'
    }
};

// --- Funciones Auxiliares de Error ---
function mostrarError(inputId, mensaje) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById('error-' + inputId);
    if (input && errorDiv) {
        input.classList.add('input-error');
        errorDiv.textContent = mensaje;
        errorDiv.style.display = 'flex';
    }
}

function limpiarError(inputId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById('error-' + inputId);
    if (input && errorDiv) {
        input.classList.remove('input-error');
        errorDiv.textContent = '';
        errorDiv.style.display = 'none';
    }
}

function validarEntradas() {
    let esValido = true;

    // 1. Validar Función f(x,y)
    limpiarError('func-f');
    const resF = window.MathUtils.validarExpresion(inputF.value, ['x', 'y']);
    if (!resF.valido) {
        mostrarError('func-f', resF.error);
        esValido = false;
    }

    // 2. Validar Rangos Numéricos (X, Y, T, Puntos)
    const inputsNum = [
        { id: 'x-min', name: 'X Mín' }, { id: 'x-max', name: 'X Máx' },
        { id: 'y-min', name: 'Y Mín' }, { id: 'y-max', name: 'Y Máx' },
        { id: 't-min', name: 't Mín' }, { id: 't-max', name: 't Máx' },
        { id: 'pt-x', name: 'Punto x0' }, { id: 'pt-y', name: 'Punto y0' }
    ];

    inputsNum.forEach(item => {
        limpiarError(item.id);
        const el = document.getElementById(item.id);
        const valStr = el.value.trim();

        // Regex estricta para números (entero o decimal, positivo o negativo)
        // Evita casos como "-3-3" o "3..5" que HTML input number a veces "traga" o deja pasar como inválido
        // ^-?\d*(\.\d+)?$ permite .5, -.5, 5., 5.5
        if (!/^-?\d*(\.\d+)?$/.test(valStr) || valStr === '' || valStr === '.' || valStr === '-.') {
            mostrarError(item.id, "Número inválido.");
            esValido = false;
        } else if (isNaN(parseFloat(valStr))) {
            mostrarError(item.id, "Valor no numérico.");
            esValido = false;
        }
    });

    // Validar Min < Max (solo si son números válidos)
    const checkMinMax = (idMin, idMax) => {
        const vMin = parseFloat(document.getElementById(idMin).value);
        const vMax = parseFloat(document.getElementById(idMax).value);
        if (!isNaN(vMin) && !isNaN(vMax) && vMin >= vMax) {
            mostrarError(idMin, "Debe ser menor al Máximo");
            // mostrarError(idMax, "Debe ser mayor al Mínimo"); // Opcional marcar ambos
            esValido = false;
        }
    };

    // Solo chequeamos lógica si ya pasaron la validación de formato
    if (esValido) {
        checkMinMax('x-min', 'x-max');
        checkMinMax('y-min', 'y-max');
        checkMinMax('t-min', 't-max');
    }

    // 3. Validar Trayectoria (x(t), y(t))
    // Solo si tienen contenido
    limpiarError('func-xt');
    limpiarError('func-yt');

    const valXt = inputXt.value.trim();
    const valYt = inputYt.value.trim();

    if (valXt || valYt) {
        // Deben estar ambas
        if (!valXt || !valYt) {
            if (!valXt) mostrarError('func-xt', "Requerido para trayectoria");
            if (!valYt) mostrarError('func-yt', "Requerido para trayectoria");
            esValido = false;
        } else {
            // Validar math
            const resXt = window.MathUtils.validarExpresion(valXt, ['t']);
            if (!resXt.valido) { mostrarError('func-xt', resXt.error); esValido = false; }

            const resYt = window.MathUtils.validarExpresion(valYt, ['t']);
            if (!resYt.valido) { mostrarError('func-yt', resYt.error); esValido = false; }
        }
    }

    return esValido;
}

/**
 * Función Principal para Renderizar Todo
 */
function actualizarGraficas() {
    try {
        if (!window.MathUtils) throw new Error("Librería matemática no cargada.");

        // --- VALIDACIÓN PREVIA ---
        if (!validarEntradas()) {
            return; // Detener si hay errores
        }

        // 1. Obtener valores de la UI
        const exprF = inputF.value;
        const exprXt = inputXt.value;
        const exprYt = inputYt.value;

        const rangoX = { min: parseFloat(xMin.value), max: parseFloat(xMax.value) };
        const rangoY = { min: parseFloat(yMin.value), max: parseFloat(yMax.value) };
        const rangoT = { min: parseFloat(tMin.value), max: parseFloat(tMax.value) };

        const pasos = parseInt(inputDensidad.value, 10);

        // 2. Generar datos del Campo Escalar (Superficie y Gradiente)
        const datosCampo = window.MathUtils.generarDatosDeCampo(exprF, rangoX, rangoY, pasos);

        // 3. Generar datos de la Trayectoria (si hay fórmulas válidas)
        let datosTrayectoria = null;
        if (exprXt && exprYt) {
            try {
                datosTrayectoria = window.MathUtils.evaluarTrayectoria(exprF, exprXt, exprYt, rangoT, 100);
            } catch (err) {
                console.warn("No se pudo graficar la trayectoria:", err.message);
            }
        }

        // --- A. GRAFICA SUPERFICIE 3D ---
        const trazoSuperficie = {
            type: 'surface',
            x: datosCampo.x,
            y: datosCampo.y,
            z: datosCampo.z,
            colorscale: 'Viridis',
            opacity: 0.8, // Un poco más transparente para ver las flechas
            showscale: false,
            contours: {
                z: { show: true, usecolormap: true, highlightcolor: "#fff", project: { z: true } }
            }
        };

        const trazos3D = [trazoSuperficie];

        // --- NUEVO: Flechas de Gradiente en 3D (Conos) ---
        // Necesitamos aplanar las matrices para el trace 'cone'
        // y submuestrear para que no se vea saturado
        const flatX = [], flatY = [], flatZ = [], flatU = [], flatV = [], flatW = [];
        const pasoFlechas = Math.max(1, Math.floor(pasos / 15)); // Dinámico según densidad

        for (let r = 0; r < datosCampo.z.length; r += pasoFlechas) {
            for (let c = 0; c < datosCampo.z[r].length; c += pasoFlechas) {
                flatX.push(datosCampo.x[c]);
                flatY.push(datosCampo.y[r]);
                flatZ.push(datosCampo.z[r][c]);

                // El gradiente es 2D (u, v), w=0
                // Normalizamos un poco el tamaño visual
                flatU.push(datosCampo.u[r][c]);
                flatV.push(datosCampo.v[r][c]);
                flatW.push(0);
            }
        }

        trazos3D.push({
            type: 'cone',
            x: flatX, y: flatY, z: flatZ,
            u: flatU, v: flatV, w: flatW,
            sizemode: 'absolute',
            sizeref: 2, // Tamaño base de las flechas
            anchor: 'tail',
            colorscale: 'Reds', // Color distinto para resaltar
            showscale: false,
            name: 'Gradiente'
        });

        // Si hay trayectoria, añadir la línea 3D
        if (datosTrayectoria) {
            trazos3D.push({
                type: 'scatter3d',
                mode: 'lines',
                x: datosTrayectoria.x,
                y: datosTrayectoria.y,
                z: datosTrayectoria.z,
                line: { color: '#ec4899', width: 6 }, // Rosa brillante
                name: 'r(t)'
            });
        }

        // --- NUEVO: Flecha Grande en Punto Específico ---
        const x0 = parseFloat(ptX.value);
        const y0 = parseFloat(ptY.value);

        if (!isNaN(x0) && !isNaN(y0)) {
            let exprCompilada = window.math.compile(exprF);
            let z0 = exprCompilada.evaluate({ x: x0, y: y0 });

            // Reusar math_utils para calcular gradiente en ese punto
            let u0 = window.MathUtils.calcularDerivadaParcial(exprCompilada, { x: x0, y: y0 }, 'x');
            let v0 = window.MathUtils.calcularDerivadaParcial(exprCompilada, { x: x0, y: y0 }, 'y');

            // Normalizar visualmente el tamaño de la flecha
            // Queremos que sea visible pero proporcional
            const magnitud = Math.sqrt(u0 * u0 + v0 * v0);
            const escalaVisual = (rangoX.max - rangoX.min) * 0.15 / (magnitud || 1);

            const u_vis = u0 * escalaVisual;
            const v_vis = v0 * escalaVisual;

            const x_final = x0 + u_vis;
            const y_final = y0 + v_vis;
            const z_final = z0; // El gradiente está en el plano tangente, visualmente plano en Z se entiende mejor como dirección XY

            // 1. EL CUERPO DE LA FLECHA (Línea elegante)
            trazos3D.push({
                type: 'scatter3d',
                mode: 'lines',
                x: [x0, x_final],
                y: [y0, y_final],
                z: [z0, z_final],
                line: { color: '#fb923c', width: 8 }, // Naranja "Orange-400"
                name: 'Cuerpo Gradiente'
            });

            // 2. LA PUNTA DE LA FLECHA (Cono pequeño al final)
            trazos3D.push({
                type: 'cone',
                x: [x_final], y: [y_final], z: [z_final],
                u: [u0], v: [v0], w: [0],
                sizemode: 'absolute',
                sizeref: 0.5, // Punta pequeña y discreta
                anchor: 'tip', // El cono termina en el punto final
                colorscale: [[0, '#fb923c'], [1, '#fb923c']],
                showscale: false,
                name: 'Punta Gradiente'
            });

            // Añadir marcador del punto origen
            trazos3D.push({
                type: 'scatter3d',
                mode: 'markers',
                x: [x0], y: [y0], z: [z0],
                marker: { color: '#fff', size: 4, opacity: 0.8 }, // Punto blanco sutil
                name: 'Punto P'
            });
        }

        const layout3D = {
            ...layoutBase,
            margin: { t: 0, b: 0, l: 0, r: 0 }, // Maximizar espacio
            scene: {
                xaxis: { title: 'X', gridcolor: '#475569' },
                yaxis: { title: 'Y', gridcolor: '#475569' },
                zaxis: { title: 'Z', gridcolor: '#475569' },
                camera: { eye: { x: 1.4, y: 1.4, z: 1.4 } }
            }
        };

        Plotly.newPlot('plot-surface', trazos3D, layout3D, { responsive: true, displayModeBar: true });


        // --- B. GRAFICA CONTOUR + GRADIENTE (2D) ---

        // 1. Mapa de contornos
        const trazoContour = {
            type: 'contour',
            x: datosCampo.x,
            y: datosCampo.y,
            z: datosCampo.z,
            colorscale: 'Viridis',
            ncontours: 15,
            line: { smoothing: 0.85, width: 0.5 },
            colorbar: { title: 'f(x,y)', thickness: 10, len: 0.8 }
        };

        // 2. Flechas del Gradiente (Quiver personalizado)
        const quiverX = [];
        const quiverY = [];

        // Calcular escala para las flechas
        let maxMag = 0;
        for (let r = 0; r < datosCampo.u.length; r++) {
            for (let c = 0; c < datosCampo.u[r].length; c++) {
                const mag = Math.sqrt(datosCampo.u[r][c] ** 2 + datosCampo.v[r][c] ** 2);
                if (mag > maxMag) maxMag = mag;
            }
        }
        const escalaFlecha = (rangoX.max - rangoX.min) / pasos * 0.8 / (maxMag || 1);

        // Construir líneas de flechas
        for (let r = 0; r < datosCampo.z.length; r++) {
            for (let c = 0; c < datosCampo.z[r].length; c++) {
                // Reducir la densidad visual de flechas si la malla es muy fina
                if (pasos > 20 && (r % 2 !== 0 || c % 2 !== 0)) continue;

                const x = datosCampo.x[c];
                const y = datosCampo.y[r];
                const u = datosCampo.u[r][c];
                const v = datosCampo.v[r][c];

                quiverX.push(x, x + u * escalaFlecha, null);
                quiverY.push(y, y + v * escalaFlecha, null);
            }
        }

        const trazoGradiente = {
            type: 'scatter',
            mode: 'lines',
            x: quiverX,
            y: quiverY,
            line: { color: 'rgba(255, 255, 255, 0.4)', width: 1 },
            hoverinfo: 'skip',
            name: 'Gradiente'
        };

        const trazos2D = [trazoContour, trazoGradiente];

        // Si hay trayectoria, proyectarla en 2D
        if (datosTrayectoria) {
            trazos2D.push({
                type: 'scatter',
                mode: 'lines',
                x: datosTrayectoria.x,
                y: datosTrayectoria.y,
                line: { color: '#ec4899', width: 3, dash: 'dot' },
                name: 'Proyección r(t)'
            });
        }

        const layout2D = {
            ...layoutBase,
            xaxis: { title: 'X', scaleanchor: 'y' },
            yaxis: { title: 'Y' },
            showlegend: false
        };

        Plotly.newPlot('plot-contour', trazos2D, layout2D, { responsive: true, displayModeBar: false });


        // --- C. PERFIL DE ALTURA (f vs t) ---
        if (datosTrayectoria) {
            const trazoPerfil = {
                type: 'scatter',
                mode: 'lines',
                x: datosTrayectoria.t,
                y: datosTrayectoria.z,
                fill: 'tozeroy', // Relleno bajo la curva
                line: { color: '#ec4899', width: 3 },
                name: 'f(r(t))'
            };

            const layoutPerfil = {
                ...layoutBase,
                xaxis: { title: 'Tiempo (t)' },
                yaxis: { title: 'Valor de f(x,y)' },
                margin: { t: 20, b: 40, l: 50, r: 20 }
            };

            Plotly.newPlot('plot-profile', [trazoPerfil], layoutPerfil, { responsive: true, displayModeBar: false });
        } else {
            // Limpiar si no hay trayectoria
            document.getElementById('plot-profile').innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;color:#64748b;">Sin trayectoria definida</div>';
        }

    } catch (err) {
        console.error(err);
        alert("¡Ups! Hubo un error al calcular: " + err.message);
    }
}

// Event Listeners
btnGraficar.addEventListener('click', actualizarGraficas);
document.addEventListener('DOMContentLoaded', actualizarGraficas);

// Actualizar automáticamente al soltar el slider de densidad (para no trabar mientras desliza)
inputDensidad.addEventListener('change', actualizarGraficas);
