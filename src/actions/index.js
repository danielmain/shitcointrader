/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';
export const GET_APIKEY = 'GET_APIKEY';
export const SET_STATUS = 'SET_STATUS';
export const GET_BALANCE = 'GET_BALANCE';
export const GET_TRADES = 'GET_TRADES';
export const BUY_COIN = 'BUY_COIN';

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

export function getTrades(event, payload) {
  console.log('Actions->getTrades: status -> status', payload);
  return { type: GET_TRADES, payload };
}

export function buyCoin(event, payload) {
  console.log('Actions->buyCoin: status -> status', payload);
  return { type: BUY_COIN, payload };
}
