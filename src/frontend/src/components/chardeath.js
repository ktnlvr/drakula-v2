export function characterDeath(charElement)
{
    charElement.classList.add("explode");
    setTimeout(() => {
        charElement.remove();
    }, 2000);
}