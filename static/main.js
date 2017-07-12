var rangeSlider = require('leaflet-range')

var map = L.map('mapid').setView([35.8, -86], 7);
var mapboxAccessToken = 'pk.eyJ1Ijoia2lyc3RlbmxqIiwiYSI6ImNqMzYyMWUyeDAzNnMzM3BsZHV6anMzMmsifQ.hSSPRndJwiLJLkjnLJ1bVQ'
var tnData = require('./density_over_time.json')
var geojson;
var currentYear = 2015


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
    attribution: ''
}).addTo(map);


function getColor(d) {
    return d > 100000 ? '#800026' :
           d > 85000  ? '#BD0026' :
           d > 60000  ? '#E31A1C' :
           d > 45000  ? '#FC4E2A' :
           d > 30000   ? '#FD8D3C' :
           d > 15000   ? '#FEB24C' :
           d > 0   ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density[currentYear]),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

/*
* On Hover 
*/

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>TN Senior Population Density</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.density[currentYear] + ' people / mi<sup>2</sup>'
        : 'Hover over a state');
};

info.addTo(map);



/*
 * Legend
*/

var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 15000, 35000, 45000 , 60000, 85000 , 100000]
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

/*
* Range Slider
*/

var slider = L.control.range({
    position: 'topright',
    min: 2015,
    max: 2020,
    value: 2015,
    step: 1,
    orient: 'horizontal',
    iconClass: 'none'
});

slider.on('input change', function(e) {
    currentYear = e.value

    document.getElementById('current-year').textContent = currentYear
    geojson = L.geoJson(tnData, {style: style, onEachFeature: onEachFeature}).addTo(map);

});

map.addControl(slider);

var range = document.getElementsByClassName('leaflet-range-control')[0]
range.classList.remove('leaflet-bar');
range.classList.add('info');

var headerNode = document.createElement('h4');
headerNode.textContent = 'Year'

var node = document.createElement('p');
node.setAttribute("id", "current-year");
node.textContent = currentYear

range.insertBefore(node, range.firstChild);
range.insertBefore(headerNode, range.firstChild);

geojson = L.geoJson(tnData, {style: style, onEachFeature: onEachFeature}).addTo(map);