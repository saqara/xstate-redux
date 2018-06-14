/**
 * @summary Returns `state.xstate`
 * @locus Anywhere
 * @export
 * @function getState
 * @param {Object} state
 * @return {Object}
 */
export const getState = (state) => state.xstate

/**
 * @summary Returns true if reduxState is in `state`
 * @locus Anywhere
 * @export
 * @function isInState
 * @param {Object|String} reduxState
 * @param {String} [state=''] a dot object string
 * @return {Boolean}
 */
export const isInState = (reduxState, state = '') => {
  if (!reduxState) return false
  if (!state) return true
  if (typeof reduxState === 'string') return reduxState === state

  const [key, ...keys] = state.split('.')
  return isInState(reduxState[key], keys.join('.'))
}

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
