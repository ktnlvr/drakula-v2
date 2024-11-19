<script>
  let {
    name = "Traps",
    description = "Traps the dracula for until and unless they last",
    img = "https://placecats.com/300/200",
    angle,
    index,
    onclickselected = () => true,
    onclickunselected = () => false,
  } = $props();

  export function select() {
    selected = true;
  }

  export function deselect() {
    selected = false;
  }

  let selected = $state(false);
  let self;
</script>

<div class="card w-1/6" bind:this={self}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    class="p-4 w-full flex flex-col rounded border border-black bg-slate-500"
    style="transform: rotate({angle}deg);"
    onclick={() => {
      let proxy = {select, deselect, '__proto__': self}
      if (selected)
        selected = onclickselected(proxy)
      else
        selected = onclickunselected(proxy)
    }}
	class:card-active="{selected}"
  >
    <h1 class="font-bold text-lg">{name}</h1>
    <p class="p-1">{description}</p>
    <img src={img} alt="A cat" class="rounded" />
  </div>
</div>

<style>
    .card {
		scale: 1.;
		transition: 0.1s;
	}

	.card:hover, .card-active {
		--scale: 1.3;
		scale: var(--scale);
		transition: 0.2;
		z-index: 100;
		transform: translateY(-1.75rem);
	}
</style>
