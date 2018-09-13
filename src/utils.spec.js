import { isEqual } from './utils'

describe('Utils', () => {
  describe('isEqual', () => {
    const expectEqual = (state1, state2, toBe) =>
      expect(isEqual(state1, state2)).toBe(toBe)
    describe('string states', () => {
      it('should be equal', () => {
        expectEqual('green', 'green', true)
        expectEqual('', '', true)
        expectEqual(undefined, undefined, true)
        expectEqual(null, null, true)
      })

      it('should not be equal', () => {
        expectEqual(undefined, 'green', false)
        expectEqual('green', undefined, false)
        expectEqual(null, 'green', false)
        expectEqual('green', null, false)
        expectEqual('green', 'yellow', false)
      })
    })

    describe('object states', () => {
      it('should be equal', () => {
        expectEqual({}, {}, true)
        const obj = { green: 'magenta' }
        expectEqual(obj, obj, true)
        const objWithMultipeProp = { green: 'magenta', yellow: 'cyan' }
        expectEqual(objWithMultipeProp, objWithMultipeProp, true)
        expectEqual({ green: 'magenta', cyan: 'yellow' }, { cyan: 'yellow', green: 'magenta' }, true)
        const deepObj = { green: { magenta: 'cyan' } }
        expectEqual(deepObj, deepObj, true)
        const otherDeepObj = { green: { magenta: { cyan: 'blue' } } }
        expectEqual(otherDeepObj, otherDeepObj, true)
        expectEqual({
          green: {
            magenta: { blue: 'cyan', lightGreen: { golden: 'silver' } },
            yellow: 'pink'
          },
          red: 'orange',
          white: { grey: 'purple' }
        }, {
          white: { grey: 'purple' },
          red: 'orange',
          green: {
            yellow: 'pink',
            magenta: { lightGreen: { golden: 'silver' }, blue: 'cyan' }
          }
        }, true)
      })

      it('should not be equal', () => {
        expectEqual(undefined, {}, false)
        expectEqual(null, {}, false)
        expectEqual({}, undefined, false)
        expectEqual({}, null, false)
        expectEqual({ green: 'magenta' }, { green: 'cyan' }, false)
        expectEqual({ green: 'magenta' }, { green: { magenta: 'magenta' } }, false)
        expectEqual({ green: { magenta: 'cyan' } }, { green: { magenta: 'magenta' } }, false)
        expectEqual({ green: { magenta: { cyan: 'blue' } } }, { green: { magenta: { blue: 'cyan' } } }, false)
        expectEqual({ green: { magenta: { cyan: 'blue' } } }, { green: { magenta: { blue: 'cyan' } } }, false)
        expectEqual({ green: 'magenta', cyan: 'yellow' }, { green: 'magenta', cyan: 'blue' }, false)
        expectEqual({ green: 'magenta' }, { green: 'magenta', cyan: 'blue' }, false)
        expectEqual({
          green: {
            magenta: { blue: 'cyan', lightGreen: { golden: 'silver' } },
            yellow: 'pink'
          },
          red: 'orange',
          white: { grey: 'purple' }
        }, {
          white: { grey: 'purple' },
          red: 'orange',
          green: {
            yellow: 'pink',
            magenta: { lightGreen: { golden: 'golden' }, blue: 'cyan' }
          }
        }, false)
      })
    })
  })
})
