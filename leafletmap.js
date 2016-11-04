/*global L */
/*global S */
/*global console */

/*************************************************************
    The options for the map view use tilejson as detailed in
    https://github.com/mapbox/tilejson-spec/tree/master/2.1.0
**************************************************************/
var tilespecification = {
    tilejson:   "2.1.0",
    name:       "compositing",
    description: "A simple, light grey world.",
    version:    "1.0.0",
    attribution:'&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    template:   "{{#__teaser__}}{{NAME}}{{/__teaser__}}",
    legend:     "Dangerous zones are red, safe zones are green",
    scheme:     "xyz",
    tiles:      [ "http://{s}.tile.osm.org/{z}/{x}/{y}.png" ],
    grids:      [ "http://localhost:8888/admin/1.0.0/broadband/{z}/{x}/{y}.grid.json" ],
    data:       [ "http://ktp.dev.purplegroup.com/data/m33_5.geojson" ],

    minzoom:    0,
    maxzoom:    25,
    bounds:     [[50.801759, -1.110911], [50.801867, -1.110074]],
    center:     [ 50.80181, -1.11036, 21 ]
};


var tileoptions = {
    attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    tiles:      [ "http://{s}.tile.osm.org/{z}/{x}/{y}.png" ],
    data:       [ "m33_5.geojson" ],
    minzoom:    0,
    maxzoom:    25,
    bounds:     [[50.801759, -1.110911], [50.801867, -1.110074]],
    center:     [ 50.80181, -1.11036, 21 ]
};


/*************************************************************
    maptile
**************************************************************/
function maptile(mapId, tilejson) {

    var osm,
        map;

    osm = L.tileLayer(tilejson.tiles[0], {
        maxZoom: tilejson.maxzoom,
        attribution: tilejson.attribution
    });

    /* Set initial map view */
    //map = L.map(mapId, {center: [tilejson.center[0], tilejson.center[1]], zoom: tilejson.center[2]});

    // initialize the map on the "maith a given center and zoom
    map = L.map(mapId).setView([tilejson.center[0], tilejson.center[1]], tilejson.center[2]).addLayer(osm);


    return map;

} /* maptile */


/*************************************************************
    Create the map and set the image overlay
**************************************************************/
var map = maptile('map', tileoptions);
var image = L.imageOverlay('http://electronicshed.co.uk/MAAP/images/deckplan.jpg', tileoptions.bounds).addTo(map);

var locationelements = $.ajax({url: tileoptions.data[0], dataType: 'json', async: false});


/*************************************************************
    Add geoJson data to the layer
**************************************************************/
var markerLayer = L.geoJson(locationelements.responseJSON, {

    onEachFeature: function onEachFeature(feature, layer) {

        if (feature.properties && feature.properties.popupContent) {
            layer.bindPopup(feature.properties.popupContent);
        }
    },

    filter: function (feature, layer) {
        if (feature.properties.Deck === 2) {
            return true;
        }
        else {
            return false;
        }
    }

}).addTo(map);





/*************************************************************
    Set up the leaflet drawing
**************************************************************/
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Set the title to show on the polygon button
L.drawLocal.draw.toolbar.buttons.polygon = 'Draw a polygon!';

var drawControl = new L.Control.Draw({
    position: 'topright',
    draw: {
        polyline: false,
        polygon: true,
        circle: false,
        marker: true
    },
    edit: {
        featureGroup: drawnItems,
        remove: true
    }
});
map.addControl(drawControl);

map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if (type === 'marker') {
        layer.bindPopup('A popup!');
    }

    drawnItems.addLayer(layer);
});

map.on('draw:edited', function (e) {
    var layers = e.layers;
    var countOfEditedLayers = 0;
    layers.eachLayer(function(layer) {
        countOfEditedLayers++;
    });
    console.log("Edited " + countOfEditedLayers + " layers");
});

L.DomUtil.get('changeColor').onclick = function () {
    drawControl.setDrawingOptions({ rectangle: { shapeOptions: { color: '#004a80' } } });
};
