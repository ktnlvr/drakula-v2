
//main drakula logic
export function draculaTurn(draculaDice, playerDice) {
    // Dracula chooses a value and counts how many of that value he has
    const chosenValue = draculaDice[Math.floor(Math.random() * draculaDice.length)];
    const chosenNumber = draculaDice.filter(value => value === chosenValue).length;
    console.log(`Dracula initially chooses number of dices: ${chosenNumber} and dice value: ${chosenValue}`);
    const totalDice = draculaDice.length + playerDice.length;
    const halfDice = totalDice / 2;
    const potentialAction = Math.random();

    function draculaMoreDice(){
        // Dracula has more dice - more confident to bump values or numbers, dice number max 8 min 3
        if (chosenValue < 4 && chosenNumber < halfDice && potentialAction<0.8) {
            //chosen number max 4 min 1
            if (chosenNumber >= halfDice - 3 && potentialAction<0.7){
                // chosenNumber max 1 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= halfDice - 2 && potentialAction<0.5){
                // chosenNumber max 2 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= halfDice - 1 && potentialAction<0.3){
                // chosenNumber max 3 bump number or not meet
                draculaAction = 'bumpNumber';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpValue';
            } 
        } else if (chosenValue < 4 && chosenNumber >= halfDice && potentialAction<0.5) {
             //chosen number max 5 min 2
             if (chosenNumber <= halfDice + 1 && potentialAction<0.6){
                // chosenNumber max 4 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= halfDice + 2 && potentialAction<0.5){
                // chosenNumber max 5 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= halfDice + 3 && potentialAction<0.4){
                // chosenNumber max 6 bump number or not meet
                draculaAction = 'bumpValue';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpNumber';
            } 
        } else if (chosenValue >= 4 && chosenNumber < halfDice && potentialAction<0.8) {
            //chosen number max 4 min 1, Value max 6 min 4
            if (chosenNumber >= halfDice - 3 && potentialAction<0.6){
                // chosenNumber max 1 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= halfDice - 2 && potentialAction<0.5){
                // chosenNumber max 2 bump number or not meet
                draculaAction = 'bumpNumber';
            } else if (chosenNumber >= halfDice - 1 && potentialAction<0.4){
                // chosenNumber max 3 bump number or not meet
                draculaAction = 'bumpNumber';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpValue';
            } 
        } else if (chosenValue >= 4 && chosenNumber >= halfDice && potentialAction<0.5) {
            //chosen number max 5 min 2
            if (chosenNumber <= halfDice + 1 && potentialAction<0.3){
                // chosenNumber max 4 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= halfDice + 2 && potentialAction<0.2){
                // chosenNumber max 5 bump number or not meet
                draculaAction = 'bumpValue';
            } else if (chosenNumber <= halfDice + 3 && potentialAction<0.1){
                // chosenNumber max 6 bump number or not meet
                draculaAction = 'bumpValue';
            } else {
                // chosenNumber something else just call
                draculaAction = 'bumpNumber';
            } 
    }

    // Less dice drakula less bump
    function drakulaEqualOrLessDice(){
        if (potentialAction) {
            draculaAction = 'call'; // Call more often in a defensive stance
        } else if (chosenValue <= 3 && potentialAction) {
            draculaAction = 'bumpValue';
        } else if (chosenNumber < totalDice && potentialAction) {
            draculaAction = 'bumpNumber';
        } else {
            draculaAction = 'call'; // Fall back to calling if no other option is favorable
        }
    }

    let draculaAction;
    // When Dracula has more Dice
    if (draculaDice.length > playerDice.length) {
        draculaAction = draculaMoreDice();
        // When Dracula has fewer or equal number of dices than player
    } else if (draculaDice.length <= playerDice.length) {
        draculaAction = drakulaEqualOrLessDice();
    } else {
            draculaAction = 'call'; // Unexpected situation meet, Dracula calls
        }
    }

    // Log and return Dracula's action
    if (draculaAction === 'call') {
        console.log(`Dracula chooses to call.`);
        return { action: 'call', chosenNumber, chosenValue};
    }
    
     // Dracula's another thinking
    if (draculaAction === 'bumpValue') {
        if (chosenValue < 6) {
            chosenValue = chosenValue + 1; // Bump the value and assign the new value to chosenValue
            console.log(`Dracula guesses to bump the value of the dice from previous value to ${chosenValue}`);
        } else {
            console.log(`Dracula cannot bump the value beyond 6, keeping it at ${chosenValue}`);
        }
    } else if (draculaAction === 'bumpNumber') {
        if (chosenNumber < 8) {
            chosenNumber = chosenNumber + 1; // Bump the number and assign the new number to chosenNumber
            console.log(`Dracula guesses to bump the number of ${chosenValue} from previous number to ${chosenNumber}`);
        } else {
            console.log(`Dracula cannot bump the number beyond 8, keeping it at ${chosenNumber}`);
        }
    }
    
    return { action: draculaAction, chosenNumber, chosenValue};
}
