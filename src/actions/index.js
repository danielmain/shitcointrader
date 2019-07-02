/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';


/*
 * action creators
 */

export function storeApiKey(key) {
  return { type: STORE_APIKEY, key }
}