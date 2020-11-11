class Petri {
    x;
    y;
    pre = [];
    post = [];
    movable = true;
    graphics;
    type;

    static all_elements = []

    constructor(x, y, add) {
        this.x = x;
        this.y = y;

        if (add) Petri.all_elements.push(this)
    }

    make() {

    }

    set_fixed() {
        this.movable = false;
    }

    static add_connection(pre, post) {
        pre.post.push(post)
        post.pre.push(pre)
    }

    get_graphics() {
        return this.graphics;
    }

    set_coordinates(x, y) {
        if (this.movable) {
            this.x = x;
            this.y = y;
            this.graphics.x = x;
            this.graphics.y = y;
        }
    }

    get_type() {
        return this.type;
    }
}

class Place extends Petri {
    r = 20;
    tokens = 0;

    constructor(x, y, add = true) {
        super(x, y, add);
        this.type = "place"
    }

    make() {
        let place = new createjs.Shape();
        place.graphics.setStrokeStyle(2).beginStroke('black').drawCircle(this.x, this.y, this.r);
        place.type = "place"
        place.def = this;
        stage.addChild(place);

        this.graphics = place;
    }

    add_token() {
        this.tokens += 1;
    }

    get_tokens(){
        return this.tokens;
    }
}

class Transition extends Petri {
    h = 10;
    w = 90;
    active = false;

    constructor(x, y, add = true) {
        super(x, y, add);
        this.type = "transition";
    }

    make() {
        let transition = new createjs.Shape();
        transition.graphics.beginFill('black').drawRect(this.x, this.y, this.h, this.w);
        transition.type = "transition";
        transition.def = this;
        stage.addChild(transition);

        this.graphics = transition;
    }
}