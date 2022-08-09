<script>
  import { onMount } from 'svelte';

  export let width = 100;
  export let height = 100;

  let canvas;
  let context;  
  let coord = { x: 0, y: 0 };
  let isMouseDown = false;
  let offsetLeft;
  let offsetTop;  

  export function claer() {	
    context.clearRect(0, 0, canvas.width, canvas.height);	
	}

  export function getBytecode() {	
    return canvas.toDataURL('image/png')
	}

  function reposition(event) {
    coord.x = event.clientX - offsetLeft;
    coord.y = event.clientY - offsetTop;
  }

  function draw(event) {
    context.beginPath();
    context.lineWidth = 15;
    context.lineCap = 'round';
    context.strokeStyle = '#ACD3ED';    
    context.moveTo(coord.x, coord.y);   
    reposition(event);     
    context.lineTo(coord.x, coord.y);
    context.stroke();
  }

  function handleMousemove(event) {		
    if (isMouseDown) {      
      draw(event);
    }    
	}
  function handleMousedown(event) {		
    reposition(event);
    isMouseDown = true;    
	}
  function handleMouseup(event) {		
    isMouseDown = false;    
	}

  onMount(() => {
    context = canvas.getContext('2d');
    offsetLeft = canvas.offsetLeft;
    offsetTop = canvas.offsetTop;
  });
</script>

<canvas 
  bind:this={canvas}
  on:mousemove={handleMousemove}
  on:mousedown={handleMousedown}
  on:mouseup={handleMouseup}      
  width={width}
  height={height}
></canvas>

<style>
  canvas {    
    border: 1px solid #ccc;
  }
</style>
