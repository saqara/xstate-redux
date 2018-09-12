# Xstate Redux

Redux middleware/reducer to use xstate with redux

## Installation
[NPM](https://www.npmjs.com/):
```
$ npm install --save xstate-redux
```

[Yarn](https://yarnpkg.com/lang/en/):
```
yarn add xstate-redux
```

## Import
In ES6:
```js
import {
  resetMachineStateAction,
  setMachineStateAction,
  XSTATE_RESET_MACHINE_STATE,
  XSTATE_SET_MACHINE_STATE,
  XstateRedux
} from 'redux-hmr-registry'
```

## Use with redux
__Create store__:
```js
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { Machine } from 'xstate'
import { XstateRedux } from 'xstate-redux'

const machine = Machine({
  initial: 'green',
  states: {
    green: { on: { TIMER: 'yellow' } },
    yellow: { on: { TIMER: 'green' } }
  }
})
const reduxMachine = new XstateRedux(machine)

const reducers = {
  xstate: reduxMachine.createReducer()
}
const middlewares = [reduxMachine.createMiddleware()]

const store = createStore(
  combineLazyReducers(reducers),
  applyMiddleware(...middlewares)
)
```

__Make a transition with `dispatch`__:
```js
console.log(store.getState())
// Initial state => { xstate: 'green' }

store.dispatch({ type: 'TIMER' })

console.log(store.getState())
// State after transition => { xstate: 'yellow' }
```

__Code splitting__:
For code splitting, we need to create a new machine.
```js
import('./red_state')
  .then(({ red }) => { // red = { on: { TIMER: 'green' } }
    // Create new xstate machine that can perform a transition from yellow to red state
    const nextMachine = Machine({
      initial: 'green',
      states: {
        green: { on: { TIMER: 'yellow' } },
        yellow: { on: { TIMER: 'red' } },
        red
      }
    })

    console.log(store.getState())
    // State before transition => { xstate: 'yellow' }

    reduxMachine.setMachine(nextMachine)
    store.dispatch({ type: 'TIMER' })

    console.log(store.getState())
    // State after transition => { xstate: 'red' }
  })
```

## API
#### `resetMachineStateAction` (Function)
Returns reset machine state action

#### `combineLazyReducers` (Function)
Returns set machine state action

__Arguments__:
  - `newState` (Object): new current machine state

#### `XSTATE_RESET_MACHINE_STATE` (String)
reset machine state action type

#### `XSTATE_SET_MACHINE_STATE` (String)
set machine state action type


#### `XstateRedux` (ES6 Class)
Enable code splitting for redux middlewares

__Constructor__:
  - [`machine`] (Machine): xstate machine

__Methods__:
  - __createMiddleware(options)__: returns redux middleware
    - [`options={}`] (Object):
      - [`getState=defaultGetState`] (Function): use to retreive machine state in redux store (usefull if you don't want to call your reducer `xstate`). This function received `store.getState()` as first argument and must return current machine state.
  - __createReducer()__: returns redux reducer
  - __setMachine(machine)__: set current machine
    - `machine` (Machine): xstate machine
