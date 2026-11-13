/**
 * Validates the CDN's /v1/home.json at the network boundary, so the rest of the
 * app only ever sees well-formed, typed data.
 */

export class InvalidResponseError extends Error {}

const fail = (path) => {
  throw new InvalidResponseError(`home.json: invalid ${path}`);
};
const obj = (v, path) => (typeof v === 'object' && v !== null && !Array.isArray(v) ? v : fail(path));
const arr = (v, path) => (Array.isArray(v) ? v : fail(path));
const str = (o, k, path) => (typeof o[k] === 'string' ? o[k] : fail(`${path}.${k}`));
const num = (o, k, path) => (typeof o[k] === 'number' && Number.isFinite(o[k]) ? o[k] : fail(`${path}.${k}`));
const numOrNull = (o, k, path) => (o[k] == null ? null : num(o, k, path));
const oneOf = (v, allowed, path) => (allowed.includes(v) ? v : fail(path));

const CATEGORY_IDS = ['protein-plus', 'white', 'brown'];
const EGG_SIZES = ['M', 'L', 'XL'];
const ACTIONS = ['wallet', 'subscribe', 'home'];

function variant(v, base, path) {
  const o = obj(v, path);
  return { url: `${base}${str(o, 'url', path)}`, width: num(o, 'width', path), height: num(o, 'height', path) };
}

function image(v, base, path) {
  const o = obj(v, path);
  return {
    blurhash: str(o, 'blurhash', path),
    thumb: variant(o.thumb, base, `${path}.thumb`),
    full: variant(o.full, base, `${path}.full`),
  };
}

function product(v, base, i) {
  const path = `products[${i}]`;
  const o = obj(v, path);
  return {
    id: str(o, 'id', path),
    name: str(o, 'name', path),
    categoryId: oneOf(str(o, 'categoryId', path), CATEGORY_IDS, `${path}.categoryId`),
    packSize: num(o, 'packSize', path),
    eggSize: oneOf(str(o, 'eggSize', path), EGG_SIZES, `${path}.eggSize`),
    price: num(o, 'price', path),
    mrp: numOrNull(o, 'mrp', path),
    pricePerEgg: num(o, 'pricePerEgg', path),
    earnCoins: numOrNull(o, 'earnCoins', path),
    bestSeller: o.bestSeller === true,
    image: image(o.image, base, `${path}.image`),
  };
}

export function parseHome(raw, base) {
  const root = obj(raw, 'root');
  const products = arr(root.products, 'products').map((p, i) => product(p, base, i));
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));

  const banners = arr(root.banners, 'banners').map((v, i) => {
    const o = obj(v, `banners[${i}]`);
    const productId = typeof o.productId === 'string' ? o.productId : null;
    return {
      id: str(o, 'id', `banners[${i}]`),
      title: str(o, 'title', `banners[${i}]`),
      subtitle: str(o, 'subtitle', `banners[${i}]`),
      action: oneOf(str(o, 'action', `banners[${i}]`), ACTIONS, `banners[${i}].action`),
      image: productId ? (productsById[productId]?.image ?? null) : null,
    };
  });

  const categories = arr(root.categories, 'categories').map((v, i) => {
    const o = obj(v, `categories[${i}]`);
    return {
      id: oneOf(str(o, 'id', `categories[${i}]`), CATEGORY_IDS, `categories[${i}].id`),
      name: str(o, 'name', `categories[${i}]`),
    };
  });

  const sections = arr(root.sections, 'sections')
    .map((v, i) => {
      const o = obj(v, `sections[${i}]`);
      const ids = arr(o.productIds, `sections[${i}].productIds`).filter((id) => typeof id === 'string');
      return {
        id: str(o, 'id', `sections[${i}]`),
        title: str(o, 'title', `sections[${i}]`),
        products: ids.map((id) => productsById[id]).filter((p) => p !== undefined),
      };
    })
    .filter((s) => s.products.length > 0);

  return {
    coins: num(root, 'coins', 'root'),
    walletBalance: num(root, 'walletBalance', 'root'),
    banners,
    categories,
    sections,
    productsById,
    observedOn: typeof root.observedOn === 'string' ? root.observedOn : '',
    fetchedAt: Date.now(),
  };
}
