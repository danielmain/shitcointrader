/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';
export const GET_APIKEY = 'GET_APIKEY';
export const SET_STATUS = 'SET_STATUS';
export const GET_BALANCE = 'GET_BALANCE';

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

export function getBalance(event, payload) {
  console.log('Actions->getBalance: status -> status', payload);
  return { type: GET_BALANCE, payload };
}
