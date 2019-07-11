/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';
export const GET_APIKEY = 'GET_APIKEY';
export const SET_STATUS = 'SET_STATUS';

/*
 * action creators
 */

export function storeApiKey(event, payload) {
  console.log('Actions: storeApiKey -> keys', payload);
  return { type: STORE_APIKEY, payload };
}

export function getApiKey(event, payload) {
  return { type: GET_APIKEY, payload };
}

export function setStatus(event, payload) {
  console.log('Actions: status -> status', payload);
  return { type: SET_STATUS, payload };
}
