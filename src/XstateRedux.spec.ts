import { Machine, StateValue } from 'xstate';

import { XstateRedux } from './XstateRedux';
import { resetMachineStateAction, setMachineStateAction } from './action';

describe('XstateRedux', () => {
  const machine = Machine({
    initial: 'green',
    states: {
      green: { on: { TIMER: 'yellow' } },
      yellow: { on: { TIMER: 'green' } }
    }
  });

  const nextMachine = Machine({
    initial: 'blue',
    states: {
      blue: { on: { TIMER: 'green' } },
      green: { on: { TIMER: 'blue' } }
    }
  });

  const reduxMachine = new XstateRedux(machine);

  describe('createMiddleware', () => {
    const action = { type: 'TIMER' };
    const dispatch = jest.fn();
    const getState = jest.fn();
    const store = { dispatch, getState };
    const yellowAction = setMachineStateAction('yellow');

    describe('without option', () => {
      const middleware = reduxMachine.createMiddleware();

      it('should dispatch action and perform transition', () => {
        getState.mockReturnValue({ xstate: machine.initialState.value });

        middleware(store)(dispatch)(action);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toEqual(action);
        expect(dispatch.mock.calls[1][0]).toEqual(yellowAction);

        dispatch.mockClear();
      });

      it('should not perform transition on setMachineState action', () => {
        middleware(store)(dispatch)(yellowAction);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toEqual(yellowAction);

        dispatch.mockClear();
      });

      it('should not dispatch set state for equal state', () => {
        const unknownAction = { type: 'UNKNOWN' };

        middleware(store)(dispatch)(unknownAction);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toEqual(unknownAction);

        dispatch.mockClear();
      });
    });

    describe('with custom getState option', () => {
      const customGetState = (
        state: { customReducerName: StateValue }
      ): StateValue => state.customReducerName;
      const middleware = reduxMachine.createMiddleware({
        getState: customGetState
      });

      it('should dispatch action and perform transition', () => {
        getState.mockReturnValue({
          customReducerName: machine.initialState.value
        });

        middleware(store)(dispatch)(action);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toEqual(action);
        expect(dispatch.mock.calls[1][0]).toEqual(yellowAction);

        dispatch.mockClear();
      });

      it('should not perform transition on setMachineState action', () => {
        middleware(store)(dispatch)(yellowAction);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toEqual(yellowAction);

        dispatch.mockClear();
      });

      it('should not dispatch set state for equal state', () => {
        const unknownAction = { type: 'UNKNOWN' };

        middleware(store)(dispatch)(unknownAction);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toEqual(unknownAction);

        dispatch.mockClear();
      });
    });

    describe('set machine', () => {
      const middleware = reduxMachine.createMiddleware();

      it('should dispatch yellow before set and blue after', () => {
        getState.mockReturnValue({ xstate: machine.initialState.value });
        middleware(store)(dispatch)(action);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toEqual(action);
        expect(dispatch.mock.calls[1][0]).toEqual(yellowAction);

        dispatch.mockClear();
        reduxMachine.setMachine(nextMachine);
        middleware(store)(dispatch)(action);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toEqual(action);
        expect(dispatch.mock.calls[1][0])
          .toEqual(setMachineStateAction('blue'));

        dispatch.mockClear();
      });

      it('should not dispatch set state for equal state', () => {
        const unknownAction = { type: 'UNKNOWN' };

        middleware(store)(dispatch)(unknownAction);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toEqual(unknownAction);

        dispatch.mockClear();
        reduxMachine.setMachine(machine);
      });
    });

    describe('complex machine', () => {
      const magentaEnterAction = { type: 'MAGENTA_ENTER_ACTION' };
      const magentaExitAction = { type: 'MAGENTA_EXIT_ACTION' };
      const pinkEnterAction = { type: 'PINK_ENTER_ACTION' };
      const pinkExitAction = { type: 'PINK_EXIT_ACTION' };
      const complexMachine = new XstateRedux(Machine({
        initial: 'green',
        states: {
          green: {
            initial: 'magenta',
            on: { TIMER: 'yellow' },
            states: {
              magenta: {
                on: { TIMER2: 'pink' },
                onEntry: magentaEnterAction,
                onExit: magentaExitAction
              },
              pink: {
                on: { TIMER2: 'magenta' },
                onEntry: pinkEnterAction,
                onExit: pinkExitAction
              }
            }
          },
          yellow: { on: { TIMER: 'green' } }
        }
      }));
      const middleware = complexMachine.createMiddleware();

      it('should not dispatch set state for equal state', () => {
        const unknownAction = { type: 'UNKNOWN' };
        getState.mockReturnValue({ xstate: { green: 'magenta' } });
        middleware(store)(dispatch)(unknownAction);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toEqual(unknownAction);

        dispatch.mockClear();
      });

      it('should dispatch onEnter pink and onExit magenta action', () => {
        middleware(store)(dispatch)({ type: 'TIMER2' });

        expect(dispatch.mock.calls.length).toBe(4);
        expect(dispatch.mock.calls[2][0]).toEqual(magentaExitAction);
        expect(dispatch.mock.calls[3][0]).toEqual(pinkEnterAction);

        dispatch.mockClear();
      });

      it('should dispatch onExit pink and onEnter magenta action', () => {
        getState.mockReturnValue({ xstate: { green: 'pink' } });
        middleware(store)(dispatch)({ type: 'TIMER2' });

        expect(dispatch.mock.calls.length).toBe(4);
        expect(dispatch.mock.calls[2][0]).toEqual(pinkExitAction);
        expect(dispatch.mock.calls[3][0]).toEqual(magentaEnterAction);

        dispatch.mockClear();
      });
    });
  });

  describe('createReducer', () => {
    const machineReducer = reduxMachine.createReducer();

    it('should return initial state', () => {
      expect(machineReducer(undefined, undefined)).toEqual('green');
    });

    it('should return yellow state', () => {
      expect(
        machineReducer('green', setMachineStateAction('yellow'))
      ).toEqual('yellow');
    });

    it('should reset machine state green', () => {
      expect(
        machineReducer('yellow', resetMachineStateAction())
      ).toEqual('green');
    });

    it('should not set state for unknown action', () => {
      expect(machineReducer('green', { type: 'UNKNOWN' })).toEqual('green');
    });

    describe('set machine', () => {
      it('should return green initial state before and blue after', () => {
        expect(machineReducer(undefined, undefined)).toEqual('green');

        reduxMachine.setMachine(nextMachine);

        expect(machineReducer(undefined, undefined)).toEqual('blue');
      });

      it('should reset machine state to blue', () => {
        expect(
          machineReducer('green', resetMachineStateAction())
        ).toEqual('blue');
      });
    });
  });
});
