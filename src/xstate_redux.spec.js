import { Machine } from 'xstate'

import XstateRedux from './xstate_redux'
import { resetMachineStateAction, setMachineStateAction } from './action'

describe('XstateRedux', () => {
  const machine = Machine({
    initial: 'green',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'green' } }
    }
  })
  const nextMachine = Machine({
    initial: 'blue',
    states: {
      blue: { on: { TIMER: 'green' } },
      green: { on: { TIMER: 'blue' } }
    }
  })
  const reduxMachine = new XstateRedux(machine)

  it('should not create instance without machine', () => {
    const create = () => new XstateRedux()
    expect(create).toThrow()
  })

  describe('createMiddleware', () => {
    const action = { type: 'TIMER' }
    const dispatch = jest.fn()
    const getState = jest.fn()
    const store = { dispatch, getState }
    const yellowAction = setMachineStateAction('yellow')

    describe('without option', () => {
      const middleware = reduxMachine.createMiddleware()

      it('should dispatch action and perform transition', () => {
        getState.mockReturnValue({ xstate: machine.initialState.value })
        middleware(store)(dispatch)(action)
        expect(dispatch.mock.calls.length).toBe(2)
        expect(dispatch.mock.calls[0][0]).toEqual(action)
        expect(dispatch.mock.calls[1][0]).toEqual(yellowAction)
        dispatch.mockClear()
      })

      it('should not perform transition on setMachineState action', () => {
        middleware(store)(dispatch)(yellowAction)
        expect(dispatch.mock.calls.length).toBe(1)
        expect(dispatch.mock.calls[0][0]).toEqual(yellowAction)
        dispatch.mockClear()
      })
    })

    describe('with custom getState option', () => {
      const middleware = reduxMachine.createMiddleware({
        getState: state => state.customReducerName
      })

      it('should dispatch action and perform transition', () => {
        getState.mockReturnValue({
          customReducerName: machine.initialState.value
        })
        middleware(store)(dispatch)(action)
        expect(dispatch.mock.calls.length).toBe(2)
        expect(dispatch.mock.calls[0][0]).toEqual(action)
        expect(dispatch.mock.calls[1][0]).toEqual(yellowAction)
        dispatch.mockClear()
      })

      it('should not perform transition on setMachineState action', () => {
        middleware(store)(dispatch)(yellowAction)
        expect(dispatch.mock.calls.length).toBe(1)
        expect(dispatch.mock.calls[0][0]).toEqual(yellowAction)
        dispatch.mockClear()
      })
    })

    describe('set machine', () => {
      const middleware = reduxMachine.createMiddleware()

      it('should dispatch yellow before set and blue after', () => {
        getState.mockReturnValue({ xstate: machine.initialState.value })
        middleware(store)(dispatch)(action)
        expect(dispatch.mock.calls.length).toBe(2)
        expect(dispatch.mock.calls[0][0]).toEqual(action)
        expect(dispatch.mock.calls[1][0]).toEqual(yellowAction)
        dispatch.mockClear()
        reduxMachine.setMachine(nextMachine)
        middleware(store)(dispatch)(action)
        expect(dispatch.mock.calls.length).toBe(2)
        expect(dispatch.mock.calls[0][0]).toEqual(action)
        expect(dispatch.mock.calls[1][0]).toEqual(setMachineStateAction('blue'))
        dispatch.mockClear()
        reduxMachine.setMachine(machine)
      })
    })
  })

  describe('createReducer', () => {
    const machineReducer = reduxMachine.createReducer()

    it('should return initial state', () => {
      expect(machineReducer()).toEqual('green')
    })

    it('should return yellow state', () => {
      expect(
        machineReducer('green', setMachineStateAction('yellow'))
      ).toEqual('yellow')
    })

    it('should reset machine state green', () => {
      expect(
        machineReducer('yellow', resetMachineStateAction())
      ).toEqual('green')
    })

    it('should not set state for unknown action', () => {
      expect(machineReducer('green', { type: 'UNKNOWN' })).toEqual('green')
    })

    describe('set machine', () => {
      it('should return green initial state before and blue after', () => {
        expect(machineReducer()).toEqual('green')
        reduxMachine.setMachine(nextMachine)
        expect(machineReducer()).toEqual('blue')
      })

      it('should reset machine state to blue', () => {
        expect(
          machineReducer('green', resetMachineStateAction())
        ).toEqual('blue')
      })
    })
  })
})
