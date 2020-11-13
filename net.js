class PetriNet {
    _all_elements = []
    _id_counter = 0;

    get_all_elements() {
        return this._all_elements;
    }

    get_state_model() {
        let states = []
        for (let i = 0; i < this._all_elements.length; i++) {
            if (this._all_elements[i].get_type() === "place") {
                states.push(this._all_elements[i].get_tokens());
            }
        }
        return states;
    }

    add_element(element) {
        element.set_id(this._id_counter);
        this._id_counter += 1;
        this._all_elements.push(element);
    }

    get_element_by_id(id) {
        for (let i = 0; i < this._all_elements.length; i++) {
            if (this._all_elements[i].get_id() === id) {
                return this._all_elements[i];
            }
        }
        return null;
    }

    deep_clone() {
        let new_net = new PetriNet();
        let net = this;

        // copy elements
        for (let i = 0; i < net.get_all_elements().length; i++) {
            let c = net.get_all_elements()[i];

            let n_element = null;
            if (c.get_type() === "place") {
                n_element = new Place(c.get_x(), c.get_y(), new_net);
                n_element.set_tokens(c.get_tokens())
            } else {
                n_element = new Transition(c.get_x(), c.get_y(), new_net);
                n_element.set_active(c.get_active())
            }
            n_element.make();
            n_element.set_fixed();
        }

        // copy connections
        for (let i = 0; i < net.get_all_elements().length; i++) {
            let o = net.get_all_elements()[i];
            let c = new_net.get_all_elements()[i];

            for (let j = 0; j < o.get_pre().length; j++) {
                let pre = o.get_pre()[j];
                let contains_pre = false;

                for (let k = 0; k < c.get_pre().length; k++) {
                    if (c.get_pre()[k].get_id() === pre.get_id()) {
                        contains_pre = true;
                        break;
                    }
                }
                if (!contains_pre) {
                    let pre_e = new_net.get_element_by_id(pre.get_id());
                    PetriObject.add_connection(pre_e, c);
                }
            }
        }
        for (let i = 0; i < net.get_all_elements().length; i++) {
            let o = net.get_all_elements()[i];
            let c = new_net.get_all_elements()[i];

            for (let j = 0; j < o.get_post().length; j++) {
                let post = o.get_post()[j];
                let contains_post = false;

                for (let k = 0; k < c.get_post().length; k++) {
                    if (c.get_post()[k].get_id() === post.get_id()) {
                        contains_post = true;
                        break;
                    }
                }
                if (!contains_post) {
                    let post_t = new_net.get_element_by_id(post.get_id());
                    PetriObject.add_connection(c, post_t);
                }
            }
        }

        return new_net;
    }
}

class PetriObject {
    _id;
    _x;
    _y;
    _pre = [];
    _post = [];
    _movable = true;
    _graphics;
    _type;
    _parent;
    static _id_counter = 0;

    constructor(x, y, parent, add) {
        this._x = x;
        this._y = y;
        this._parent = parent;

        if (add) this._parent.add_element(this);
    }


    make() {

    }

    set_fixed() {
        this._movable = false;
    }

    get_graphics() {
        return this._graphics;
    }

    set_coordinates(x, y) {
        if (this._movable) {
            this._x = x;
            this._y = y;
            this._graphics.x = x;
            this._graphics.y = y;
        }
    }

    get_type() {
        return this._type;
    }

    get_pre() {
        return this._pre;
    }

    get_post() {
        return this._post;
    }

    get_x() {
        return this._x;
    }

    get_y() {
        return this._y;
    }

    get_id() {
        return this._id;
    }

    set_id(id){
        this._id = id;
    }

    static add_connection(pre, post) {
        pre._post.push(post)
        post._pre.push(pre)
    }

}

class Place extends PetriObject {
    _r = 20;
    _tokens = 0;

    constructor(x, y, net, add = true) {
        super(x, y, net, add);
        this._type = "place"
    }

    make() {
        let place = new createjs.Shape();
        place.graphics.setStrokeStyle(2).beginStroke('black').drawCircle(this._x, this._y, this._r);
        place.type = "place"
        place.def = this;
        stage.addChild(place);

        this._graphics = place;
    }

    add_token() {
        this._tokens += 1;
    }

    lose_token() {
        if (this._tokens > 0) {
            this._tokens -= 1;
        } else {
            throw Error("A tokenek száma nem lehet negatív!")
        }
    }

    set_tokens(i) {
        this._tokens = i;
    }

    get_tokens() {
        return this._tokens;
    }
}

class Transition extends PetriObject {
    _h = 10;
    _w = 90;
    _active = false;

    constructor(x, y, net, add = true) {
        super(x, y, net, add);
        this._type = "transition";
    }

    make() {
        let transition = new createjs.Shape();
        transition.graphics.beginFill('black').drawRect(this._x, this._y, this._h, this._w);
        transition.type = "transition";
        transition.def = this;
        stage.addChild(transition);

        this._graphics = transition;
    }

    set_active(active) {
        this._active = active;
    }

    get_active() {
        return this._active;
    }

    fire(n) {
        if (this._active)
            for (let i = 0; i < this._pre.length; i++)
                this._pre[i].lose_token()

        if(n !== null) this._post[n].add_token();
    }
}