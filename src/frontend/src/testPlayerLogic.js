import { getGlobals, updateGlobals } from './testMainGameLoop.js';

export function playerGuess() {
    const { chosenValue, chosenNumber } = getGlobals(); // Get current values

    const guessType = prompt("Enter '1' to guess the value of a dice,\n or '2' to guess the number of dices,\n or '3' to call:").toLowerCase();

    if (guessType === '1') {
        const newValue = Math.min(chosenValue + 1, 6);
        console.log(`Player guesses to bump the value`);
        updateGlobals(newValue, chosenNumber);
        return { playerAction: '1', valueGuess: newValue, countGuess: chosenNumber };

    } else if (guessType === '2') {
        const newNumber = Math.min(chosenNumber + 1, 8);
        console.log(`Player guesses to bump the number`);
        updateGlobals(chosenValue, newNumber);
        return { playerAction: '2', valueGuess: chosenValue, countGuess: newNumber };

    } else if (guessType === '3') {
        console.log(`Player guesses to call`);
        return { playerAction: '3', valueGuess: chosenValue, countGuess: chosenNumber };
    } else {
        console.log("Invalid input.\n Please enter '1' for 'value' or '2' for 'number'.");
        return playerGuess(); // Retry until valid input
    }
}