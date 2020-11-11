class PetriNet {
    _all_elements = []

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
        this._all_elements.push(element);
    }
}

class PetriObject {
    _x;
    _y;
    _pre = [];
    _post = [];
    _movable = true;
    _graphics;
    _type;
    _parent;

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
}