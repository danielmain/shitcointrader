/*
 * action types
 */

export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'

/*
 * action creators
 */

export function increment(text) {
  console.log('Calling increment');
  return { type: INCREMENT, text }
}

export function decrement(index) {
  return { type: DECREMENT, index }
}
