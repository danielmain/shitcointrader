/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';
export const GET_APIKEY = 'GET_APIKEY';

/*
 * action creators
 */

export function storeApiKey(keys) {
  return { type: STORE_APIKEY, keys }
}

export function getApiKey() {
  return { type: GET_APIKEY }
}
