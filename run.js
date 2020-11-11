function onRunPressed(){
    let elements = Petri.all_elements;
    // Activate all transitions
    for (let i = 0; i < elements.length; i++){
        if(elements[i] === "transition"){
            let active = true;
            for(let j = 0; j < elements[i].pre.length; j++){
                if(elements[i].pre[j].tokens === 0){
                    active = false;
                }
            }
            elements[i].active = active
        }
    }
}
