var stage = new createjs.Stage('myCanvas');

var net = new PetriNet();

var lineDraw_mode = false;
var token_mode = false;
var firstPoint = null;

let log = function (msg) {
    $("#logger").append("<br>" + msg);
}

let toolbar_clone = function (evt) {
    let clone;
    if (evt.target.def.get_type() === "place") {
        clone = new Place(evt.target.def.get_x(), evt.target.def.get_y(), net);
    } else {
        clone = new Transition(evt.target.def.get_x(), evt.target.def.get_y(), net);
    }
    clone.make();

    let graphics = clone.get_graphics()

    evt.currentTarget = graphics;

    evt.currentTarget.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
    graphics.on("pressmove", toolbar_clone_interact);
    graphics.on("click", cloned_element_interact);
}

let toolbar_clone_interact = function (evt) {
    if (!lineDraw_mode && !token_mode) {
        evt.currentTarget.def.set_coordinates(evt.stageX + evt.currentTarget.offset.x, evt.stageY + evt.currentTarget.offset.y)
        stage.update();
    }
}

let cloned_element_interact = function (evt) {
    evt.currentTarget.def.set_fixed();
    if (token_mode) {
        evt.currentTarget.def.add_token();
        let token = new createjs.Shape();
        token.graphics.beginFill('black').drawCircle(evt.stageX, evt.stageY, 5);
        stage.addChild(token);

        stage.update();
    } else if (lineDraw_mode) {
        if (firstPoint == null) {
            firstPoint = evt.currentTarget;
            firstPoint.l_x = evt.stageX;
            firstPoint.l_y = evt.stageY;
        } else {
            if (evt.target.def.get_type() === firstPoint.def.get_type()) {
                log("A ki és bemenet típusa megegyezik!")
                return;
            }
            let connection = new createjs.Shape();
            connection.graphics.setStrokeStyle(2)
                .beginStroke('black')
                .moveTo(firstPoint.l_x, firstPoint.l_y)
                .lineTo(evt.stageX, evt.stageY)
                .endStroke()
                .beginFill("red")
                .drawPolyStar(evt.stageX, evt.stageY, 8, 3)
                .endFill();
            stage.addChild(connection);

            PetriObject.add_connection(firstPoint.def, evt.target.def);

            firstPoint = null;
            stage.update();
        }
    }
};

$(document).ready(function () {
    var btn = $("#run");
    btn.on('click', function () {
        step(net);
    });

    // Define toolbars
    let place_toolbar = new Place(30, 30, net, false);
    place_toolbar.make()

    let transition_toolbar = new Transition(25, 70, net, false);
    transition_toolbar.make()

    let connection_toolbar = new createjs.Shape();
    connection_toolbar.graphics.setStrokeStyle(5)
        .beginStroke('black')
        .moveTo(15, 190)
        .lineTo(50, 190)
        .lineTo(40, 180)
        .moveTo(50, 190)
        .lineTo(40, 200)
        .endStroke();
    stage.addChild(connection_toolbar);

    let token_toolbar = new createjs.Shape();
    token_toolbar.graphics.beginFill('black').drawCircle(30, 230, 5);
    stage.addChild(token_toolbar);

    // Add toolbar event listeners
    place_toolbar.get_graphics().on("click", toolbar_clone);
    transition_toolbar.get_graphics().on("click", toolbar_clone);

    // Line click - global draw
    connection_toolbar.on("click", function () {
        lineDraw_mode = true;
        log("Vonalrajzolási mód aktiválva!")
    });

    // Token click
    token_toolbar.on("click", function () {
        token_mode = true;
        log("Token mód aktiválva!")
    });

    // Escape -- global draw/token modes ends
    $(document).keyup(function (evt) {
        if (evt.key === "Escape") {
            lineDraw_mode = false;
            token_mode = false;
            firstPoint = null;
            log("Vonalrajzolási mód deaktiválva!")
            log("Token mód deaktiválva!")
        }
    });
    stage.update();
})