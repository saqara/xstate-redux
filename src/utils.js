/**
 * @summary Returns `true` if two state are equals
 * @locus Anywhere
 * @export
 * @function isEqual
 * @param {Object|String} state
 * @param {Object|String} nextState
 * @return {Boolean}
 */
export const isEqual = (state, nextState) => {
  if (!state || !nextState || typeof state !== 'object' || typeof nextState !== 'object') {
    return state === nextState
  }
  const nextStateKeys = Object.keys(nextState)
  const stateKeys = Object.keys(state)

  if (
    nextStateKeys.length !== stateKeys.length ||
    nextStateKeys.filter(key => !stateKeys.includes(key)).length > 0
  ) {
    return false
  }
  return nextStateKeys.every(key => isEqual(state[key], nextState[key]))
}
