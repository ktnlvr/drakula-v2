
import * as drakulaAi from './drakula_ai.js';
import { playerGuess} from './player_logic.js';

function playGame(draculaDice, playerDice) {
    while (draculaDice.length > 0 && playerDice.length > 0) {
        console.log("\n--- New Round ---");

        // Dracula's Turn
        const draculaResult = drakulaAi.draculaTurn(draculaDice, playerDice);

        if (draculaResult.action === 'call') {
            compareAndDetermineOutcome('dracula', draculaResult.chosenValue, draculaResult.chosenNumber, draculaDice, playerDice);
            continue; // Move to next round
        }

        // Player's Turn to Guess
        const playerGuessResult = playerGuess();
        console.log(draculaDice.length, playerDice.length)
        console.log(draculaDice, playerDice)
        console.log(playerGuessResult)
        console.log(draculaResult)
        // Compare Player Guess vs. Dracula's Guess
        if (playerGuessResult.type === '1') {
            console.log(`playerGuessResult.guess`); 
        } else if (playerGuessResult.type === '2') {
            console.log(`playerGuessResult.guess`);
        }

        // Dracula's Next Move: Call or Continue Guessing
        if (Math.random() > 0.5) {
            console.log(`Dracula chooses to call.`);
            compareAndDetermineOutcome('dracula', draculaResult.chosenValue, draculaResult.chosenNumber, draculaDice, playerDice);
        } else {
            console.log(`Dracula chooses to continue guessing.`);
        }
    }

    console.log("\n--- Game Over ---");
    if (draculaDice.length <= 0) {
        console.log("Player wins! Dracula has no more dice.");
    } else if (playerDice.length <= 0) {
        console.log("Dracula wins! Player has no more dice.");
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

// Dracula starts with 6 dice, each assigned a random value between 1 and 6
const draculaDice = initializeDice(6);

// Player starts with 2 dice, each assigned a random value between 1 and 6
const playerDice = initializeDice(2);

// Start the game
playGame(draculaDice, playerDice);

