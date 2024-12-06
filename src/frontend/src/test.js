
export function draculaTurn(draculaDice, playerDice) {
    // Dracula chooses a value and counts how many of that value he has
    const draculaDice = [1, 2, 3, 4, 5, 5];
    const playerDice = [2, 3];
    const chosenValue = draculaDice[Math.floor(Math.random() * draculaDice.length)];
    const chosenNumber = draculaDice.filter(value => value === chosenValue).length;

    console.log(`Dracula initially chooses number of dices: ${chosenNumber} and dice value: ${chosenValue}`);

    let draculaAction;

    const totalDice = draculaDice.length + playerDice.length;
    const potentialAction = Math.random();
    // Logic based on the current game state
    if (draculaDice.length > playerDice.length) {
        // Dracula has more dice - more confident to bump values or numbers, dice number max 8 min 3
        if (chosenValue < 4 && 0 < chosenNumber < totalDice / 2 && potentialAction<0.8) {
            //chosen number max 4 min 1
            if (chosenNumber >= totalDice / 2 - 3 > 0 && potentialAction<0.7){
                // chosenNumber max 1 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= totalDice / 2 - 2 > 0 && potentialAction<0.5){
                // chosenNumber max 2 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= totalDice / 2 - 1 > 0 && potentialAction<0.3){
                // chosenNumber max 3 bump number or not meet
                draculaAction = 'bumpNumber';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpValue';
            } 
        } else if (chosenValue < 4 && chosenNumber >= totalDice / 2 && potentialAction<0.5) {
             //chosen number max 5 min 2
             if (chosenNumber <= totalDice / 2 + 1 && potentialAction<0.6){
                // chosenNumber max 4 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= totalDice / 2 + 2 && potentialAction<0.5){
                // chosenNumber max 5 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= totalDice / 2 + 3 && potentialAction<0.4){
                // chosenNumber max 6 bump number or not meet
                draculaAction = 'bumpValue';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpNumber';
            } 
        } else if (chosenValue >= 4 && chosenNumber < totalDice / 2 && potentialAction<0.8) {
            //chosen number max 4 min 1, Value max 6 min 4
            if (chosenNumber >= totalDice / 2 - 3 > 0 && potentialAction<0.6){
                // chosenNumber max 1 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= totalDice / 2 - 2 > 0 && potentialAction<0.5){
                // chosenNumber max 2 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= totalDice / 2 - 1 > 0 && potentialAction<0.4){
                // chosenNumber max 3 bump number or not meet
                draculaAction = 'bumpNumber';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpValue';
            } 
        } else if (chosenValue >= 4 && chosenNumber >= totalDice / 2 && potentialAction<0.5) {
            //chosen number max 5 min 2
            if (chosenNumber <= totalDice / 2 + 1 && potentialAction<0.3){
                // chosenNumber max 4 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= totalDice / 2 + 2 && potentialAction<0.2){
                // chosenNumber max 5 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= totalDice / 2 + 3 && potentialAction<0.1){
                // chosenNumber max 6 bump number or not meet
                draculaAction = 'bumpValue';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpNumber';
            } 
        // When Dracula has fewer or equal number of dices than player
    } else if (draculaDice.length <= playerDice.length) {
        if (potentialAction) {
            draculaAction = 'call'; // Call more often in a defensive stance
        } else if (chosenValue <= 3 && potentialAction) {
            draculaAction = 'bumpValue';
        } else if (chosenNumber < totalDice && potentialAction) {
            draculaAction = 'bumpNumber';
        } else {
            draculaAction = 'call'; // Fall back to calling if no other option is favorable
        }
    } else {
            draculaAction = 'call'; // Unexpected situation meet, Dracula calls
        }
    }

    // Log and return Dracula's action
    if (draculaAction === 'call') {
        console.log(`Dracula chooses to call.`);
        return { action: 'call', chosenValue, chosenNumber };
    }

    // Dracula's Guess
    if (draculaAction === 'bumpValue') {
        //Make sure no logic error, if Dracula bump Value to 7
        console.log(`Dracula guesses to bump the value of ${chosenValue} to ${Math.min(chosenValue + 1, 6)}`);
    } else if (draculaAction === 'bumpNumber') {
        //Make sure chosennumber smallar than 6 + 2 
        console.log(`Dracula guesses to bump the number of ${chosenValue} from ${chosenNumber} to ${Math.min(chosenNumber + 1),8}`);
    }

    // ktnlvr: good work! very nice clean code, big fan
    return { action: draculaAction, chosenValue, chosenNumber };
}
