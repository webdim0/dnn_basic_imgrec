<script>
  import { Router, Route, Link } from "svelte-routing";
  import Home from "./pages/Home.svelte";
  import Dataset from "./pages/Dataset.svelte";
  
  export let url = ""; //This property is necessary declare to avoid ignore the Router
  
  function getProps({ location, href, isPartiallyCurrent, isCurrent }) {
    const isActive = href === "/" ? isCurrent : isPartiallyCurrent || isCurrent;

    // The object returned here is spread on the anchor element's attributes
    if (isActive) {
      return { class: "active" };
    }
    return {};
  }
</script>

<main>
  <Router url="{url}">
    <nav>
      <Link to="/" getProps="{getProps}">Home</Link>
      <Link to="ds" getProps="{getProps}">Dataset</Link>      
    </nav>
    <div>              
      <Route path="/"><Home /></Route>
      <Route path="ds"><Dataset /></Route>
    </div>
  </Router>
</main>

<style>  
</style>
