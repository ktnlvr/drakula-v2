<script>
  import Card from "./Card.svelte";

  let cards = [
    {
      name: "Traps",
      description: "Traps the dracula for until and unless they last",
      img: "https://placecats.com/300/200",
    },
    {
      name: "Traps",
      description: "Traps the dracula for until and unless they last",
      img: "https://placecats.com/300/200",
    },
    {
      name: "Traps",
      description: "Traps the dracula for until and unless they last",
      img: "https://placecats.com/300/200",
    },
    {
      name: "Traps",
      description: "Traps the dracula for until and unless they last",
      img: "https://placecats.com/300/200",
    },
  ];

  let count = cards.length;

  let angle = 20;
  let lift = 150;

  let selected = null;
</script>

<div
  class="flex flex-row h-auto justify-center w-full"
  style="position: absolute; bottom: 0px"
>
  {#each cards as { name, description, img }, i}
    <Card
      {name}
      {description}
      {img}
      angle="{0 && (angle * (i + 0.5 - count / 2)) / (count - 1)},"
      index={i}
      onclickunselected={(e) => {
        console.log(e)
        if (selected !== null)
          selected.deselect();
        selected = e;
        return true;
      }}
    />
  {/each}
</div>
