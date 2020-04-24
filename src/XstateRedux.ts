import { Middleware, Reducer, Dispatch, AnyAction } from 'redux';
import { StateMachine, StateValueMap, State } from 'xstate';

import {
  Action,
  XSTATE_RESET_MACHINE_STATE,
  XSTATE_SET_MACHINE_STATE,
  setMachineStateAction
} from './action';
import { isEqual } from './utils';

type StateValue = string | StateValueMap | State<unknown>;

interface DefaultState {
  xstate: StateValue;
}

export function defaultGetState(state: DefaultState): DefaultState['xstate'] {
  return state.xstate;
}


export class XstateRedux {
  constructor (private machine: StateMachine<unknown, unknown, any>) {}

  /**
   * Create redux middleware
   * Listen all actions dispatched to the store and update the state machine
   * if it's possible
   */
  createMiddleware({
    getState = defaultGetState
  }: {
    getState?: (state: any) => StateValue } = {}
  ): Middleware {
    return (store) => (next) => (action): ReturnType<Dispatch<AnyAction>> => {
      const reduxState = store.getState();
      const machineState = getState(reduxState);
      const result = next(action);

      if (action.type === XSTATE_SET_MACHINE_STATE) {
        return result;
      }

      const nextMachineState: State<unknown> | null = this.machine.transition(
        machineState,
        action,
        reduxState
      ) || null;

      if (
        nextMachineState &&
        nextMachineState.value &&
        !isEqual(machineState, nextMachineState.value)
      ) {
        store.dispatch(setMachineStateAction(nextMachineState.value));
      }

      if (
        nextMachineState &&
        nextMachineState.actions &&
        Array.isArray(nextMachineState.actions)
      ) {
        nextMachineState.actions.forEach((actionType) => {
          const typeOf = typeof actionType;
          if (typeOf === 'string') {
            store.dispatch({ type: actionType });
          } else if (
            typeOf === 'object' &&
            typeof actionType.type === 'string'
          ) {
            store.dispatch(actionType);
          } else {
            throw new TypeError(
              'Action must be a `string` or an `object` with a property `type`.'
            );
          }
        });
      }

      return result;
    };
  }

  /**
   * Create `xstate-redux` reducer
   * It uses to store fsm state
   */
  createReducer(): Reducer<
    StateValue | undefined,
    Action<StateValue> | undefined
  > {
    return (
      state = this.machine.initialState.value,
      action?: Action<StateValue | undefined>
    ): StateValue => {
      if (action && action.type === XSTATE_RESET_MACHINE_STATE) {
        return this.machine.initialState.value;
      } else if (
        action &&
        action.type === XSTATE_SET_MACHINE_STATE &&
        action.payload
      ) {
        return action.payload;
      }

      return state;
    };
  }

  /**
   * Set fsm
   */
  setMachine(machine: StateMachine<unknown, unknown, any>): void {
    this.machine = machine;
  }
}
