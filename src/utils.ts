export function isEqual(
  state: null | number | { [key: string]: any } | string | undefined,
  nextState: null | number | { [key: string]: any } | string | undefined
): boolean {
  if (
    !state ||
    !nextState ||
    typeof state !== 'object' ||
    typeof nextState !== 'object'
  ) {
    return state === nextState;
  }
  const nextStateKeys = Object.keys(nextState);
  const stateKeys = Object.keys(state);

  if (
    nextStateKeys.length !== stateKeys.length ||
    nextStateKeys.filter(key => !stateKeys.includes(key)).length > 0
  ) {
    return false;
  }

  return nextStateKeys.every(key => isEqual(state[key], nextState[key]));
}
