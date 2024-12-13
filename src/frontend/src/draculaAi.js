export function draculaDecide(draculaDice, playerDiceCount, bet) {
    let [chosenNumber, chosenValue] = bet; // Get current values
    let totalDice = draculaDice.length + playerDiceCount;
    let halfDice = totalDice / 2;
    let bumpValue = false;
    let bumpNumber = false;
    let call = false;

    function draculaMoreDice() {
        // Dracula has more dice - more confident to bump values or numbers, dice number max 8 min 3
        if (chosenValue < 4 && chosenNumber < halfDice) {
            //chosen number max 4 min 1
            if (chosenNumber >= halfDice - 3 && Math.random() < 0.7) {
                // chosenNumber max 1 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 2) {
                // chosenNumber max 2 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 1 && Math.random() < 0.9) {
                // chosenNumber max 3 bump number or not meet
                bumpNumber = true;
            } else {
                // Set both bumpValue and bumpNumber to true
                bumpValue = true;
                bumpNumber = true;
            }
        } else if (chosenValue < 4 && chosenNumber >= halfDice && Math.random() < 0.6) {
            //chosen number max 5 min 2
            if (chosenNumber <= halfDice + 1 && Math.random() < 0.6) {
                // chosenNumber max 4 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 2) {
                // chosenNumber max 5 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 3 && Math.random() < 0.9) {
                // chosenNumber max 6 bump number or not meet
                bumpValue = true;
            } else {
                // Set call
                call = true;
            }
        } else if (chosenValue >= 4 && chosenNumber < halfDice) {
            //chosen number max 4 min 1, Value max 6 min 4
            if (chosenNumber >= halfDice - 3 && Math.random() < 0.6) {
                // chosenNumber max 1 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 2) {
                // chosenNumber max 2 bump number or not meet
                bumpNumber = true;
            } else if (chosenNumber >= halfDice - 1 && Math.random() < 0.9) {
                // chosenNumber max 3 bump number or not meet
                bumpNumber = true;
            } else {
                // Set both bumpValue and bumpNumber to true
                bumpValue = true;
                bumpNumber = true;
            }
        } else if (chosenValue >= 4 && chosenNumber >= halfDice) {
            //chosen number max 5 min 2
            if (chosenNumber <= halfDice + 1 && Math.random() < 0.3) {
                // chosenNumber max 4 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 2 && Math.random() < 0.4) {
                // chosenNumber max 5 bump number or not meet
                bumpValue = true;
            } else if (chosenNumber <= halfDice + 3 && Math.random() < 0.8) {
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
        if (chosenValue <= 3 && Math.random() < 0.5) {
            bumpValue = true;
        } else if (chosenNumber < totalDice && Math.random() < 0.9) {
            bumpNumber = true;
        } else {
            call = true; // Fall back to calling if no other option is favorable
        }
    }

    if (draculaDice.length > playerDiceCount) {
        draculaMoreDice();
    } else {
        drakulaEqualOrLessDice();
    }

    let actionPool = [];
    if (call) {
        actionPool.push('call');
    } else if (bumpValue && bumpNumber) {
        actionPool.push('bumpValueAndNumber');
    } else if (bumpValue) {
        actionPool.push('bumpValue');
    } else if (bumpNumber) {
        actionPool.push('bumpNumber');
    }

    let action = 'call';
    if (actionPool) {
        action = actionPool[Math.floor(Math.random() * actionPool.length)]
    }

    // Vary the strategy a little sometimes
    if (action === 'call' && Math.random() < 0.1) {
        action = ['bumpNumber', 'bumpValue', 'bumpValueAndNumber'][Math.floor(Math.random() * 3)]
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

    // Reduce the aggression
    return action;
}


// Code for trialing the Dracula's strategy
// If we ever come around to implementing proper debugging features
// or debug layers this is where it would go
/*

const decisions = { 'call': 0, 'bumpValue': 0, 'bumpNumber': 0, 'bumpValueAndNumber': 0}
let trials = 0;

for(let i = 1; i <= 6; i++) {
    for (let j = 1; i <= 6; i++) {
        for (let k = 0; k < 100000; k++) {
            const bet = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
            const draculaDice = []
            for (let s = 0; s < j; s++)
                draculaDice.push(Math.floor(Math.random() * 6) + 1);

            const decision = draculaDecide(draculaDice, i, bet);
            decisions[decision]++;
            trials++;
        }
    }
}

console.log(trials)
for (const [key, value] of Object.entries(decisions)) {
    decisions[key] = Math.round(10000 * value / trials) / 100
}

console.log(decisions)

*/
