/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';
export const GET_APIKEY = 'GET_APIKEY';
export const SET_STATUS = 'SET_STATUS';
export const GET_BALANCE = 'GET_BALANCE';
export const GET_BALANCES = 'GET_BALANCES';
export const GET_TRADES = 'GET_TRADES';
export const SELL_COIN = 'SELL_COIN';
export const BUY_COIN = 'BUY_COIN';

/*
 * action creators
 */

export function storeApiKey(event, payload) {
  console.log('Actions: storeApiKey -> key', payload);
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

export function getBalances(event, payload) {
  console.log('Actions->getBalances: status -> status', payload);
  return { type: GET_BALANCES, payload };
}

export function getTrades(event, payload) {
  console.log('Actions->getTrades: status -> status', payload);
  return { type: GET_TRADES, payload };
}

export function buyCoin(event, payload) {
  console.log('Actions->buyCoin: status -> status', payload);
  return { type: BUY_COIN, payload };
}

export function sellCoin(event, payload) {
  console.log('Actions->sellCoin: status -> status', payload);
  return { type: SELL_COIN, payload };
}
