import { isEqual } from './utils'
import {
  setMachineStateAction,
  XSTATE_RESET_MACHINE_STATE,
  XSTATE_SET_MACHINE_STATE
} from './action'

/**
 * @summary Returns `state.xstate`
 * @locus Anywhere
 * @export
 * @function getState
 * @param {Object} state
 * @return {Object}
 */
export const defaultGetState = state => state.xstate

/**
 * @class
 * @export
 */
export default class XstateRedux {
  /**
   * @constructor
   * @param {Machine} machine
   */
  constructor (machine) {
    if (!machine) {
      throw new TypeError('XstateRedux::constructor `machine` must be xstate machine.')
    }
    this._machine = machine
  }

  /**
   * @summary Create redux middleware for `xstate`
   * @locus Anywhere
   * @instance
   * @memberof XstateRedux
   * @method createMiddleware
   * @param {Object} options
   * @param {Function} [getState=defaultGetState]
   * @return {Function}
   */
  createMiddleware ({ getState = defaultGetState } = {}) {
    return store => next => action => {
      const reduxState = store.getState()
      const machineState = getState(reduxState)
      const result = next(action)

      if (action.type === XSTATE_SET_MACHINE_STATE) return result

      const nextMachineState = this._machine.transition(
        machineState,
        action,
        reduxState
      ) || {}
      if (nextMachineState.value &&
        !isEqual(machineState, nextMachineState.value)) {
        store.dispatch(setMachineStateAction(nextMachineState.value))
      }
      if (nextMachineState.actions && Array.isArray(nextMachineState.actions)) {
        nextMachineState.actions.forEach((actionType) => {
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

  /**
   * @summary Creates redux reducer for `xstate`
   * @locus Anywhere
   * @instance
   * @memberof XstateRedux
   * @method createReducer
   * @param {Machine} machine
   * @return {Function}
   */
  createReducer () {
    return (state = this._machine.initialState.value, action = {}) => {
      if (action.type === XSTATE_RESET_MACHINE_STATE) {
        return this._machine.initialState.value
      } else if (action.type === XSTATE_SET_MACHINE_STATE && action.payload) {
        return action.payload
      }
      return state
    }
  }

  /**
   * @summary Sets machine
   * @locus Anywhere
   * @instance
   * @memberof XstateRedux
   * @method setMachine
   * @param {Machine} machine
   */
  setMachine (machine) {
    if (!machine) {
      throw new TypeError('XstateRedux::setMachine `machine` must be xstate machine.')
    }
    this._machine = machine
  }
}
