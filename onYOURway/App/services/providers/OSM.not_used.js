MarkerArray = new Array();
var Layergroup = new L.LayerGroup();

function Moveaufruf() {
  coords = map.getBounds();
  lefttop = coords.getNorthWest();
  rightbottom = coords.getSouthEast();
  XMLLaden(lefttop.lat, lefttop.lng, rightbottom.lat, rightbottom.lng);
}

function XMLLaden(lat1, lon1, lat2, lon2) {
  //Maximalen Zoom um karten ausschnitt nicht zu gross zu haben
  minzoom = 12;

  if (map.getZoom() >= minzoom) {
    $('#zoomwarnung').hide(0.4);
    $('#loading').show().effect("highlight", {}, 700);
    loadingcounter++;
    //CrossoverAPI XML request

    XMLRequestText = '( node ["vending"="public_transport_tickets"] ( ' + lat2 + ',' + lon1 + ',' + lat1 + ',' + lon2 + ' ); >; ); out;';

    //URL Codieren
    XMLRequestText = encodeURIComponent(XMLRequestText);

    RequestURL = "http://overpass-api.de/api/interpreter?data=" + XMLRequestText;
    //AJAX REQUEST

    $.ajax({
      url: RequestURL,
      type: 'GET',
      crossDomain: true,
      success: function (data) { parseOSM(data); }
      //beforeSend: setHeader
    });

  }

  else {
    //Zoom zu klein um anzuzeigen
    $('#zoomwarnung').show(1);
  }
}

function parseOSM(daten) {
  //console.log(daten);
  MarkerArray = new Array();
  CoordObj = new Object();
  Layergroup.clearLayers();

  $(daten).find('node,way').each(function () {
    EleID = $(this).attr("id");

    //Knoten
    if ($(this).attr("lat")) {
      EleLat = $(this).attr("lat");
      EleLon = $(this).attr("lon");
      EleType = "node"
      EleObj = new Object();
      EleObj["lat"] = EleLat;
      EleObj["lon"] = EleLon;
      CoordObj[EleID] = EleObj;
    }

      //Weg
    else {
      EleType = "way";
      EleCoordArrayLat = new Array();
      EleCoordArrayLon = new Array();

      $(this).find('nd').each(function () {
        NdRefID = $(this).attr("ref");
        EleCoordArrayLat.push(CoordObj[NdRefID]["lat"]);
        EleCoordArrayLon.push(CoordObj[NdRefID]["lon"]);
      });
      EleCoordArrayLat = EleCoordArrayLat.sort();
      console.log(EleCoordArrayLat);
      EleCoordArrayLon = EleCoordArrayLon.sort();
      EleLatMin = EleCoordArrayLat[0];
      EleLatArrayLenght = EleCoordArrayLat.length - 1;
      EleLatMax = EleCoordArrayLat[EleLatArrayLenght];
      EleLonMin = EleCoordArrayLon[0];
      EleLonArrayLenght = EleCoordArrayLon.length - 1;
      EleLonMax = EleCoordArrayLon[EleLonArrayLenght];

      EleLat = (EleLatMin - 0) + ((EleLatMax - EleLatMin) / 2);
      EleLon = (EleLonMin - 0) + ((EleLonMax - EleLonMin) / 2);

    }

    var EleText = "";
    var amenity = "";
    var operator = "";
    var ref = "";
    var covered = "";
    var payment_coins = "";
    var payment_electronic_purses = "";
    var payment_notes = "";
    var payment_ep_geldkarte = "";
    var payment_account_cards = "";
    var payment_debit_card = "";
    var payment_girocard = "";
    var note = "";
    var fixme = "";
    var costommarker = "";
    var level = "";
    var wheelchair = "";

    $(this).find('tag').each(function () {
      EleKey = $(this).attr("k");
      EleValue = $(this).attr("v");
      //EleText = EleText + "<b>" + EleKey + ": </b>" + EleValue + "<br/>";
      if ((EleKey == "amenity")) {
        amenity = EleValue;
      }
      if ((EleKey == "operator")) {
        operator = EleValue;
      }
      if ((EleKey == "ref")) {
        ref = EleValue;
      }
      if ((EleKey == "covered")) {
        covered = EleValue;
      }
      if ((EleKey == "payment:coins")) {
        payment_coins = EleValue;
      }
      if ((EleKey == "payment:electronic_purses")) {
        payment_electronic_purses = EleValue;
      }
      if ((EleKey == "payment:debit_cards")) {
        payment_debit_card = EleValue;
      }
      if ((EleKey == "payment:girocard")) {
        payment_girocard = EleValue;
      }
      if ((EleKey == "payment:notes")) {
        payment_notes = EleValue;
      }
      if ((EleKey == "payment:ep_geldkarte")) {
        payment_ep_geldkarte = EleValue;
      }
      if ((EleKey == "payment:account_cards")) {
        payment_account_cards = EleValue;
      }
      if ((EleKey == "note")) {
        note = EleValue;
      }
      if ((EleKey == "fixme")) {
        fixme = EleValue;
      }
      if ((EleKey == "level")) {
        level = EleValue;
      }
      if ((EleKey == "wheelchair")) {
        wheelchair = EleValue;
      }
    });


    if (amenity != "") {
      if (operator == "") operator = "<i><b>unbekannt</i></b>";
      if (payment_coins == "") payment_coins = "<i><b>unbekannt</i></b>";
      if (payment_notes == "") payment_notes = "<i><b>unbekannt</i></b>";

      //Dinge die nur angezeigt werden, wenn sie getaggt sind:
      if (payment_ep_geldkarte != "") payment_ep_geldkarte = "<tr><td>GeldKarte: </td><td>" + yesno(payment_ep_geldkarte) + "</td></tr>";
      if (payment_account_cards != "") payment_account_cards = "<tr><td>Kundenkarte: </td><td>" + yesno(payment_account_cards) + "</td></tr>";
      if (payment_electronic_purses != "") payment_electronic_purses = "<tr><td>Karte: </td><td>" + yesno(payment_electronic_purses) + "</td></tr>";
      if (payment_debit_card != "") payment_debit_card = "<tr><td>EC-Karte: </td><td>" + yesno(payment_debit_card) + "</td></tr>";
      if (payment_girocard != "") payment_girocard = "<tr><td>EC-Karte: </td><td>" + yesno(payment_girocard) + "</td></tr>";

      if (covered != "") covered = "<tr><td>Überdacht: </td><td>" + yesno(covered) + "</td></tr>";
      if (note != "") note = "<tr><td>Notiz: </td><td>" + note + "</td></tr>";
      if (fixme != "") note = "<tr><td>Fixme: </td><td>" + fixme + "</td></tr>";
      if (level != "") level = "<tr><td>Stockwerk: </td><td>" + stockwerk(level) + "</td></tr>";
      if (wheelchair != "") wheelchair = "<tr><td>Rollstuhlgeeignet: </td><td>" + yesno(wheelchair) + "</td></tr>";

      if (ref == "") ref = "<i><b>unbekannt</i></b>";

      EleText =
        "<b>Betreiber: " + operator + "</b><br>" +
        "<small>Zahlungsmöglichkeiten</small>" +
        "<div class='infoblock'><table>" +
        "<tr><td>Münzen: </td><td>" + yesno(payment_coins) + "</td></tr>" +
        "<tr><td>Scheine: </td><td>" + yesno(payment_notes) + "</td></tr>" +

        payment_ep_geldkarte +
        payment_account_cards +
        payment_electronic_purses +
        payment_debit_card +
        payment_girocard +

        "</table></div>" +
        "<div class='infoblock'><table>" +
        level +
        wheelchair +
        covered +
        "<tr><td>Automatennummer: </td><td>" + ref + "</td></tr>" +
        note +
        "</table></div>" +
        "<br><a href='#' onclick='openinJOSM(\"" + EleType + "\",\"" + EleID + "\")'>edit in JOSM</a>"
      ;

      if ($.inArray(EleID, MarkerArray) == -1) {
        var markerLocation = new L.LatLng(EleLat, EleLon);
        /*var Icon = new L.icon({
          iconUrl: "./leaflet/images/marker-icon"+costommarker+".png",
          iconSize: [25, 41],
          iconAnchor:   [12, 41],
          popupAnchor:  [0, -42]
        });*/
        var Icon = getMarkerIcon(preparseOperatorName(operator));
        var marker = new L.Marker(markerLocation, { icon: Icon });

        if (EleText != "") {
          marker.bindPopup(EleText);
        }
        Layergroup.addLayer(marker);

        MarkerArray.push(EleID);

      }

      map.addLayer(Layergroup);
    }

  });

  //Loading ausblenden
  loadingcounter--;
  if (loadingcounter == 0) {
    $("#loading").hide(0.4);
  };
}