function start(net) {
    net.set_original();
    let start_state = net.get_state_model();
    step(net, 0);

    net.load_state_model(start_state);
}

function step(net, depth) {
    if (depth > $("#depth").val()) return;

    let tabs = "";
    for (let i = 0; i < depth; i++) {
        tabs += "&emsp;"
    }
    log(tabs + "[" + net.get_state_model() + "]");

    let elements = net.get_all_elements();
    let active_transitions = [];

    // Activate all transitions
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].get_type() === "transition") {
            let active = true;
            for (let j = 0; j < elements[i].get_pre().length; j++) {
                if (elements[i].get_pre()[j].get_tokens() === 0) active = false;
            }
            elements[i].set_active(active);
            if (active) active_transitions.push(elements[i]);
        }
    }

    // create cloned "realities" and fire different transition, to different place in each
    for (let i = 0; i < active_transitions.length; i++) {
        let clone;
        if (i < active_transitions.length - 1)
            clone = net.deep_clone();
        else
            clone = net;

        let a_transition = clone.get_element_by_id(active_transitions[i].get_id());
        if (a_transition.get_post().length === 0) {
            a_transition.fire(null);
            step(clone, depth + 1);
            clone.cleanup();
        } else
            for (let j = 0; j < a_transition.get_post().length; j++) {
                let c_clone;
                if (j < a_transition.get_post().length - 1)
                    c_clone = clone.deep_clone();
                else
                    c_clone = clone;

                let aa_transition = c_clone.get_element_by_id(a_transition.get_id());
                aa_transition.fire(j);
                step(c_clone, depth + 1);
                c_clone.cleanup();
            }
        clone.cleanup();
    }
}
