import Config from '/src/config.js';	

const apiUrl = Config.apiUrl;
const dsUrl = `${apiUrl}/dataset`;  
const headers = {        
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',        
                    'Content-Type': 'application/json',
                    'credentials': 'same-origin',
                    'mode': 'no-cors',
                };  	

export const updateList = async ({fetch}) => {
    const response = await fetch(dsUrl);
    const json = await response.json();
    const data = json?.status == 'ok' ? json?.data : [];
    const imgsCount = data.length;
    const indexLetterMap = new Map();
    const dsList = data.reduce((acc, curr) => {       
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
    return {
        status: response.status,
        data: {
            dsList,
            imgsCount
        }
    };
    //return dsList;
    // console.log(dsList);  
}

export const create = async (label, img) => {    
    const response = await fetch(dsUrl, {
        method: 'POST',            
        headers,                              
        body: JSON.stringify({
          label,
          img
        })
    });

    const json = await response.json();   

    return {
        status: response.status,
        data: {
            json
        }
    };
}

export const deleteItem = async id => {    
    const response = await fetch(`${dsUrl}/${id}`, {
                              method: 'DELETE',
                              headers
                          });

    const json = await response.json();    

    return {
        status: response.status,
        data: {
            json
        }
    };
}

export const train = async () => {    
    const response = await fetch(`${apiUrl}/neural-network/train`, {
        method: 'POST',            
        headers                              
    });
    const json = await response.json();    

    return {
        status: response.status,
        data: {
            json
        }
    };
}

export const trainCNN = async () => {    
    const response = await fetch(`${apiUrl}/neural-network/train-cnn`, {
        method: 'POST',            
        headers                              
    });
    const json = await response.json();    

    return {
        status: response.status,
        data: {
            json
        }
    };
}