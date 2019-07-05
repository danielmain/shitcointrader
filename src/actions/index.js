/*
 * action types
 */

export const STORE_APIKEY = 'STORE_APIKEY';
export const GET_APIKEY = 'GET_APIKEY';

/*
 * action creators
 */

export function storeApiKey(event, keys) {
  console.log('reducers=> keys => keys', keys);
  return { type: STORE_APIKEY, keys }
}

export function getApiKey() {
  return { type: GET_APIKEY }
}


// function pongActionCreator (event, arg1, arg2, arg3) {
//   return {
//     type: 'IPC_PONG',
//     arg1,
//     arg2,
//     arg3
//   };
// }