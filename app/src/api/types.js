/**
 * Data shapes used across the app, documented with JSDoc so editors (VS Code)
 * still show types and autocomplete. Runtime validation of network data lives in
 * parseHome.js — these typedefs describe what it guarantees.
 */

/** @typedef {'protein-plus' | 'white' | 'brown'} CategoryId */
/** @typedef {'M' | 'L' | 'XL'} EggSize */

/**
 * @typedef {object} ImageVariant
 * @property {string} url    Absolute URL on the prototype CDN.
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {object} ProductImage
 * @property {string} blurhash      ~36-character placeholder shown while the photo loads.
 * @property {ImageVariant} thumb   ≤400 px — product cards and banners.
 * @property {ImageVariant} full    ≤800 px — product page.
 */

/**
 * @typedef {object} Product
 * @property {string} id
 * @property {string} name
 * @property {CategoryId} categoryId
 * @property {number} packSize
 * @property {EggSize} eggSize
 * @property {number} price
 * @property {number | null} mrp
 * @property {number} pricePerEgg
 * @property {number | null} earnCoins
 * @property {boolean} bestSeller
 * @property {ProductImage} image
 */

/**
 * @typedef {object} Banner
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {'wallet' | 'subscribe' | 'home'} action
 * @property {ProductImage | null} image   Product photo shown on the banner, if any.
 */

/**
 * @typedef {object} Category
 * @property {CategoryId} id
 * @property {string} name
 */

/**
 * @typedef {object} HomeSection
 * @property {string} id
 * @property {string} title
 * @property {Product[]} products
 */

/**
 * @typedef {object} HomeData
 * @property {number} coins
 * @property {number} walletBalance
 * @property {Banner[]} banners
 * @property {Category[]} categories
 * @property {HomeSection[]} sections
 * @property {Record<string, Product>} productsById
 * @property {string} observedOn   Date the content was captured from the real app (YYYY-MM-DD).
 * @property {number} fetchedAt
 */

/**
 * @typedef {object} Address
 * @property {string} label    Short line shown in the header chip, e.g. "Sector 29, Gurugram".
 * @property {string} city
 * @property {string} pincode
 * @property {'gps' | 'pincode'} source
 */

/**
 * @typedef {{ serviceable: true, address: Address } | { serviceable: false, pincode: string | null, place: string }} Serviceability
 */

export {};
