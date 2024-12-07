export function playerGuess() {
    const guessType = prompt("Enter '1' to guess the value of a dice,\n or '2' to guess the number of dices,\n or '3' to call:").toLowerCase();

    if (guessType === '1') {
        const valueGuess = parseInt(prompt("Enter the value of the dice you want to guess (1-6):"), 10);
        if (isNaN(valueGuess) || valueGuess < 1 || valueGuess > 6) {
            console.log("Invalid value guess.\n Please enter a number between 1 and 6.");
            return playerGuess(); // Retry until valid input
        }
        console.log(`Player guesses to bump the value: ${valueGuess}`);
        return { type: 'value', guess: valueGuess };
    } else if (guessType === '2') {
        const countGuess = parseInt(prompt("Enter your guess for the total number of dice showing a particular value:"), 10);
        if (isNaN(countGuess) || countGuess <= 0) {
            console.log("Invalid number guess.\n Please enter a positive number.");
            return playerGuess(); // Retry until valid input
        }
        console.log(`Player guesses to bump the number of dices to: ${countGuess}`);
        return { type: '2', guess: countGuess };
    } else if (guessType === '3') {

    } else {
        console.log("Invalid input.\n Please enter '1' for 'value' or '2' for 'number'.");
        return playerGuess(); // Retry until valid input
    }
}