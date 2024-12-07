import * as drakulaAi from './drakulaAi2nd.js';
import * as playerLogic from './testPlayerLogic.js';

// Global variables for current chosen value and number
export let chosenValue = null; // Initial value
export let chosenNumber = null; // Initial number

//export function getGlobals() {
 //   return { chosenValue, chosenNumber };
//}


function playGame(draculaDice, playerDice) {
    // Initialize chosenValue and chosenNumber using Dracula's first turn
    chosenValue = draculaDice[Math.floor(Math.random() * draculaDice.length)];
    chosenNumber = draculaDice.filter(value => value === chosenValue).length;

    console.log(`Dracula chosenValue: ${chosenValue}, chosenNumber: ${chosenNumber}`);
// Loop round
    while (draculaDice.length > 0 && playerDice.length > 0) {
        console.log("\n--- New Round ---");

        // Dracula's Turn
        console.log("Dracula's Turn:");
        const draculaResult = drakulaAi.draculaTurn(draculaDice, playerDice, chosenValue, chosenNumber);

        if (draculaResult.action === 'call') {
            console.log(`Dracula calls!  Number: ${chosenNumber}, Value: ${chosenValue}`);
            compareAndDetermineOutcome('dracula', chosenNumber, chosenValue, draculaDice, playerDice);
            break; // Stop the loop if Dracula calls
        } else {
            // Update the global variables with Dracula's guesses
            chosenValue = draculaResult.chosenValue;
            chosenNumber = draculaResult.chosenNumber;
            console.log(`Dracula guesses: Number = ${chosenNumber}, Value = ${chosenValue}`);
        }

        // Player's Turn
        console.log("Player's Turn:");
        const playerResult = playerLogic.playerGuess(chosenValue, chosenNumber);

        if (playerResult.playerAction === '3') {
            console.log(`Player calls! Number: ${chosenNumber}, Value: ${chosenValue}`);
            compareAndDetermineOutcome('player', chosenValue, chosenNumber, draculaDice, playerDice);
            break; // Stop the loop if Player calls
        } else {
            // Update the global variables with Player's guesses
            chosenValue = playerResult.valueGuess;
            chosenNumber = playerResult.countGuess;
            console.log(`Player guesses: Number = ${chosenNumber}, Value = ${chosenValue}`);
        }
    }

    console.log("\n--- Game Over ---");
    if (draculaDice.length <= 0) {
        console.log("Player wins! Dracula has no more dice.");
    } else if (playerDice.length <= 0) {
        console.log("Dracula wins! Player has no more dice.");
    }
}

function compareAndDetermineOutcome(caller, chosenValue, chosenNumber, draculaDice, playerDice) {
    const actualDraculaCount = draculaDice.filter(value => value === chosenValue).length;
    const actualPlayerCount = playerDice.filter(value => value === chosenValue).length;
    const actualTotalCount = actualDraculaCount + actualPlayerCount;

    if (caller === 'dracula') {
        if (actualTotalCount === chosenNumber) {
            console.log("Dracula called correctly! Player loses a dice.");
            playerDice.pop(); // Player loses one dice
        } else {
            console.log("Dracula called wrongly! Dracula loses a dice.");
            draculaDice.pop(); // Dracula loses one dice
        }
    } else if (caller === 'player') {
        if (actualTotalCount === chosenNumber) {
            console.log("Player called correctly! Dracula loses a dice.");
            draculaDice.pop(); // Dracula loses one dice
        } else {
            console.log("Player called wrongly! Player loses a dice.");
            playerDice.pop(); // Player loses one dice
        }
    }
}

// Generate initial dice values for Dracula and Player
function initializeDice(numberOfDice) {
    const dice = [];
    for (let i = 0; i < numberOfDice; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1); // Random number between 1 and 6
    }
    return dice;
}

// Dracula starts with 6 dice, each assigned a random value between 1 and 6
const draculaDice = initializeDice(6);

// Player starts with 2 dice, each assigned a random value between 1 and 6
const playerDice = initializeDice(2);

// Start the game
playGame(draculaDice, playerDice);
