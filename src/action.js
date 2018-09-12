export const XSTATE_RESET_MACHINE_STATE = 'XSTATE/RESET_MACHINE_STATE'
export const XSTATE_SET_MACHINE_STATE = 'XSTATE/SET_MACHINE_STATE'

export const resetMachineStateAction = () => ({
  type: XSTATE_RESET_MACHINE_STATE
})

export const setMachineStateAction = newState => ({
  payload: newState,
  type: XSTATE_SET_MACHINE_STATE
})
