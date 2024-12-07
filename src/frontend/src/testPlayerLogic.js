import { getGlobals, updateGlobals } from './testMainGameLoop.js';

export function playerGuess() {
    let { chosenValue, chosenNumber } = getGlobals(); // Get current values

    const guessType = prompt("Enter '1' to guess the value of a dice,\n or '2' to guess the number of dices,\n or '3' to call:").toLowerCase();
    //const valueGuess = parseInt(prompt("Enter the value of the dice you want to guess (1-6):"), 10);
    //const countGuess = parseInt(prompt("Enter your guess for the total number of dice showing a particular value:"), 10);
    const playerCall = 'call';

    
    if (guessType === '1') {
        chosenValue += 1
        console.log(`Player guesses to bump the value`);
        //return { playerAction: '1', chosenValue, chosenNumber};
        updateGlobals(chosenValue, chosenNumber);
    } else if (guessType === '2') {
        chosenNumber+=1
        console.log(`Player guesses to bump the number`);
        //return { playerAction: '2', chosenNumber, chosenValue};
        updateGlobals(chosenValue, chosenNumber);

    } else if (guessType === '3') {
        console.log(`Player guesses to call`);
        return { playerAction: '3', chosenNumber: chosenNumber, chosenValue: chosenValue };
    } else {
        console.log("Invalid input.\n Please enter '1' for 'value' or '2' for 'number'.");
        return playerGuess(); // Retry until valid input
    }
}