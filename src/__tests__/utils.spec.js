import { isInState } from '../utils'

describe('isInState', () => {
  describe('must return true', () => {
    it('in state \'HELLO_WORLD\'', () => {
      expect(isInState('HELLO_WORLD', 'HELLO_WORLD')).toBe(true)
    })

    it('in state \'APP.POST\'', () => {
      expect(isInState({ APP: 'POST' }, 'APP.POST')).toBe(true)
    })

    it('in state \'APP.POST\'', () => {
      expect(isInState({ APP: { POST: 'FETCHING' } }, 'APP.POST')).toBe(true)
    })

    it('in state \'APP.POST.FETCHING\'', () => {
      expect(isInState({ APP: { POST: 'FETCHING' } }, 'APP.POST.FETCHING')).toBe(true)
    })
  })

  describe('must return false', () => {
    it('not in state \'HELLO_WORLD\'', () => {
      expect(isInState('FOO_BAR', 'HELLO_WORLD')).toBe(false)
    })

    it('not in state \'APP.POST\'', () => {
      expect(isInState({ APP: 'COMMENT' }, 'APP.POST')).toBe(false)
    })

    it('not in state \'APP.POST\'', () => {
      expect(isInState({ APP: { COMMENT: 'FETCHING' } }, 'APP.POST')).toBe(false)
    })

    it('not in state \'APP.POST.FETCHING\'', () => {
      expect(isInState({ APP: { POST: 'DISPLAY' } }, 'APP.POST.FETCHING')).toBe(false)
    })
  })
})
