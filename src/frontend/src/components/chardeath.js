export function characterDeath(charElement)
{
    charElement.classList.add("explode");
    setTimeout(() => {
        charElement.remove();
    }, 1000);
}