function step(net, depth = 0) {
    let elements = net.get_all_elements();
    // Activate all transitions
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].get_type() === "transition") {
            let active = true;
            for (let j = 0; j < elements[i].get_pre().length; j++) {
                if (elements[i].get_pre()[j].get_tokens() === 0) active = false;
            }
            elements[i].set_active(active)
        }
    }
    log("(" + net.get_state_model() + ")")
}
