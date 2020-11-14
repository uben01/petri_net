var stage = new createjs.Stage('myCanvas');

var net = new PetriNet();
net.set_original();

var lineDraw_mode = false;
var token_mode = false;
var firstPoint = null;

let log = function (msg) {
    $("#logger").append("<br>" + msg);
}

/**
 * This function is called upon a click on a toolbar element. It is cloning the clicked object
 * and placing it to the stage. After doing so two event handlers are set. One for moving the object (upon pressmove),
 * one for placing tokens nad making connections (upon click)
 * @param evt
 */
let toolbar_clone = function (evt) {
    let clone;
    if (evt.target.def.get_type() === types.PLACE) {
        clone = new Place(evt.target.def.get_x(), evt.target.def.get_y(), net);
    } else {
        clone = new Transition(evt.target.def.get_x(), evt.target.def.get_y(), net);
    }
    clone.make();
    stage.update();

    let graphics = clone.get_graphics()

    evt.currentTarget = graphics;
    evt.currentTarget.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};

    graphics.on("pressmove", toolbar_clone_interact);
    graphics.on("click", cloned_element_interact);
}

/**
 * If the lineDraw and token modes are disabled, the function tries to set the object's coordinates to the cursor's.
 * It might fail, in case of the element is already fixed (being clicked on by connection or token tool).
 * @param evt
 */
let toolbar_clone_interact = function (evt) {
    if (!lineDraw_mode && !token_mode) {
        evt.currentTarget.def.set_coordinates(evt.stageX + evt.currentTarget.offset.x, evt.stageY + evt.currentTarget.offset.y)
        stage.update();
    }
}

/**
 * This function makes the element fixed (not movable) in case of token or connection mode activated.
 *
 * If token_mode is activated and the clicked object is a Place, it will gain a token and visualize the new token.
 *
 * If the lineDraw_mode is active, on the first element clicked the function will save it. In case of the second element
 * the types are checked. If they are the same, the user will get an error on the state and nothing will happen, the
 * first element is still in memory.
 * In case of different types being connected, a line will be shown between the two spots clicked, and a PetriObject
 * connection will be made. It means first object will gain a post connection and the second object gains a pre.
 * After, the first object relation will be nullified, and the connection making can continue.
 *
 * @param evt
 */
let cloned_element_interact = function (evt) {
    if (token_mode) {
        evt.currentTarget.def.set_fixed();
        if (evt.currentTarget.def.get_type() === types.PLACE) {
            evt.currentTarget.def.add_token();
            let token = new createjs.Shape();
            token.graphics.beginFill('black').drawCircle(evt.stageX, evt.stageY, 5);
            stage.addChild(token);

            stage.update();
        }
    } else if (lineDraw_mode) {
        evt.currentTarget.def.set_fixed();
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

/**
 * It is fired, when the document load is finished.
 *
 * The 0th step is to initialize the visual effects, making an empty graph painter.
 *
 * First, the manual title is made toggleable, then the start button gains it's powers.
 *
 * After, the toolbar is defined. The place and transition is made and put in the stage. Then connection and token
 * toolbars alike.
 *
 * The first two gain an event listener, so they can be cloned upon clicked. The other two just activates their modes
 * and prints it on the logger.
 *
 * Last another event listener for key 'Escape'. It will shut down both connection and token modes.
 *
 * In the end, stage is updated, to show all the changes we've made!
 */
$(document).ready(function () {
    visualize_init();

    let manual = $("#manual")
    let manual_title = $("#manual_title")

    manual_title.on('click', function () {
        manual.slideToggle();
    });

    let btn = $("#start");
    btn.on('click', function () {
        start(net);
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
    place_toolbar.get_graphics().on("mousedown", toolbar_clone);
    transition_toolbar.get_graphics().on("mousedown", toolbar_clone);

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