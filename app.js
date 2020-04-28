// Initial Map 
const map = new ol.Map({
    target: 'map-container',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([77.1025, 28.7041]), // initial location set to delhi
        zoom: 2
    })
});

const startBtn = document.getElementById('start'); // Button to start trail generation
const source = new ol.source.Vector();
const layer = new ol.layer.Vector({
    source: source
});

startBtn.addEventListener('click', startTrailing); // event

function startTrailing() {
    map.addLayer(layer);

    // removing footer text
    document.querySelector('.footer-text').remove();

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function (pos) {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            const accuracy = new ol.geom.Polygon(coords, pos.coords.accuracy);
    
            // adding location trail
            const div = document.createElement('div');
            div.className = 'alert alert-info';
            div.innerHTML = `<strong>Latitude:</strong> ${pos.coords.latitude} <strong>Longitude:</strong> ${pos.coords.longitude} <strong>Date/Time:</strong> ${Date()}`;
            document.querySelector('.card-footer').insertBefore(div, document.querySelector('.alert'));
    
            source.clear(true);
            source.addFeatures([
                new ol.Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
                new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(coords)))
            ]);
    
            if (!source.isEmpty()) {
                map.getView().fit(source.getExtent(), {
                    maxZoom: 16,
                    duration: 500
                });
            }
            
        }, function (error) {
            const div = document.createElement('div');
            div.className = 'alert alert-danger mt-3';
            div.innerHTML = `ERROR: ${error.message} Please refresh and start again.`;
            document.querySelector('.card-body').append(document.querySelector('.map-container'), div);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000
        });
    
        // Locate button on map
        const locate = document.createElement('div');
        locate.className = 'ol-control ol-unselectable locate';
        locate.innerHTML = '<button id="locate" title="Locate me">◎</button>';
        locate.addEventListener('click', function () {
            if (!source.isEmpty()) {
                map.getView().fit(source.getExtent(), {
                    maxZoom: 16,
                    duration: 500
                });
            }
        });
        map.addControl(new ol.control.Control({
            element: locate
        }));
    } else {
        alert('Geolocation not supported in this browser.');
    }
    
}
