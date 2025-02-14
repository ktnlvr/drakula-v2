import { getGlobals, updateGlobals } from './testMainGameLoop.js';
//main drakula logic
export function draculaTurn(draculaDice, playerDice) {
    let { chosenValue, chosenNumber } = getGlobals(); // Get current values
    let totalDice = draculaDice.length + playerDice.length;
    let halfDice = totalDice / 2;
    const potentialAction = Math.random();
    let bumpValue = false;
    let bumpNumber = false;
    let call = false;

    function draculaMoreDice() {
        // Dracula has more dice - more confident to bump values or numbers, dice number max 8 min 3
        if (chosenValue < 4 && chosenNumber < halfDice) {
            //chosen number max 4 min 1
            if (potentialAction < 0.7) {
                bumpNumber = true;
            } else {
                // Set both bumpValue and bumpNumber to true
                bumpValue = true;
                bumpNumber = true;
            }
        } else if (chosenValue < 4 && chosenNumber >= halfDice) {
            //chosen number max 5 min 2
            if (potentialAction < 0.6) {
                bumpValue = true;
            } else {
                // Set call
                call = true;
            }
        } else if (chosenValue >= 4 && chosenNumber < halfDice) {
            //chosen number max 4 min 1, Value max 6 min 4
            if (potentialAction < 0.6) {
                bumpNumber = true;
            } else {
                // Set both bumpValue and bumpNumber to true
                bumpValue = true;
                bumpNumber = true;
            }
        } else if (chosenValue >= 4 && chosenNumber >= halfDice) {
            //chosen number max 5 min 2
            if (potentialAction < 0.3) {
                bumpValue = true;
            } else {
                // Set call
                call = true;
            }
        } else {
            call = true;
        }
    }
    // Less dice drakula less bump
    function drakulaEqualOrLessDice() {
        if (potentialAction < 0.4) {
            call = true; // Call more often in a defensive stance
        } else if (chosenValue <= 3 && potentialAction < 0.5) {
            bumpValue = true;
        } else if (chosenNumber < totalDice && potentialAction < 0.9) {
            bumpNumber = true;
        } else {
            call = true; // Fall back to calling if no other option is favorable
        }
    }

    // When Dracula has more Dice
    if (draculaDice.length > playerDice.length) {
        draculaMoreDice();
        // When Dracula has fewer or equal number of dices than player
    } else if (draculaDice.length <= playerDice.length) {
        drakulaEqualOrLessDice();
    } else {
        call = true; // Unexpected situation meet, Dracula calls
    }


    let draculaAction = null;
    if (call) {
        draculaAction = 'call';
    } else if (bumpValue && bumpNumber) {
        draculaAction = 'bumpValueAndNumber';
    } else if (bumpValue) {
        draculaAction = 'bumpValue';
    } else if (bumpNumber) {
        draculaAction = 'bumpNumber';
    } else {
        draculaAction = 'call';
    }

    // Handle the actions
    if (draculaAction === 'call') {
        //console.log(`Dracula chooses to call -> Number:${chosenNumber}, Value:${chosenValue}`);
        return { action: 'call', chosenNumber, chosenValue };
    }

    if (draculaAction === 'bumpValueAndNumber') {
        if (chosenValue < 6 && chosenNumber < 8) {
            chosenValue += 1;
            chosenNumber += 1;
            //console.log(`Dracula bumps both number and value -> Number:${chosenNumber}, Value:${chosenValue}`);
        } else {
            console.log(`Dracula bump out of range, keeping it at Number:${chosenNumber}`);
        }
    } else if (draculaAction === 'bumpValue') {
        if (chosenValue < 6) {
            chosenValue += 1;
            //console.log(`Dracula bumps the value -> Number:${chosenNumber}, Value:${chosenValue}`);
        } else {
            console.log(`Cannot bump value beyond 6, keeping it at ${chosenValue}`);
        }
    } else if (draculaAction === 'bumpNumber') {
        if (chosenNumber < 8) {
            chosenNumber += 1;
            //console.log(`Dracula bumps the number -> Number:${chosenNumber}, Value:${chosenValue}`);
        } else {
            console.log(`Cannot bump number beyond 8, keeping it at ${chosenNumber}`);
        }
    }
    updateGlobals(chosenValue, chosenNumber);
    //console.log(`Dracula current chosen number: ${chosenNumber}, chosen value: ${chosenValue}`);
    return {action: draculaAction, chosenNumber: chosenNumber, chosenValue: chosenValue };
}
