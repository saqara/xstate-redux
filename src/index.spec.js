import { applyMiddleware, combineReducers, createStore } from 'redux'
import { Machine } from 'xstate'

import XstateRedux from './xstate_redux'

describe('Integration with redux', () => {
  const action = { type: 'TIMER' }
  const machine = Machine({
    initial: 'green',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'green' } }
    }
  })
  const nextMachine = Machine({
    initial: 'green',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'red' } },
      red: { on: { TIMER: 'green' } }
    }
  })
  const reduxMachine = new XstateRedux(machine)
  const store = createStore(
    combineReducers({ xstate: reduxMachine.createReducer() }),
    applyMiddleware(reduxMachine.createMiddleware())
  )

  it('should have green initialState', () => {
    expect(store.getState()).toEqual({ xstate: 'green' })
  })

  it('should perform state transition from green to yellow', () => {
    store.dispatch(action)
    expect(store.getState()).toEqual({ xstate: 'yellow' })
  })

  it('should be possible to move from yellow to red after set machine', () => {
    expect(store.getState()).toEqual({ xstate: 'yellow' })
    reduxMachine.setMachine(nextMachine)
    store.dispatch(action)
    expect(store.getState()).toEqual({ xstate: 'red' })
  })
})
