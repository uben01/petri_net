/**
 * PetriObject types
 * @type {{TRANSITION: string, PLACE: string}}
 */
const types = {
    PLACE: 'place',
    TRANSITION: 'transition'
};

/**
 * @abstract
 * @classdesc - Defines base PetriObjects. It is abstract, ancestor of Places and Transitions
 * @typedef PetriObject
 */
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
    _name;
    _tag;

    /**
     * Sets the object's coordinates, it's parent net, and in case of {add} is true, it is added to the pooled
     * PetriObjects
     * @param {int} x
     * @param {int} y
     * @param {PetriNet} parent
     * @param {boolean} add
     */
    constructor(x, y, parent, add) {
        this._x = x;
        this._y = y;
        this._parent = parent;
        if (add) this._parent.add_element(this);
    }

    /**
     * Creates connection between two PetriObjects with different type
     * @param {PetriObject} pre
     * @param {PetriObject} post
     */
    static add_connection(pre, post) {
        pre._post.push(post)
        post._pre.push(pre)
    }

    /**
     * Abstract function, to make graphical representation for PetriObject
     */
    make() {

    }

    /**
     * Sets the object fixed. After, it cannot be moved
     */
    set_fixed() {
        this._movable = false;
    }

    /**
     * Return with the given graphical representation of the PetriObject
     * @returns {createjs.Shape}
     */
    get_graphics() {
        return this._graphics;
    }

    /**
     * Sets the PetriObject's coordinate to the given numbers
     * @param {int} x
     * @param {int} y
     */
    set_coordinates(x, y) {
        if (this._movable) {
            this._x = x;
            this._y = y;
            this._graphics.x = x;
            this._graphics.y = y;

            this._tag.x = x - 1;
            if (this._type === types.PLACE) {
                this._tag.y = y - 1;
            } else {
                this._tag.y = y - 1 + 60;
            }
        }
    }

    /**
     * Returns with the type of the PetriObject
     * @returns {types}
     */
    get_type() {
        return this._type;
    }

    /**
     * Return with the predecessors of the PetriObject
     * @returns {PetriObject[]}
     */
    get_pre() {
        return this._pre;
    }

    /**
     * Return with the successors of the PetriObject
     * @returns {PetriObject[]}
     */
    get_post() {
        return this._post;
    }

    /**
     * Returns with the x coordinate of the PetriObject
     * @returns {int}
     */
    get_x() {
        return this._x;
    }

    /**
     * Returns with the y coordinate of the PetriObject
     * @returns {int}
     */
    get_y() {
        return this._y;
    }

    /**
     * Returns with the id of the PetriObject
     * @returns {int}
     */
    get_id() {
        return this._id;
    }

    /**
     * Sets the id of the PetriObject to a given integer
     * @param {int} id
     */
    set_id(id) {
        this._id = id;
    }

    /**
     * Cleans up the PetriObject, in the end of it's lifecycle
     */
    cleanup() {
        stage.removeChild(this._graphics);
        stage.removeChild(this._tag);
        delete this._graphics;
    }

    /**
     * Generates (first time) and returns with the name of the PetriObject
     * @returns {string}
     */
    get_name() {
        if (this._name == null) {
            let before = 0
            for (let i = 0; i < this._parent.get_all_elements().length; i++) {
                if (this._parent.get_all_elements()[i]._id === this._id) {
                    if (this._type === types.PLACE) {
                        this._name = String.fromCharCode(65 + before)
                    } else {
                        this._name = "t" + before;
                    }
                } else {
                    if (this._parent.get_all_elements()[i].get_type() === this._type) before += 1;
                }
            }
        }
        return this._name;
    }

    /**
     * Creates a visual representation for the object's name
     * @param {int} x
     * @param {int} y
     * @param {string} text
     */
    put_name(x, y, text) {
        let txt = new createjs.Text(text, "18px Arial", "#ff7700");
        txt.x = x;
        txt.y = y;
        this._tag = txt;
        stage.addChild(txt);
    }

}

/**
 * Class to describe Places
 * @typedef Place
 */
class Place extends PetriObject {
    _r = 20;
    _tokens = 0;

    /**
     * Propagates all infos to the parent and sets it's type to Place
     * @param {int} x
     * @param {int} y
     * @param {PetriNet} net
     * @param {boolean} add
     */
    constructor(x, y, net, add = true) {
        super(x, y, net, add);
        this._type = types.PLACE
    }

    make() {
        let place = new createjs.Shape();
        place.graphics.setStrokeStyle(2).beginFill('#F0F0F0').beginStroke('black').drawCircle(this._x, this._y, this._r);
        place.type = types.PLACE
        place.def = this;
        stage.addChild(place);

        this.put_name(this._x - 30, this._y - 30, this.get_name());

        this._graphics = place;
    }

    /**
     * Increases the token count of the Place
     */
    add_token() {
        this._tokens += 1;
    }

    /**
     * Decreases the token count of the Place
     */
    lose_token() {
        if (this._tokens > 0) {
            this._tokens -= 1;
        } else {
            throw Error("A tokenek száma nem lehet negatív!")
        }
    }

    /**
     * Sets the token count to a given number
     * @param {int} i
     */
    set_tokens(i) {
        this._tokens = i;
    }

    /**
     * Returns with the token count of the Place
     * @returns {int}
     */
    get_tokens() {
        return this._tokens;
    }
}

/**
 * Class to describe Transitions
 * @typedef Transition
 */
class Transition extends PetriObject {
    _h = 10;
    _w = 90;
    _active = false;

    /**
     * Propagates all infos to the parent and sets it's type to Transition
     * @param {int} x
     * @param {int} y
     * @param {PetriNet} net
     * @param {boolean} add
     */
    constructor(x, y, net, add = true) {
        super(x, y, net, add);
        this._type = types.TRANSITION;
    }

    make() {
        let transition = new createjs.Shape();
        transition.graphics.beginFill('black').drawRect(this._x, this._y, this._h, this._w);
        transition.type = types.TRANSITION;
        transition.def = this;
        stage.addChild(transition);

        this.put_name(this._x - 20, this._y - 10, this.get_name());

        this._graphics = transition;
    }

    /**
     * Makes Transition active
     * @param {boolean} active
     */
    set_active(active) {
        this._active = active;
    }

    /**
     * Gets the 'active' property of the Transition
     * @returns {boolean}
     */
    get_active() {
        return this._active;
    }

    /**
     * Fires the Transition, making all the predecessors lose a token, and the successors gain one.
     */
    fire() {
        if (this._active) {
            for (let i = 0; i < this._pre.length; i++)
                this._pre[i].lose_token()

            for (let i = 0; i < this._post.length; i++)
                this._post[i].add_token();
        }
    }
}

/**
 * Class for PetriNet object
 * @typedef PetriNet
 */
class PetriNet {
    _all_elements = [];
    _id_counter = 0;
    _original = false;

    /**
     * Returns all elements under the net
     * @returns {PetriObject[]}
     */
    get_all_elements() {
        return this._all_elements;
    }

    /**
     * Returns a state model containing all places with token count
     * @returns {int[]}
     */
    get_state_model() {
        let states = []
        for (let i = 0; i < this._all_elements.length; i++) {
            if (this._all_elements[i].get_type() === types.PLACE) {
                states.push(this._all_elements[i].get_tokens());
            }
        }
        return states;
    }

    /**
     * Loads previously saved state model
     * @param {int[]} model
     */
    load_state_model(model) {
        let j = 0;
        for (let i = 0; i < this._all_elements.length; i++) {
            if (this._all_elements[i].get_type() === types.PLACE) {
                this._all_elements[i].set_tokens(model[j]);
                j += 1;
            }
        }
    }

    /**
     * Returns with an array of integers. Every integer represents how many tokens a place has.
     * @returns {int[]}
     */
    get_pretty_state_model() {
        let states = []
        for (let i = 0; i < this._all_elements.length; i++) {
            if (this._all_elements[i].get_type() === types.PLACE) {
                states.push(this._all_elements[i].get_tokens());
            }
        }
        return states;
    }

    /**
     * Adds an PetriObject to the element list
     * @param {PetriObject} element
     */
    add_element(element) {
        element.set_id(this._id_counter);
        this._id_counter += 1;
        this._all_elements.push(element);
    }

    /**
     * Returns a PetriObject with the given id
     * @param id
     * @returns {null|PetriObject}
     */
    get_element_by_id(id) {
        for (let i = 0; i < this._all_elements.length; i++) {
            if (this._all_elements[i].get_id() === id) {
                return this._all_elements[i];
            }
        }
        return null;
    }

    /**
     * Deep cloning the Petrinet
     * @returns {PetriNet}
     */
    deep_clone() {
        let new_net = new PetriNet();
        let net = this;

        // copy elements
        for (let i = 0; i < net.get_all_elements().length; i++) {
            let c = net.get_all_elements()[i];

            let n_element = null;
            if (c.get_type() === types.PLACE) {
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
                let pre_e = new_net.get_element_by_id(pre.get_id());

                PetriObject.add_connection(pre_e, c);
            }
        }
        return new_net;
    }

    /**
     * Cleans up all elements under Petrinet
     */
    cleanup() {
        if (this._original) return;
        for (let i = 0; i < this._all_elements.length; i++) {
            this._all_elements[i].cleanup();
            delete this._all_elements[i];
        }
        this._all_elements = [];
        delete this;
    }

    /**
     * Sets the Petrinet to the "original". It cannot be cleaned-up
     */
    set_original() {
        this._original = true;
    }
}