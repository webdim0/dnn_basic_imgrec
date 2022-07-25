<script>
  import Config from '../config.js';
  import Canva from '../components/Canva.svelte';    
  import { onMount } from "svelte";

  const apiUrl = Config.apiUrl;
  const dsUrl = `${apiUrl}/dataset`;  
  const dsImgRoot = Config.dataSetImgsRoot;
  const headers = {        
                      'Accept': 'application/json',
                      'X-Requested-With': 'XMLHttpRequest',        
                      'Content-Type': 'application/json',
                      'credentials': 'same-origin',
                      'mode': 'no-cors',
                  };

  let canva;
  let newImageLabel = 5;
  let newImageBody = '';
  let isTraining = false;
  
  let dsList = [];
  let dsImgsCount = 0;

  const updateList = async () => {
    const response = await fetch(dsUrl);
    const json = await response.json();
    const data = json?.status == 'ok' ? json?.data : [];
    dsImgsCount = data.length;
    const indexLetterMap = new Map();
    dsList = data.reduce((acc, curr) => {       
      // console.log(acc);
      const label = parseInt(curr.value);
      if (indexLetterMap.has(label)) {        
          acc[indexLetterMap.get(label)].list.push(curr);        
      } else {
        indexLetterMap.set(label, acc.length);
        acc.push({label : label, list: [curr]});        
      }      
      return acc;
    }, []);   
    dsList.sort((a, b) => parseInt(a.label) - parseInt(b.label));
    // console.log(dsList);  
  }

  const clearCanvas = () => {
    canva.claer();
    newImageBody = '';
  }

  const saveCanvas = async () => {
    newImageBody = canva.getBytecode();
    const response = await fetch(dsUrl, {
                              method: 'POST',            
                              headers,                              
                              body: JSON.stringify({
                                label: newImageLabel,
                                img: newImageBody           
                              })
                          });

    const json = await response.json();

    canva.claer(); 

    updateList();

    return json?.status == 'ok';       
  }

  const deleteItem = async id => {    
    const response = await fetch(`${dsUrl}/${id}`, {
                              method: 'DELETE',
                              headers
                          });

    const json = await response.json();    

    if (json?.status == 'ok') {
      updateList();
      return true;
    }
    
    return false;
  }

  const handleTrain = async () => {    
    isTraining = true;
    const response = await fetch(`${apiUrl}/neural-network/train`, {
                          method: 'POST',            
                          headers                              
                      });
    const json = await response.json();    
    isTraining = false;    

    return json?.status == 'ok';       
  }
  
  onMount(async () => {
    updateList();  
  });
</script>

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
  <div class="newImage">
    {#if isTraining}
    <div class="training__label">
      Training...
    </div>
    {/if}
    <button on:click={handleTrain}>
      Train network
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
        <span class="dsList__img--delete" on:click={() => deleteItem(dsItem.id)}>
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
  .training__label {    
    color: crimson;
    margin-right: 1em;
  }
</style>
