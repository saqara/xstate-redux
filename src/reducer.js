import { isEqual } from './utils'

/**
 * @summary Creates redux reducer for `xstate`
 * @locus Anywhere
 * @function
 * @param {Machine} machine
 * @return {Function}
 */
export default function createReduxXstateReducer (machine) {
  return (state = machine.initialState.value, action) => {
    const nextState = machine.transition(state, action)
    if (nextState && !isEqual(state, nextState.value)) return nextState.value
    return state
  }
}
