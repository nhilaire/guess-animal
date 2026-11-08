// Buttons of consecutive game screens sit at the same spot: after each view change, presses are ignored for a
// moment so that the second tap of a double tap never lands on the next screen.
export const INPUT_LOCK_MS = 350;

// The clock of the lock (tests that tap at machine speed replace it).
export const lockClock = { now: (): number => Date.now() };
