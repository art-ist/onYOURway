/// <reference path="app.js" />
/// <reference path="logger.js" />
/// <reference path="platform.js" />
/// <reference path="geoUtils.js" />
/// <reference path="../_libraries/durandal/plugins/router.js" />
/// <reference path="providers/routing-yours.js" />
define([
  'services/app',
  'services/tell',
  'services/platform',
  'services/geoUtils',
  'plugins/router',
  'providers/routing-yours',
  'providers/geocode-nominatim'
], function (app, tell, platform, geoUtils, router, routingProvider, geocodingProvider) {

	// serviceUri is route to the Web API controller
	var locateDataService = new breeze.DataService({
		serviceName: config.host + '/api/locate',
		hasServerMetadata: false  // don't ask the server for metadata (as we'll load it from location.metadata)
	});
	var locateMetadata = new breeze.MetadataStore(); //see: http://www.breezejs.com/documentation/naming-convention
	var locateContext = new breeze.EntityManager({
		dataService: locateDataService,
		metadataStore: locateMetadata
	});

	// add basic auth header to breeze calls
	//var ajaxAdapter = breeze.config.getAdapterInstance("ajax");
	//ajaxAdapter.defaultSettings = {
	//  beforeSend: function (xhr, settings) {
	//    xhr.setRequestHeader("Authorization", 'Basic ' + authentication.token);
	//  }
	//};

	// JSON proxy for NOT-CORS-enabled cross domain calls
	var proxy = 'JP.aspx?u=';

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

	var location = {
		map: null,
		//get current Metadata from /api/locate/Metadata
		metadata: JSON.stringify({ "?xml": { "version": "1.0", "encoding": "utf-8" }, "schema": { "namespace": "onYOURwayModel", "alias": "Self", "p1:UseStrongSpatialTypes": "false", "xmlns:annotation": "http://schemas.microsoft.com/ado/2009/02/edm/annotation", "xmlns:p1": "http://schemas.microsoft.com/ado/2009/02/edm/annotation", "xmlns": "http://schemas.microsoft.com/ado/2009/11/edm", "cSpaceOSpaceMapping": "[[\"onYOURwayModel.Card\",\"onYOURway.Models.Card\"],[\"onYOURwayModel.ShoppingList\",\"onYOURway.Models.ShoppingList\"],[\"onYOURwayModel.UserProfile\",\"onYOURway.Models.UserProfile\"],[\"onYOURwayModel.BikeWay\",\"onYOURway.Models.BikeWay\"],[\"onYOURwayModel.LocationForeignId\",\"onYOURway.Models.LocationForeignId\"],[\"onYOURwayModel.Partner\",\"onYOURway.Models.Partner\"],[\"onYOURwayModel.ProductSuggestion\",\"onYOURway.Models.ProductSuggestion\"],[\"onYOURwayModel.Region\",\"onYOURway.Models.Region\"],[\"onYOURwayModel.RegionAlias\",\"onYOURway.Models.RegionAlias\"],[\"onYOURwayModel.RegionView\",\"onYOURway.Models.RegionView\"],[\"onYOURwayModel.Tag\",\"onYOURway.Models.Tag\"],[\"onYOURwayModel.TagName\",\"onYOURway.Models.TagName\"],[\"onYOURwayModel.TransportLine\",\"onYOURway.Models.TransportLine\"],[\"onYOURwayModel.TransportStop\",\"onYOURway.Models.TransportStop\"],[\"onYOURwayModel.Membership\",\"onYOURway.Models.Membership\"],[\"onYOURwayModel.OAuthMembership\",\"onYOURway.Models.OAuthMembership\"],[\"onYOURwayModel.Role\",\"onYOURway.Models.Role\"],[\"onYOURwayModel.Location\",\"onYOURway.Models.Location\"],[\"onYOURwayModel.MyLocation\",\"onYOURway.Models.MyLocation\"],[\"onYOURwayModel.Street\",\"onYOURway.Models.Street\"],[\"onYOURwayModel.LocationLink\",\"onYOURway.Models.LocationLink\"],[\"onYOURwayModel.LocationAlias\",\"onYOURway.Models.LocationAlias\"],[\"onYOURwayModel.Country\",\"onYOURway.Models.Country\"],[\"onYOURwayModel.HasTag\",\"onYOURway.Models.HasTag\"],[\"onYOURwayModel.SearchSuggestion\",\"onYOURway.Models.SearchSuggestion\"],[\"onYOURwayModel.Place\",\"onYOURway.Models.Place\"]]", "entityContainer": { "name": "onYOURwayEntities", "p1:LazyLoadingEnabled": "false", "entitySet": [{ "name": "Cards", "entityType": "onYOURwayModel.Card" }, { "name": "ShoppingLists", "entityType": "onYOURwayModel.ShoppingList" }, { "name": "UserProfiles", "entityType": "onYOURwayModel.UserProfile" }, { "name": "BikeWays", "entityType": "onYOURwayModel.BikeWay" }, { "name": "LocationForeignIds", "entityType": "onYOURwayModel.LocationForeignId" }, { "name": "Partners", "entityType": "onYOURwayModel.Partner" }, { "name": "ProductSuggestions", "entityType": "onYOURwayModel.ProductSuggestion" }, { "name": "Regions", "entityType": "onYOURwayModel.Region" }, { "name": "RegionAlias1", "entityType": "onYOURwayModel.RegionAlias" }, { "name": "RegionViews", "entityType": "onYOURwayModel.RegionView" }, { "name": "Tags", "entityType": "onYOURwayModel.Tag" }, { "name": "TagNames", "entityType": "onYOURwayModel.TagName" }, { "name": "TransportLines", "entityType": "onYOURwayModel.TransportLine" }, { "name": "TransportStops", "entityType": "onYOURwayModel.TransportStop" }, { "name": "Memberships", "entityType": "onYOURwayModel.Membership" }, { "name": "OAuthMemberships", "entityType": "onYOURwayModel.OAuthMembership" }, { "name": "Roles", "entityType": "onYOURwayModel.Role" }, { "name": "Locations", "entityType": "onYOURwayModel.Location" }, { "name": "MyLocations", "entityType": "onYOURwayModel.MyLocation" }, { "name": "Streets", "entityType": "onYOURwayModel.Street" }, { "name": "LocationLinks", "entityType": "onYOURwayModel.LocationLink" }, { "name": "LocationAliases", "entityType": "onYOURwayModel.LocationAlias" }, { "name": "Countries", "entityType": "onYOURwayModel.Country" }, { "name": "HasTags", "entityType": "onYOURwayModel.HasTag" }], "associationSet": [{ "name": "FK_my_Card_UserProfile", "association": "onYOURwayModel.FK_my_Card_UserProfile", "end": [{ "role": "UserProfile", "entitySet": "UserProfiles" }, { "role": "Card", "entitySet": "Cards" }] }, { "name": "FK_my_ShoppingList_UserProfile", "association": "onYOURwayModel.FK_my_ShoppingList_UserProfile", "end": [{ "role": "UserProfile", "entitySet": "UserProfiles" }, { "role": "ShoppingList", "entitySet": "ShoppingLists" }] }, { "name": "FK_oyw_ForeignId_Partner", "association": "onYOURwayModel.FK_oyw_ForeignId_Partner", "end": [{ "role": "Partner", "entitySet": "Partners" }, { "role": "LocationForeignId", "entitySet": "LocationForeignIds" }] }, { "name": "FK_oyw_RegionAlias_Region", "association": "onYOURwayModel.FK_oyw_RegionAlias_Region", "end": [{ "role": "Region", "entitySet": "Regions" }, { "role": "RegionAlia", "entitySet": "RegionAlias1" }] }, { "name": "FK_oyw_RegionView_Region", "association": "onYOURwayModel.FK_oyw_RegionView_Region", "end": [{ "role": "Region", "entitySet": "Regions" }, { "role": "RegionView", "entitySet": "RegionViews" }] }, { "name": "FK_oyw_TagAlias_Tag", "association": "onYOURwayModel.FK_oyw_TagAlias_Tag", "end": [{ "role": "Tag", "entitySet": "Tags" }, { "role": "TagName", "entitySet": "TagNames" }] }, { "name": "TagIsA", "association": "onYOURwayModel.TagIsA", "end": [{ "role": "Tag", "entitySet": "Tags" }, { "role": "Parent", "entitySet": "Tags" }] }, { "name": "FK_oyw_ForeignId_Location", "association": "onYOURwayModel.FK_oyw_ForeignId_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "LocationForeignId", "entitySet": "LocationForeignIds" }] }, { "name": "FK_oyw_ProductSuggestion_Location", "association": "onYOURwayModel.FK_oyw_ProductSuggestion_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "ProductSuggestion", "entitySet": "ProductSuggestions" }] }, { "name": "FK_my_Location_UserProfile1", "association": "onYOURwayModel.FK_my_Location_UserProfile1", "end": [{ "role": "UserProfile", "entitySet": "UserProfiles" }, { "role": "Location1", "entitySet": "MyLocations" }] }, { "name": "FK_oyw_LocationLink_Location", "association": "onYOURwayModel.FK_oyw_LocationLink_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "LocationLink", "entitySet": "LocationLinks" }] }, { "name": "FK_oyw_LocationAlias_Location", "association": "onYOURwayModel.FK_oyw_LocationAlias_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "LocationAlia", "entitySet": "LocationAliases" }] }, { "name": "LocationHasTag", "association": "onYOURwayModel.LocationHasTag", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "HasTag", "entitySet": "HasTags" }] }, { "name": "TagHasTag", "association": "onYOURwayModel.TagHasTag", "end": [{ "role": "Tag", "entitySet": "Tags" }, { "role": "HasTag", "entitySet": "HasTags" }] }], "functionImport": [{ "name": "SearchSuggestions", "returnType": "Collection(onYOURwayModel.SearchSuggestion)", "parameter": [{ "name": "regionId", "mode": "In", "type": "Edm.Int32" }, { "name": "Lang", "mode": "In", "type": "Edm.String" }] }, { "name": "GetPlaces", "returnType": "Collection(onYOURwayModel.Place)", "parameter": [{ "name": "RegionId", "mode": "In", "type": "Edm.Int32" }, { "name": "Lang", "mode": "In", "type": "Edm.String" }] }, { "name": "GetTaxonomy", "returnType": "Collection(String)", "parameter": [{ "name": "idSet", "mode": "In", "type": "Edm.String" }, { "name": "lang", "mode": "In", "type": "Edm.String" }] }] }, "entityType": [{ "name": "Card", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false" }, { "type": "Edm.Int64", "name": "LocationId" }, { "type": "Edm.Int32", "name": "TagId" }], "navigationProperty": { "name": "UserProfile", "relationship": "onYOURwayModel.FK_my_Card_UserProfile", "fromRole": "Card", "toRole": "UserProfile" } }, { "name": "ShoppingList", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false" }, { "type": "Edm.Int64", "name": "LocationId" }, { "type": "Edm.String", "name": "Item", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Boolean", "name": "Checked", "nullable": "false" }], "navigationProperty": { "name": "UserProfile", "relationship": "onYOURwayModel.FK_my_ShoppingList_UserProfile", "fromRole": "ShoppingList", "toRole": "UserProfile" } }, { "name": "UserProfile", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "UserName", "nullable": "false", "maxLength": "56", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "FirstName", "maxLength": "50", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "LastName", "maxLength": "50", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Email", "nullable": "false", "maxLength": "100", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Card", "relationship": "onYOURwayModel.FK_my_Card_UserProfile", "fromRole": "UserProfile", "toRole": "Card" }, { "name": "ShoppingList", "relationship": "onYOURwayModel.FK_my_ShoppingList_UserProfile", "fromRole": "UserProfile", "toRole": "ShoppingList" }, { "name": "Locations", "relationship": "onYOURwayModel.FK_my_Location_UserProfile1", "fromRole": "UserProfile", "toRole": "Location1" }] }, { "name": "BikeWay", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Geography", "name": "Way" }, { "type": "Edm.String", "name": "Mode", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }] }, { "name": "LocationForeignId", "key": { "propertyRef": [{ "name": "LocationId" }, { "name": "PartnerId" }] }, "property": [{ "type": "Edm.Int64", "name": "LocationId", "nullable": "false" }, { "type": "Edm.String", "name": "PartnerId", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "ForeignId", "maxLength": "100", "fixedLength": "false", "unicode": "false" }], "navigationProperty": [{ "name": "Partner", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Partner", "fromRole": "LocationForeignId", "toRole": "Partner" }, { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Location", "fromRole": "LocationForeignId", "toRole": "Location" }] }, { "name": "Partner", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.String", "name": "Id", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Website", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": { "name": "LocationForeignIds", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Partner", "fromRole": "Partner", "toRole": "LocationForeignId" } }, { "name": "ProductSuggestion", "key": { "propertyRef": [{ "name": "Item" }, { "name": "UsageCount" }] }, "property": [{ "type": "Edm.Int64", "name": "LocationId" }, { "type": "Edm.String", "name": "Item", "nullable": "false", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Int64", "name": "UsageCount", "nullable": "false" }], "navigationProperty": { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_ProductSuggestion_Location", "fromRole": "ProductSuggestion", "toRole": "Location" } }, { "name": "Region", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Website", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.Int64", "name": "OsmRelationId" }, { "type": "Edm.Int32", "name": "CreatedBy", "nullable": "false" }, { "type": "Edm.DateTime", "name": "CreatedAt", "nullable": "false", "precision": "2" }, { "type": "Edm.Int32", "name": "ModifiedBy" }, { "type": "Edm.DateTime", "name": "ModifiedAt", "precision": "2" }, { "type": "Edm.Geography", "name": "Boundary" }], "navigationProperty": [{ "name": "Aliases", "relationship": "onYOURwayModel.FK_oyw_RegionAlias_Region", "fromRole": "Region", "toRole": "RegionAlia" }, { "name": "Views", "relationship": "onYOURwayModel.FK_oyw_RegionView_Region", "fromRole": "Region", "toRole": "RegionView" }] }, { "name": "RegionAlias", "key": { "propertyRef": [{ "name": "RegionId" }, { "name": "Lang" }, { "name": "Name" }] }, "property": [{ "type": "Edm.Int64", "name": "RegionId", "nullable": "false" }, { "type": "Edm.String", "name": "Lang", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Website", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": { "name": "Region", "relationship": "onYOURwayModel.FK_oyw_RegionAlias_Region", "fromRole": "RegionAlia", "toRole": "Region" } }, { "name": "RegionView", "key": { "propertyRef": [{ "name": "RegionId" }, { "name": "ViewId" }] }, "property": [{ "type": "Edm.Int64", "name": "RegionId", "nullable": "false" }, { "type": "Edm.Int32", "name": "ViewId", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Int32", "name": "ListOrder", "nullable": "false" }, { "type": "Edm.Geography", "name": "Boundary" }], "navigationProperty": { "name": "Region", "relationship": "onYOURwayModel.FK_oyw_RegionView_Region", "fromRole": "RegionView", "toRole": "Region" } }, { "name": "Tag", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int32", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Type", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "CssClass", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Icon", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Values", "fixedLength": "false", "unicode": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "ForeignId", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": [{ "name": "Names", "relationship": "onYOURwayModel.FK_oyw_TagAlias_Tag", "fromRole": "Tag", "toRole": "TagName" }, { "name": "Children", "relationship": "onYOURwayModel.TagIsA", "fromRole": "Tag", "toRole": "Parent" }, { "name": "Parents", "relationship": "onYOURwayModel.TagIsA", "fromRole": "Parent", "toRole": "Tag" }, { "name": "Locations", "relationship": "onYOURwayModel.TagHasTag", "fromRole": "Tag", "toRole": "HasTag" }] }, { "name": "TagName", "key": { "propertyRef": [{ "name": "TagId" }, { "name": "Lang" }, { "name": "Name" }] }, "property": [{ "type": "Edm.Int32", "name": "TagId", "nullable": "false" }, { "type": "Edm.String", "name": "Lang", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "name": "Show", "type": "Edm.Boolean", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Tag", "relationship": "onYOURwayModel.FK_oyw_TagAlias_Tag", "fromRole": "TagName", "toRole": "Tag" } }, { "name": "TransportLine", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Ref", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "From", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "To", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Mode", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Network", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Operator", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Color", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.Geography", "name": "Way" }] }, { "name": "TransportStop", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "LineIds", "nullable": "false", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Geography", "name": "Position" }] }, { "name": "Membership", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int32", "name": "UserId", "nullable": "false" }, { "type": "Edm.DateTime", "name": "CreateDate", "precision": "3" }, { "type": "Edm.String", "name": "ConfirmationToken", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Boolean", "name": "IsConfirmed" }, { "type": "Edm.DateTime", "name": "LastPasswordFailureDate", "precision": "3" }, { "type": "Edm.Int32", "name": "PasswordFailuresSinceLastSuccess", "nullable": "false" }, { "type": "Edm.String", "name": "Password", "nullable": "false", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.DateTime", "name": "PasswordChangedDate", "precision": "3" }, { "type": "Edm.String", "name": "PasswordSalt", "nullable": "false", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "PasswordVerificationToken", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.DateTime", "name": "PasswordVerificationTokenExpirationDate", "precision": "3" }] }, { "name": "OAuthMembership", "key": { "propertyRef": [{ "name": "Provider" }, { "name": "ProviderUserId" }] }, "property": [{ "type": "Edm.String", "name": "Provider", "nullable": "false", "maxLength": "30", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "ProviderUserId", "nullable": "false", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Int32", "name": "UserId", "nullable": "false" }] }, { "name": "Role", "key": { "propertyRef": { "name": "RoleId" } }, "property": [{ "type": "Edm.Int32", "name": "RoleId", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "RoleName", "nullable": "false", "maxLength": "256", "fixedLength": "false", "unicode": "true" }] }, { "name": "Location", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Lang", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Country", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Province", "maxLength": "3", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "City", "maxLength": "50", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Zip", "maxLength": "10", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Street", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "HouseNumber", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Phone", "maxLength": "100", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.Int32", "name": "CreatedBy", "nullable": "false" }, { "type": "Edm.DateTime", "name": "CreatedAt", "nullable": "false", "precision": "2" }, { "type": "Edm.Int32", "name": "ModifiedBy" }, { "type": "Edm.DateTime", "name": "ModifiedAt", "precision": "2" }, { "type": "Edm.Geography", "name": "Position" }, { "name": "Icon", "type": "Edm.String", "maxLength": "50", "fixedLength": "false", "unicode": "true" }, { "name": "OpeningHours", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Type", "type": "Edm.String", "nullable": "false", "maxLength": "10", "fixedLength": "false", "unicode": "false" }], "navigationProperty": [{ "name": "ForeignIds", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Location", "fromRole": "Location", "toRole": "LocationForeignId" }, { "name": "ProductSuggestions", "relationship": "onYOURwayModel.FK_oyw_ProductSuggestion_Location", "fromRole": "Location", "toRole": "ProductSuggestion" }, { "name": "Links", "relationship": "onYOURwayModel.FK_oyw_LocationLink_Location", "fromRole": "Location", "toRole": "LocationLink" }, { "name": "Aliases", "relationship": "onYOURwayModel.FK_oyw_LocationAlias_Location", "fromRole": "Location", "toRole": "LocationAlia" }, { "name": "Tags", "relationship": "onYOURwayModel.LocationHasTag", "fromRole": "Location", "toRole": "HasTag" }] }, { "name": "MyLocation", "key": { "propertyRef": [{ "name": "UserId" }, { "name": "LocationId" }] }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false" }, { "type": "Edm.Int64", "name": "LocationId", "nullable": "false" }, { "type": "Edm.Int32", "name": "ListOrder" }], "navigationProperty": { "name": "UserProfile", "relationship": "onYOURwayModel.FK_my_Location_UserProfile1", "fromRole": "Location1", "toRole": "UserProfile" } }, { "name": "Street", "key": { "propertyRef": [{ "name": "RegionId" }, { "name": "Name" }] }, "property": [{ "name": "RegionId", "type": "Edm.Int64", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "Way", "type": "Edm.Geography" }] }, { "name": "LocationLink", "key": { "propertyRef": [{ "name": "Id" }, { "name": "LocationId" }] }, "property": [{ "name": "Id", "type": "Edm.Int64", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "name": "LocationId", "type": "Edm.Int64", "nullable": "false" }, { "name": "Lang", "type": "Edm.String", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "name": "Tag", "type": "Edm.String", "nullable": "false", "maxLength": "30", "fixedLength": "false", "unicode": "true" }, { "name": "URL", "type": "Edm.String", "nullable": "false", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_LocationLink_Location", "fromRole": "LocationLink", "toRole": "Location" } }, { "name": "LocationAlias", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "LocationId", "type": "Edm.Int64", "nullable": "false" }, { "name": "Lang", "type": "Edm.String", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "Id", "type": "Edm.Int64", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }], "navigationProperty": { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_LocationAlias_Location", "fromRole": "LocationAlia", "toRole": "Location" } }, { "name": "Country", "key": { "propertyRef": { "name": "ID" } }, "property": [{ "name": "ID", "type": "Edm.Int32", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "name": "OBJECTID", "type": "Edm.Int64" }, { "name": "NAME", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "ISO3", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "ISO2", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "FIPS", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "COUNTRY1", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "ENGLISH", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "FRENCH", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "SPANISH", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "LOCAL", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "FAO", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "WAS_ISO", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "SOVEREIGN", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "CONTINENT", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "UNREG1", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "UNREG2", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "EU", "type": "Edm.Int32" }, { "name": "SQKM", "type": "Edm.Single" }, { "name": "geom", "type": "Edm.Geography" }] }, { "name": "HasTag", "key": { "propertyRef": [{ "name": "LocationId" }, { "name": "TagId" }] }, "property": [{ "name": "LocationId", "type": "Edm.Int64", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "name": "TagId", "type": "Edm.Int32", "nullable": "false" }], "navigationProperty": [{ "name": "Location", "relationship": "onYOURwayModel.LocationHasTag", "fromRole": "HasTag", "toRole": "Location" }, { "name": "Tag", "relationship": "onYOURwayModel.TagHasTag", "fromRole": "HasTag", "toRole": "Tag" }] }], "association": [{ "name": "FK_my_Card_UserProfile", "end": [{ "type": "Edm.onYOURwayModel.UserProfile", "role": "UserProfile", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.Card", "role": "Card", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "UserProfile", "propertyRef": { "name": "UserId" } }, "dependent": { "role": "Card", "propertyRef": { "name": "UserId" } } } }, { "name": "FK_my_ShoppingList_UserProfile", "end": [{ "type": "Edm.onYOURwayModel.UserProfile", "role": "UserProfile", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.ShoppingList", "role": "ShoppingList", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "UserProfile", "propertyRef": { "name": "UserId" } }, "dependent": { "role": "ShoppingList", "propertyRef": { "name": "UserId" } } } }, { "name": "FK_oyw_ForeignId_Partner", "end": [{ "type": "Edm.onYOURwayModel.Partner", "role": "Partner", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationForeignId", "role": "LocationForeignId", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Partner", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationForeignId", "propertyRef": { "name": "PartnerId" } } } }, { "name": "FK_oyw_RegionAlias_Region", "end": [{ "type": "Edm.onYOURwayModel.Region", "role": "Region", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.RegionAlias", "role": "RegionAlia", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Region", "propertyRef": { "name": "Id" } }, "dependent": { "role": "RegionAlia", "propertyRef": { "name": "RegionId" } } } }, { "name": "FK_oyw_RegionView_Region", "end": [{ "type": "Edm.onYOURwayModel.Region", "role": "Region", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.RegionView", "role": "RegionView", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Region", "propertyRef": { "name": "Id" } }, "dependent": { "role": "RegionView", "propertyRef": { "name": "RegionId" } } } }, { "name": "FK_oyw_TagAlias_Tag", "end": [{ "type": "Edm.onYOURwayModel.Tag", "role": "Tag", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.TagName", "role": "TagName", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Tag", "propertyRef": { "name": "Id" } }, "dependent": { "role": "TagName", "propertyRef": { "name": "TagId" } } } }, { "name": "TagIsA", "end": [{ "type": "Edm.onYOURwayModel.Tag", "role": "Tag", "multiplicity": "*" }, { "type": "Edm.onYOURwayModel.Tag", "role": "Parent", "multiplicity": "*" }] }, { "name": "FK_oyw_ForeignId_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationForeignId", "role": "LocationForeignId", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationForeignId", "propertyRef": { "name": "LocationId" } } } }, { "name": "FK_oyw_ProductSuggestion_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "0..1" }, { "type": "Edm.onYOURwayModel.ProductSuggestion", "role": "ProductSuggestion", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "ProductSuggestion", "propertyRef": { "name": "LocationId" } } } }, { "name": "FK_my_Location_UserProfile1", "end": [{ "type": "Edm.onYOURwayModel.UserProfile", "role": "UserProfile", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.MyLocation", "role": "Location1", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "UserProfile", "propertyRef": { "name": "UserId" } }, "dependent": { "role": "Location1", "propertyRef": { "name": "UserId" } } } }, { "name": "FK_oyw_LocationLink_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationLink", "role": "LocationLink", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationLink", "propertyRef": { "name": "LocationId" } } } }, { "name": "FK_oyw_LocationAlias_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationAlias", "role": "LocationAlia", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationAlia", "propertyRef": { "name": "LocationId" } } } }, { "name": "LocationHasTag", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.HasTag", "role": "HasTag", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "HasTag", "propertyRef": { "name": "LocationId" } } } }, { "name": "TagHasTag", "end": [{ "type": "Edm.onYOURwayModel.Tag", "role": "Tag", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.HasTag", "role": "HasTag", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Tag", "propertyRef": { "name": "Id" } }, "dependent": { "role": "HasTag", "propertyRef": { "name": "TagId" } } } }], "complexType": [{ "name": "SearchSuggestion", "property": [{ "type": "Edm.String", "name": "Class", "nullable": "false", "maxLength": "8" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200" }] }, { "name": "Place", "property": [{ "type": "Edm.String", "name": "T", "nullable": "false", "maxLength": "7" }, { "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "true", "maxLength": "200" }, { "type": "Edm.String", "name": "Alias", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Street", "nullable": "true", "maxLength": "200" }, { "type": "Edm.String", "name": "HouseNumber", "nullable": "true", "maxLength": "20" }, { "type": "Edm.String", "name": "Zip", "nullable": "true", "maxLength": "10" }, { "type": "Edm.String", "name": "City", "nullable": "true", "maxLength": "50" }, { "type": "Edm.String", "name": "Position", "nullable": "true" }, { "type": "Edm.String", "name": "Icon", "nullable": "true", "maxLength": "50" }, { "type": "Edm.String", "name": "Tags", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Links", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Lines", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Open", "nullable": "true", "maxLength": "Max" }] }] } }),

		settings: {
			mode: ko.observable("bicycle"), //supported: bicycle, foot, car  //TODO: add multi, public
			//Map Styling
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
			walkIn5: 330,   //meters in 5 minutes at 4 km/h
			bikeIn5: 1800,  //meters in 5 minutes at 21,6 km/h
			clusterLocations: ko.observable(false),
			zoomToSearchResults: ko.observable(true),
			mapPadding: { top: 50, right: 30, bottom: 20, left: 30 }, //px
			autoPan: ko.observable(true),

			showMap: ko.observable('auto'),
			showList: ko.observable('auto'),
			showDetails: ko.observable('auto'),
			showVeilOfSilence: true,
			showPointer: true,
			showIndicator: true,

			routeColor: '#0067a3',

			forceMap: false,
			disableDetails: false,
			maxSelectedItems: 5
		},

		regions: ko.observableArray(),
		region: ko.observable(),        //selected region
		views: ko.observableArray(),
		locations: ko.observableArray(),
		mapLocations: ko.observableArray(),
		searchSuggestions: ko.observableArray(),
		searchSuggestionObjects: ko.observableArray(),
		tags: ko.observableArray(),
		getTaxonomy: getTaxonomy,
		getCountries: getCountries,

		selectedItem: ko.observable(), //current location
		selectedItems: ko.observableArray(), //last selected locations (max: settings.maxSelectedItems)

		siteCollectorMode: ko.observable(), // boolean - if true, smaller map and possible to select a new location in the map by clicking or moving the siteCollectorMarker
		siteCollectorCoords: ko.observable(), // if siteCollectorMode is true: coordinates of the siteCollectorMarker

		searchFor: ko.observable(),
		featuredIf: ko.observableArray([
		  { Name: ko.observable('Bio'), Selected: new ko.observable(true) },
		  { Name: ko.observable('FairTrade'), Selected: new ko.observable(true) },
		  { Name: ko.observable('aus der Region'), Selected: new ko.observable(false) },
		  { Name: ko.observable('Eigenproduktion'), Selected: new ko.observable(false) }
		]),
		sortBy: ko.observable(),
		sortOptions: [
		  { Name: 'nach Entfernung, offene zuerst', Sorter: sortOpenThenByDistance },
		  { Name: 'nach Entfernung, hervorgehobene zuerst', Sorter: sortFeaturedThenByDistance },
		  { Name: 'nach Entfernung', Sorter: sortByDistance },
		  { Name: 'nach Name', Sorter: sortByName },
		],

		context: locateContext,
		loactionToEdit: ko.observable(null),
		getLocation: getLocation,
		editLocation: editLocation,
		baseMap: {
			open: baseMapOpenOsm,
			edit: baseMapEditOsm,
			about: baseMapAboutOsm
		},

		//position: new ko.observable(),
		route: {
			start: {
				text: ko.observable(),
				coords: ko.observable(),
				marker: null
			},
			end: {
				text: ko.observable(),
				coords: ko.observable(),
				marker: null
			},
			geometry: [],
			instructions: [],
			distance: null,
			duration: null
		},
		when: ko.observable(new Date()),

		//--Layergroups:
		layers: {
			tileLayer: ko.observable(null),
			routeLayer: null,
			fiveMinutesInidcatorLayer: null,
			transportLayer: null,
			bikeLayer: null,
			locationLayer: null,
			pointerLayer: null,
			editLayer: null
		},

		//methods
		initializeMap: initializeMap,
		loadRegionFeatures: loadRegionFeatures,

		setTileLayer: setTileLayer,
		setMode: setMode,

		search: search,
		showByTagName: showByTagName,
		locate: locate,

		getCurrentPosition: getCurrentPosition,
		itemClick: itemClick,
		drawMarkers: drawMarkers,

		setView: setView,
		drawPointer: _drawPointer,
		panIntoView: _panMap,

		toggleMap: toggleMap,
		toggleList: toggleList,
		toggleDetails: toggleDetails

	}; //var location

	//#region Constructor 

	location.sortBy(location.sortOptions[0]);

	location.sortBy.subscribe(function (newValue) {
		location.mapLocations(location.mapLocations().sort(newValue.Sorter));
	});

	initializeMetadata();

	//#endregion Constructor 
	return location;

	//#region Initializer
	function initializeMetadata() {
		//Fetch Metadata, add COMPUTED PROPERTIES and LOAD DATA
		//locateContext.fetchMetadata()
		//  .then(function () {
		locateMetadata.importMetadata(location.metadata);
		tell.log('metadata loaded', 'location');

		//Extensions for computed Properties (see: http://stackoverflow.com/questions/17323290/accessing-notmapped-computed-properties-using-breezejs-and-angularjs)
		var Location = function () {
			this.kind = "";
			this.tags = [];
			this.open = [];
		};

		var myLocationInit = function (myLocation) {
			//myLocation.rawTags = ko.observableArray();
		};

		locateMetadata.registerEntityTypeCtor("Location:#onYOURway.Models", Location, myLocationInit);
	}

	function initializeMap(containerId) {
		tell.log('[location] Initializing Map', 'location', containerId);

		//create map
		var map = L.map(containerId, { attributionControl: false });
		//L.control.attribution({
		//	position: 'bottomleft',
		//	prefix: false
		//}).addTo(map);

		location.map = map;

		//register eventhandlers for map
		map.on({
			'move': function () {
				_drawPointer();
			},
			'click': function (event) {
				if (location.siteCollectorMode()) {
					_setSiteCollectorMarker(event.latlng, true);
				}
			}
		});

		// update siteCollectorMarker when changing the siteCollectorCoords
		location.siteCollectorCoords.subscribe(_setSiteCollectorMarker);

		// disable siteCollectorMarker when closing the siteCollector
		location.siteCollectorMode.subscribe(function (val) {
			if (val === false && location.siteCollectorMarker) {
				location.map.removeLayer(location.siteCollectorMarker);
				location.siteCollectorMarker = undefined;
			}
		});

		//register eventhandlers for list
		var list = $('#locationList');
		list.scroll(function () {
			_drawPointer();
		});

		//load tile layer
		setTileLayer(0);

		//getCurrentPosition();

		//get regions
		_loadRegions(map);

		//get locations and search suggestions
		loadRegionFeatures();

		//  })
		//  .fail(function (err) {
		//  	tell.log('matadata could not be requested:' + err.message, 'location');
		//  })
		//;

		//_showTransport(map);

		/* define and hook up the eventhandlers */
		//map.on('click', function (e) {
		//  location.showMessage('Map klicked at ' + JSON.stringify(e.latlng), 'Map Event');
		//});
	} //initializeMap

	function loadRegionFeatures() {
		//TODO: change to "loadRegionFeatures"
		//_loadLocations(map);
		_loadPlaces();

		//get SearchSuggestions (maybe reintegrate with loadLocations into loadRegionFeatures)
		_loadSearchSuggestions();
	}

	//#endregion Initializer

	//#region Private Members

	function _getLocationIcon(loc, selected) {
		return L.AwesomeMarkers.icon({
			icon: loc.Icon ? loc.Icon() : null,
			prefix: 'fa',
			markerColor: selected ? "cadetblue"
								  : loc.isFeatured() ? "green"
								  : "orange"
		});
	} //_getLocationIcon

	function _drawVeilOfSilence(map, regions) {
		if (!location.settings.showVeilOfSilence) return;
		var bounds = [
		  L.GeoJSON.coordsToLatLngs([[90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]])
		];
		for (var i = 0; i < regions.length; i++) {
			var wkt = regions[i].Boundary().Geography.WellKnownText;
			var coords = geoUtils.wktToCoords(wkt);
			var latLngs = L.GeoJSON.coordsToLatLngs(coords);
			bounds.push(latLngs);
		}
		//overlay-pane
		var mPoly = L.polygon(bounds, {
			color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#000000", fillOpacity: 0.15, clickable: false
			//color: "#ff7800", weight: 2, smoothFactor: 2.0, fillColor: "#ffffff", fillOpacity: 1, clickable: false
		});
		mPoly.addTo(map);
	} //_drawVeilOfSilence

	//function _itemMouseOver() { }
	//function _itemMouseOut() { }

	/** 
     *  function _setSiteCollectorMarker is subscribed
     *   - as click-handler for the map during map initialization (only if location.siteCollectorMode is active)
     *   - to the siteCollectorCoords observable
     * @method  _setSiteCollectorMarker
     * @param {object} geo The geolocation
     * @param {boolean} [updateCoords=false] if true, update the siteCollectoreCoords observable
     */
	function _setSiteCollectorMarker(geo, updateCoords) {
		if (!location.siteCollectorMarker) {
			// create new marker, if none exists
			location.siteCollectorMarker = L.marker(geo.coords ? [geo.coords[1], geo.coords[0]] : geo, {
				dragable: true,
				prefix: "fa",
				title: "New Entry",
				icon: _getLocationIcon(false, true)
			});
			location.siteCollectorMarker.addTo(location.map);
			location.siteCollectorMarker.dragging.enable();
			location.siteCollectorMarker.on("dragend", function () {
				location.siteCollectorCoords(location.siteCollectorMarker.getLatLng());
			});
		} else {
			location.siteCollectorMarker.setLatLng(geo.coords ? [geo.coords[1], geo.coords[0]] : geo);
		}
		if (updateCoords) {
			location.siteCollectorCoords(location.siteCollectorMarker.getLatLng());
		}
		_panMap(location.siteCollectorMarker);
		return location.siteCollectorMarker;
	}

	function _drawPointer(mode) { //draws a pointer to connect the listitem of the selected venture with its marker
		var map = location.map;
		if (location.layers.pointerLayer) { //remove a previously drawn pointer
			map.removeLayer(location.layers.pointerLayer);
		}
		if (!location.settings.showPointer  //disabled in settings
		   || (mode && mode === 'hide')       //drawing-mode hide 
		   || !location.selectedItem()        //no item selected
		   || !location.selectedItem().marker //selected item has no marker
		   || !location.settings.showList()   //list not visible
		   || !location.settings.showMap()    //map not visible
		) { return; } // don't display marker -> done after hiding

		var $listItem = $('#' + location.selectedItem().Id());
		if ($listItem.length === 0) return; //dom element for selectesd item not found -> run away (after hiding ;)
		var $list = $('#locationList');
		var $map = $('#map');

		var offset = 8;
		var height = 15;
		var pointerOptions = {
			className: 'oyw-map-pointer',
			weight: null,
			color: null,
			opacity: null,
			fillColor: null,
			fillOpacity: null,
			zIndexOffset: 9999
		};
		var top = $listItem.offset().top + offset - $map.offset().top;
		var left = $list.position().left + $listItem.position().left;
		var pointer = new L.polygon([
		  map.containerPointToLatLng([left, top]),
		  map.containerPointToLatLng([left, top + height]),
		  location.selectedItem().marker.getLatLng(),
		], pointerOptions);
		location.layers.pointerLayer = pointer;
		map.addLayer(pointer);
	} //_drawPointer

	function _setMarker(group, marker, loc) {
		if (!loc.coords) return;

		var add = !marker ? true : false;
		if (add) {
			marker = new L.Marker({ prefix: "fa" });
		}
		//var coords = loc.Position.Geography.WellKnownText.replace(/POINT \(/, '').replace(/\)/, '').split(' ');
		var latLong = [loc.coords[1], loc.coords[0]];
		marker.options.title = loc.Name();
		marker.setLatLng(latLong);
		marker.setIcon(_getLocationIcon(loc));
		marker.setOpacity(loc.isOpen() ? 1 : 0.3);

		//store refeences
		marker.data = loc;
		loc.marker = marker;

		if (add) {
			group.addLayer(marker);
			marker
			  .on({
			  	//mouseover: _itemMouseOver,
			  	//mouseout: _itemMouseOut,
			  	click: itemClick
			  });
			//.bindPopup('<b>' + loc.Name() + '</b><br/>' + loc.Street);
		}
	} //_setMarker

	function _loadRegions(map) {
		var query = breeze.EntityQuery.from("Regions");
		return locateContext
		  .executeQuery(query)
		  .then(function (d) {
		  	var regions = d.results;
		  	tell.log(regions.length + " Regions found", 'location');
		  	location.regions(regions);
		  	//TODO: Set first region as default -> select default region based on  settings / current location
		  	setRegion(0);
		  })
		  .fail(function (error) {
		  	logger.error("Query for Regions failed: " + error.message, 'location', error);
		  });
	} //_loadRegions

	function _loadPlaces() {
		require(['services/app'], function (app) {
			var query = breeze.EntityQuery.from("Places");
			query.parameters = {
				RegionId: location.Region ? location.Region().Id() : 1,
				Lang: app.lang()
			};

			return locateContext
			  .executeQuery(query)
			  .then(function (d) {
			  	if (d.results) {
			  		var places = ko.mapping.fromJS(d.results[0].Places.Place)();
			  		//tell.log('places found', 'location - _loadPlaces', places);

			  		//extend places
			  		//$.each(places, function (i, item) {
			  		places.forEach(function (item) {
			  			if (item.Position && item.Position().startsWith("POINT")) item.coords = item.Position().replace(/POINT \(/, '').replace(/\)/, '').split(' ');

			  			//** opening_hours **
			  			if (item.oh === undefined && item.OpeningHours && item.OpeningHours()) {
			  				try {
			  					item.oh = new opening_hours(item.OpeningHours(), {
			  						//initialize opening_hours property
			  						//TODO: move definition to locate property
			  						//TODO: get from start or center of map or region (but actually not used as long as nobody uses sunrise/sunset and, oh, holidays)
			  						"place_id": "97604310",
			  						"licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright",
			  						"osm_type": "relation",
			  						"osm_id": "77189",
			  						"lat": "48.2817813",
			  						"lon": "15.7632457",
			  						"display_name": "Niederösterreich, Österreich",
			  						"address": {
			  							"state": "Niederösterreich",
			  							"country": "Österreich",
			  							"country_code": "at"
			  						}
			  					});
			  				} catch (e) {
			  					tell.log('OpeningHours Error: ' + e, 'locate', item);
			  				}
			  			}

			  			//** isOpen **
			  			if (item.isOpen === undefined) {
			  				item.isOpen = function () {

			  					if (!item.oh) return null;
			  					var when = !location.when() || location.when() === 'jetzt' ? new Date() : location.when();
			  					return item.oh.getState(when);

			  				}; // isOpen()
			  			} //if (item.isOpen === undefined)

			  			//** OpeningHours **
			  			if (item.OpenDisplay === undefined) {
			  				item.OpenDisplay = ko.computed(function () {
			  					if (!item.oh) return null;
			  					return item.oh.prettifyValue({
			  						block_sep_string: '<br/>', print_semicolon: false
			  					}).replace('Su', 'So').replace('Tu', 'Di').replace('Th', 'Do').replace('PH', 'Feiertag');
			  				}); // OpenDisplay
			  			} //if (item.OpenDisplay === undefined)

			  			//** distance **
			  			if (item.distance === undefined) {
			  				if (!item.coords) return 100000000;

			  				item.distance = function () {
			  					///----------
			  					var reader = new jsts.io.WKTReader();
			  					var wkt;
			  					if (location.route.geometry && location.route.geometry.length > 0) {
			  						wkt = geoUtils.latLngToWkt(location.route.geometry, 'LINESTRING', false);
			  					}
			  					else if (location.route.start.coords())
			  						wkt = geoUtils.latLngToWkt(new L.LatLng(location.route.start.coords()[1], location.route.start.coords()[0]), 'POINT', false);
			  					else {
			  						return -1;
			  					}
			  					var to = reader.read(wkt); //including transform
			  					wkt = geoUtils.latLngToWkt(new L.LatLng(item.coords[1], item.coords[0]), 'POINT', false);
			  					var locPos = reader.read(wkt); //including transform
			  					var dist = locPos.distance(to);
			  					//console.log(item.Name() + ' - ' + dist * 1000);
			  					return dist;
			  				};
			  			}

			  			//** isFeatured **
			  			if (item.isFeatured === undefined) {
			  				item.isFeatured = function () {
			  					if (!item.Tag) return false;
			  					var _tags = ko.isObservable(item.Tag)
										  ? item.Tag()
										  : [item.Tag]
			  					;
			  					for (var i = 0; i < _tags.length; i++) {
			  						for (var f = 0; f < location.featuredIf().length; f++) {
			  							if (_tags[i].Name().toLowerCase() === location.featuredIf()[f].Name().toLowerCase() && location.featuredIf()[f].Selected() === true) {
			  								return true;
			  							}
			  						}
			  					}
			  					return false;
			  				}; // isFeatured()
			  			} // if (item.isFeatured === undefined)

			  		}); //places.forEach
			  	} //if (d.results)

			  	//update locations
			  	location.locations(places);

			  	tell.log(places.length + ' places loaded', 'location');
			  })
			  .fail(function (error) {
			  	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
			  	error.message = msg;
			  	logger.error("Die Angebote der Region konnten nicht geladen werden. Sie können versuchen Sie die Seite neu aufzurufen.", 'location - _loadPlaces', error);
			  	throw error;
			  });
		});
	} //_loadPlaces

	function _loadSearchSuggestions() {
		require(['services/app'], function (app) {
			var query = breeze.EntityQuery.from("SearchSuggestions");
			query.parameters = {
				RegionId: location.Region ? location.Region().Id() : 1,
				Lang: app.lang()
			};

			return locateContext
			  .executeQuery(query)
			  .then(function (d) {
			    location.searchSuggestions.removeAll();
			    location.searchSuggestionObjects.removeAll();
			  	$.each(d.results, function (i, item) {
			  	    location.searchSuggestions.push(item.Name);
			  	    location.searchSuggestionObjects.push(item);
			  		if (item.Class === 'tag') {
			  			location.tags.push(item.Name);
			  		} //if
			  	}); //$.each
			  	//tell.log(location.searchSuggestions().length + " SearchSuggestions loaded", 'location', location.searchSuggestions());
			  })
			  .fail(function (error) {
			  	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
			  	error.message = msg;
			  	tell.logError("Suchvorschläge konnten nicht geladen werden.", 'location - _loadSearchSuggestions', error);
			  	throw error;
			  });
		});
	} //_loadSearchSuggestions

	function _setFiveMinutesInidcator(aroundWhat) {
		tell.log('starting', 'location - _setFiveMinutesIndicator', aroundWhat);
		var map = location.map;
		if (location.layers.fiveMinutesInidcatorLayer) {
			map.removeLayer(location.layers.fiveMinutesInidcatorLayer);
		}
		if (!location.settings.showIndicator) { return; } //don't show indicator

		var indicator = null;
		var indicatorOptions = {
			title: '5 Minuten zufuß',
			//color: 'transparent',
			stroke: false,
			fillColor: '#b8f71a', //ToDo: Move color to theme
			fillOpacity: 0.2
		};

		//if (aroundWhat[0] instanceof L.LatLng) { //aroundWhat is an array and it's first Element is a L.LatLng -> route.geometry
		if (aroundWhat[0] instanceof Array) { //aroundWhat is an array and it's first Element is also -> route.geometry

			//calculate convex hull
			var reader = new jsts.io.WKTReader();
			var writer = new jsts.io.WKTWriter();

			var wkt = geoUtils.latLngToWkt(aroundWhat, 'LINESTRING', true);
			//tell.log('wkt after geoUtils.latLngToWkt(.,.) = ', 'location - _setFiveMinutesIndicator', wkt);
			var input = reader.read(wkt); //including transform
			//tell.log('calculating Buffer for ' + JSON.stringify(input), 'location - _setFiveMinutesIndicator');
			var buffer = input.buffer(location.settings.walkIn5);
			//tell.log('jsts buffer = ', 'location - _setFiveMinutesIndicator', buffer);

			wkt = writer.write(buffer);
			//tell.log('calculated buffer', 'location - _setFiveMinutesIndicator', wkt);
			var points = geoUtils.wktToCoords(wkt); //convert 2 point array
			//tell.log('points after wktToCoords(wkt) = ', 'location - _setFiveMinutesIndicator', points);
			var latLngs = [];
			for (var i = 0; i < points.length; i++) {  //transform to spherical
				latLngs.push(geoUtils.transformXyMeterToLatLong(points[i]));
			}
			//tell.log('latLngs after point-wise transform', 'location - _setFiveMinutesIndicator', latLngs);

			indicator = L.polygon(latLngs, indicatorOptions);
			location.layers.fiveMinutesIndicatorLayer = indicator;
			map.addLayer(indicator);
		}
		if (typeOf(aroundWhat[0]) === 'number' && aroundWhat.length > 1) { //ok, but it's a coordinate Pair -> position?
			var latLng = [aroundWhat[1], aroundWhat[0]];
			indicator = L.circle(latLng, location.settings.walkIn5, indicatorOptions);
			location.layers.fiveMinutesInidcatorLayer = indicator;
			map.addLayer(indicator);
		}

		location.mapLocations(location.mapLocations().sort(location.sortBy().Sorter));
	} //_setFiveMinutesInidcator

	function _setRouteMarker(coord, usage) {
		tell.log('setting ' + usage + ' to ' + JSON.stringify(coord), 'location - setMarker', location.route.start);

		var map = location.map;
		var marker, latLng, icon;
		switch (usage) {
			case 'start':
				if (location.route.start.marker) {
					map.removeLayer(location.route.start.marker);
				}

				latLng = [coord[1], coord[0]];
				icon = L.AwesomeMarkers.icon({
					prefix: "fa",
					icon: "home",
					color: "navy"
				});
				marker = L.marker(latLng);
				marker.setIcon(icon);
				marker.options.dragable = true;
				marker.options.title = "Ausgangspunkt (Start)";
				location.route.start.marker = marker;
				map.addLayer(marker);

				break;
			case 'end':
				if (location.route.end.marker) {
					map.removeLayer(location.route.end.marker);
				}

				latLng = [coord[1], coord[0]];
				icon = L.AwesomeMarkers.icon({
					prefix: "fa",
					icon: "flag",
					markerColor: "navy"
				});
				marker = L.marker(latLng);
				marker.setIcon(icon);
				marker.options.dragable = true;
				marker.options.title = "Ziel";
				location.route.end.marker = marker;
				map.addLayer(marker);
				break;
			default:
				break;
		}

	} //_setRouteMarker

	function _geoCode(searchString, writeResultTo) {
		tell.log('geocoding: ' + searchString, 'location - geoCode');

		return geocodingProvider
			.getCoords(searchString, location.region)
			.done(function (result) {
				if (result.success) {
					writeResultTo(result.coords);  //observable variable to write the result to (e.g. start.coords or end.coords)
					tell.log('found: ' + JSON.stringify(result.coords), 'location - geoCode', writeResultTo);
				}
				else {
					logger.error('Die Koordinaten zu diesem Standort konnten nicht gefunden werden.', 'location - geoCode', result);
				}
			})
			.fail(function (err) {
				logger.error('Die Koordinaten zu diesem Standort konnten nicht gefunden werden.', 'location - geoCode', err);
			});

	} //_geoCode

	function _getRoute() {
		//TODO: add routing via stores at shopping list
		//var via = [];
		return routingProvider
		  .getRoute(location.route, location.route.start.coords(), location.route.end.coords(), location.when(), location.settings.mode())
		  .done(function (route) {
		  	var map = location.map;
		  	if (location.routeLayer) {
		  		map.removeLayer(location.routeLayer);
		  	}
		  	location.routeLayer = L.polyline(location.route.geometry, { color: location.settings.routeColor });
		  	map.addLayer(location.routeLayer);
		  	_setFiveMinutesInidcator(location.route.geometry);
		  	return route;
		  })
		  .fail(function (err) {
		  	logger.error('Die Route konnte nicht berechnet werden.', 'location - locate', err);
		  });
	} //_getRoute


	//UI
	function _scrollList(selector) {
		var $listItem = $(selector);
		if ($listItem.length > 0) {
			$listItem.scrollIntoView({
				duration: 500,
				easing: false, //'swing', //'easeOutExpo',
				complete: $.noop(),
				step: $.noop(),
				queue: false,
				specialEasing: 'swing' //what's the difference to easing?
			});
		}
	} //_scrollList

	function _panMap(marker) { //pan the selected marker into view
		if (!location.settings.autoPan) return;
		if (!marker) { //try to find marker of selected item
			if (!location.selectedItem()) {
				return;
			}
			else {
				marker = location.selectedItem().marker;
				if (!marker) return;
			}
		} //if (!marker)

		var map = location.map;
		var size = L.point(map.getContainer().offsetWidth, map.getContainer().offsetHeight); //map.getSize();
		var padding = location.settings.mapPadding;

		var ll = marker.getLatLng();
		var pos = map.latLngToContainerPoint(ll);
		tell.log('size: ' + size.x + ', ' + size.y + '   pos: ' + pos.x + ', ' + pos.y, 'location - _panMap', { size: map.getSize(), container: size });

		var dx = 0;
		var dy = 0;
		if (pos.x + padding.right > size.x) { // right
			dx = pos.x - size.x + padding.right;
		}
		if (pos.x - dx - padding.left < 0) { // left
			dx = pos.x - padding.left;
		}
		if (pos.y + padding.bottom > size.y) { // bottom
			dy = pos.y - size.y + padding.bottom;
		}
		if (pos.y - dy - padding.top < 0) { // top
			dy = pos.y - padding.top;
		}
		if (dx || dy) {
			map.panBy([dx, dy]);
		}
	} //_panMap

	//#endregion Private Members

	//#region Public Methods

	function setRegion(index) {
		var regions = location.regions();
		tell.log('setRegion', 'location - setRegion', regions);
		location.region(regions[index]);
		if (regions.length) {
			location.views(regions[index].Views());
			//ToDo: in Select Region auslagern?
			setView(0);
		}
		_drawVeilOfSilence(location.map, [regions[index]]); //highlight the selected region only
	}

	function setView(i) {
		var map = location.map;
		var view = location.views()[i];
		var box = geoUtils.wktToCoords(view.Boundary().Geography.WellKnownText);
		map.fitBounds([[box[3][1], box[3][0]], [box[1][1], box[1][0]]]);
		return;
	} //setView

	function setTileLayer(index) {
		var layer = location.layers.tileLayer();
		var map = location.map;
		if (layer) {
			map.removeLayer(layer.Layer);
		}
		layer = location.settings.tileLayers[index];
		location.layers.tileLayer(layer);
		map.addLayer(layer.Layer);
	} //setTileLayer

	function setMode(mode) {
		tell.log("changing mode to " + mode, 'location');
		//if no change do nothing
		if (location.settings.mode() === mode) return;

		//remove old mode overlay
		if (location.layers.bikeLayer) location.map.removeLayer(location.layers.bikeLayer);
		if (location.layers.transportLayer) location.map.removeLayer(location.layers.transportLayer);

		//set new mode
		location.settings.mode(mode);

		//show new mode overlay
		var query = null;
		switch (location.settings.mode()) {
			case "bike":
				if (location.layers.bikeLayer) {
					location.map.addLayer(location.layers.bikeLayer);
				}
				else {
					query = breeze.EntityQuery.from("BikeFeatures/?RegionId=1");
					return locateContext
					  .executeQuery(query)
					  .then(function (d) {
					  	var group = new L.LayerGroup();
					  	var ways = d.results;
					  	tell.log(ways.length + " ways found", 'location');
					  	for (var i = 0; i < ways.length; i++) {
					  		var way = ways[i];
					  		var color;
					  		switch (way.Mode()) {
					  			case 'Route': color = '#ff0000'; break;
					  			case 'Dedicated': color = '#00ff00'; break;
					  			default: color = 'ff7800'; break;
					  		}
					  		var poly = L.multiPolyline(
							  L.GeoJSON.coordsToLatLngs(geoUtils.wktToCoords(way.Way().Geography.WellKnownText)),
							{
								color: color, weight: 5, smoothFactor: 2.0, opacity: 1, clickable: (way.Name() ? true : false)
							}
							  );
					  		if (way.Name()) {
					  			poly.bindPopup('<b>' + way.Name() + '</b>');
					  		}
					  		group.addLayer(poly);
					  	}
					  	location.map.addLayer(group);
					  	location.layers.bikeLayer = group;
					  }) //then
					  .fail(function (error) {
					  	logger.error("Query for Regions failed: " + error.message, 'location', error);
					  });
				}
				break;
			case "walk":
				if (location.layers.transportLayer) {
					location.map.addLayer(location.layers.transportLayer);
				}
				else {
					query = breeze.EntityQuery.from("TransportFeatures/?RegionId=1");
					return locateContext
					  .executeQuery(query)
					  .then(function (d) {
					  	var group = new L.LayerGroup();
					  	var lines = d.results[0].Lines;
					  	tell.log(lines.length + " lines found", 'location');
					  	for (var i = 0; i < lines.length; i++) {
					  		var line = lines[i];
					  		var color;
					  		switch (line.Mode()) {
					  			case 'Route': color = '#ff0000'; break;
					  			case 'Dedicated': color = '#00ff00'; break;
					  			default: color = 'ff7800'; break;
					  		}
					  		var poly = L.multiPolyline(
							  L.GeoJSON.coordsToLatLngs(geoUtils.wktToCoords(line.Way().Geography.WellKnownText)),
							{
								color: color, weight: 5, smoothFactor: 2.0, opacity: 1, clickable: true
							}
							  );
					  		poly.bindPopup('<b>' + line.Name() + '</b>');
					  		group.addLayer(poly);
					  	}
					  	location.map.addLayer(group);
					  	location.layers.transportLayer = group;
					  }) //then
					  .fail(function (error) {
					  	logger.error("Query for Regions failed: " + error.message, 'location', error);
					  });
				}
				break;
				//default:
				//  break;
		}

		//recalculate route
		_getRoute();

	} //setMode

	function drawMarkers(map, locationsToDraw) {
		if (location.layers.locationLayer) map.removeLayer(location.layers.locationLayer);
		if (location.layers.pointerLayer) map.removeLayer(location.layers.pointerLayer);
		var group = location.settings.clusterLocations()
				  ? new L.MarkerClusterGroup()
				  : new L.LayerGroup();
		map.addLayer(group);
		location.layers.locationLayer = group;

		for (var i = 0; i < locationsToDraw.length; i++) {
			//console.log("[location] drawMarkers drawing marker ", locationsToDraw[i])
			_setMarker(group, null, locationsToDraw[i]);
		}

		//if(location.settings.zoomToSearchResults()) {
		//  map.fitBounds(group.getBounds());
		//}
	} //drawMarkers

	function getCurrentPosition() {
		navigator.geolocation.getCurrentPosition( //requests current position from geolocation api (HTML5 or PhoneGap)
		  function (result) {
		  	if (result.coords) {
		  		location.route.start.coords([result.coords.longitude, result.coords.latitude]);
		  		location.route.start.text('aktueller Standort');
		  		_setRouteMarker(location.route.start.coords(), 'start');
		  		_setFiveMinutesInidcator(location.route.start.coords());
		  	}
		  },
		  function (error) {
		  	logger.error(error.message, 'location-getCurrentPosition');
		  },
		  {
		  	maximumAge: 300000
		  }
		);
	} //getCurrentPosition

	//#region sorters

	function sortOpenThenByDistance(l1, l2) {
		var o1 = l1.isOpen();
		var o2 = l2.isOpen();

		if (o1 && !o2)
			return -1;
		else if (o2 && !o1)
			return 1;
		else
			return sortByDistance(l1, l2);
	}

	function sortFeaturedThenByDistance(l1, l2) {
		var f1 = l1.isFeatured();
		var f2 = l2.isFeatured();

		if (f1 && !f2)
			return -1;
		else if (f2 && !f1)
			return 1;
		else
			return sortByDistance(l1, l2);
	}

	function sortByDistance(l1, l2) {
		if (l1.distance && l2.distance)
			return l1.distance() > l2.distance();
		else if (l1.distance)
			return -1; //only l1 has distance so set as frst
		else if (l2.distance)
			return 1; //only l2 has distance sp set l2 as first
		else
			//return 0; //if both have no distance consider equal
			return sortByName; //if both have no distance sort by name
	}

	function sortByName(l1, l2) {
		return l1.Name() > l2.Name();
	}

	//#endregion sorters

	//like search but only by full TagNames
	function showByTagName(what) {
		//tell.log('showByTagName: ' + what, 'location');
		location.searchFor(what);
		try {
			var toShow;
			if (!what) {//empty search criteria -> return everything
				toShow = location.locations();
			}
			else {
				what = what.toLowerCase();
				var tagList = what.split(',');
				toShow = ko.utils.arrayFilter(location.locations(), function (loc) {
					//check tags
					if (!loc.Tag) {
						//no Tags
						return false;
					}
					else {
						var _tags = ko.isObservable(loc.Tag)
								  ? loc.Tag()
								  : [loc.Tag]
						;
						for (var it = 0; it < _tags.length; it++) {
							if (tagList.indexOf(_tags[it].Name().toLowerCase()) !== -1) {
								//match
								return true;
							}
						}
						//no match
						return false;
					}
				}); //arrayFilter
			} //else
			location.mapLocations(toShow.sort(location.sortBy().Sorter)); //drawMarkers called by databinding
			if (location.mapLocations().length === 0) {
				logger.warn("Keine Treffer für '" + what + "' gefunden.", 'location - showByTagName');
			}
		} catch (e) {
			logger.error(e.message, 'location - showByTagName', e);
		}

		router.navigate('map');
	} //showByTagName

	function search(what) {
	    //logger.info('search: ' + what, 'location');
		location.searchFor(what);
		try {
			var toShow;
			if (!what) { //empty search criteria -> return all ventures
				toShow = ko.utils.arrayFilter(location.locations(), function (loc) {
					if (loc.T && loc.T() === 'Venture') { //return only ventures (exclude stops, transports and streets)
						return true;
					}
					return false;
				}); //arrayFilter
			} //if (!what)
			else {
				what = what.toLowerCase();
				toShow = ko.utils.arrayFilter(location.locations(), function (loc) {
					//arrayFilter
					if (!loc.T || loc.T() !== 'Venture') { //return only ventures (exclude stops, transports and streets)
						return false;
					}
					//check name, strasse
					if ((loc.Name && loc.Name() && loc.Name().toLowerCase().indexOf(what) !== -1)
						||
						(loc.Street && loc.Street() && loc.Street().toLowerCase().indexOf(what) !== -1)
					   ) { //substring search in name
						return true;
					}
					//check aliases
					if (loc.Alias) {
						var _aliases = ko.isObservable(loc.Alias)
									 ? loc.Alias()
									 : [loc.Alias];
						for (var ia = 0; ia < _aliases.length; ia++) {
							if (_aliases[ia].Name().toLowerCase().indexOf(what) !== -1) {
								return true;
							}
						}
					}
					//check tags
					if (loc.Tag) {
						//tell.log('searching', 'location', loc.Tag)
						var _tags = ko.isObservable(loc.Tag)
								  ? loc.Tag()
								  : [loc.Tag]
						;
						for (var it = 0; it < _tags.length; it++) {
							if (_tags[it].Name().toLowerCase().indexOf(what) !== -1) {
								return true;
							}
						}
					}
					//no match
					return false;
				}); //arrayFilter
			} //else
			location.mapLocations(toShow.sort(location.sortBy().Sorter)); //drawMarkers called by databinding
		} catch (e) {
			logger.error(e.message, 'location - search', e);
		}

		router.navigate('map');
	} //search

	function locate(what) {
		var map = location.map;
		var start = location.route.start;
		var end = location.route.end;

		if (location.layers.fiveMinutesInidcatorLayer) {
			map.removeLayer(location.layers.fiveMinutesInidcatorLayer);
		}

		if (what === 'start' && start.text() === 'aktueller Standort') {
			getCurrentPosition();
			return;
		}
		if (what === 'start' && !start.text()) {
			logger.error('Geben Sie eine Position oder einen Startpunkt an.', 'location - locate');
			return;
		}
		if (what === 'end' && !end.text()) {
			logger.error('Geben Sie eine Zieladresse an.', 'location - locate');
			return;
		}
		if (what === 'nothing') { //start or endpoint removed
			location.route.end.text(null);
			if (location.route.end.marker) map.removeLayer(location.route.end.marker);
			if (location.routeLayer) map.removeLayer(location.routeLayer);
			if (location.route.start.coords()) { _setFiveMinutesInidcator(location.route.start.coords()) };
		}
		else if (what === 'start') { //get position of start
			_geoCode(location.route.start.text(), location.route.start.coords)	//location.route.start.coords ... passing function reference
			  .done(function () {
			  	_setRouteMarker(location.route.start.coords(), 'start');		//location.route.start.coords ... passing value
			  	_setFiveMinutesInidcator(location.route.start.coords());
			  });
		}
		else if (what === 'end') { //get position of end and calculate route
			_geoCode(location.route.end.text(), location.route.end.coords)
			  .done(function () {
			  	_setRouteMarker(location.route.end.coords(), 'end');
			  	_getRoute(); //calls _setFiveMinutesInidcator()
			  });
		}

	} //locate

	function itemClick(e) {
		var oldLoc = location.selectedItem();

		//get new marker and loc(ation)
		var marker, loc;
		if (e.target) { //marker ... loc in e.target.data
			marker = e.target;
			loc = e.target.data;
		}
		else if (e.marker) { //bound item (e.g. locationList) ... marker in e.marker
			marker = e.marker;
			loc = e;
		}

		//if already selected toggle details and return
		if (oldLoc === loc) {
			location.toggleDetails();
		}
		else {
			//restore marker of formerly selected item
			if (oldLoc) {
				oldLoc.marker
				  .setIcon(_getLocationIcon(oldLoc))
				  .setZIndexOffset(0)
				  .setOpacity(oldLoc.isOpen() ? 1 : 0.3)
				;
			}
			//select new item
			location.selectedItem(loc);
			//highlight new marker
			marker
			  .setIcon(_getLocationIcon(loc, true))
			  .setZIndexOffset(10000)
			  .setOpacity(loc.isOpen() ? 1 : 0.8)
			;
		}

		var selItmsIdx = location.selectedItems.indexOf(loc);
		if (selItmsIdx >= 0) {
			location.selectedItems.splice(selItmsIdx, 1);
		}
		location.selectedItems.unshift(loc);
		if (location.selectedItems().length > location.settings.maxSelectedItems) {
			location.selectedItems.pop();
		}

		_drawPointer();
		_scrollList('#' + loc.Id());
		_panMap(marker);

	} //itemClick

	//#region control display of mapparts

	function toggleMap(mode) {
		if (!location.settings.forceMap) {
			if (mode === 'hide' || location.settings.showMap() === 'auto')
				location.settings.showMap(false);
			else
				location.settings.showMap('auto');
		}
	}

	function toggleList(mode) {
		if ((!location.settings.disableDetails) || !location.settings.forceMap) {
			if (mode === 'hide' || location.settings.showList() === 'auto')
				location.settings.showList(false);
			else
				location.settings.showList('auto');
			//location.map.invalidateSize(true);
		}
	}

	function toggleDetails(mode) {
		if (!location.settings.disableDetails) {
			if (mode === 'hide' || $('#ventureDetails').hasClass('detailsOpen')) {
				location.drawPointer('hide');
				$('#ventureDetails, #locationList, #map').removeClass('detailsOpen');
				tell.log('details hidden', 'location - toggleDetails');
				setTimeout(function () { //500ms later
					location.panIntoView();
					location.drawPointer();
					//map.panBy([0, 0]);
				}, 500);
			}
			else {
				location.drawPointer('hide');
				$('#ventureDetails, #locationList, #map')
				  .addClass('detailsOpen');
				tell.log('details opened', 'location - toggleDetails');
				setTimeout(function () { //500ms later
					location.panIntoView();
					location.drawPointer();
					//location.map.panBy([0, 0]);
				}, 500);
			}
		}
	}

	//#endregion control display of mapparts


	//#region edit

	function getLocation(Id) {
		var query = breeze.EntityQuery.from("Location");
		query.parameters = { Id: Id };
		return locateContext
		  .executeQuery(query)
		  .then(function (d) {
		  	var item = d.results[0];
		  	location.loactionToEdit(item);
		  })
		  .fail(function (error) {
		  	logger.error("Location data could not be loaded: " + error.message, 'location - getLocation', error);
		  });
	} //getLocation

	function editLocation(Id) {
		location
		 .getLocation(Id)
		 .then(function () {
		 	tell.log('location loaded', 'location - editLocation', location.loactionToEdit());
		 	router.navigate('my/wizardNew');
		 });
	} //editLocation

	function getTaxonomy(region, lang) {
		var query = breeze.EntityQuery.from("GetTaxonomy");
		query.parameters = {
			RegionId: region || 1,
			Lang: lang
		};

		return locateContext
			.executeQuery(query)
			/*.then(function (d) {
				tell.log(d.results.length + " Tags loaded", 'location - getTaxonomy', d.results);
			})
            the result is only available in the FIRST .then callback / listener :(
            */
			.fail(function (error) {
				var msg = breeze.saveErrorMessageService.getErrorMessage(error);
				error.message = msg;
				tell.logError("Loading Tags failed.", 'location - getTaxonomy', error);
				throw error;
			});
	} //getTaxonomy

	function getCountries() {
		return [{ text: "Afghanistan", id: "AF" },
                { text: "Ägypten", id: "EG" },
                { text: "Åland", id: "AX" },
                { text: "Albanien", id: "AL" },
                { text: "Algerien", id: "DZ" },
                { text: "Amerikanisch-Samoa", id: "AS" },
                { text: "Amerikanische Jungferninseln", id: "VI" },
                { text: "Andorra", id: "AD" },
                { text: "Angola", id: "AO" },
                { text: "Anguilla", id: "AI" },
                { text: "Antarktika", id: "AQ" },
                { text: "Antigua und Barbuda", id: "AG" },
                { text: "Äquatorialguinea", id: "GQ" },
                { text: "Argentinien", id: "AR" },
                { text: "Armenien", id: "AM" },
                { text: "Aruba", id: "AW" },
                { text: "Ascension", id: "AC" },
                { text: "Aserbaidschan", id: "AZ" },
                { text: "Äthiopien", id: "ET" },
                { text: "Australien", id: "AU" },
                { text: "Bahamas", id: "BS" },
                { text: "Bahrain", id: "BH" },
                { text: "Bangladesch", id: "BD" },
                { text: "Barbados", id: "BB" },
                { text: "Belarus (Weißrussland)", id: "BY" },
                { text: "Belgien", id: "BE" },
                { text: "Belize", id: "BZ" },
                { text: "Benin", id: "BJ" },
                { text: "Bermuda", id: "BM" },
                { text: "Bhutan", id: "BT" },
                { text: "Bolivien", id: "BO" },
                { text: "Bonaire, Sint Eustatius und Saba (Niederlande)", id: "BQ" },
                { text: "Bosnien und Herzegowina", id: "BA" },
                { text: "Botswana", id: "BW" },
                { text: "Bouvetinsel", id: "BV" },
                { text: "Brasilien", id: "BR" },
                { text: "Britische Jungferninseln", id: "VG" },
                { text: "Britisches Territorium im Indischen Ozean", id: "IO" },
                { text: "Brunei Darussalam", id: "BN" },
                { text: "Bulgarien", id: "BG" },
                { text: "Burkina Faso", id: "BF" },
                { text: "Burma", id: "BU" },
                { text: "Burundi", id: "BI" },
                { text: "Ceuta, Melilla", id: "EA" },
                { text: "Chile", id: "CL" },
                { text: "China, Volksrepublik", id: "CN" },
                { text: "Clipperton", id: "CP" },
                { text: "Cookinseln", id: "CK" },
                { text: "Costa Rica", id: "CR" },
                { text: "Côte d’Ivoire (Elfenbeinküste)", id: "CI" },
                { text: "Curaçao", id: "CW" },
                { text: "Dänemark", id: "DK" },
                { text: "Deutschland", id: "DE" },
                { text: "Diego Garcia", id: "DG" },
                { text: "Dominica", id: "DM" },
                { text: "Dominikanische Republik", id: "DO" },
                { text: "Dschibuti", id: "DJ" },
                { text: "Ecuador", id: "EC" },
                { text: "El Salvador", id: "SV" },
                { text: "Eritrea", id: "ER" },
                { text: "Estland", id: "EE" },
                { text: "Falklandinseln", id: "FK" },
                { text: "Färöer", id: "FO" },
                { text: "Fidschi", id: "FJ" },
                { text: "Finnland", id: "FI" },
                { text: "Frankreich", id: "FR" },
                { text: "Frankreich, Übersee", id: "FX" },
                { text: "Französisch-Guayana", id: "GF" },
                { text: "Französisch-Polynesien", id: "PF" },
                { text: "Französische Süd- und Antarktisgebiete", id: "TF" },
                { text: "Gabun", id: "GA" },
                { text: "Gambia", id: "GM" },
                { text: "Georgien", id: "GE" },
                { text: "Ghana", id: "GH" },
                { text: "Gibraltar", id: "GI" },
                { text: "Grenada", id: "GD" },
                { text: "Griechenland", id: "GR" },
                { text: "Grönland", id: "GL" },
                { text: "Guadeloupe", id: "GP" },
                { text: "Guam", id: "GU" },
                { text: "Guatemala", id: "GT" },
                { text: "Guernsey (Kanalinsel)", id: "GG" },
                { text: "Guinea", id: "GN" },
                { text: "Guinea-Bissau", id: "GW" },
                { text: "Guyana", id: "GY" },
                { text: "Haiti", id: "HT" },
                { text: "Heard und McDonaldinseln", id: "HM" },
                { text: "Honduras", id: "HN" },
                { text: "Hongkong", id: "HK" },
                { text: "Indien", id: "IN" },
                { text: "Indonesien", id: "ID" },
                { text: "Insel Man", id: "IM" },
                { text: "Irak", id: "IQ" },
                { text: "Iran, Islamische Republik", id: "IR" },
                { text: "Irland", id: "IE" },
                { text: "Island", id: "IS" },
                { text: "Israel", id: "IL" },
                { text: "Italien", id: "IT" },
                { text: "Jamaika", id: "JM" },
                { text: "Japan", id: "JP" },
                { text: "Jemen", id: "YE" },
                { text: "Jersey (Kanalinsel)", id: "JE" },
                { text: "Jordanien", id: "JO" },
                { text: "Kaimaninseln", id: "KY" },
                { text: "Kambodscha", id: "KH" },
                { text: "Kamerun", id: "CM" },
                { text: "Kanada", id: "CA" },
                { text: "Kanarische Inseln", id: "IC" },
                { text: "Kap Verde", id: "CV" },
                { text: "Kasachstan", id: "KZ" },
                { text: "Katar", id: "QA" },
                { text: "Kenia", id: "KE" },
                { text: "Kirgisistan", id: "KG" },
                { text: "Kiribati", id: "KI" },
                { text: "Kokosinseln", id: "CC" },
                { text: "Kolumbien", id: "CO" },
                { text: "Komoren", id: "KM" },
                { text: "Kongo, Demokratische Republik", id: "CD" },
                { text: "Republik Kongo", id: "CG" },
                { text: "Nordkorea", id: "KP" },
                { text: "Südkorea", id: "KR" },
                { text: "Kroatien", id: "HR" },
                { text: "Kuba", id: "CU" },
                { text: "Kuwait", id: "KW" },
                { text: "Laos, Demokratische Volksrepublik", id: "LA" },
                { text: "Lesotho", id: "LS" },
                { text: "Lettland", id: "LV" },
                { text: "Libanon", id: "LB" },
                { text: "Liberia", id: "LR" },
                { text: "Libyen", id: "LY" },
                { text: "Liechtenstein", id: "LI" },
                { text: "Litauen", id: "LT" },
                { text: "Luxemburg", id: "LU" },
                { text: "Macao", id: "MO" },
                { text: "Madagaskar", id: "MG" },
                { text: "Malawi", id: "MW" },
                { text: "Malaysia", id: "MY" },
                { text: "Malediven", id: "MV" },
                { text: "Mali", id: "ML" },
                { text: "Malta", id: "MT" },
                { text: "Marokko", id: "MA" },
                { text: "Marshallinseln", id: "MH" },
                { text: "Martinique", id: "MQ" },
                { text: "Mauretanien", id: "MR" },
                { text: "Mauritius", id: "MU" },
                { text: "Mayotte", id: "YT" },
                { text: "Mazedonien", id: "MK" },
                { text: "Mexiko", id: "MX" },
                { text: "Mikronesien", id: "FM" },
                { text: "Moldawien", id: "MD" },
                { text: "Monaco", id: "MC" },
                { text: "Mongolei", id: "MN" },
                { text: "Montenegro", id: "ME" },
                { text: "Montserrat", id: "MS" },
                { text: "Mosambik", id: "MZ" },
                { text: "Myanmar (Burma)", id: "MM" },
                { text: "Namibia", id: "NA" },
                { text: "Nauru", id: "NR" },
                { text: "Nepal", id: "NP" },
                { text: "Neukaledonien", id: "NC" },
                { text: "Neuseeland", id: "NZ" },
                { text: "Nicaragua", id: "NI" },
                { text: "Niederlande", id: "NL" },
                { text: "Niger", id: "NE" },
                { text: "Nigeria", id: "NG" },
                { text: "Niue", id: "NU" },
                { text: "Nördliche Marianen", id: "MP" },
                { text: "Norfolkinsel", id: "NF" },
                { text: "Norwegen", id: "NO" },
                { text: "Oman", id: "OM" },
                { text: "Österreich", id: "AT" },
                { text: "Osttimor", id: "TL)" },
                { text: "Pakistan", id: "PK" },
                { text: "Staat Palästina", id: "PS" },
                { text: "Palau", id: "PW" },
                { text: "Panama", id: "PA" },
                { text: "Papua-Neuguinea", id: "PG" },
                { text: "Paraguay", id: "PY" },
                { text: "Peru", id: "PE" },
                { text: "Philippinen", id: "PH" },
                { text: "Pitcairninseln", id: "PN" },
                { text: "Polen", id: "PL" },
                { text: "Portugal", id: "PT" },
                { text: "Puerto Rico", id: "PR" },
                { text: "Réunion", id: "RE" },
                { text: "Ruanda", id: "RW" },
                { text: "Rumänien", id: "RO" },
                { text: "Russische Föderation", id: "RU" },
                { text: "Salomonen", id: "SB" },
                { text: "Saint-Barthélemy", id: "BL" },
                { text: "Saint-Martin (franz. Teil)", id: "MF" },
                { text: "Sambia", id: "ZM" },
                { text: "Samoa", id: "WS" },
                { text: "San Marino", id: "SM" },
                { text: "São Tomé und Príncipe", id: "ST" },
                { text: "Saudi-Arabien", id: "SA" },
                { text: "Schweden", id: "SE" },
                { text: "Schweiz", id: "CH" },
                { text: "Senegal", id: "SN" },
                { text: "Serbien", id: "RS" },
                { text: "Seychellen", id: "SC" },
                { text: "Sierra Leone", id: "SL" },
                { text: "Simbabwe", id: "ZW" },
                { text: "Singapur", id: "SG" },
                { text: "Sint Maarten (niederl. Teil)", id: "SX" },
                { text: "Slowakei", id: "SK" },
                { text: "Slowenien", id: "SI" },
                { text: "Somalia", id: "SO" },
                { text: "Spanien", id: "ES" },
                { text: "Sri Lanka", id: "LK" },
                { text: "St. Helena", id: "SH" },
                { text: "St. Kitts und Nevis", id: "KN" },
                { text: "St. Lucia", id: "LC" },
                { text: "Saint-Pierre und Miquelon", id: "PM" },
                { text: "St. Vincent und die Grenadinen", id: "VC" },
                { text: "Südafrika", id: "ZA" },
                { text: "Sudan", id: "SD" },
                { text: "Südgeorgien und die Südlichen Sandwichinseln", id: "GS" },
                { text: "Südsudan", id: "SS" },
                { text: "Suriname", id: "SR" },
                { text: "Svalbard und Jan Mayen", id: "SJ" },
                { text: "Swasiland", id: "SZ" },
                { text: "Syrien, Arabische Republik", id: "SY" },
                { text: "Tadschikistan", id: "TJ" },
                { text: "Taiwan", id: "TW" },
                { text: "Tansania, Vereinigte Republik", id: "TZ" },
                { text: "Thailand", id: "TH" },
                { text: "Togo", id: "TG" },
                { text: "Tokelau", id: "TK" },
                { text: "Tonga", id: "TO" },
                { text: "Trinidad und Tobago", id: "TT" },
                { text: "Tristan da Cunha", id: "TA" },
                { text: "Tschad", id: "TD" },
                { text: "Tschechische Republik", id: "CZ" },
                { text: "Tunesien", id: "TN" },
                { text: "Türkei", id: "TR" },
                { text: "Turkmenistan", id: "TM" },
                { text: "Turks- und Caicosinseln", id: "TC" },
                { text: "Tuvalu", id: "TV" },
                { text: "Uganda", id: "UG" },
                { text: "Ukraine", id: "UA" },
                { text: "Ungarn", id: "HU" },
                { text: "United States Minor Outlying Islands", id: "UM" },
                { text: "Uruguay", id: "UY" },
                { text: "Usbekistan", id: "UZ" },
                { text: "Vanuatu", id: "VU" },
                { text: "Vatikanstadt", id: "VA" },
                { text: "Venezuela", id: "VE" },
                { text: "Vereinigte Arabische Emirate", id: "AE" },
                { text: "Vereinigte Staaten von Amerika", id: "US" },
                { text: "Vereinigtes Königreich Großbritannien", id: "GB" },
                { text: "Vietnam", id: "VN" },
                { text: "Wallis und Futuna", id: "WF" },
                { text: "Weihnachtsinsel", id: "CX" },
                { text: "Westsahara", id: "EH" },
                { text: "Zaire", id: "ZR" },
                { text: "Zentralafrikanische Republik", id: "CF" },
                { text: "Zypern", id: "CY" },
		];
	} //getCountries

	//#endregion edit

	//#region baseMap

	function baseMapOpenOsm() {
		var center = location.map.getCenter();
		var z = location.map.getZoom();
		tell.log('called', 'baseMap Open Osm', { center: center, zoom: z });
		window.open('http://www.openstreetmap.org/?' + 'editor=id' + '#map=' + z + '/' + center.lat + '/' + center.lng);
	}

	function baseMapEditOsm() {
		var center = location.map.getCenter();
		var z = location.map.getZoom();
		tell.log('called', 'baseMap Edit Osm', { center: center, zoom: z });
		window.open('http://www.openstreetmap.org/edit?' + 'editor=id' + '#map=' + z + '/' + center.lat + '/' + center.lng);
	}

	function baseMapAboutOsm() {
		tell.log('called', 'baseMap About Osm');
		window.open('http://www.openstreetmap.org/about');
	}

	//#endregion baseMap


	//#endregion Public Methods

}); //module