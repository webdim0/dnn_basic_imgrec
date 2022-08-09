<script context="module">
	export const prerender = true;	
</script>

<script>
	import Canva from '../components/Canva.svelte';
	import Config from '/src/config.js';

	let canva;
	let isTraining = false;
	
	const apiUrl = Config.apiUrl;
	const headers = {        
						'Accept': 'application/json',
						'X-Requested-With': 'XMLHttpRequest',        
						'Content-Type': 'application/json',
						'credentials': 'same-origin',
						'mode': 'no-cors',
					};

	let answer = '?'; 
	let nnResult = ''; 

	const clearCanvas = () => {
		canva.claer();    
	}

	const saveCanvas = async () => {
		const newImageBody = canva.getBytecode();    
		let response = await fetch(`${apiUrl}/dataset`, {
								method: 'POST',            
								headers,
								body: JSON.stringify({
									label: answer,
									img: newImageBody           
								})
							});
    let json = await response.json();

    canva.claer();  

    if (json?.status == 'ok') {
        isTraining = true;
        response = await fetch(`${apiUrl}/neural-network/train`, {
                              method: 'POST',            
                              headers                              
                          });
        json = await response.json();    
        isTraining = false;
    }    

    return json?.status == 'ok';       
  }

  const handlePredict = async () => {
    const imageBody = canva.getBytecode();
    const response = await fetch(`${apiUrl}/neural-network/predict`, {
                              method: 'POST',            
                              headers,
                              body: JSON.stringify({                                
                                img: imageBody           
                              })
                          });

    const json = await response.json();

    nnResult = json.data.resultValue; 
    answer = json.data.label; 

    return json?.status == 'ok';       
  }
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Simple digits recognition" />
</svelte:head>

<section>
	<div class="newImage">    
	<Canva 
		bind:this="{canva}" 
		bind:width="{Config.canvasWidth}" 
		bind:height="{Config.canvasHeight}" 
	/>      
	<div class="newImage__controls">      
		<button on:click={handlePredict}>
		Predict
		</button>      
		<button on:click={clearCanvas}>
		Clear
		</button>
	</div>    
	</div>
	<div class="answer">
	<h2>{answer}</h2>
	<span class="answer__nnresult">{nnResult}</span>
	<input type="number" bind:value={answer}>                  
	<button on:click={saveCanvas}>
		Save
	</button>
	</div>  
	{#if isTraining}
	<div class="training__label">
	Training...
	</div>
	{/if}
</section>

<style>
	.newImage {
	  display: flex;
	  margin-top: 2em;    
	  justify-content: center;
	}
	.newImage__controls {
	  display: flex;
	  padding: 2px 0;
	  flex-direction: column;
	  justify-content: start;
	  margin-left: 20px;
	}
	button {
	  font-size: 1em;
	  padding: .35em .5em;
	  margin-bottom: 1em;    
	}
	.answer input {
	  font-size: 1.5em;
	  width: 70px;
	  vertical-align: middle;
	}
	.answer button {
	  margin-bottom: 0;
	  vertical-align: middle;
	}
	.answer h2 {
	  padding: 0;
	  margin: 20px 0 0 0;
	}
	.answer .answer__nnresult {
	  display: block;
	  margin-bottom: 20px;
	  color: #ccc;
	}
	.training__label {
	  margin-top: 1em;
	  color: crimson;
	}
</style>