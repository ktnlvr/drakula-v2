
export function draculaTurn(draculaDice, playerDice) {
    // Dracula chooses a value and counts how many of that value he has
    const chosenValue = draculaDice[Math.floor(Math.random() * draculaDice.length)];
    const chosenNumber = draculaDice.filter(value => value === chosenValue).length;

    console.log(`Dracula initially chooses number of dices: ${chosenNumber} and dice value: ${chosenValue}`);

    let draculaAction;

    const totalDice = draculaDice.length + playerDice.length;

    // Logic based on the current game state
    if (draculaDice.length > playerDice.length) {
        // Dracula has more dice - more confident to bump values or numbers
        if (chosenValue < 4 && chosenNumber < totalDice / 2 && Math.random() > 0.5) {
            // If chosen value is below 4, Dracula tries to bump it, but with slightly lower probability
            draculaAction = 'bumpValue';
        } else if (chosenValue < 4 && chosenNumber < totalDice / 3 && Math.random() > 0.3) {
            // If the number of chosen dice is less than the total number of Dracula's dice, bump the count
            draculaAction = 'bumpNumber';
        } else if (
            // ktnlvr: ok, this is a bit complicated, but the probabilities
            // here don't line up like you thtink they do.
            //
            // The values are checked sequentially so the random numbers are 
            // generated anew every time.
            // 
            //                      For now, only look at these
            //                                  v
            (chosenValue === 4 && Math.random() > 0.3) || 
            // the chance of this firing is 0.7, as expected
            (chosenValue === 5 && Math.random() > 0.2) ||
            // this check will only be performed ONLY if the first one fails
            // so the chance of this passing is P(this fires) AND P(previous doesn't fire)
            // therefore the actual chance for this check to work is
            // P(this fires) = 0.8
            // P(previous doesn't fire) = 1 - 0.7 = 0.3
            // P(this fires) * P(previous doesn't fire) = 0.8 * 0.3 = 0.24 <--- the actual probability
            (chosenValue === 6 && Math.random() > 0.1) ||
            // the principle continous
            // P(this fires) = 0.9
            // P(previous doesn't fire) = 1 - 0.26 = 0.74
            // P(this fires) * P(previous doesn't fire) = 0.666 <--- the actual probability
            (chosenNumber > totalDice / 2 && Math.random() > 0.5) ||
            (chosenNumber > totalDice / 2 + 2 && Math.random() > 0.2) || 
            // SOLUTION: generate the random number once at the start
            // Bayes Theorem: P(A | B) = P(B | A) * P(A) / P(B)
            // the probability of A happening, giving that B happened is equal to
            // the probability of B happening, giving A happened, times probability of A
            // divided by the probability of B

            // and if you work through the formulas you'll see it's gonna be ok!
            // i don't have an intuitive solution to this sorry

            // ktnlvr: it's more common to express 70% as `Math.random() < 0.7`, rather than `Math.random() > (1 - 0.3)`
            (chosenNumber === totalDice)
        ) { // ktnlvr: I am noticing that calling is always a fallback
            // does it make sense to only set it at the end if nothing else matches?

            // If chosenValue is high, or chosenNumber is greater than half the total, Dracula may call with varying probabilities
            draculaAction = 'call';
        }
        // ktnlvr: reachable?
    } else if (draculaDice.length <= playerDice.length) {
        // Dracula has fewer or equal dice - might lean towards calling more often
        if (Math.random() > 0.5) {
            draculaAction = 'call'; // Call more often in a defensive stance
        } else if (chosenValue < 3 && Math.random() > 0.4) {
            draculaAction = 'bumpValue';
        } else if (chosenNumber < playerDice.length && Math.random() > 0.4) {
            draculaAction = 'bumpNumber';
        } else {
            draculaAction = 'call'; // Fall back to calling if no other option is favorable
        }
    } else { // ktnlvr: is this ever reached?
        // If the game state is equal and balanced
        if (chosenValue < 4 && Math.random() > 0.5) {
            // If the chosen value is low, Dracula may bump it
            draculaAction = 'bumpValue';
        } else if (chosenNumber < totalDice / 2 && Math.random() > 0.4) {
            // If there is room to bump the count, do it
            draculaAction = 'bumpNumber';
        } else {
            draculaAction = 'call'; // If all else fails, Dracula calls
        }
    }

    // Log and return Dracula's action
    if (draculaAction === 'call') {
        console.log(`Dracula chooses to call.`);
        return { action: 'call', chosenValue, chosenNumber };
    }

    // Dracula's Guess
    if (draculaAction === 'bumpValue') {
        //                                            ktnlvr: not sure why we have the Math.min, the value of a dice is always 1..6 
        console.log(`Dracula guesses to bump the value of ${chosenValue} to ${Math.min(chosenValue + 1, 6)}`);
    } else if (draculaAction === 'bumpNumber') {
        console.log(`Dracula guesses to bump the number of ${chosenValue} from ${chosenNumber} to ${chosenNumber + 1}`);
    }

    // ktnlvr: good work! very nice clean code, big fan
    return { action: draculaAction, chosenValue, chosenNumber };
}
