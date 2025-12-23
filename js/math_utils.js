/**
 * Utilidades Matemáticas para el Explorador de Campos Escalares
 * (MathUtils)
 */

window.MathUtils = window.MathUtils || {};

// Acceso a la librería math.js global
const m = window.math;

/**
 * Calcula la derivada parcial numérica usando Diferencias Finitas (Diferencia Central)
 * @param {Object} exprCompilada - objeto compilado por math.js
 * @param {Object} ambito - variables actuales {x, y}
 * @param {String} variable - 'x' o 'y' (respecto a qué derivamos)
 * @param {Number} h - Tamaño del paso (por defecto 0.001)
 */
window.MathUtils.calcularDerivadaParcial = function (exprCompilada, ambito, variable, h = 0.001) {
    const valorOriginal = ambito[variable];

    // f(var + h)
    ambito[variable] = valorOriginal + h;
    const f_mas = exprCompilada.evaluate(ambito);

    // f(var - h)
    ambito[variable] = valorOriginal - h;
    const f_menos = exprCompilada.evaluate(ambito);

    // Restauramos el valor original para no afectar otros cálculos
    ambito[variable] = valorOriginal;

    // Fórmula de diferencia central: (f(x+h) - f(x-h)) / 2h
    return (f_mas - f_menos) / (2 * h);
};

/**
 * Genera la malla de puntos y evalúa la función y su gradiente en cada uno.
 * @param {String} exprStr - Expresión de la función f(x,y)
 * @param {Object} rangoX - {min, max}
 * @param {Object} rangoY - {min, max}
 * @param {Number} pasos - Resolución de la malla (número de divisiones)
 */
window.MathUtils.generarDatosDeCampo = function (exprStr, rangoX, rangoY, pasos) {
    let exprCompilada;
    try {
        exprCompilada = m.compile(exprStr);
    } catch (e) {
        throw new Error("La función f(x,y) tiene errores de sintaxis.");
    }

    const valX = [];
    const valY = [];
    const valZ = []; // Matriz 2D para la superficie Z

    // Matrices para el Campo Vectorial (Gradiente)
    const valU = []; // Componente x del gradiente (df/dx)
    const valV = []; // Componente y del gradiente (df/dy)

    const dx = (rangoX.max - rangoX.min) / (pasos - 1);
    const dy = (rangoY.max - rangoY.min) / (pasos - 1);

    // 1. Generar vectores de coordenadas X e Y
    for (let i = 0; i < pasos; i++) {
        valX.push(rangoX.min + i * dx);
        valY.push(rangoY.min + i * dy);
    }

    // 2. Evaluar f(x,y) y Gradiente en cada punto de la malla
    for (let j = 0; j < pasos; j++) { // Recorrer filas (Y)
        const filaZ = [];
        const filaU = [];
        const filaV = [];
        const y = valY[j];

        for (let i = 0; i < pasos; i++) { // Recorrer columnas (X)
            const x = valX[i];
            const ambito = { x, y };

            // Evaluar Altura Z = f(x,y)
            let z;
            try {
                z = exprCompilada.evaluate(ambito);
            } catch (e) { z = NaN; }
            filaZ.push(z);

            // Evaluar Gradiente ∇f = <df/dx, df/dy>
            let df_dx = window.MathUtils.calcularDerivadaParcial(exprCompilada, { x, y }, 'x');
            let df_dy = window.MathUtils.calcularDerivadaParcial(exprCompilada, { x, y }, 'y');

            filaU.push(df_dx);
            filaV.push(df_dy);
        }

        valZ.push(filaZ);
        valU.push(filaU);
        valV.push(filaV);
    }

    return {
        x: valX,
        y: valY,
        z: valZ,
        u: valU, // Vector gradiente componente X
        v: valV  // Vector gradiente componente Y
    };
};

/**
 * Evalúa una trayectoria paramétrica r(t) = (x(t), y(t)) sobre el campo escalar.
 * @param {String} fExprStr - f(x,y)
 * @param {String} xtExprStr - x(t)
 * @param {String} ytExprStr - y(t)
 * @param {Object} rangoT - {min, max}
 * @param {Number} pasos - Número de puntos en la trayectoria
 */
window.MathUtils.evaluarTrayectoria = function (fExprStr, xtExprStr, ytExprStr, rangoT, pasos = 100) {
    let fExpr, xtExpr, ytExpr;
    try {
        fExpr = m.compile(fExprStr);
        xtExpr = m.compile(xtExprStr);
        ytExpr = m.compile(ytExprStr);
    } catch (e) {
        throw new Error("Error en las fórmulas de la trayectoria.");
    }

    const tVals = [];
    const xVals = [];
    const yVals = [];
    const zVals = []; // f(x(t), y(t))

    const dt = (rangoT.max - rangoT.min) / (pasos - 1);

    for (let i = 0; i < pasos; i++) {
        const t = rangoT.min + i * dt;
        tVals.push(t);

        // Calcular posición en el plano (x, y) para este tiempo t
        const ambitoT = { t: t };
        let val_x, val_y;
        try {
            val_x = xtExpr.evaluate(ambitoT);
            val_y = ytExpr.evaluate(ambitoT);
        } catch (e) { val_x = NaN; val_y = NaN; }

        xVals.push(val_x);
        yVals.push(val_y);

        // Calcular altura z sobre la superficie en ese punto (x,y)
        // z = f(x(t), y(t))
        const ambitoF = { x: val_x, y: val_y };
        let val_z;
        try {
            val_z = fExpr.evaluate(ambitoF);
        } catch (e) { val_z = NaN; }

        zVals.push(val_z);
    }

    return {
        t: tVals,
        x: xVals,
        y: yVals,
        z: zVals
    };
};
