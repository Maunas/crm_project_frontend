/**
 * Define la estructura de una lista con paginación. Se llama como: Paginable<Lead>.
 */
export interface Paginable<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: T[];
}

/**
 * Contiene los metadatos de los elementos comunes obtenidos como "detailed".
 */
export interface Metadata {
  created_at: string;
  updated_at: string;
  active: boolean;
  created_by: number;
}

/**
 * Contienen los parámetros permitidos de cada request.
 */
export interface ListParams {
    only_active?: boolean,
    detailed?: boolean,
    page?: number,
    page_size?: number
}