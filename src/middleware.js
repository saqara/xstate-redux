import { getState as defaultGetState } from './utils'

/**
 * @summary Create redux middleware for `xstate`
 * @locus Anywhere
 * @function
 * @param {Machine} machine
 * @param {Object} options
 * @param {Function} [getState=defaultGetState]
 * @return {Function}
 */
export default function createReduxXstateMiddleware (machine, { getState = defaultGetState } = {}) {
  return (store) =>
    (next) =>
      (action) => {
        const reduxState = store.getState()
        const xstate = getState(reduxState)
        const nextMachine = machine.transition(xstate, action, reduxState)

        const result = next(action)
        if (nextMachine && nextMachine.actions && Array.isArray(nextMachine.actions)) {
          nextMachine.actions.forEach((actionType) => {
            const typeOf = typeof actionType
            if (typeOf === 'string') {
              store.dispatch({ type: actionType })
            } else if (typeOf === 'object' && typeof actionType.type === 'string') {
              store.dispatch(actionType)
            } else {
              throw new TypeError(
                'Action must be a `string` or an `object` with a property `type`.'
              )
            }
          })
        }
        return result
      }
}
