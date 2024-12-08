import * as drakulaAi from './drakulaAi2nd.js';
import * as playerLogic from './testPlayerLogic.js';

// Global variables for current chosen value and number
export let chosenValue = null; // Initial value
export let chosenNumber = null; // Initial number

export function getGlobals() {
    return { chosenValue, chosenNumber };
}

export function updateGlobals(newValue, newNumber) {
    chosenValue = newValue;
    chosenNumber = newNumber;
}

function playGame(draculaDice, playerDice) {

    // Loop round
    while (draculaDice.length > 0 && playerDice.length > 0) {

        console.log("\n--- New Round ---");

        // playerDice = initializeDice(playerDice.length);
        //draculaDice = initializeDice(draculaDice.length); 
        console.log(`current status dracula dice: ${draculaDice},player dice: ${playerDice}`);
        // If it's the first round or after a call, initialize Dracula's guesses
        if (chosenValue === null || chosenNumber === null) {
            chosenValue = draculaDice[Math.floor(Math.random() * draculaDice.length)];
            chosenNumber = draculaDice.filter(value => value === chosenValue).length;
            console.log(`Dracula chosen Number: ${chosenNumber}, Value: ${chosenValue}`);
        }

        // Player's Turn
        console.log("Player's Turn:");
        const playerResult = playerLogic.playerGuess();

        if (playerResult.playerAction === '3') {
            console.log(`Player calls! Number: ${chosenNumber}, Value: ${chosenValue}`);
            compareAndDetermineOutcome('player', chosenNumber, chosenValue, draculaDice, playerDice);
            // Reinitialize dice after a call
            if (draculaDice.length > 0 && playerDice.length > 0) {
                draculaDice = initializeDice(draculaDice.length);
                playerDice = initializeDice(playerDice.length);
                chosenValue = null;
                chosenNumber = null;
            }
            continue; // Start a new round
        } else {
            // Update the global variables with Player's guesses
            chosenNumber = playerResult.countGuess;
            chosenValue = playerResult.valueGuess;
            console.log(`Player guesses: Number = ${chosenNumber}, Value = ${chosenValue}`);
        }
        console.log(`current status dracula dice: ${draculaDice},player dice: ${playerDice}`);

        // Dracula's Turn
        console.log("Dracula's Turn:");
        const draculaResult = drakulaAi.draculaTurn(draculaDice, playerDice);

        if (draculaResult.action === 'call') {
            console.log(`Dracula calls!  Number: ${chosenNumber}, Value: ${chosenValue}`);
            compareAndDetermineOutcome('dracula', chosenNumber, chosenValue, draculaDice, playerDice);
            // Reinitialize dice after a call
            if (draculaDice.length > 0 && playerDice.length > 0) {
                draculaDice = initializeDice(draculaDice.length);
                playerDice = initializeDice(playerDice.length);
                chosenValue = null;
                chosenNumber = null;
            }
            continue; // Start a new round
        } else {
            // Update the global variables with Dracula's guesses
            chosenValue = draculaResult.chosenValue;
            chosenNumber = draculaResult.chosenNumber;
            console.log(`Dracula guesses: Number ${chosenNumber}, Value ${chosenValue}`);
        }
        console.log(`current status dracula dice: ${draculaDice},player dice: ${playerDice}`);
    }

    if (draculaDice.length <= 0) {
        console.log("\n--- Game Over ---");
        console.log("Player wins! Dracula has no more dice.");
    } else if (playerDice.length <= 0) {
        console.log("\n--- Game Over ---");
        console.log("Dracula wins! Player has no more dice.");
    }
}

function compareAndDetermineOutcome(caller, chosenNumber, chosenValue, draculaDice, playerDice) {
    let actualDraculaCount = draculaDice.filter(value => value === chosenValue).length;
    let actualPlayerCount = playerDice.filter(value => value === chosenValue).length;
    let actualTotalCount = actualDraculaCount + actualPlayerCount;

    if (caller === 'dracula') {
        if (actualTotalCount === chosenNumber) {
            console.log("Dracula called correctly! Player loses a dice.");
            playerDice.pop(); // Player loses one dice
        } else {
            console.log("Dracula called wrongly! Dracula loses a dice.");
            draculaDice.pop();// Dracula loses one dice
        }
    } else if (caller === 'player') {
        if (actualTotalCount === chosenNumber) {
            console.log("Player called correctly! Dracula loses a dice.");
            draculaDice.pop();// Dracula loses one dice
            //console.log(`current status dracula dice: ${draculaDice},player dice: ${playerDice}`);
        } else {
            console.log("Player called wrongly! Player loses a dice.");
            playerDice.pop();// Player loses one dice
            //console.log(`current status dracula dice: ${draculaDice},player dice: ${playerDice}`);
        }
    }

    return { draculaDice, playerDice };
}

// Generate initial dice values for Dracula and Player
function initializeDice(numberOfDice) {
    let dice = [];
    for (let i = 0; i < numberOfDice; i++) {
        dice.push(Math.floor(Math.random() * 6) + 1); // Random number between 1 and 6
    }
    return dice;
}

// Dracula starts with 6 dice, each assigned a random value between 1 and 6
let draculaDice = initializeDice(6);

// Player starts with 2 dice, each assigned a random value between 1 and 6
let playerDice = initializeDice(2);

// Start the game
playGame(draculaDice, playerDice);
