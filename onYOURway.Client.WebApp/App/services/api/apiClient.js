define([
    'services/tell'
], function (tell) {

    var locateMetadata = new breeze.MetadataStore();
    var locateContext = createBreezeContext();
    var rawMetadata = JSON.stringify({ "?xml": { "version": "1.0", "encoding": "utf-8" }, "schema": { "namespace": "onYOURwayModel", "alias": "Self", "p1:UseStrongSpatialTypes": "false", "xmlns:annotation": "http://schemas.microsoft.com/ado/2009/02/edm/annotation", "xmlns:p1": "http://schemas.microsoft.com/ado/2009/02/edm/annotation", "xmlns": "http://schemas.microsoft.com/ado/2009/11/edm", "cSpaceOSpaceMapping": "[[\"onYOURwayModel.Card\",\"onYOURway.Models.Card\"],[\"onYOURwayModel.ShoppingList\",\"onYOURway.Models.ShoppingList\"],[\"onYOURwayModel.UserProfile\",\"onYOURway.Models.UserProfile\"],[\"onYOURwayModel.BikeWay\",\"onYOURway.Models.BikeWay\"],[\"onYOURwayModel.LocationForeignId\",\"onYOURway.Models.LocationForeignId\"],[\"onYOURwayModel.Partner\",\"onYOURway.Models.Partner\"],[\"onYOURwayModel.ProductSuggestion\",\"onYOURway.Models.ProductSuggestion\"],[\"onYOURwayModel.Region\",\"onYOURway.Models.Region\"],[\"onYOURwayModel.RegionAlias\",\"onYOURway.Models.RegionAlias\"],[\"onYOURwayModel.RegionView\",\"onYOURway.Models.RegionView\"],[\"onYOURwayModel.Tag\",\"onYOURway.Models.Tag\"],[\"onYOURwayModel.TagName\",\"onYOURway.Models.TagName\"],[\"onYOURwayModel.TransportLine\",\"onYOURway.Models.TransportLine\"],[\"onYOURwayModel.TransportStop\",\"onYOURway.Models.TransportStop\"],[\"onYOURwayModel.Membership\",\"onYOURway.Models.Membership\"],[\"onYOURwayModel.OAuthMembership\",\"onYOURway.Models.OAuthMembership\"],[\"onYOURwayModel.Role\",\"onYOURway.Models.Role\"],[\"onYOURwayModel.Location\",\"onYOURway.Models.Location\"],[\"onYOURwayModel.MyLocation\",\"onYOURway.Models.MyLocation\"],[\"onYOURwayModel.Street\",\"onYOURway.Models.Street\"],[\"onYOURwayModel.LocationLink\",\"onYOURway.Models.LocationLink\"],[\"onYOURwayModel.LocationAlias\",\"onYOURway.Models.LocationAlias\"],[\"onYOURwayModel.Country\",\"onYOURway.Models.Country\"],[\"onYOURwayModel.HasTag\",\"onYOURway.Models.HasTag\"],[\"onYOURwayModel.SearchSuggestion\",\"onYOURway.Models.SearchSuggestion\"],[\"onYOURwayModel.Place\",\"onYOURway.Models.Place\"]]", "entityContainer": { "name": "onYOURwayEntities", "p1:LazyLoadingEnabled": "false", "entitySet": [{ "name": "Cards", "entityType": "onYOURwayModel.Card" }, { "name": "ShoppingLists", "entityType": "onYOURwayModel.ShoppingList" }, { "name": "UserProfiles", "entityType": "onYOURwayModel.UserProfile" }, { "name": "BikeWays", "entityType": "onYOURwayModel.BikeWay" }, { "name": "LocationForeignIds", "entityType": "onYOURwayModel.LocationForeignId" }, { "name": "Partners", "entityType": "onYOURwayModel.Partner" }, { "name": "ProductSuggestions", "entityType": "onYOURwayModel.ProductSuggestion" }, { "name": "Regions", "entityType": "onYOURwayModel.Region" }, { "name": "RegionAlias1", "entityType": "onYOURwayModel.RegionAlias" }, { "name": "RegionViews", "entityType": "onYOURwayModel.RegionView" }, { "name": "Tags", "entityType": "onYOURwayModel.Tag" }, { "name": "TagNames", "entityType": "onYOURwayModel.TagName" }, { "name": "TransportLines", "entityType": "onYOURwayModel.TransportLine" }, { "name": "TransportStops", "entityType": "onYOURwayModel.TransportStop" }, { "name": "Memberships", "entityType": "onYOURwayModel.Membership" }, { "name": "OAuthMemberships", "entityType": "onYOURwayModel.OAuthMembership" }, { "name": "Roles", "entityType": "onYOURwayModel.Role" }, { "name": "Locations", "entityType": "onYOURwayModel.Location" }, { "name": "MyLocations", "entityType": "onYOURwayModel.MyLocation" }, { "name": "Streets", "entityType": "onYOURwayModel.Street" }, { "name": "LocationLinks", "entityType": "onYOURwayModel.LocationLink" }, { "name": "LocationAliases", "entityType": "onYOURwayModel.LocationAlias" }, { "name": "Countries", "entityType": "onYOURwayModel.Country" }, { "name": "HasTags", "entityType": "onYOURwayModel.HasTag" }], "associationSet": [{ "name": "FK_my_Card_UserProfile", "association": "onYOURwayModel.FK_my_Card_UserProfile", "end": [{ "role": "UserProfile", "entitySet": "UserProfiles" }, { "role": "Card", "entitySet": "Cards" }] }, { "name": "FK_my_ShoppingList_UserProfile", "association": "onYOURwayModel.FK_my_ShoppingList_UserProfile", "end": [{ "role": "UserProfile", "entitySet": "UserProfiles" }, { "role": "ShoppingList", "entitySet": "ShoppingLists" }] }, { "name": "FK_oyw_ForeignId_Partner", "association": "onYOURwayModel.FK_oyw_ForeignId_Partner", "end": [{ "role": "Partner", "entitySet": "Partners" }, { "role": "LocationForeignId", "entitySet": "LocationForeignIds" }] }, { "name": "FK_oyw_RegionAlias_Region", "association": "onYOURwayModel.FK_oyw_RegionAlias_Region", "end": [{ "role": "Region", "entitySet": "Regions" }, { "role": "RegionAlia", "entitySet": "RegionAlias1" }] }, { "name": "FK_oyw_RegionView_Region", "association": "onYOURwayModel.FK_oyw_RegionView_Region", "end": [{ "role": "Region", "entitySet": "Regions" }, { "role": "RegionView", "entitySet": "RegionViews" }] }, { "name": "FK_oyw_TagAlias_Tag", "association": "onYOURwayModel.FK_oyw_TagAlias_Tag", "end": [{ "role": "Tag", "entitySet": "Tags" }, { "role": "TagName", "entitySet": "TagNames" }] }, { "name": "TagIsA", "association": "onYOURwayModel.TagIsA", "end": [{ "role": "Tag", "entitySet": "Tags" }, { "role": "Parent", "entitySet": "Tags" }] }, { "name": "FK_oyw_ForeignId_Location", "association": "onYOURwayModel.FK_oyw_ForeignId_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "LocationForeignId", "entitySet": "LocationForeignIds" }] }, { "name": "FK_oyw_ProductSuggestion_Location", "association": "onYOURwayModel.FK_oyw_ProductSuggestion_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "ProductSuggestion", "entitySet": "ProductSuggestions" }] }, { "name": "FK_my_Location_UserProfile1", "association": "onYOURwayModel.FK_my_Location_UserProfile1", "end": [{ "role": "UserProfile", "entitySet": "UserProfiles" }, { "role": "Location1", "entitySet": "MyLocations" }] }, { "name": "FK_oyw_LocationLink_Location", "association": "onYOURwayModel.FK_oyw_LocationLink_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "LocationLink", "entitySet": "LocationLinks" }] }, { "name": "FK_oyw_LocationAlias_Location", "association": "onYOURwayModel.FK_oyw_LocationAlias_Location", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "LocationAlia", "entitySet": "LocationAliases" }] }, { "name": "LocationHasTag", "association": "onYOURwayModel.LocationHasTag", "end": [{ "role": "Location", "entitySet": "Locations" }, { "role": "HasTag", "entitySet": "HasTags" }] }, { "name": "TagHasTag", "association": "onYOURwayModel.TagHasTag", "end": [{ "role": "Tag", "entitySet": "Tags" }, { "role": "HasTag", "entitySet": "HasTags" }] }], "functionImport": [{ "name": "SearchSuggestions", "returnType": "Collection(onYOURwayModel.SearchSuggestion)", "parameter": [{ "name": "regionId", "mode": "In", "type": "Edm.Int32" }, { "name": "Lang", "mode": "In", "type": "Edm.String" }] }, { "name": "GetPlaces", "returnType": "Collection(onYOURwayModel.Place)", "parameter": [{ "name": "RegionId", "mode": "In", "type": "Edm.Int32" }, { "name": "Lang", "mode": "In", "type": "Edm.String" }] }, { "name": "GetTaxonomy", "returnType": "Collection(String)", "parameter": [{ "name": "idSet", "mode": "In", "type": "Edm.String" }, { "name": "lang", "mode": "In", "type": "Edm.String" }] }] }, "entityType": [{ "name": "Card", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false" }, { "type": "Edm.Int64", "name": "LocationId" }, { "type": "Edm.Int32", "name": "TagId" }], "navigationProperty": { "name": "UserProfile", "relationship": "onYOURwayModel.FK_my_Card_UserProfile", "fromRole": "Card", "toRole": "UserProfile" } }, { "name": "ShoppingList", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false" }, { "type": "Edm.Int64", "name": "LocationId" }, { "type": "Edm.String", "name": "Item", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Boolean", "name": "Checked", "nullable": "false" }], "navigationProperty": { "name": "UserProfile", "relationship": "onYOURwayModel.FK_my_ShoppingList_UserProfile", "fromRole": "ShoppingList", "toRole": "UserProfile" } }, { "name": "UserProfile", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "UserName", "nullable": "false", "maxLength": "56", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "FirstName", "maxLength": "50", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "LastName", "maxLength": "50", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Email", "nullable": "false", "maxLength": "100", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Card", "relationship": "onYOURwayModel.FK_my_Card_UserProfile", "fromRole": "UserProfile", "toRole": "Card" }, { "name": "ShoppingList", "relationship": "onYOURwayModel.FK_my_ShoppingList_UserProfile", "fromRole": "UserProfile", "toRole": "ShoppingList" }, { "name": "Locations", "relationship": "onYOURwayModel.FK_my_Location_UserProfile1", "fromRole": "UserProfile", "toRole": "Location1" }] }, { "name": "BikeWay", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Geography", "name": "Way" }, { "type": "Edm.String", "name": "Mode", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }] }, { "name": "LocationForeignId", "key": { "propertyRef": [{ "name": "LocationId" }, { "name": "PartnerId" }] }, "property": [{ "type": "Edm.Int64", "name": "LocationId", "nullable": "false" }, { "type": "Edm.String", "name": "PartnerId", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "ForeignId", "maxLength": "100", "fixedLength": "false", "unicode": "false" }], "navigationProperty": [{ "name": "Partner", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Partner", "fromRole": "LocationForeignId", "toRole": "Partner" }, { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Location", "fromRole": "LocationForeignId", "toRole": "Location" }] }, { "name": "Partner", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.String", "name": "Id", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Website", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": { "name": "LocationForeignIds", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Partner", "fromRole": "Partner", "toRole": "LocationForeignId" } }, { "name": "ProductSuggestion", "key": { "propertyRef": [{ "name": "Item" }, { "name": "UsageCount" }] }, "property": [{ "type": "Edm.Int64", "name": "LocationId" }, { "type": "Edm.String", "name": "Item", "nullable": "false", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Int64", "name": "UsageCount", "nullable": "false" }], "navigationProperty": { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_ProductSuggestion_Location", "fromRole": "ProductSuggestion", "toRole": "Location" } }, { "name": "Region", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Website", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.Int64", "name": "OsmRelationId" }, { "type": "Edm.Int32", "name": "CreatedBy", "nullable": "false" }, { "type": "Edm.DateTime", "name": "CreatedAt", "nullable": "false", "precision": "2" }, { "type": "Edm.Int32", "name": "ModifiedBy" }, { "type": "Edm.DateTime", "name": "ModifiedAt", "precision": "2" }, { "type": "Edm.Geography", "name": "Boundary" }], "navigationProperty": [{ "name": "Aliases", "relationship": "onYOURwayModel.FK_oyw_RegionAlias_Region", "fromRole": "Region", "toRole": "RegionAlia" }, { "name": "Views", "relationship": "onYOURwayModel.FK_oyw_RegionView_Region", "fromRole": "Region", "toRole": "RegionView" }] }, { "name": "RegionAlias", "key": { "propertyRef": [{ "name": "RegionId" }, { "name": "Lang" }, { "name": "Name" }] }, "property": [{ "type": "Edm.Int64", "name": "RegionId", "nullable": "false" }, { "type": "Edm.String", "name": "Lang", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Website", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": { "name": "Region", "relationship": "onYOURwayModel.FK_oyw_RegionAlias_Region", "fromRole": "RegionAlia", "toRole": "Region" } }, { "name": "RegionView", "key": { "propertyRef": [{ "name": "RegionId" }, { "name": "ViewId" }] }, "property": [{ "type": "Edm.Int64", "name": "RegionId", "nullable": "false" }, { "type": "Edm.Int32", "name": "ViewId", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Int32", "name": "ListOrder", "nullable": "false" }, { "type": "Edm.Geography", "name": "Boundary" }], "navigationProperty": { "name": "Region", "relationship": "onYOURwayModel.FK_oyw_RegionView_Region", "fromRole": "RegionView", "toRole": "Region" } }, { "name": "Tag", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int32", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Type", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "CssClass", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Icon", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Values", "fixedLength": "false", "unicode": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "ForeignId", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": [{ "name": "Names", "relationship": "onYOURwayModel.FK_oyw_TagAlias_Tag", "fromRole": "Tag", "toRole": "TagName" }, { "name": "Children", "relationship": "onYOURwayModel.TagIsA", "fromRole": "Tag", "toRole": "Parent" }, { "name": "Parents", "relationship": "onYOURwayModel.TagIsA", "fromRole": "Parent", "toRole": "Tag" }, { "name": "Locations", "relationship": "onYOURwayModel.TagHasTag", "fromRole": "Tag", "toRole": "HasTag" }] }, { "name": "TagName", "key": { "propertyRef": [{ "name": "TagId" }, { "name": "Lang" }, { "name": "Name" }] }, "property": [{ "type": "Edm.Int32", "name": "TagId", "nullable": "false" }, { "type": "Edm.String", "name": "Lang", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "name": "Show", "type": "Edm.Boolean", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Tag", "relationship": "onYOURwayModel.FK_oyw_TagAlias_Tag", "fromRole": "TagName", "toRole": "Tag" } }, { "name": "TransportLine", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Ref", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "From", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "To", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Mode", "nullable": "false", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Network", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Operator", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Color", "maxLength": "20", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.Geography", "name": "Way" }] }, { "name": "TransportStop", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "LineIds", "nullable": "false", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Name", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Geography", "name": "Position" }] }, { "name": "Membership", "key": { "propertyRef": { "name": "UserId" } }, "property": [{ "type": "Edm.Int32", "name": "UserId", "nullable": "false" }, { "type": "Edm.DateTime", "name": "CreateDate", "precision": "3" }, { "type": "Edm.String", "name": "ConfirmationToken", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Boolean", "name": "IsConfirmed" }, { "type": "Edm.DateTime", "name": "LastPasswordFailureDate", "precision": "3" }, { "type": "Edm.Int32", "name": "PasswordFailuresSinceLastSuccess", "nullable": "false" }, { "type": "Edm.String", "name": "Password", "nullable": "false", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.DateTime", "name": "PasswordChangedDate", "precision": "3" }, { "type": "Edm.String", "name": "PasswordSalt", "nullable": "false", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "PasswordVerificationToken", "maxLength": "128", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.DateTime", "name": "PasswordVerificationTokenExpirationDate", "precision": "3" }] }, { "name": "OAuthMembership", "key": { "propertyRef": [{ "name": "Provider" }, { "name": "ProviderUserId" }] }, "property": [{ "type": "Edm.String", "name": "Provider", "nullable": "false", "maxLength": "30", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "ProviderUserId", "nullable": "false", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.Int32", "name": "UserId", "nullable": "false" }] }, { "name": "Role", "key": { "propertyRef": { "name": "RoleId" } }, "property": [{ "type": "Edm.Int32", "name": "RoleId", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "RoleName", "nullable": "false", "maxLength": "256", "fixedLength": "false", "unicode": "true" }] }, { "name": "Location", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "type": "Edm.Int64", "name": "Id", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Lang", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Country", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "Province", "maxLength": "3", "fixedLength": "true", "unicode": "false" }, { "type": "Edm.String", "name": "City", "maxLength": "50", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Zip", "maxLength": "10", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.String", "name": "Street", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "HouseNumber", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "type": "Edm.String", "name": "Phone", "maxLength": "100", "fixedLength": "false", "unicode": "false" }, { "type": "Edm.Int32", "name": "CreatedBy", "nullable": "false" }, { "type": "Edm.DateTime", "name": "CreatedAt", "nullable": "false", "precision": "2" }, { "type": "Edm.Int32", "name": "ModifiedBy" }, { "type": "Edm.DateTime", "name": "ModifiedAt", "precision": "2" }, { "type": "Edm.Geography", "name": "Position" }, { "name": "Icon", "type": "Edm.String", "maxLength": "50", "fixedLength": "false", "unicode": "true" }, { "name": "OpeningHours", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Type", "type": "Edm.String", "nullable": "false", "maxLength": "10", "fixedLength": "false", "unicode": "false" }], "navigationProperty": [{ "name": "ForeignIds", "relationship": "onYOURwayModel.FK_oyw_ForeignId_Location", "fromRole": "Location", "toRole": "LocationForeignId" }, { "name": "ProductSuggestions", "relationship": "onYOURwayModel.FK_oyw_ProductSuggestion_Location", "fromRole": "Location", "toRole": "ProductSuggestion" }, { "name": "Links", "relationship": "onYOURwayModel.FK_oyw_LocationLink_Location", "fromRole": "Location", "toRole": "LocationLink" }, { "name": "Aliases", "relationship": "onYOURwayModel.FK_oyw_LocationAlias_Location", "fromRole": "Location", "toRole": "LocationAlia" }, { "name": "Tags", "relationship": "onYOURwayModel.LocationHasTag", "fromRole": "Location", "toRole": "HasTag" }] }, { "name": "MyLocation", "key": { "propertyRef": [{ "name": "UserId" }, { "name": "LocationId" }] }, "property": [{ "type": "Edm.Int64", "name": "UserId", "nullable": "false" }, { "type": "Edm.Int64", "name": "LocationId", "nullable": "false" }, { "type": "Edm.Int32", "name": "ListOrder" }], "navigationProperty": { "name": "UserProfile", "relationship": "onYOURwayModel.FK_my_Location_UserProfile1", "fromRole": "Location1", "toRole": "UserProfile" } }, { "name": "Street", "key": { "propertyRef": [{ "name": "RegionId" }, { "name": "Name" }] }, "property": [{ "name": "RegionId", "type": "Edm.Int64", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "Way", "type": "Edm.Geography" }] }, { "name": "LocationLink", "key": { "propertyRef": [{ "name": "Id" }, { "name": "LocationId" }] }, "property": [{ "name": "Id", "type": "Edm.Int64", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "name": "LocationId", "type": "Edm.Int64", "nullable": "false" }, { "name": "Lang", "type": "Edm.String", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "name": "Tag", "type": "Edm.String", "nullable": "false", "maxLength": "30", "fixedLength": "false", "unicode": "true" }, { "name": "URL", "type": "Edm.String", "nullable": "false", "maxLength": "1000", "fixedLength": "false", "unicode": "false" }], "navigationProperty": { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_LocationLink_Location", "fromRole": "LocationLink", "toRole": "Location" } }, { "name": "LocationAlias", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "LocationId", "type": "Edm.Int64", "nullable": "false" }, { "name": "Lang", "type": "Edm.String", "nullable": "false", "maxLength": "2", "fixedLength": "true", "unicode": "false" }, { "name": "Name", "type": "Edm.String", "nullable": "false", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "Id", "type": "Edm.Int64", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }], "navigationProperty": { "name": "Location", "relationship": "onYOURwayModel.FK_oyw_LocationAlias_Location", "fromRole": "LocationAlia", "toRole": "Location" } }, { "name": "Country", "key": { "propertyRef": { "name": "ID" } }, "property": [{ "name": "ID", "type": "Edm.Int32", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "name": "OBJECTID", "type": "Edm.Int64" }, { "name": "NAME", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "ISO3", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "ISO2", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "FIPS", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "COUNTRY1", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "ENGLISH", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "FRENCH", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "SPANISH", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "LOCAL", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "FAO", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "WAS_ISO", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "SOVEREIGN", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "CONTINENT", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "UNREG1", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "UNREG2", "type": "Edm.String", "maxLength": "255", "fixedLength": "false", "unicode": "true" }, { "name": "EU", "type": "Edm.Int32" }, { "name": "SQKM", "type": "Edm.Single" }, { "name": "geom", "type": "Edm.Geography" }] }, { "name": "HasTag", "key": { "propertyRef": [{ "name": "LocationId" }, { "name": "TagId" }] }, "property": [{ "name": "LocationId", "type": "Edm.Int64", "nullable": "false", "p1:StoreGeneratedPattern": "Identity" }, { "name": "TagId", "type": "Edm.Int32", "nullable": "false" }], "navigationProperty": [{ "name": "Location", "relationship": "onYOURwayModel.LocationHasTag", "fromRole": "HasTag", "toRole": "Location" }, { "name": "Tag", "relationship": "onYOURwayModel.TagHasTag", "fromRole": "HasTag", "toRole": "Tag" }] }], "association": [{ "name": "FK_my_Card_UserProfile", "end": [{ "type": "Edm.onYOURwayModel.UserProfile", "role": "UserProfile", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.Card", "role": "Card", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "UserProfile", "propertyRef": { "name": "UserId" } }, "dependent": { "role": "Card", "propertyRef": { "name": "UserId" } } } }, { "name": "FK_my_ShoppingList_UserProfile", "end": [{ "type": "Edm.onYOURwayModel.UserProfile", "role": "UserProfile", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.ShoppingList", "role": "ShoppingList", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "UserProfile", "propertyRef": { "name": "UserId" } }, "dependent": { "role": "ShoppingList", "propertyRef": { "name": "UserId" } } } }, { "name": "FK_oyw_ForeignId_Partner", "end": [{ "type": "Edm.onYOURwayModel.Partner", "role": "Partner", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationForeignId", "role": "LocationForeignId", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Partner", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationForeignId", "propertyRef": { "name": "PartnerId" } } } }, { "name": "FK_oyw_RegionAlias_Region", "end": [{ "type": "Edm.onYOURwayModel.Region", "role": "Region", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.RegionAlias", "role": "RegionAlia", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Region", "propertyRef": { "name": "Id" } }, "dependent": { "role": "RegionAlia", "propertyRef": { "name": "RegionId" } } } }, { "name": "FK_oyw_RegionView_Region", "end": [{ "type": "Edm.onYOURwayModel.Region", "role": "Region", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.RegionView", "role": "RegionView", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Region", "propertyRef": { "name": "Id" } }, "dependent": { "role": "RegionView", "propertyRef": { "name": "RegionId" } } } }, { "name": "FK_oyw_TagAlias_Tag", "end": [{ "type": "Edm.onYOURwayModel.Tag", "role": "Tag", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.TagName", "role": "TagName", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Tag", "propertyRef": { "name": "Id" } }, "dependent": { "role": "TagName", "propertyRef": { "name": "TagId" } } } }, { "name": "TagIsA", "end": [{ "type": "Edm.onYOURwayModel.Tag", "role": "Tag", "multiplicity": "*" }, { "type": "Edm.onYOURwayModel.Tag", "role": "Parent", "multiplicity": "*" }] }, { "name": "FK_oyw_ForeignId_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationForeignId", "role": "LocationForeignId", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationForeignId", "propertyRef": { "name": "LocationId" } } } }, { "name": "FK_oyw_ProductSuggestion_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "0..1" }, { "type": "Edm.onYOURwayModel.ProductSuggestion", "role": "ProductSuggestion", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "ProductSuggestion", "propertyRef": { "name": "LocationId" } } } }, { "name": "FK_my_Location_UserProfile1", "end": [{ "type": "Edm.onYOURwayModel.UserProfile", "role": "UserProfile", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.MyLocation", "role": "Location1", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "UserProfile", "propertyRef": { "name": "UserId" } }, "dependent": { "role": "Location1", "propertyRef": { "name": "UserId" } } } }, { "name": "FK_oyw_LocationLink_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationLink", "role": "LocationLink", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationLink", "propertyRef": { "name": "LocationId" } } } }, { "name": "FK_oyw_LocationAlias_Location", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.LocationAlias", "role": "LocationAlia", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "LocationAlia", "propertyRef": { "name": "LocationId" } } } }, { "name": "LocationHasTag", "end": [{ "type": "Edm.onYOURwayModel.Location", "role": "Location", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.HasTag", "role": "HasTag", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Location", "propertyRef": { "name": "Id" } }, "dependent": { "role": "HasTag", "propertyRef": { "name": "LocationId" } } } }, { "name": "TagHasTag", "end": [{ "type": "Edm.onYOURwayModel.Tag", "role": "Tag", "multiplicity": "1" }, { "type": "Edm.onYOURwayModel.HasTag", "role": "HasTag", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Tag", "propertyRef": { "name": "Id" } }, "dependent": { "role": "HasTag", "propertyRef": { "name": "TagId" } } } }], "complexType": [{ "name": "SearchSuggestion", "property": [{ "type": "Edm.String", "name": "Class", "nullable": "false", "maxLength": "8" }, { "type": "Edm.String", "name": "Name", "nullable": "false", "maxLength": "200" }] }, { "name": "Place", "property": [{ "type": "Edm.String", "name": "T", "nullable": "false", "maxLength": "7" }, { "type": "Edm.Int64", "name": "Id", "nullable": "false" }, { "type": "Edm.String", "name": "Name", "nullable": "true", "maxLength": "200" }, { "type": "Edm.String", "name": "Alias", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Street", "nullable": "true", "maxLength": "200" }, { "type": "Edm.String", "name": "HouseNumber", "nullable": "true", "maxLength": "20" }, { "type": "Edm.String", "name": "Zip", "nullable": "true", "maxLength": "10" }, { "type": "Edm.String", "name": "City", "nullable": "true", "maxLength": "50" }, { "type": "Edm.String", "name": "Position", "nullable": "true" }, { "type": "Edm.String", "name": "Icon", "nullable": "true", "maxLength": "50" }, { "type": "Edm.String", "name": "Tags", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Links", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Lines", "nullable": "true", "maxLength": "Max" }, { "type": "Edm.String", "name": "Open", "nullable": "true", "maxLength": "Max" }] }] } });
    initializeMetadata();

    var self = {
        //TODO: make locateContext private, all access to this has to be moved inside apiClient and its subclasses
        locateContext: locateContext,
        getTaxonomy: getTaxonomy,
        getCountries: getCountries,

        //TODO: remove my/wizardNew and all its dependencies  (locationToEdit)
        locationToEdit: ko.observable(null),
        getLocation: getLocation
    };
    return self;

    function createBreezeDataService() {
        return new breeze.DataService({
            serviceName: config.host + '/api/locate',
            hasServerMetadata: false
        });
    }

    function createBreezeContext() {
        return new breeze.EntityManager({
            dataService: createBreezeDataService(),
            metadataStore: locateMetadata
        });
    }

    function initializeMetadata() {
        //TODO: check if metadata should instead be fetched from server with locateContext.fetchMetadata(). Current solution is faster.
        locateMetadata.importMetadata(rawMetadata);
        tell.log('metadata loaded', 'location');
        extendLocationModelWithComputedProperties();
    }

    function extendLocationModelWithComputedProperties() {
        var Location = function () {
            this.kind = "";
            this.tags = [];
            this.open = [];
        };
        locateMetadata.registerEntityTypeCtor("Location:#onYOURway.Models", Location);
    }

    function getTaxonomy(region, lang) {
        var query = breeze.EntityQuery.from("GetTaxonomy");
        query.parameters = {
            RegionId: region || 1,
            Lang: lang
        };

        return locateContext
            .executeQuery(query)
            .fail(function (error) {
                var msg = breeze.saveErrorMessageService.getErrorMessage(error);
                error.message = msg;
                tell.logError("Loading Tags failed.", 'location - getTaxonomy', error);
                throw error;
            });
    }

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
    }

    //TODO: remove my/wizardNew and all its dependencies  (locationToEdit)
    function getLocation(Id) {
        var query = breeze.EntityQuery.from("Location");
        query.parameters = { Id: Id };
        return locateContext
            .executeQuery(query)
            .then(function (d) {
                var item = d.results[0];
                self.locationToEdit(item);
            })
            .fail(function (error) {
                tell.error("Location data could not be loaded: " + error.message, 'location - getLocation', error);
            });
    }

});
