let nodeDataArray;
let linkDataArray;
let index;

/**
 * This function starts the chain reaction of the data processing. Nullifying the two arrays needed to pass to the
 * visualization and the index counter. It saves the starting state, and loading it in the end, so the simulation can
 * be redone.
 *
 * Then calls the step function, with the initial parameters (depth: 0; trans_fired: null; parent: -1)
 *
 * In the end, the state load and visualization function is called.
 * @param {PetriNet} net
 */
function start(net) {
    nodeDataArray = []
    linkDataArray = []
    index = 0;

    let start_state = net.get_state_model();

    step(net, 0, null, -1);
    net.load_state_model(start_state);

    do_visualize(nodeDataArray, linkDataArray);
}

/**
 * The main function of the program.
 *
 * First it checks if the recursion depth reached the given number. If so, then stops the event chain for this branch.
 *
 * If the state gets through it is registered to nodeDataArray (describing from-to relations). If the current state is
 * already in the array, the parent gets connected via trans_fired to the given state in linkDataArray. If it's not in
 * the array, a new connection is made from the parent to the current index via trans_fired. Then the actual state node
 * is created to nodeDataArray.
 *
 * Then all the active transitions are checked, and for every active transition a new state model is created. (Not for
 * every. The last will go with the current state for memory and process time save.)
 *
 * Then in those states, the chosen transition will fire, and recursively call the step function again, with the newly
 * created state.
 *
 * Upon it's return a cleanup is done, so the alternative states won't interrupt the workflow or take unnecessary space
 * in memory.
 *
 * @param {PetriNet} net_state - The inspected PetriNet state
 * @param {int} depth - The current depth of recursion
 * @param {Transition} trans_fired - The transition fired, to get to this state
 * @param {int} parent - The id of the net state, called us
 */
function step(net_state, depth, trans_fired, parent) {
    if (depth > $("#depth").val()) return;

    // check if it is already in object
    let txt = net_state.get_pretty_state_model().join(' ');
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

    // saving the current index, for parenting purposes
    index += 1;
    let i_index = index;

    // registering from (parent) to (this) relation via trans_fired
    if (parent !== -1) {
        linkDataArray.push({
            from: parent,
            to: index,
            text: trans_fired.get_name()
        });
    }

    // registering the actual node
    nodeDataArray.push({
        key: index,
        text: txt
    });

    let elements = net_state.get_all_elements();
    let active_transitions = [];

    // De/activate all transitions and save the active ones to a list
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].get_type() === types.TRANSITION) {
            let active = true;
            for (let j = 0; j < elements[i].get_pre().length; j++) {
                let multiplier = elements[i].get_pre().filter(x => x === elements[i].get_pre()[j]).length

                if (elements[i].get_pre()[j].get_tokens() < multiplier) active = false;
            }
            elements[i].set_active(active);
            if (active) active_transitions.push(elements[i]);
        }
    }

    // create cloned state models for every different transition fired
    for (let i = 0; i < active_transitions.length; i++) {
        let clone;
        if (i < active_transitions.length - 1)
            clone = net_state.deep_clone();
        else
            clone = net_state;

        let a_transition = clone.get_element_by_id(active_transitions[i].get_id());
        a_transition.fire();
        step(clone, depth + 1, a_transition, i_index);
        clone.cleanup();
    }
}
