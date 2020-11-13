let nodeDataArray = []
let linkDataArray = []
let index = 0;
let objects = [];

function start(net) {
    net.set_original();
    let start_state = net.get_state_model();
    for (let i = 0; i < net.get_all_elements(); i++) {
        if (net.get_all_elements()[i].get_type() === types.PLACE) {
            objects.push(net.get_all_elements()[i].get_name());
        }
    }

    step(net, 0, null, -1);
    net.load_state_model(start_state);

    do_visualize(nodeDataArray, linkDataArray);
}

function step(net, depth, trans_fired, parent) {
    if (depth > $("#depth").val()) return;

    // check if it is already in object
    let txt = net.get_pretty_state_model().join(' ');
    for (let i = 0; i < nodeDataArray.length; i++) {
        if (nodeDataArray[i].text === txt) {
            linkDataArray.push({
                from: parent,
                to: nodeDataArray[i].key,
                text: trans_fired.get_name()
            });
            return;
        }
    }

    // do the stuff
    index += 1;
    let i_index = index;

    if (parent !== -1) {
        linkDataArray.push({
            from: parent,
            to: index,
            text: trans_fired.get_name()
        });
    }

    nodeDataArray.push({
        key: index,
        text: txt
    });

    let elements = net.get_all_elements();
    let active_transitions = [];

    // Activate all transitions
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].get_type() === types.TRANSITION) {
            let active = true;
            for (let j = 0; j < elements[i].get_pre().length; j++) {
                if (elements[i].get_pre()[j].get_tokens() === 0) active = false;
            }
            elements[i].set_active(active);
            if (active) active_transitions.push(elements[i]);
        }
    }

    // create cloned "realities" and fire different transition
    for (let i = 0; i < active_transitions.length; i++) {
        let clone;
        if (i < active_transitions.length - 1)
            clone = net.deep_clone();
        else
            clone = net;

        let a_transition = clone.get_element_by_id(active_transitions[i].get_id());
        a_transition.fire();
        step(clone, depth + 1, a_transition, i_index);
        clone.cleanup();
    }
}
