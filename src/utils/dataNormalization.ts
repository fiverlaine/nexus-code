/**
 * Utilitário para normalização e hash de dados para Advanced Matching do Meta Pixel
 * 
 * Este módulo fornece funções para normalizar e aplicar hash SHA256 em dados
 * que serão enviados como Advanced Matching Parameters para o Meta Pixel.
 * 
 * @module dataNormalization
 */

/**
 * Normaliza uma cidade removendo espaços extras e convertendo para minúsculas
 * 
 * @param {string} city - Cidade a ser normalizada
 * @returns {string} Cidade normalizada ou string vazia se inválida
 */
export function normalizeCity(city: string): string {
  if (!city || typeof city !== 'string') return '';
  return city.trim().toLowerCase();
}

/**
 * Normaliza um estado removendo espaços extras e convertendo para minúsculas
 * 
 * @param {string} state - Estado a ser normalizado
 * @returns {string} Estado normalizado ou string vazia se inválido
 */
export function normalizeState(state: string): string {
  if (!state || typeof state !== 'string') return '';
  return state.trim().toLowerCase();
}

/**
 * Normaliza um país removendo espaços extras e convertendo para minúsculas
 * 
 * @param {string} country - País a ser normalizado
 * @returns {string} País normalizado ou string vazia se inválido
 */
export function normalizeCountry(country: string): string {
  if (!country || typeof country !== 'string') return '';
  return country.trim().toLowerCase();
}

/**
 * Aplica hash SHA256 em uma string
 * 
 * @param {string} data - Dados a serem hasheados
 * @returns {Promise<string>} Hash SHA256 em hexadecimal (minúsculas) ou string vazia se erro
 * 
 * @example
 * await hashSHA256('user@example.com') // '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b'
 */
export async function hashSHA256(data: string): Promise<string> {
  if (!data || typeof data !== 'string') return '';
  
  try {
    // Usar Web Crypto API (disponível em navegadores modernos)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Erro ao aplicar hash SHA256:', error);
    return '';
  }
}

/**
 * Normaliza e aplica hash SHA256 em uma cidade
 * 
 * @param {string} city - Cidade a ser processada
 * @returns {Promise<string>} Hash SHA256 da cidade normalizada
 */
export async function hashCity(city: string): Promise<string> {
  const normalized = normalizeCity(city);
  if (!normalized) return '';
  return await hashSHA256(normalized);
}

/**
 * Normaliza e aplica hash SHA256 em um estado
 * 
 * @param {string} state - Estado a ser processado
 * @returns {Promise<string>} Hash SHA256 do estado normalizado
 */
export async function hashState(state: string): Promise<string> {
  const normalized = normalizeState(state);
  if (!normalized) return '';
  return await hashSHA256(normalized);
}

/**
 * Normaliza e aplica hash SHA256 em um país
 * 
 * @param {string} country - País a ser processado
 * @returns {Promise<string>} Hash SHA256 do país normalizado
 */
export async function hashCountry(country: string): Promise<string> {
  const normalized = normalizeCountry(country);
  if (!normalized) return '';
  return await hashSHA256(normalized);
}

