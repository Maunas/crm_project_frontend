/** Devuelve el alpha para el borde de Paper según su elevation.
 *  Empieza en .35 para elevation=0 y se reduce .08 por cada nivel. */
export const getBorderAlpha = (elevation: number): number => {
    return Math.min(0.45, Math.max(0.1, 0.35 - (elevation * 0.08)))
}
