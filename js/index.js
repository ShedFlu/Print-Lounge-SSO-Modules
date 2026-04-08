/**
 * BrandPrintSSO
 * Modern JavaScript module for Brand Print SSO integration using Web Crypto API.
 */
export class BrandPrintSSO {
  #shopUrl;
  #secretKey;
  #algorithm;
  #payload = {};

  /**
   * @param {string} shopUrl - The base URL of the shop (e.g., 'https://shopname.print-server.net')
   * @param {string} secretKey - The shared secret key for AES encryption
   * @param {string} [algorithm='AES-CBC'] - The encryption algorithm (default: AES-CBC)
   */
  constructor(shopUrl, secretKey, algorithm = 'AES-CBC') {
    if (!shopUrl || !secretKey) {
      throw new Error('shopUrl and secretKey are required');
    }
    this.#shopUrl = shopUrl.replace(/\/$/, '');
    this.#secretKey = secretKey;
    this.#algorithm = algorithm;
  }

  /**
   * Set multiple payload parameters at once.
   * @param {Object} data 
   */
  setPayload(data) {
    this.#payload = { ...this.#payload, ...data };
    return this;
  }

  /**
   * Set a single payload parameter.
   * @param {string} key 
   * @param {any} value 
   */
  setParam(key, value) {
    this.#payload[key] = value;
    return this;
  }

  /**
   * Validates mandatory fields and prepares the payload.
   * @private
   */
  #preparePayload() {
    const data = { ...this.#payload };

    if (!data.request_time) {
      data.request_time = new Date().toISOString();
    }

    if (!data.customer_user_name) {
      throw new Error('Mandatory field "customer_user_name" is missing');
    }

    // Convert all values to strings and format as query string
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  /**
   * Generates the encrypted "h" parameter.
   * @returns {Promise<string>}
   */
  async #encrypt() {
    const queryString = this.#preparePayload();
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(queryString);
    
    // Hash the secret key to ensure correct length for AES (128, 192, 256)
    const keyData = encoder.encode(this.#secretKey);
    const hash = await globalThis.crypto.subtle.digest('SHA-256', keyData);
    
    // Use the first 32 bytes for AES-256, 24 for AES-192, 16 for AES-128
    // For simplicity, we'll use AES-256 if the key hash is 32 bytes.
    const key = await globalThis.crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    const iv = globalThis.crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await globalThis.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      dataBytes
    );

    // Combine IV + Encrypted Data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Return as Base64 (using btoa for compatibility, or Buffer in Node if needed)
    // For universal modern JS, we use a simple base64 conversion
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Generates the full SSO login URL.
   * @returns {Promise<string>}
   */
  async generateUrl() {
    const h = await this.#encrypt();
    return `${this.#shopUrl}/sso.php?h=${encodeURIComponent(h)}`;
  }

  /**
   * Generates an HTML IFrame string for the SSO login.
   * @param {Object} attributes - HTML attributes for the iframe (e.g., width, height)
   * @returns {Promise<string>}
   */
  async generateIframe(attributes = {}) {
    const url = await this.generateUrl();
    const attrs = Object.entries({
      width: '100%',
      height: '600px',
      frameborder: '0',
      ...attributes
    })
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `<iframe src="${url}" ${attrs}></iframe>`;
  }
}
