/**
 * BrandPrintSSO
 * Modern JavaScript module for Brand Print SSO integration using Web Crypto API.
 */
/**
 * @typedef {Object} BrandPrintSSOPayload
 * @property {string} [request_time] - Date and time (ISO 8601). Standard validity is 500s.
 * @property {string} customer_user_name - 50 characters (A-Z0-9_-.@). Unique identifier like UserId or Email. (MANDATORY)
 * @property {number} [customer_user_budgetgruppe__id] - ID of the user group.
 * @property {string} [group_customer_number] - Match user group by customer number.
 * @property {string} [group_name] - Name of the user group (created if missing if enabled).
 * @property {string} [customer_longname] - User's full name.
 * @property {string} [customer_firstname] - User's first name.
 * @property {string} [customer_lastname] - User's last name.
 * @property {string} [customer_user_businessunit] - Business unit.
 * @property {string} [customer_user_purchaser] - Purchaser name.
 * @property {string} [customer_user_company1] - Company line 1.
 * @property {string} [customer_user_company2] - Company line 2.
 * @property {string} [customer_user_company3] - Company line 3.
 * @property {string} [customer_user_street] - Street address.
 * @property {string} [customer_user_zip] - ZIP code.
 * @property {string} [customer_user_town] - City/Town.
 * @property {string} [customer_user_countrycode] - Country code (ISO 3166).
 * @property {string} [customer_user_costcenter] - Cost center.
 * @property {string} [customer_user_telefon] - Phone number.
 * @property {string} [customer_user_telefax] - Fax number.
 * @property {string} [customer_user_email] - Email address.
 * @property {string} [user_groups_binary_url] - URL for user group logo.
 * @property {string} [user_groups_binary_description] - Description for user group logo.
 * @property {string} [customer_user_internet] - Website URL.
 * @property {string} [customer_user_mobil] - Mobile number.
 * @property {string} [customer_user_kundennummer] - Customer number.
 * @property {57|58|59|60} [customer_user_level] - 57: User, 58: Supervisor, 59: Admin, 60: Interested party.
 * @property {53|54} [freigabeportal_zeigen] - 53: Yes, 54: No.
 * @property {string} [customer_user_aussendienst] - Field service info.
 * @property {string} [customer_funktion] - User function/role.
 * @property {'de'|'en'} [sprache] - Language (de: German, en: English).
 * @property {string} [customfield1] - Custom field 1.
 * @property {string} [customfield2] - Custom field 2.
 * @property {string} [customfield3] - Custom field 3.
 * @property {string} [customfield4] - Custom field 4.
 * @property {string} [customfield5] - Custom field 5.
 * @property {0|1|2} [delivery_address_editable] - 0: Yes, 1: No (w/o Email), 2: No.
 * @property {'wg'|'pers'|'article_detail'|'reorder'} [dest_page] - Destination page type.
 * @property {string|number} [dest_id] - ID of the destination entry.
 * @property {number} [quantity] - Product quantity.
 * @property {53|54} [skip_cart] - 53: Yes, 54: No.
 * @property {0|1|2} [continue_shopping] - 0: Deactivate, 1: Activate, 2: SSO transfer point.
 * @property {string} [pers_data] - Personalization data.
 * @property {boolean} [test] - Set to true for test mode (shows debug output).
 * @property {string} [lang] - Language ID (e.g., de_DE or en_EN).
 * @property {string} [dynamic_lists] - JSON string for dynamic list entries.
 * @property {Object} [view_settings] - UI visibility settings (cookie_notice, header, etc.).
 * @property {string} [email_address_for_cost_release] - Email for cost release.
 * @property {string} [external_order_number] - External reference number.
 * @property {string} [return_url] - URL for the "back" button on finish page.
 * @property {Object} [settings] - General user settings key-value pairs.
 * @property {string} [redirect_url] - URL to redirect to after successful login.
 */

export class BrandPrintSSO {
  #shopUrl;
  #secretKey;
  #algorithm;
  /** @type {BrandPrintSSOPayload} */
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
   * @param {Partial<BrandPrintSSOPayload>} data 
   */
  setPayload(data) {
    this.#payload = { ...this.#payload, ...data };
    return this;
  }

  /**
   * Set a single payload parameter.
   * @template {keyof BrandPrintSSOPayload} K
   * @param {K} key 
   * @param {BrandPrintSSOPayload[K]} value 
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
