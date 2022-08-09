<script context="module">	
	import Config from '/src/config.js';	
	import { updateList, deleteItem, train, create } from '../api/dataset';
	import Canva from '../components/Canva.svelte';

	export async function load({ params, fetch, stuff }) {
		const list = await updateList({fetch});

		return {
			status: list.status,
			props: {
				dsList: list.data.dsList,
				dsImgsCount: list.data.imgsCount
			}
		};
  	}	
</script>

<script>		
	const dsImgRoot = Config.dataSetImgsRoot;
	let canva;
	let newImageLabel = 5;
	let newImageBody = '';
	let isTraining = false;
	
	export let dsList = [];
	export let dsImgsCount = 0;
	    
	const clearCanvas = () => {
	  canva.claer();
	  newImageBody = '';
	}

	const drawList = async () => {
		const ret = await updateList({fetch});
		dsList = ret?.data?.dsList || [];
		dsImgsCount = ret?.data?.imgsCount || 0;
	}
  
	const saveCanvas = async () => {
	  newImageBody = canva.getBytecode();	  
	  await create(newImageLabel, newImageBody);	  
	  canva.claer(); 
  
	  drawList();   
	}
  
	const delItem = async id => {    

	  const res = await deleteItem(id);  
  
	  if (res?.status == 200) {
		drawList();
		// console.log(dsList);
		return true;
	  }
	  
	  return false;
	}
  
	const handleTrain = async () => {    
	  isTraining = true;
	  const ret = await train();    
	  isTraining = false;    
  
	  return ret.status == 200;
	}
	
	// onMount(async () => {
	//   updateList({fetch});  
	// });

</script>

<svelte:head>
	<title>Data set</title>
	<meta name="description" content="Data set" />
</svelte:head>

<main>
<div class="newImage">    
	<Canva 
	bind:this="{canva}" 
	bind:width="{Config.canvasWidth}" 
	bind:height="{Config.canvasHeight}" 
	/>      
	<div class="newImage__controls">
	<input bind:value={newImageLabel}>      
	<button on:click={clearCanvas}>
		Clear
	</button>      
	<button on:click={saveCanvas}>
		Save
	</button>
	</div>        
</div>  
<div class="trainingBlock">
	{#if isTraining}
	<div class="training__label">
		Training...
	</div>
	{/if}
	<button on:click={handleTrain}>
		Train DNN
	</button>    
	<button on:click={handleTrain}>
		Train CNN
	</button>    
</div>

<div class="dsList">
	<div class="dsList__count">Images count: {dsImgsCount}</div>
{#each dsList as dsGroup}    
	<div class="dsRow">
	<div class="dsList__letter">
		{dsGroup.label}
	</div>
	{#each dsGroup.list as dsItem}
	<div class="dsList__img">
		<img src={`${dsImgRoot}/origin/${dsItem.img}`} alt=""/>
		<img class="img_small" src={`${dsImgRoot}/prepared/${dsItem.img}`} alt=""/>
		<span class="dsList__img--delete" on:click={() => delItem(dsItem.id)}>
		Delete
		</span>
	</div>      
	{/each}
	</div>          
{/each}
</div>
</main>
    
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
	  justify-content: space-between;
	  margin-left: 20px;
	}
	button {
	  font-size: 1em;
	  padding: .35em .5em;
	}
	.newImage__controls input {
	  font-size: 1.5em;
	  width: 70px;
	}
	.dsList {
	  margin-top: 2em;
	}
	.dsRow {
	  display: flex;
	  margin-bottom: 10px;
	}
	.dsList__count {
	  margin-bottom: 15px;
	}
	.dsList__letter {
	  font-size: 4em;    
	  padding:0 20px;
	  vertical-align: middle;
	  font-weight: bold;
	  color: dimgray;
	}
	.dsList__img {
	  position: relative;    
	  margin-right: 10px;    
	}
	  .dsList__img img {      
		width: 100px;
		height: 100px;      
		border: 1px solid #ccc;
	  }
	  .dsList__img .img_small {      
		position: absolute;
		left: 10%;
		top: 10%;
		width: auto;
		height: auto;      
	  }
	  .dsList__img--delete {
		position: absolute;
		right: 5px;
		bottom: 5px;
		color: #f00;
		cursor: pointer;
	  }
	.trainingBlock {
	  display: flex;
	  margin-top: 2em;    
	  justify-content: center;
	}
		.trainingBlock button {
			margin-right: 1rem;
		}
	.training__label {    
	  color: crimson;
	  margin-right: 1em;
	}
</style>