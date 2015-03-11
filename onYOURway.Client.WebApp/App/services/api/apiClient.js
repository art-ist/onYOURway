define([
    'services/tell'
], function (tell) {

	var locateMetadata = new breeze.MetadataStore();
	var rawMetadata = JSON.stringify({ "schema": { "namespace": "onYOURway.Models", "alias": "Self", "annotation:UseStrongSpatialTypes": "false", "xmlns:annotation": "http://schemas.microsoft.com/ado/2009/02/edm/annotation", "xmlns:customannotation": "http://schemas.microsoft.com/ado/2013/11/edm/customannotation", "xmlns": "http://schemas.microsoft.com/ado/2009/11/edm", "cSpaceOSpaceMapping": "[[\"onYOURway.Models.BaseMapFeature\",\"onYOURway.Models.BaseMapFeature\"],[\"onYOURway.Models.BaseMapFeatureLocalized\",\"onYOURway.Models.BaseMapFeatureLocalized\"],[\"onYOURway.Models.Entry\",\"onYOURway.Models.Entry\"],[\"onYOURway.Models.EntryCategory\",\"onYOURway.Models.EntryCategory\"],[\"onYOURway.Models.Category\",\"onYOURway.Models.Category\"],[\"onYOURway.Models.EntryExternalId\",\"onYOURway.Models.EntryExternalId\"],[\"onYOURway.Models.ExternalSystem\",\"onYOURway.Models.ExternalSystem\"],[\"onYOURway.Models.Media\",\"onYOURway.Models.Media\"],[\"onYOURway.Models.EntryLink\",\"onYOURway.Models.EntryLink\"],[\"onYOURway.Models.EntryLocalization\",\"onYOURway.Models.EntryLocalization\"],[\"onYOURway.Models.Realm\",\"onYOURway.Models.Realm\"],[\"onYOURway.Models.RealmLocalized\",\"onYOURway.Models.RealmLocalized\"],[\"onYOURway.Models.Region\",\"onYOURway.Models.Region\"],[\"onYOURway.Models.RegionLocalized\",\"onYOURway.Models.RegionLocalized\"],[\"onYOURway.Models.Map\",\"onYOURway.Models.Map\"],[\"onYOURway.Models.MapLocalized\",\"onYOURway.Models.MapLocalized\"],[\"onYOURway.Models.Event\",\"onYOURway.Models.Event\"],[\"onYOURway.Models.Location\",\"onYOURway.Models.Location\"],[\"onYOURway.Models.Message\",\"onYOURway.Models.Message\"],[\"onYOURway.Models.Role\",\"onYOURway.Models.Role\"],[\"onYOURway.Models.UserRole\",\"onYOURway.Models.UserRole\"],[\"onYOURway.Models.CategoryName\",\"onYOURway.Models.CategoryName\"],[\"onYOURway.Models.CategoryRelation\",\"onYOURway.Models.CategoryRelation\"],[\"onYOURway.Models.User\",\"onYOURway.Models.User\"],[\"onYOURway.Models.UserClaim\",\"onYOURway.Models.UserClaim\"],[\"onYOURway.Models.UserExternalLogin\",\"onYOURway.Models.UserExternalLogin\"]]", "entityType": [{ "name": "BaseMapFeature", "customannotation:ClrType": "onYOURway.Models.BaseMapFeature, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "Class" }, { "name": "Id" }] }, "property": [{ "name": "Class", "type": "Edm.String", "maxLength": "10", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Id", "type": "Edm.Int64", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "IsIn", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "ParentClass", "type": "Edm.String", "maxLength": "10", "fixedLength": "false", "unicode": "true" }, { "name": "ParentId", "type": "Edm.Int64" }, { "name": "IsoCode", "type": "Edm.String", "maxLength": "4", "fixedLength": "false", "unicode": "true" }, { "name": "Name", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "Position", "type": "Edm.Geography" }, { "name": "Boundary", "type": "Edm.Geography" }, { "name": "BoundingBox", "type": "Edm.Geography" }, { "name": "SourceKey", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "SourceId", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Localizations", "relationship": "Self.BaseMapFeatureLocalized_Feature", "fromRole": "BaseMapFeatureLocalized_Feature_Target", "toRole": "BaseMapFeatureLocalized_Feature_Source" }, { "name": "Parent", "relationship": "Self.BaseMapFeature_Parent", "fromRole": "BaseMapFeature_Parent_Source", "toRole": "BaseMapFeature_Parent_Target" }] }, { "name": "BaseMapFeatureLocalized", "customannotation:ClrType": "onYOURway.Models.BaseMapFeatureLocalized, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "FeatureClass" }, { "name": "FeatureId" }, { "name": "Locale" }] }, "property": [{ "name": "FeatureClass", "type": "Edm.String", "maxLength": "10", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "FeatureId", "type": "Edm.Int64", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Feature", "relationship": "Self.BaseMapFeatureLocalized_Feature", "fromRole": "BaseMapFeatureLocalized_Feature_Source", "toRole": "BaseMapFeatureLocalized_Feature_Target" } }, { "name": "Entry", "customannotation:ClrType": "onYOURway.Models.Entry, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "CssClass", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "IconCssClass", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "IconUrl", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "OpeningHours", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "name": "ThumbId", "type": "Edm.Guid" }, { "name": "ImageId", "type": "Edm.Guid" }, { "name": "RealmKey", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "name": "CreatedBy", "type": "Edm.Guid", "nullable": "false" }, { "name": "CreatedAt", "type": "Edm.DateTime", "nullable": "false" }, { "name": "ModifiedBy", "type": "Edm.Guid" }, { "name": "ModifiedAt", "type": "Edm.DateTime" }, { "name": "ApprovalRequired", "type": "Edm.Boolean", "nullable": "false" }, { "name": "ApprovedAt", "type": "Edm.DateTime" }, { "name": "ApprovedBy", "type": "Edm.Guid" }, { "name": "Published", "type": "Edm.Boolean", "nullable": "false" }, { "name": "SourceKey", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "SourceId", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Categories", "relationship": "Self.EntryCategory_Entry", "fromRole": "EntryCategory_Entry_Target", "toRole": "EntryCategory_Entry_Source" }, { "name": "ExternalIds", "relationship": "Self.EntryExternalId_Entry", "fromRole": "EntryExternalId_Entry_Target", "toRole": "EntryExternalId_Entry_Source" }, { "name": "Image", "relationship": "Self.Entry_Image", "fromRole": "Entry_Image_Source", "toRole": "Entry_Image_Target" }, { "name": "Links", "relationship": "Self.EntryLink_Entry", "fromRole": "EntryLink_Entry_Target", "toRole": "EntryLink_Entry_Source" }, { "name": "Localizations", "relationship": "Self.EntryLocalization_Entry", "fromRole": "EntryLocalization_Entry_Target", "toRole": "EntryLocalization_Entry_Source" }, { "name": "Realm", "relationship": "Self.Entry_Realm", "fromRole": "Entry_Realm_Source", "toRole": "Entry_Realm_Target" }, { "name": "Thumb", "relationship": "Self.Entry_Thumb", "fromRole": "Entry_Thumb_Source", "toRole": "Entry_Thumb_Target" }] }, { "name": "EntryCategory", "customannotation:ClrType": "onYOURway.Models.EntryCategory, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "EntryId" }, { "name": "CategoryId" }] }, "property": [{ "name": "EntryId", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "CategoryId", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "Value", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Comment", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Category", "relationship": "Self.EntryCategory_Category", "fromRole": "EntryCategory_Category_Source", "toRole": "EntryCategory_Category_Target" }, { "name": "Entry", "relationship": "Self.EntryCategory_Entry", "fromRole": "EntryCategory_Entry_Source", "toRole": "EntryCategory_Entry_Target" }] }, { "name": "Category", "customannotation:ClrType": "onYOURway.Models.Category, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "Key", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "CssClass", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "IconCssClass", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "IconUrl", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "Type", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "name": "ValueEditor", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "ValueOptions", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Visible", "type": "Edm.Boolean", "nullable": "false" }] }, { "name": "EntryExternalId", "customannotation:ClrType": "onYOURway.Models.EntryExternalId, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "EntryId" }, { "name": "SystemKey" }] }, "property": [{ "name": "EntryId", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "SystemKey", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "ExternalId", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Entry", "relationship": "Self.EntryExternalId_Entry", "fromRole": "EntryExternalId_Entry_Source", "toRole": "EntryExternalId_Entry_Target" }, { "name": "System", "relationship": "Self.EntryExternalId_System", "fromRole": "EntryExternalId_System_Source", "toRole": "EntryExternalId_System_Target" }] }, { "name": "ExternalSystem", "customannotation:ClrType": "onYOURway.Models.ExternalSystem, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Key" } }, "property": [{ "name": "Key", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "AppKey", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "AppSecret", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "Website", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }] }, { "name": "Media", "customannotation:ClrType": "onYOURway.Models.Media, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Guid", "nullable": "false" }, { "name": "MediaType", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Bytes", "type": "Edm.Binary", "maxLength": "Max", "fixedLength": "false" }] }, { "name": "EntryLink", "customannotation:ClrType": "onYOURway.Models.EntryLink, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "Id" }, { "name": "EntryId" }] }, "property": [{ "name": "Id", "type": "Edm.Guid", "nullable": "false" }, { "name": "EntryId", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true" }, { "name": "Type", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Title", "type": "Edm.String", "maxLength": "30", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Url", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "AccessLevel", "type": "Edm.Int16", "nullable": "false" }], "navigationProperty": { "name": "Entry", "relationship": "Self.EntryLink_Entry", "fromRole": "EntryLink_Entry_Source", "toRole": "EntryLink_Entry_Target" } }, { "name": "EntryLocalization", "customannotation:ClrType": "onYOURway.Models.EntryLocalization, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "EntryId", "type": "Edm.Guid", "nullable": "false" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Entry", "relationship": "Self.EntryLocalization_Entry", "fromRole": "EntryLocalization_Entry_Source", "toRole": "EntryLocalization_Entry_Target" } }, { "name": "Realm", "customannotation:ClrType": "onYOURway.Models.Realm, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Key" } }, "property": [{ "name": "Key", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "UriPattern", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "SuggestItems", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "LogoUrl", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "TaxonomyId", "type": "Edm.Guid", "nullable": "false" }, { "name": "Boundary", "type": "Edm.Geography" }], "navigationProperty": [{ "name": "Localizations", "relationship": "Self.RealmLocalized_Realm", "fromRole": "RealmLocalized_Realm_Target", "toRole": "RealmLocalized_Realm_Source" }, { "name": "Regions", "relationship": "Self.Region_Realm", "fromRole": "Region_Realm_Target", "toRole": "Region_Realm_Source" }, { "name": "Taxonomy", "relationship": "Self.Realm_Taxonomy", "fromRole": "Realm_Taxonomy_Source", "toRole": "Realm_Taxonomy_Target" }] }, { "name": "RealmLocalized", "customannotation:ClrType": "onYOURway.Models.RealmLocalized, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "RealmKey" }, { "name": "Locale" }] }, "property": [{ "name": "RealmKey", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Realm", "relationship": "Self.RealmLocalized_Realm", "fromRole": "RealmLocalized_Realm_Source", "toRole": "RealmLocalized_Realm_Target" } }, { "name": "Region", "customannotation:ClrType": "onYOURway.Models.Region, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Key" } }, "property": [{ "name": "Key", "type": "Edm.String", "maxLength": "40", "fixedLength": "false", "unicode": "true", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Website", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "name": "RealmKey", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "name": "CreatedBy", "type": "Edm.Int32", "nullable": "false" }, { "name": "CreatedAt", "type": "Edm.DateTime", "nullable": "false" }, { "name": "ModifiedBy", "type": "Edm.Int32" }, { "name": "BaseMapFeatureClass", "type": "Edm.String", "maxLength": "10", "fixedLength": "false", "unicode": "true" }, { "name": "BaseMapFeatureId", "type": "Edm.Int64" }, { "name": "ModifiedAt", "type": "Edm.DateTime" }, { "name": "Boundary", "type": "Edm.Geography" }, { "name": "BoundingBox", "type": "Edm.Geography" }], "navigationProperty": [{ "name": "BaseMapFeature", "relationship": "Self.Region_BaseMapFeature", "fromRole": "Region_BaseMapFeature_Source", "toRole": "Region_BaseMapFeature_Target" }, { "name": "Localizations", "relationship": "Self.RegionLocalized_Region", "fromRole": "RegionLocalized_Region_Target", "toRole": "RegionLocalized_Region_Source" }, { "name": "Maps", "relationship": "Self.Map_Region", "fromRole": "Map_Region_Target", "toRole": "Map_Region_Source" }, { "name": "Realm", "relationship": "Self.Region_Realm", "fromRole": "Region_Realm_Source", "toRole": "Region_Realm_Target" }] }, { "name": "RegionLocalized", "customannotation:ClrType": "onYOURway.Models.RegionLocalized, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "RegionKey" }, { "name": "Locale" }, { "name": "Name" }] }, "property": [{ "name": "RegionKey", "type": "Edm.String", "maxLength": "40", "fixedLength": "false", "unicode": "true", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Website", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Region", "relationship": "Self.RegionLocalized_Region", "fromRole": "RegionLocalized_Region_Source", "toRole": "RegionLocalized_Region_Target" } }, { "name": "Map", "customannotation:ClrType": "onYOURway.Models.Map, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "RegionKey" }, { "name": "Id" }] }, "property": [{ "name": "RegionKey", "type": "Edm.String", "maxLength": "40", "fixedLength": "false", "unicode": "true", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "Id", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "Visible", "type": "Edm.Boolean", "nullable": "false" }, { "name": "SortOrder", "type": "Edm.Int16", "nullable": "false" }, { "name": "BoundingBox", "type": "Edm.Geography" }], "navigationProperty": [{ "name": "Localizations", "relationship": "Self.Map_Localizations", "fromRole": "Map_Localizations_Source", "toRole": "Map_Localizations_Target" }, { "name": "Region", "relationship": "Self.Map_Region", "fromRole": "Map_Region_Source", "toRole": "Map_Region_Target" }] }, { "name": "MapLocalized", "customannotation:ClrType": "onYOURway.Models.MapLocalized, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "MapId" }, { "name": "Locale" }] }, "property": [{ "name": "MapId", "type": "Edm.Guid", "nullable": "false" }, { "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Name", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }] }, { "name": "Event", "customannotation:ClrType": "onYOURway.Models.Event, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "baseType": "Self.Entry", "property": [{ "name": "LocationId", "type": "Edm.Guid", "nullable": "false" }, { "name": "Start", "type": "Edm.DateTimeOffset", "nullable": "false" }, { "name": "End", "type": "Edm.DateTimeOffset", "nullable": "false" }, { "name": "Recurrency", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Location", "relationship": "Self.Event_Location", "fromRole": "Event_Location_Source", "toRole": "Event_Location_Target" } }, { "name": "Location", "customannotation:ClrType": "onYOURway.Models.Location, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "baseType": "Self.Entry", "property": [{ "name": "CountryCode", "type": "Edm.String", "maxLength": "2", "fixedLength": "false", "unicode": "true" }, { "name": "ProvinceCode", "type": "Edm.String", "maxLength": "3", "fixedLength": "false", "unicode": "true" }, { "name": "City", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true" }, { "name": "Zip", "type": "Edm.String", "maxLength": "10", "fixedLength": "false", "unicode": "true" }, { "name": "Street", "type": "Edm.String", "maxLength": "200", "fixedLength": "false", "unicode": "true" }, { "name": "HouseNumber", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "name": "Position", "type": "Edm.Geography" }, { "name": "Boundary", "type": "Edm.Geography" }] }, { "name": "Message", "customannotation:ClrType": "onYOURway.Models.Message, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "Locale" }, { "name": "Key" }] }, "property": [{ "name": "Locale", "type": "Edm.String", "maxLength": "5", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Key", "type": "Edm.String", "maxLength": "300", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "Text", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }] }, { "name": "Role", "customannotation:ClrType": "onYOURway.Models.Role, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Int32", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "Name", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Users", "relationship": "Self.Role_Users", "fromRole": "Role_Users_Source", "toRole": "Role_Users_Target" } }, { "name": "UserRole", "customannotation:ClrType": "onYOURway.Models.UserRole, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "UserId" }, { "name": "RoleId" }] }, "property": [{ "name": "UserId", "type": "Edm.Int32", "nullable": "false" }, { "name": "RoleId", "type": "Edm.Int32", "nullable": "false" }] }, { "name": "CategoryName", "customannotation:ClrType": "onYOURway.Models.CategoryName, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "CategoryId", "type": "Edm.Guid", "nullable": "false" }, { "name": "Locale", "type": "Edm.String", "maxLength": "2", "fixedLength": "false", "unicode": "true" }, { "name": "Name", "type": "Edm.String", "maxLength": "1000", "fixedLength": "false", "unicode": "true" }, { "name": "Visible", "type": "Edm.Boolean", "nullable": "false" }, { "name": "Description", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": { "name": "Category", "relationship": "Self.CategoryName_Category", "fromRole": "CategoryName_Category_Source", "toRole": "CategoryName_Category_Target" } }, { "name": "CategoryRelation", "customannotation:ClrType": "onYOURway.Models.CategoryRelation, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "FromCategoryId" }, { "name": "ToCategoryId" }] }, "property": [{ "name": "FromCategoryId", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "ToCategoryId", "type": "Edm.Guid", "nullable": "false", "annotation:StoreGeneratedPattern": "None" }, { "name": "RelationshipType", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "SortOrder", "type": "Edm.Int16" }], "navigationProperty": [{ "name": "FromCategory", "relationship": "Self.CategoryRelation_FromCategory", "fromRole": "CategoryRelation_FromCategory_Source", "toRole": "CategoryRelation_FromCategory_Target" }, { "name": "ToCategory", "relationship": "Self.CategoryRelation_ToCategory", "fromRole": "CategoryRelation_ToCategory_Source", "toRole": "CategoryRelation_ToCategory_Target" }] }, { "name": "User", "customannotation:ClrType": "onYOURway.Models.User, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Int32", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "RealmKey", "type": "Edm.String", "maxLength": "20", "fixedLength": "false", "unicode": "true" }, { "name": "Email", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "EmailConfirmed", "type": "Edm.Boolean", "nullable": "false" }, { "name": "PasswordHash", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "SecurityStamp", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "PhoneNumber", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "PhoneNumberConfirmed", "type": "Edm.Boolean", "nullable": "false" }, { "name": "TwoFactorEnabled", "type": "Edm.Boolean", "nullable": "false" }, { "name": "LockoutEndDateUtc", "type": "Edm.DateTime" }, { "name": "LockoutEnabled", "type": "Edm.Boolean", "nullable": "false" }, { "name": "AccessFailedCount", "type": "Edm.Int32", "nullable": "false" }, { "name": "UserName", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }], "navigationProperty": [{ "name": "Claims", "relationship": "Self.User_Claims", "fromRole": "User_Claims_Source", "toRole": "User_Claims_Target" }, { "name": "Logins", "relationship": "Self.User_Logins", "fromRole": "User_Logins_Source", "toRole": "User_Logins_Target" }, { "name": "Realm", "relationship": "Self.User_Realm", "fromRole": "User_Realm_Source", "toRole": "User_Realm_Target" }, { "name": "Roles", "relationship": "Self.User_Roles", "fromRole": "User_Roles_Source", "toRole": "User_Roles_Target" }] }, { "name": "UserClaim", "customannotation:ClrType": "onYOURway.Models.UserClaim, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": { "name": "Id" } }, "property": [{ "name": "Id", "type": "Edm.Int32", "nullable": "false", "annotation:StoreGeneratedPattern": "Identity" }, { "name": "UserId", "type": "Edm.Int32", "nullable": "false" }, { "name": "ClaimType", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }, { "name": "ClaimValue", "type": "Edm.String", "maxLength": "Max", "fixedLength": "false", "unicode": "true" }] }, { "name": "UserExternalLogin", "customannotation:ClrType": "onYOURway.Models.UserExternalLogin, onYOURway.Server, Version=0.8.0.0, Culture=neutral, PublicKeyToken=null", "key": { "propertyRef": [{ "name": "LoginProvider" }, { "name": "ProviderKey" }] }, "property": [{ "name": "LoginProvider", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "ProviderKey", "type": "Edm.String", "maxLength": "100", "fixedLength": "false", "unicode": "true", "nullable": "false" }, { "name": "UserId", "type": "Edm.Int32", "nullable": "false" }] }], "association": [{ "name": "BaseMapFeatureLocalized_Feature", "end": [{ "role": "BaseMapFeatureLocalized_Feature_Source", "type": "Edm.Self.BaseMapFeatureLocalized", "multiplicity": "*" }, { "role": "BaseMapFeatureLocalized_Feature_Target", "type": "Edm.Self.BaseMapFeature", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "BaseMapFeatureLocalized_Feature_Target", "propertyRef": [{ "name": "Class" }, { "name": "Id" }] }, "dependent": { "role": "BaseMapFeatureLocalized_Feature_Source", "propertyRef": [{ "name": "FeatureClass" }, { "name": "FeatureId" }] } } }, { "name": "BaseMapFeature_Parent", "end": [{ "role": "BaseMapFeature_Parent_Source", "type": "Edm.Self.BaseMapFeature", "multiplicity": "*" }, { "role": "BaseMapFeature_Parent_Target", "type": "Edm.Self.BaseMapFeature", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "BaseMapFeature_Parent_Target", "propertyRef": [{ "name": "Class" }, { "name": "Id" }] }, "dependent": { "role": "BaseMapFeature_Parent_Source", "propertyRef": [{ "name": "ParentClass" }, { "name": "ParentId" }] } } }, { "name": "EntryCategory_Category", "end": [{ "role": "EntryCategory_Category_Source", "type": "Edm.Self.EntryCategory", "multiplicity": "*" }, { "role": "EntryCategory_Category_Target", "type": "Edm.Self.Category", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "EntryCategory_Category_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "EntryCategory_Category_Source", "propertyRef": { "name": "CategoryId" } } } }, { "name": "EntryCategory_Entry", "end": [{ "role": "EntryCategory_Entry_Source", "type": "Edm.Self.EntryCategory", "multiplicity": "*" }, { "role": "EntryCategory_Entry_Target", "type": "Edm.Self.Entry", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "EntryCategory_Entry_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "EntryCategory_Entry_Source", "propertyRef": { "name": "EntryId" } } } }, { "name": "EntryExternalId_Entry", "end": [{ "role": "EntryExternalId_Entry_Source", "type": "Edm.Self.EntryExternalId", "multiplicity": "*" }, { "role": "EntryExternalId_Entry_Target", "type": "Edm.Self.Entry", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "EntryExternalId_Entry_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "EntryExternalId_Entry_Source", "propertyRef": { "name": "EntryId" } } } }, { "name": "EntryExternalId_System", "end": [{ "role": "EntryExternalId_System_Source", "type": "Edm.Self.EntryExternalId", "multiplicity": "*" }, { "role": "EntryExternalId_System_Target", "type": "Edm.Self.ExternalSystem", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "EntryExternalId_System_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "EntryExternalId_System_Source", "propertyRef": { "name": "SystemKey" } } } }, { "name": "Entry_Image", "end": [{ "role": "Entry_Image_Source", "type": "Edm.Self.Entry", "multiplicity": "*" }, { "role": "Entry_Image_Target", "type": "Edm.Self.Media", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "Entry_Image_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "Entry_Image_Source", "propertyRef": { "name": "ImageId" } } } }, { "name": "EntryLink_Entry", "end": [{ "role": "EntryLink_Entry_Source", "type": "Edm.Self.EntryLink", "multiplicity": "*" }, { "role": "EntryLink_Entry_Target", "type": "Edm.Self.Entry", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "EntryLink_Entry_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "EntryLink_Entry_Source", "propertyRef": { "name": "EntryId" } } } }, { "name": "EntryLocalization_Entry", "end": [{ "role": "EntryLocalization_Entry_Source", "type": "Edm.Self.EntryLocalization", "multiplicity": "*" }, { "role": "EntryLocalization_Entry_Target", "type": "Edm.Self.Entry", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "EntryLocalization_Entry_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "EntryLocalization_Entry_Source", "propertyRef": { "name": "EntryId" } } } }, { "name": "RealmLocalized_Realm", "end": [{ "role": "RealmLocalized_Realm_Source", "type": "Edm.Self.RealmLocalized", "multiplicity": "*" }, { "role": "RealmLocalized_Realm_Target", "type": "Edm.Self.Realm", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "RealmLocalized_Realm_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "RealmLocalized_Realm_Source", "propertyRef": { "name": "RealmKey" } } } }, { "name": "Region_BaseMapFeature", "end": [{ "role": "Region_BaseMapFeature_Source", "type": "Edm.Self.Region", "multiplicity": "*" }, { "role": "Region_BaseMapFeature_Target", "type": "Edm.Self.BaseMapFeature", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "Region_BaseMapFeature_Target", "propertyRef": [{ "name": "Class" }, { "name": "Id" }] }, "dependent": { "role": "Region_BaseMapFeature_Source", "propertyRef": [{ "name": "BaseMapFeatureClass" }, { "name": "BaseMapFeatureId" }] } } }, { "name": "RegionLocalized_Region", "end": [{ "role": "RegionLocalized_Region_Source", "type": "Edm.Self.RegionLocalized", "multiplicity": "*" }, { "role": "RegionLocalized_Region_Target", "type": "Edm.Self.Region", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "RegionLocalized_Region_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "RegionLocalized_Region_Source", "propertyRef": { "name": "RegionKey" } } } }, { "name": "Map_Localizations", "end": [{ "role": "Map_Localizations_Source", "type": "Edm.Self.Map", "multiplicity": "0..1" }, { "role": "Map_Localizations_Target", "type": "Edm.Self.MapLocalized", "multiplicity": "*" }] }, { "name": "Map_Region", "end": [{ "role": "Map_Region_Source", "type": "Edm.Self.Map", "multiplicity": "*" }, { "role": "Map_Region_Target", "type": "Edm.Self.Region", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "Map_Region_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "Map_Region_Source", "propertyRef": { "name": "RegionKey" } } } }, { "name": "Region_Realm", "end": [{ "role": "Region_Realm_Source", "type": "Edm.Self.Region", "multiplicity": "*" }, { "role": "Region_Realm_Target", "type": "Edm.Self.Realm", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "Region_Realm_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "Region_Realm_Source", "propertyRef": { "name": "RealmKey" } } } }, { "name": "Realm_Taxonomy", "end": [{ "role": "Realm_Taxonomy_Source", "type": "Edm.Self.Realm", "multiplicity": "*" }, { "role": "Realm_Taxonomy_Target", "type": "Edm.Self.Category", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "Realm_Taxonomy_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "Realm_Taxonomy_Source", "propertyRef": { "name": "TaxonomyId" } } } }, { "name": "Entry_Realm", "end": [{ "role": "Entry_Realm_Source", "type": "Edm.Self.Entry", "multiplicity": "*" }, { "role": "Entry_Realm_Target", "type": "Edm.Self.Realm", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "Entry_Realm_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "Entry_Realm_Source", "propertyRef": { "name": "RealmKey" } } } }, { "name": "Entry_Thumb", "end": [{ "role": "Entry_Thumb_Source", "type": "Edm.Self.Entry", "multiplicity": "*" }, { "role": "Entry_Thumb_Target", "type": "Edm.Self.Media", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "Entry_Thumb_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "Entry_Thumb_Source", "propertyRef": { "name": "ThumbId" } } } }, { "name": "Event_Location", "end": [{ "role": "Event_Location_Source", "type": "Edm.Self.Event", "multiplicity": "*" }, { "role": "Event_Location_Target", "type": "Edm.Self.Location", "multiplicity": "1" }], "referentialConstraint": { "principal": { "role": "Event_Location_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "Event_Location_Source", "propertyRef": { "name": "LocationId" } } } }, { "name": "Role_Users", "end": [{ "role": "Role_Users_Source", "type": "Edm.Self.Role", "multiplicity": "1", "onDelete": { "action": "Cascade" } }, { "role": "Role_Users_Target", "type": "Edm.Self.UserRole", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "Role_Users_Source", "propertyRef": { "name": "Id" } }, "dependent": { "role": "Role_Users_Target", "propertyRef": { "name": "RoleId" } } } }, { "name": "CategoryName_Category", "end": [{ "role": "CategoryName_Category_Source", "type": "Edm.Self.CategoryName", "multiplicity": "*" }, { "role": "CategoryName_Category_Target", "type": "Edm.Self.Category", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "CategoryName_Category_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "CategoryName_Category_Source", "propertyRef": { "name": "CategoryId" } } } }, { "name": "CategoryRelation_FromCategory", "end": [{ "role": "CategoryRelation_FromCategory_Source", "type": "Edm.Self.CategoryRelation", "multiplicity": "*" }, { "role": "CategoryRelation_FromCategory_Target", "type": "Edm.Self.Category", "multiplicity": "1" }], "referentialConstraint": { "principal": { "role": "CategoryRelation_FromCategory_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "CategoryRelation_FromCategory_Source", "propertyRef": { "name": "FromCategoryId" } } } }, { "name": "CategoryRelation_ToCategory", "end": [{ "role": "CategoryRelation_ToCategory_Source", "type": "Edm.Self.CategoryRelation", "multiplicity": "*" }, { "role": "CategoryRelation_ToCategory_Target", "type": "Edm.Self.Category", "multiplicity": "1", "onDelete": { "action": "Cascade" } }], "referentialConstraint": { "principal": { "role": "CategoryRelation_ToCategory_Target", "propertyRef": { "name": "Id" } }, "dependent": { "role": "CategoryRelation_ToCategory_Source", "propertyRef": { "name": "ToCategoryId" } } } }, { "name": "User_Claims", "end": [{ "role": "User_Claims_Source", "type": "Edm.Self.User", "multiplicity": "1", "onDelete": { "action": "Cascade" } }, { "role": "User_Claims_Target", "type": "Edm.Self.UserClaim", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "User_Claims_Source", "propertyRef": { "name": "Id" } }, "dependent": { "role": "User_Claims_Target", "propertyRef": { "name": "UserId" } } } }, { "name": "User_Logins", "end": [{ "role": "User_Logins_Source", "type": "Edm.Self.User", "multiplicity": "1", "onDelete": { "action": "Cascade" } }, { "role": "User_Logins_Target", "type": "Edm.Self.UserExternalLogin", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "User_Logins_Source", "propertyRef": { "name": "Id" } }, "dependent": { "role": "User_Logins_Target", "propertyRef": { "name": "UserId" } } } }, { "name": "User_Realm", "end": [{ "role": "User_Realm_Source", "type": "Edm.Self.User", "multiplicity": "*" }, { "role": "User_Realm_Target", "type": "Edm.Self.Realm", "multiplicity": "0..1" }], "referentialConstraint": { "principal": { "role": "User_Realm_Target", "propertyRef": { "name": "Key" } }, "dependent": { "role": "User_Realm_Source", "propertyRef": { "name": "RealmKey" } } } }, { "name": "User_Roles", "end": [{ "role": "User_Roles_Source", "type": "Edm.Self.User", "multiplicity": "1", "onDelete": { "action": "Cascade" } }, { "role": "User_Roles_Target", "type": "Edm.Self.UserRole", "multiplicity": "*" }], "referentialConstraint": { "principal": { "role": "User_Roles_Source", "propertyRef": { "name": "Id" } }, "dependent": { "role": "User_Roles_Target", "propertyRef": { "name": "UserId" } } } }], "entityContainer": { "name": "onYOURwayDbContext", "customannotation:UseClrTypes": "true", "entitySet": [{ "name": "BaseMapFeatures", "entityType": "Self.BaseMapFeature" }, { "name": "BaseMapFeatureLocalizeds", "entityType": "Self.BaseMapFeatureLocalized" }, { "name": "Entries", "entityType": "Self.Entry" }, { "name": "EntryTags", "entityType": "Self.EntryCategory" }, { "name": "Tags", "entityType": "Self.Category" }, { "name": "EntryExternalIds", "entityType": "Self.EntryExternalId" }, { "name": "ExternalSystems", "entityType": "Self.ExternalSystem" }, { "name": "Media", "entityType": "Self.Media" }, { "name": "EntryLinks", "entityType": "Self.EntryLink" }, { "name": "EntryLocalizations", "entityType": "Self.EntryLocalization" }, { "name": "Realms", "entityType": "Self.Realm" }, { "name": "RealmLocalizeds", "entityType": "Self.RealmLocalized" }, { "name": "Regions", "entityType": "Self.Region" }, { "name": "RegionsLocalized", "entityType": "Self.RegionLocalized" }, { "name": "Maps", "entityType": "Self.Map" }, { "name": "MapLocalizeds", "entityType": "Self.MapLocalized" }, { "name": "Messages", "entityType": "Self.Message" }, { "name": "Roles", "entityType": "Self.Role" }, { "name": "UserRoles", "entityType": "Self.UserRole" }, { "name": "TagNames", "entityType": "Self.CategoryName" }, { "name": "TagRelations", "entityType": "Self.CategoryRelation" }, { "name": "Users", "entityType": "Self.User" }, { "name": "UserClaims", "entityType": "Self.UserClaim" }, { "name": "UserExternalLogins", "entityType": "Self.UserExternalLogin" }], "associationSet": [{ "name": "BaseMapFeatureLocalized_Feature", "association": "Self.BaseMapFeatureLocalized_Feature", "end": [{ "role": "BaseMapFeatureLocalized_Feature_Source", "entitySet": "BaseMapFeatureLocalizeds" }, { "role": "BaseMapFeatureLocalized_Feature_Target", "entitySet": "BaseMapFeatures" }] }, { "name": "BaseMapFeature_Parent", "association": "Self.BaseMapFeature_Parent", "end": [{ "role": "BaseMapFeature_Parent_Source", "entitySet": "BaseMapFeatures" }, { "role": "BaseMapFeature_Parent_Target", "entitySet": "BaseMapFeatures" }] }, { "name": "EntryCategory_Category", "association": "Self.EntryCategory_Category", "end": [{ "role": "EntryCategory_Category_Source", "entitySet": "EntryTags" }, { "role": "EntryCategory_Category_Target", "entitySet": "Tags" }] }, { "name": "EntryCategory_Entry", "association": "Self.EntryCategory_Entry", "end": [{ "role": "EntryCategory_Entry_Source", "entitySet": "EntryTags" }, { "role": "EntryCategory_Entry_Target", "entitySet": "Entries" }] }, { "name": "EntryExternalId_Entry", "association": "Self.EntryExternalId_Entry", "end": [{ "role": "EntryExternalId_Entry_Source", "entitySet": "EntryExternalIds" }, { "role": "EntryExternalId_Entry_Target", "entitySet": "Entries" }] }, { "name": "EntryExternalId_System", "association": "Self.EntryExternalId_System", "end": [{ "role": "EntryExternalId_System_Source", "entitySet": "EntryExternalIds" }, { "role": "EntryExternalId_System_Target", "entitySet": "ExternalSystems" }] }, { "name": "Entry_Image", "association": "Self.Entry_Image", "end": [{ "role": "Entry_Image_Source", "entitySet": "Entries" }, { "role": "Entry_Image_Target", "entitySet": "Media" }] }, { "name": "EntryLink_Entry", "association": "Self.EntryLink_Entry", "end": [{ "role": "EntryLink_Entry_Source", "entitySet": "EntryLinks" }, { "role": "EntryLink_Entry_Target", "entitySet": "Entries" }] }, { "name": "EntryLocalization_Entry", "association": "Self.EntryLocalization_Entry", "end": [{ "role": "EntryLocalization_Entry_Source", "entitySet": "EntryLocalizations" }, { "role": "EntryLocalization_Entry_Target", "entitySet": "Entries" }] }, { "name": "RealmLocalized_Realm", "association": "Self.RealmLocalized_Realm", "end": [{ "role": "RealmLocalized_Realm_Source", "entitySet": "RealmLocalizeds" }, { "role": "RealmLocalized_Realm_Target", "entitySet": "Realms" }] }, { "name": "Region_BaseMapFeature", "association": "Self.Region_BaseMapFeature", "end": [{ "role": "Region_BaseMapFeature_Source", "entitySet": "Regions" }, { "role": "Region_BaseMapFeature_Target", "entitySet": "BaseMapFeatures" }] }, { "name": "RegionLocalized_Region", "association": "Self.RegionLocalized_Region", "end": [{ "role": "RegionLocalized_Region_Source", "entitySet": "RegionsLocalized" }, { "role": "RegionLocalized_Region_Target", "entitySet": "Regions" }] }, { "name": "Map_Localizations", "association": "Self.Map_Localizations", "end": [{ "role": "Map_Localizations_Source", "entitySet": "Maps" }, { "role": "Map_Localizations_Target", "entitySet": "MapLocalizeds" }] }, { "name": "Map_Region", "association": "Self.Map_Region", "end": [{ "role": "Map_Region_Source", "entitySet": "Maps" }, { "role": "Map_Region_Target", "entitySet": "Regions" }] }, { "name": "Region_Realm", "association": "Self.Region_Realm", "end": [{ "role": "Region_Realm_Source", "entitySet": "Regions" }, { "role": "Region_Realm_Target", "entitySet": "Realms" }] }, { "name": "Realm_Taxonomy", "association": "Self.Realm_Taxonomy", "end": [{ "role": "Realm_Taxonomy_Source", "entitySet": "Realms" }, { "role": "Realm_Taxonomy_Target", "entitySet": "Tags" }] }, { "name": "Entry_Realm", "association": "Self.Entry_Realm", "end": [{ "role": "Entry_Realm_Source", "entitySet": "Entries" }, { "role": "Entry_Realm_Target", "entitySet": "Realms" }] }, { "name": "Entry_Thumb", "association": "Self.Entry_Thumb", "end": [{ "role": "Entry_Thumb_Source", "entitySet": "Entries" }, { "role": "Entry_Thumb_Target", "entitySet": "Media" }] }, { "name": "Event_Location", "association": "Self.Event_Location", "end": [{ "role": "Event_Location_Source", "entitySet": "Entries" }, { "role": "Event_Location_Target", "entitySet": "Entries" }] }, { "name": "Role_Users", "association": "Self.Role_Users", "end": [{ "role": "Role_Users_Source", "entitySet": "Roles" }, { "role": "Role_Users_Target", "entitySet": "UserRoles" }] }, { "name": "CategoryName_Category", "association": "Self.CategoryName_Category", "end": [{ "role": "CategoryName_Category_Source", "entitySet": "TagNames" }, { "role": "CategoryName_Category_Target", "entitySet": "Tags" }] }, { "name": "CategoryRelation_FromCategory", "association": "Self.CategoryRelation_FromCategory", "end": [{ "role": "CategoryRelation_FromCategory_Source", "entitySet": "TagRelations" }, { "role": "CategoryRelation_FromCategory_Target", "entitySet": "Tags" }] }, { "name": "CategoryRelation_ToCategory", "association": "Self.CategoryRelation_ToCategory", "end": [{ "role": "CategoryRelation_ToCategory_Source", "entitySet": "TagRelations" }, { "role": "CategoryRelation_ToCategory_Target", "entitySet": "Tags" }] }, { "name": "User_Claims", "association": "Self.User_Claims", "end": [{ "role": "User_Claims_Source", "entitySet": "Users" }, { "role": "User_Claims_Target", "entitySet": "UserClaims" }] }, { "name": "User_Logins", "association": "Self.User_Logins", "end": [{ "role": "User_Logins_Source", "entitySet": "Users" }, { "role": "User_Logins_Target", "entitySet": "UserExternalLogins" }] }, { "name": "User_Realm", "association": "Self.User_Realm", "end": [{ "role": "User_Realm_Source", "entitySet": "Users" }, { "role": "User_Realm_Target", "entitySet": "Realms" }] }, { "name": "User_Roles", "association": "Self.User_Roles", "end": [{ "role": "User_Roles_Source", "entitySet": "Users" }, { "role": "User_Roles_Target", "entitySet": "UserRoles" }] }] } } });
	var locateContext = null;

	var serviceUrl = '/locate';
	var lang = 'em';	//as this might be an ko.observable do not use directly (use getLang)

	var self = {
		initialize: initialize,

		//TODO: make locateContext private, all access to this has to be moved inside apiClient and its subclasses
		locateContext: locateContext,

		getLang: getLang,

		getRealm: getRealm,
		getRealmKey: getRealmKey,
		getTaxonomy: getTaxonomy,
		getCountries: getCountries,
		getProvinces: getProvinces,
		getCities: getCities,
		getStreets: getStreets,

		getRegions: getRegions,
		getSearchSuggestions: getSearchSuggestions,

		getLocationInfos: getLocationInfos,
		//TODO: remove my/wizardNew and all its dependencies  (locationToEdit)
		locationToEdit: ko.observable(null),
		getLocation: getLocation,

		hasChanges: hasChanges,
		createEntity: createEntity,
		detachEntity: detachEntity,
		saveChanges: saveChanges

	};
	return self;

	function createBreezeLocateContext() {
		return new breeze.EntityManager({
			dataService: new breeze.DataService({
				serviceName: serviceUrl,
				hasServerMetadata: false
			}),
			metadataStore: locateMetadata
		});
	}

	function getLang() {
		if (ko) return ko.utils.unwrapObservable(lang);
	}

	function initialize(Realm, Lang) {
		lang = Lang || 'en';
		serviceUrl = config.host + '/locate/' + Realm;
		tell.log('initialized apiClient settings', 'apiClient', { Realm: Realm, Lang: Lang, serviceUrl: serviceUrl });

		//initialize context
		locateContext = createBreezeLocateContext();
		initializeMetadata();
	} //initialize

	function initializeMetadata() {
		//TODO: check if metadata should instead be fetched from server with locateContext.fetchMetadata(). Current solution is faster.
		locateMetadata.importMetadata(rawMetadata);
		tell.log('metadata loaded', 'apiClient', locateMetadata);
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

	//#region Boundaries

	function getRealm(key) {
		var query = breeze.EntityQuery.from("Realm/" + key);
		return locateContext
            .executeQuery(query)
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading Realm failed.", 'locate - getRealmByKey', error);
            	throw error;
            });
	} //getRealmByKey

	function getRealmKey(uri) {
		var query = breeze.EntityQuery.from("GetRealmKey" + key);
		query.parameters = {
			Key: key
		};
		return locateContext
            .executeQuery(query)
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Failed to detect realm for current Url.", 'locate - getRealmKey', error);
            	throw error;
            });
	} //getRealmByKey

	function getRegions() {
		var query = breeze.EntityQuery.from("Regions");
		return locateContext
            .executeQuery(query)
            .fail(function (error) {
            	tell.error("Query for Regions failed: " + error.message, 'regionLayer', error);
            });
	}

	//#endregion Boundaries

	//#region Taxonomy

	function getTaxonomy() {
		var query = breeze.EntityQuery.from("GetTaxonomy");
		query.parameters = {
			Locale: getLang()
		};
		return locateContext
            .executeQuery(query)
			.then(function (data) {
				return data.results[0];
			})
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading Categories failed.", 'locate - getTaxonomy', error);
            	throw error;
            });
	} //getTaxonomy

	//#endregion Taxonomy

	//#region Lookups

	function getSearchSuggestions(region) {
		var query = breeze.EntityQuery.from("SearchSuggestions");
		query.parameters = {
			Region: region && region() ? ko.utils.unwrapObservable(region().Key) : config.get('defaultRegion'),
			Locale: getLang()
		};
		return locateContext
            .executeQuery(query)
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading search suggestions failed.", 'locate - getSearchSuggestions', error);
            	throw error;
            });
	}

	function getCountries() {
		var query = breeze.EntityQuery.from("GetCountries");
		query.parameters = {
			Locale: getLang()
		};
		return locateContext
            .executeQuery(query)
			.then(function (data) {
				tell.log('countries loaded', 'apiClient', data.results);
				return data.results;
			})
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading Countries failed.", 'locate - getCountries', error);
            	throw error;
            });
	} //getCountries

	function getProvinces(CountryCode) {
		var query = breeze.EntityQuery.from("GetProvinces");
		query.parameters = {
			Locale: getLang(),
			CountryCode: CountryCode
		};
		return locateContext
            .executeQuery(query)
			.then(function (data) {
				tell.log('provinces loaded', 'apiClient', data.results);
				return data.results;
			})
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading Countries failed.", 'locate - getProvinces', error);
            	throw error;
            });
	} //GetProvinces

	function getCities(CountryCode, ProvinceCode, searchString) {
		var query = breeze.EntityQuery.from("GetCities");
		query.parameters = {
			Locale: getLang(),
			CountryCode: CountryCode,
			ProvinceCode: ProvinceCode
		};
		return locateContext
            .executeQuery(query)
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading Provinces failed.", 'locate - getCities', error);
            	throw error;
            });
	} //GetCities

	function getStreets(CityId, searchString) {
		var query = breeze.EntityQuery.from("GetStreets");
		query.parameters = {
			Locale: getLang(),
			CityId: CityId
		};
		return locateContext
            .executeQuery(query)
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.logError("Loading Streets failed.", 'locate - getStreets', error);
            	throw error;
            });
	} //GetStreets

	//#endregion Lookups

	//#region Entries

	function getLocationInfos(region) {
		var action = region ? region + '/GetLocationInfos' : 'GetLocationInfos';
		var query = breeze.EntityQuery.from(action);
		query.parameters = {
			Locale: getLang()
		};
		return locateContext
			.executeQuery(query)
            .fail(function (error) {
            	var msg = breeze.saveErrorMessageService.getErrorMessage(error);
            	error.message = msg;
            	tell.error("Die Angebote der Region konnten nicht geladen werden. Sie können versuchen Sie die Seite neu aufzurufen.", 'apiClient', error);
            	throw error;
            });
	}

	//#endregion Entries

	//TODO: remove my/wizardNew and all its dependencies  (locationToEdit)
	function getLocation(Id) {
		var query = breeze.EntityQuery.from("Location");
		query.parameters = { Id: Id };
		return locateContext
            .executeQuery(query)
            .then(function (d) {
            	var item = d.results[0];
            	//self.locationToEdit(item);
            	return item;
            })
            .fail(function (error) {
            	tell.error("Location data could not be loaded: " + error.message, 'locate - getLocation', error);
            });
	}

	//#region Updates

	function hasChanges() {
		return locateContext.hasChanges();
	}

	function createEntity(typeName, initialValues) {
		return locateContext.createEntity(typeName, initialValues);
	}

	function detachEntity(item) {
		return detachEntity(item);
	}

	function saveChanges() {
		return locateContext
			.saveChanges()
			.fail(function (error) {
				tell.error("Your entries couldn't be saved.\nReason: " + error.message, 'locate', error);
			});
	}

	//#endregion Updates

});
