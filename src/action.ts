import { StateValue } from 'xstate';

export const XSTATE_RESET_MACHINE_STATE = 'XSTATE/RESET_MACHINE_STATE';
export const XSTATE_SET_MACHINE_STATE = 'XSTATE/SET_MACHINE_STATE';

export interface Action<P = any> {
  payload?: P;
  type: string;
}

export const resetMachineStateAction = (): Action<undefined> => ({
  type: XSTATE_RESET_MACHINE_STATE
});

export const setMachineStateAction =
  (newState: StateValue): Action<StateValue> => ({
    payload: newState,
    type: XSTATE_SET_MACHINE_STATE
  });
