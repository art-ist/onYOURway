define([
  'services/tell',
  'services/map/mapAdapter'
], function (tell, map) {

    var cmk = config.apiKey.cloudmade;
    var lrk = config.apiKey.lyrk;
    var licence = {
        ODbL: { name: 'ODbl', longName: 'Open Data Commons - Open Database License', uri: 'http://opendatacommons.org/licenses/odbl' },
        cc_by_3: { name: 'CC BY 3.0', longName: 'Creative Commons - Attribution 3.0', uri: 'http://creativecommons.org/licenses/by/3.0' },
        cc_by_sa_2: { name: 'CC BY-SA 2.0', longName: 'Creative Commons - Attribution-ShareAlike 2.0', uri: 'http://creativecommons.org/licenses/by-sa/2.0' },
        lyrk: { name: '© Lytk, 2014', longName: 'Design © Lyrk UG, 2014', uri: 'https://geodienste.lyrk.de/copyright' }
    };
    var attrib = function (tiles, lic) {
        return 'Framework: <a href="https://github.com/art-ist/onYOURway">onYOURway</a>'
            + '<br/>Locations: <a href="http://onYOURway.at">onYOURway (Preview/Testdata only)</a>'
            + '<br/>Map Engine: <a href="http://leafletjs.com">Leaflet</a>'
            + '<br/>Map Tiles: ' + tiles + ' under <a href="' + lic.uri + '" title="' + lic.longName + '">' + lic.name + '</a>'
            + '<br/>Map Data: <a href="http://www.openstreetmap.org/about">OpenStreetMap</a> under <a href="' + licence.ODbL.uri + '" title="' + licence.ODbL.longName + '">' + licence.ODbL.name + '</a>'
        ;
    };

    var self = {
        activeLayer: ko.observable(),
        tileLayers: [
				//lyrk
				{ Name: 'Standard', Layer: new L.TileLayer('http://tiles.lyrk.org/ls/{z}/{x}/{y}?apikey=' + lrk, { attribution: attrib('<a href="https://geodienste.lyrk.de/">Lyrk</a>', licence.lyrk), maxZoom: 18 }) },
				{ Name: 'Standard (HD)', Layer: new L.TileLayer('http://tiles.lyrk.org/lr/{z}/{x}/{y}?apikey=' + lrk, { attribution: attrib('<a href="https://geodienste.lyrk.de/">Lyrk</a>', licence.lyrk), maxZoom: 18 }) },
				//Stamen Design
				{ Name: 'Toner-Lite', Layer: new L.TileLayer('http://b.tile.stamen.com/toner-lite/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://stamen.com">Stamen Design</a>', licence.cc_by_3), maxZoom: 18 }) },
				{ Name: 'Watercolor', Layer: new L.TileLayer('http://b.tile.stamen.com/watercolor/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://stamen.com">Stamen Design</a>', licence.cc_by_3), maxZoom: 18 }) },
				//OSM
				//{ Name: 'OSM Graustufen', Layer: new L.TileLayer('http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://www.openstreetmap.org/about">OpenStreetMap</a>', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) },
				//{ Name: 'OSM Unbeschriftet', Layer: new L.TileLayer('http://{s}.www.toolserver.org/tiles/osm-no-labels/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://www.openstreetmap.org/about">OpenStreetMap</a>', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) },
				{ Name: 'OSM Standard', Layer: new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://www.openstreetmap.org/about">OpenStreetMap</a>', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) },
				{ Name: 'Hydda', Layer: new L.TileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', { attribution: attrib('Tiles courtesy of <a href="http://openstreetmap.se">OpenStreetMap Sweden</a>', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) },
				{ Name: 'OpenRiverboatMap', Layer: new L.TileLayer('http://{s}.tile.openstreetmap.fr/openriverboatmap/{z}/{x}/{y}.png', { attribution: attrib('OpenRiverboatMap', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) },
				//others
				//'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png'; subdomains = '1234'; //MapQuest
				//{ Name: 'Sat', Layer: new L.TileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png', { attribution: attrib('MapQuest', licence.cc_by_sa_2), maxZoom: 11, subdomains: '1234' }) }, //MapQuest.Sat (no tiles for detailed zoom)
				//'http://{s}.tiles.mapbox.com/v3/' + 'examples.map-zr0njcqy' + '/{z}/{x}/{y}.png'; //MapBox
				{ Name: 'OpenCycleMap', Layer: new L.TileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://www.opencyclemap.org/docs">OpenCycleMap</a>', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) },
				{ Name: 'Transport', Layer: new L.TileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png', { attribution: attrib('<a href="http://www.opencyclemap.org/docs">OpenCycleMap</a>', licence.cc_by_sa_2), maxZoom: 18, subdomains: 'abc' }) }
        ],

        setTileLayer: setTileLayer
    };
    return self;

    function setTileLayer(index) {
        var oldLayer = self.activeLayer();
        var newLayer = self.tileLayers[index];
        map.replaceLayer(oldLayer && oldLayer.Layer, newLayer.Layer);
        self.activeLayer(newLayer);
    }

});
