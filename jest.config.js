module.exports = {
  projects: [
    { displayName: 'Test' },
    {
      displayName: 'Lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*?(.spec).js']
    }
  ]
}
