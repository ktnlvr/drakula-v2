export function draculaDecide(draculaDice, playerDiceCount, bet) {
    let [chosenNumber, chosenValue] = bet; // Get current values
    let totalDice = draculaDice.length + playerDiceCount;
    let halfDice = totalDice / 2;
    const potentialAction = Math.random();
    let bumpValue = false;
    let bumpNumber = false;
    let call = false;
    let draculaNumber = draculaDice.filter(value => value === chosenValue).length;

    function draculaMoreDice() {
        // Dracula has more dice - more confident to bump values or numbers, dice number max 8 min 3
        if (chosenValue < 4 && chosenNumber < halfDice) {
            //chosen number max 4 min 1
            if (chosenNumber >= halfDice - 3 && potentialAction < 0.7) {
                // chosenNumber max 1 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 2) {
                // chosenNumber max 2 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 1 && potentialAction < 0.9) {
                // chosenNumber max 3 bump number or not meet
                bumpNumber = true;
            } else {
                // Set both bumpValue and bumpNumber to true
                bumpValue = true;
                bumpNumber = true;
            }
        } else if (chosenValue < 4 && chosenNumber >= halfDice && potentialAction < 0.6) {
            //chosen number max 5 min 2
            if (chosenNumber <= halfDice + 1 && potentialAction < 0.6) {
                // chosenNumber max 4 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 2) {
                // chosenNumber max 5 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 3 && potentialAction < 0.9) {
                // chosenNumber max 6 bump number or not meet
                bumpValue = true;
            } else {
                // Set call
                call = true;
            }
        } else if (chosenValue >= 4 && chosenNumber < halfDice) {
            //chosen number max 4 min 1, Value max 6 min 4
            if (chosenNumber >= halfDice - 3 && potentialAction < 0.6) {
                // chosenNumber max 1 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 2) {
                // chosenNumber max 2 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 1 && potentialAction < 0.9) {
                // chosenNumber max 3 bump number or not meet
                bumpNumber = true;
            } else {
                // Set both bumpValue and bumpNumber to true
                bumpValue = true;
                bumpNumber = true;
            }
        } else if (chosenValue >= 4 && chosenNumber >= halfDice) {
            //chosen number max 5 min 2
            if (chosenNumber <= halfDice + 1 && potentialAction < 0.3) {
                // chosenNumber max 4 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 2 && potentialAction < 0.4) {
                // chosenNumber max 5 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 3 && potentialAction < 0.8) {
                // chosenNumber max 6 bump number or not meet
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

    if (chosenNumber < draculaNumber) {
        // When Dracula has more Dice
        if (draculaDice.length > playerDiceCount) {
            draculaMoreDice();
            // When Dracula has fewer or equal number of dices than player
        } else {
            drakulaEqualOrLessDice();
        }
    } else if (chosenNumber === draculaNumber && potentialAction < 0.7) {
        // When Dracula has more Dice
        if (draculaDice.length > playerDiceCount) {
            draculaMoreDice();
            // When Dracula has fewer or equal number of dices than player
        } else {
            drakulaEqualOrLessDice();
        }
    } else {
        call = true;
    }

    let action = null;
    if (call) {
        action = 'call';
    } else if (bumpValue && bumpNumber) {
        action = 'bumpValueAndNumber';
    } else if (bumpValue) {
        action = 'bumpValue';
    } else if (bumpNumber) {
        action = 'bumpNumber';
    } else {
        action = 'call';
    }

    // Handle the actions
    if (action === 'call') {
        //console.log(`Dracula chooses to call -> Number:${chosenNumber}, Value:${chosenValue}`);
        return 'call';
    }

    if (action === 'bumpValueAndNumber') {
        if (chosenValue < 6 && chosenNumber < totalDice) {
            chosenValue += 1;
            chosenNumber += 1;
            //console.log(`Dracula bumps both number and value -> Number:${chosenNumber}, Value:${chosenValue}`);
        }
    } else if (action === 'bumpValue') {
        if (chosenValue < 6) {
            chosenValue += 1;
            //console.log(`Dracula bumps the value -> Number:${chosenNumber}, Value:${chosenValue}`);
        }
    } else if (action === 'bumpNumber') {
        if (chosenNumber < totalDice) {
            chosenNumber += 1;
            //console.log(`Dracula bumps the number -> Number:${chosenNumber}, Value:${chosenValue}`);
        }
    }

    //console.log(`Dracula current chosen number: ${chosenNumber}, chosen value: ${chosenValue}`);
    return action;
}
