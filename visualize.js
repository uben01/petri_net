// licence to: https://gojs.net/latest/samples/basic.html
// licence to: https://gojs.net/latest/samples/interactiveForce.html

function visualize_init(){
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram = $(go.Diagram, "myDiagramDiv");


    // These nodes have text surrounded by a rounded rectangle
    // whose fill color is bound to the node data.
    // The user can drag a node by dragging its TextBlock label.
    // Dragging from the Shape will start drawing a new link.
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            { locationSpot: go.Spot.Center },
            $(go.Shape, "RoundedRectangle",
                {
                    fill: "white", // the default fill, if there is no data bound value
                    portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
                    // allow all kinds of links from and to this port
                    margin:6,
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true
                },
                new go.Binding("fill", "color")),
            $(go.TextBlock,
                {
                    font: "bold 14px sans-serif",
                    stroke: '#333',
                    margin: 6,  // make some extra space for the shape around the text
                    isMultiline: false,  // don't allow newlines in text
                    editable: false  // allow in-place editing by user
                },
                new go.Binding("text", "text").makeTwoWay()),  // the label shows the node data's text
        );

    // The link shape and arrowhead have their stroke brush data bound to the "color" property
    myDiagram.linkTemplate =
        $(go.Link,
            { toShortLength: 3, relinkableFrom: false, relinkableTo: false },  // allow the user to relink existing links
            $(go.Shape,
                { strokeWidth: 2 },
                new go.Binding("stroke", "color")),
            $(go.Shape,
                { toArrow: "Standard", stroke: null },
                new go.Binding("fill", "color")),
            $(go.Panel, "Auto",
                $(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: $(go.Brush, "Radial", { 0: "rgb(240, 240, 240)", 0.3: "rgb(240, 240, 240)", 1: "rgba(240, 240, 240, 0)" }),
                        stroke: null
                    }),
                $(go.TextBlock,  // the label text
                    {
                        textAlign: "center",
                        font: "10pt helvetica, arial, sans-serif",
                        stroke: "#555555",
                        margin: 4
                    },
                    new go.Binding("text", "text"))
            )
        );

    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}

function do_visualize(nodeDataArray, linkDataArray){
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);
}