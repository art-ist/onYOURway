--#region Defaults, Constraints

Create Unique NonClustered Index U_Categories_Key  On oyw.Categories([Key]) Where [Key] Is Not Null; --maybe change to crawling taxonomy tree based check

Create Unique NonClustered Index U_Source_Key_Id On oyw.Entries(SourceKey, SourceId) Where SourceId Is Not Null; --Allow duplicate SourceKey without Id

--#endregion Defaults, Constraints

-- #region Triggers

go

-- #endregion Triggers

-- #region Functions and Procedures
/*
Create View oyw.Categories As 
	Select 
		Convert(int, Id) As Id, 
		NodeType As [Type], 
		CssClass,
		Icon,
		Hook As [Values],
		ForeignId 
	From
		mind_Transformap.Mind.Nodes 
;

Create View oyw.CategoryRelations As 
	Select
		Convert(int, ToId) As TagId,
		Convert(int, FromId) As ParentId, 
		Position
	From
		mind_Transformap.Mind.Connections
;

Create View oyw.CategoryNames As 
	Select 
		Convert(int, NodeId) As TagId, 
		Locale, 
		Title Collate SQL_Latin1_General_CP1_CI_AS As Name, 
		Convert(bit, Case When Comment = 'hidden' Then 0 Else 1 End) As Show,
		Description As [Description]
	From
		mind_Transformap.Mind.NodeTexts 
;
*/
go

--#region Utilities

If Object_Id('dbo.IsNullOrWhiteSpace') Is Not Null Drop Function oyw.IsNullOrWhiteSpace;
go
Create Function dbo.IsNullOrWhiteSpace(@val nvarchar(max)) Returns bit As Begin
	If @val Is Null Return 1;
	If LTrim(@val) = '' Return 1;
	Return 0;
End
go

If Object_Id('dbo.Split') Is Not Null Drop Function dbo.Split;
go
Create Function dbo.Split(@items nvarchar(max), @seperator nvarchar(100) = ',') Returns @result Table (Item nvarchar(max)) As Begin
	Declare @listx xml = '<s>' + Replace(Replace(Replace(@items, @seperator+' ', @seperator), ' '+@seperator, @seperator), @seperator, '</s><s>') + '</s>';
	Insert Into @result Select item.value('.[1]', 'nvarchar(max)') From @listx.nodes('s') l(item);
	Return;
End
-- Select * From dbo.Split('Sepp,Franz, Fritz', ',') Order By Item;
go

If Object_Id('oyw.BoundingBox') Is Not Null Drop Function oyw.BoundingBox;
go
Create Function oyw.BoundingBox(@geo geography) returns geography As Begin
	If @geo Is Null return null; 
	-- Convert to geometry via WKB
	Declare @geom geometry = geometry::STGeomFromWKB( @geo.STAsBinary(), @geo.STSrid );
	-- Check Validity
	If (@geom.STIsValid() = 0) Set @geom = @geom.MakeValid();
	-- Use STEnvelope()
	Declare @boundingbox geometry = @geom.STEnvelope();
	-- Convert result back to geography via WKB
	Return geography::STGeomFromWKB(@boundingbox.STAsBinary(), @boundingbox.STSrid);
End
-- Select oyw.BoundingBox(Geography::STGeomFromText('LINESTRING(0 0, 10 10, 21 2)', 4326)).ToString();
go

If Object_Id('oyw.Position') Is Not Null Drop Function oyw.Position;
go
Create Function oyw.Position(@geo geography) returns geography As Begin
	If @geo.STGeometryType() = 'Point' Return @geo; --avoid unnessesary calculation and rounding errors
	Return @geo.EnvelopeCenter();
	--If @geo Is Null return null; 
	---- Convert to geometry via WKB
	--Declare @geom geometry = geometry::STGeomFromWKB( @geo.STAsBinary(), @geo.STSrid );
	---- Check Validity
	--If (@geom.STIsValid() = 0) Set @geom = @geom.MakeValid();
	---- Use STEnvelope()
	--Declare @point geometry = @geom.STCentroid();
	---- Convert result back to geography via WKB
	--Return geography::STGeomFromWKB(@point.STAsBinary(), @point.STSrid);
End
-- Select oyw.Position(Geography::STGeomFromText('LINESTRING(0 0, 10 10, 21 2)', 4326)).ToString();
-- Select oyw.Position(Geography::STGeomFromText('POLYGON ((0 0, 21 0, 21 10, 0 10, 0 0))', 4326)).ToString();
-- Select oyw.Position(Geography::STGeomFromText('POINT (10 5)', 4326)).ToString();
go

--#endregion Utilities

If Object_Id('oyw.Locations') Is Not Null Drop View oyw.Locations;
go
Create View oyw.Locations As 
	Select  Id ,Locale ,Name ,[Description] ,CssClass ,IconCssClass ,IconUrl ,OpeningHours ,ThumbId ,ImageId 
			,RealmKey ,CreatedBy ,CreatedAt ,ModifiedBy ,ModifiedAt ,ApprovalRequired ,ApprovedAt ,ApprovedBy ,Published 
			,SourceKey ,SourceId 
			,CountryCode ,ProvinceCode ,City ,Zip ,Street ,HouseNumber 
			,Position ,Boundary
	From oyw.Entries l
	Where l.Discriminator = 'Location'
;
-- Select * From oyw.Locations
go

If Object_Id('oyw.Events') Is Not Null Drop View oyw.Events;
go
Create View oyw.Events As 
	Select  Id ,Locale ,Name ,[Description] ,CssClass ,IconCssClass ,IconUrl ,OpeningHours ,ThumbId ,ImageId 
			,RealmKey ,CreatedBy ,CreatedAt ,ModifiedBy ,ModifiedAt ,ApprovalRequired ,ApprovedAt ,ApprovedBy ,Published 
			,SourceKey ,SourceId 
			,Start, [End], Recurrency, LocationId
	From oyw.Entries l
	Where l.Discriminator = 'Event'
;
-- Select * From oyw.Events
go

If Object_Id('oyw.GetCategoriesOf') Is Not Null Drop Function oyw.GetCategoriesOf;
go
CREATE Function oyw.GetCategoriesOf(@EntryId uniqueidentifier) Returns Table As Return 
	WITH 
	allCats As (
		Select 
			c.Id As TagId, cn.Name, cn.Locale, c.[Type], cn.Visible
		From
			oyw.EntryCategories ht
			Inner Join
			oyw.Categories c On (ht.CategoryId = c.Id)
			Inner Join
			oyw.CategoryNames cn On (c.Id = cn.CategoryId)
		Where
			ht.EntryId = @EntryId
		Union All
		Select
			c.Id As TagId, cn.Name, cn.Locale, c.[Type], cn.Visible
		From
			oyw.Categories c
			Inner Join 
			oyw.CategoryRelations isa On (c.Id = isa.FromCategoryId)
			Inner Join
			allCats cats On (cats.TagId = isa.ToCategoryId)
			Inner Join
			oyw.CategoryNames cn On (c.Id = cn.CategoryId)
	)
	SELECT Distinct
		*
	From
		allCats;
go
-- Select * From oyw.GetCategoriesOf('00000000-0000-0000-0000-000000000140');
-- Select * From oyw.GetCategoriesOf('00000000-0000-0000-0000-000000000023');

If Object_Id('oyw.GetLocationInfoXml') Is Not Null Drop Proc oyw.GetLocationInfoXml;
go
CREATE Proc oyw.GetLocationInfoXml (@Realm nvarchar(20) = Null, @Region nvarchar(40) = Null, @Locale char(2) = 'en') As
	--  Declare @Locale char(2) ='de', @Region nvarchar(40) = 'Test';

	Select (
		Select
			l.Id,
			l.Name,
			(
				Select a.Name, a.Locale
				From oyw.EntryLocalizations a
				Where a.EntryId = l.Id And (a.Locale Is Null Or a.Locale = @Locale)
				For Xml Path ('Localization'), type
			), --As Aliases,
			l.Street,
			l.HouseNumber,
			l.Zip,
			l.City,
			l.Position.ToString() As Position,
			l.IconUrl As Icon,
			l.IconCssClass,
			l.[Description] As [Description],  --move to text table -> localization?
			(
				Select 
					t.Name, t.Locale, t.Visible 
				From 
					oyw.GetCategoriesOf(l.Id) t
				Where  
					(t.Locale Is Null Or t.Locale = @Locale)
				For Xml Path ('Category'), type
			), -- As Categories,
			(
				Select 
					ll.Title As Title, ll.Locale As Locale, ll.Url
				From 
					oyw.EntryLinks ll
				Where 
					ll.EntryId = l.Id 
					And 
					(ll.Locale Is Null Or ll.Locale = @Locale)
				For Xml Path ('Link'), type
			), -- As Links,
			l.OpeningHours
		From
			oyw.Entries l
		Where
			--Select Class
			l.Discriminator = 'Location'
			And 
			--within Region
			(dbo.IsNullOrWhiteSpace(@Region) = 1 Or l.Position.STWithin((Select r.BoundingBox From oyw.Regions r Where r.[Key] = @Region)) = 1)
			And
			--in the realm of (entered via or categorized in the taxonomy of the given realm)
			(dbo.IsNullOrWhiteSpace(@Realm) = 1 Or l.RealmKey = @Realm Or l.Id In (Select * From oyw.GetSubCategoryIds((Select TaxonomyId From oyw.Realms Where [Key] = @Realm))))
		For Xml Path('Locations'), type
	)
	For Xml Path('LocationsInfo')
;
-- Exec oyw.GetLocationInfoXml 'onyourway', null, 'de';
-- Exec oyw.GetLocationInfoXml 'onyourway', null, 'en';
-- Exec oyw.GetLocationInfoXml 'onyourway', 'oyw-Test-Baden', 'de';
-- Exec oyw.GetLocationInfoXml 'transformap', null, 'de';
go

If Object_Id('oyw.GetSubCategoryIds') Is Not Null Drop Function oyw.GetSubCategoryIds;
go
Create Function oyw.GetSubCategoryIds(@parentId as uniqueidentifier) Returns Table As
    Return With p As (
		Select
			rt.ToCategoryId As Id
		From
			oyw.CategoryRelations rt
		Where		
			rt.FromCategoryId = @parentId
		Union All
		Select
			r.ToCategoryId
		From
			p
			Inner Join
			oyw.CategoryRelations r On (p.Id = r.FromCategoryId)
		Where
			r.RelationshipType = 'subClassOf'
	) Select * From p
;
-- Select * From oyw.GetSubCategoryIds('00000000-0000-0000-0000-000000000265');
go

If Object_Id('oyw.GetSubCategoriesXml') Is Not Null Drop Function oyw.GetSubCategoriesXml;
go
Create Function oyw.GetSubCategoriesXml(@parentId as uniqueidentifier, @Locale varchar(2) = '') Returns Xml
Begin
    Return (
		Select
			c.Id,
			c.[Key],
			c.[Type],
			c.CssClass,
			c.IconCssClass,
			c.IconUrl,
			c.ValueEditor,
			c.ValueOptions,
			c.Visible,
			(
				Select
					cn.Locale,
					cn.Name,
					cn.[Description],
					cn.Visible
				From
					oyw.CategoryNames cn 
				Where 
					cn.CategoryId = c.Id And (cn.Locale Is Null Or cn.Locale = '' Or cn.Locale = @Locale)
				For Xml Path('name'), Type
			),
			r.FromCategoryId As ParentId,
			oyw.GetSubCategoriesXml(c.Id, @Locale)
		From
			oyw.Categories c
			Left Join
			oyw.CategoryRelations r On (r.ToCategoryId = c.Id)
		Where		
			r.FromCategoryId = @parentId
			And
			r.RelationshipType = 'subClassOf'
			And
			Exists (Select * From oyw.CategoryNames _cn Where _cn.CategoryId = c.Id And (_cn.Locale Is Null Or _cn.Locale = '' Or _cn.Locale = @Locale))
        For Xml Path('category'), Type
    )
End;
go
-- Select oyw.GetSubCategoriesXml('00000000-0000-0000-0000-000000000265', 'de');
-- Select oyw.GetSubCategoriesXml('00000000-0000-0000-0000-000000000001', 'de');
-- Select oyw.GetSubCategoriesXml('00000000-0000-0000-0000-000000000001', 'en');

If Object_Id('oyw.SearchSuggestions') Is Not Null Drop Proc oyw.SearchSuggestions;
go
Create Proc oyw.SearchSuggestions ( @Realm nvarchar(20) = null, @Region nvarchar(40) = null, @Classes nvarchar(max) = null, @Locale char(2) = null, @IncludeUnpublished bit = 0, @IncludeUnapproved bit = 0 ) As 
	Set NoCount On;

	Declare @bounding Geography = Null;
	Declare @taxonomyId uniqueidentifier;
	
	Select @taxonomyId = TaxonomyId From oyw.Realms r Where r.[Key] = @Realm;
	If dbo.IsNullOrWhiteSpace(@Region) = 0 Select @bounding = BoundingBox From oyw.Regions Where [Key] = @Region;
	If dbo.IsNullOrWhiteSpace(@Classes) = 1 Set @Classes = Case When @Region Is Null Then 'category,location,city,street' Else 'category,location,street' End;
	If dbo.IsNullOrWhiteSpace(@Locale) = 1 Set @Locale = 'en';

	Declare @result table (
		Class nvarchar(10) Null,
		Id varchar(100),
		Name nvarchar(200),
		ThumbUrl nvarchar(200),
		CssClass nvarchar(100),
		IconCssClass nvarchar(100),
		IconUrl nvarchar(200),
		Street nvarchar(200),
		Zip nvarchar(100),
		City nvarchar(100),
		IsIn nvarchar(100)
	);

	--Location
	If Exists(Select * From dbo.Split(@Classes, ',') Where Item = 'location') Begin
		Insert 
			Into @result
		Select 
			'location' As Class, Convert(nvarchar(100), l.Id),
			IsNull((Select Top 1 Name From oyw.EntryLocalizations Where EntryId = l.Id And Locale = @Locale), l.Name) As Name, 
			IIf(l.ThumbId Is Not Null, Concat('/media/', l.ThumbId), null) As ThumbUrl, 
			l.CssClass, IsNull(l.IconCssClass, 'fa-map-marker'), l.IconUrl, 
			l.Street, l.Zip, l.City, Concat(l.City, ', ' + l.Street) As IsIn
		From
			oyw.Entries l
		Where
			l.Discriminator = 'Location'
			And
			(@IncludeUnpublished = 1 Or l.Published = 1)
			And
			(@IncludeUnapproved = 1 Or l.ApprovalRequired = 0 Or l.ApprovedBy Is Not Null)
			And
			(@bounding Is Null Or l.Position.STWithin(@bounding) = 1)
			And
			--in the realm of (entered via or categorized in the taxonomy of the given realm)
			(dbo.IsNullOrWhiteSpace(@Realm) = 1 Or l.RealmKey = @Realm Or l.Id In (Select * From oyw.GetSubCategoryIds((Select TaxonomyId From oyw.Realms Where [Key] = @Realm))))

			--And
			--'location' In (Select item From dbo.Split(@Classes, ','))
		--Union 
		--Select 'location' As Class, Name From oyw.LocationAlias Where Locale Is Null Or Locale = @Locale --And LocationId In (Select Id From @locs)
	End

	--BaseMapFeatures
	Begin
		Insert 
			Into @result ( Class, Id, Name, IconCssClass, City, IsIn )
		Select 
			Class, 
			f.Id,
			IsNull((Select Top 1 Name From Lookup.BaseMapFeaturesLocalized Where Class = f.Class And Id = f.Id And Locale = @Locale), f.Name) As Name, 
			Case Class When 'Country' Then 'fa-flag' When 'City' Then 'fa-university ' When 'Street' Then 'fa-road' End As IconCssClass, 
			Case When Class = 'Street' And f.IsIn Is Not Null Then (Select Top 1 Item From dbo .Split(f.IsIn, ',')) Else Null End As City,
			f.IsIn
		From
			Lookup.BaseMapFeatures f
		Where
			Class In (Select item From dbo.Split(@Classes, ','))
			And
			(@bounding Is Null Or f.Position.STWithin(@bounding) = 1 Or f.Boundary.STIntersects(@bounding) = 1)
		;
	End

	--
	If Exists(Select * From dbo.Split(@Classes, ',') Where Item = 'category') Begin
		Insert 
			Into @result ( Class, Id, Name, IconCssClass, IsIn )
		Select 
			'category' As Class, 
			c.Id,
			cn.Name, 
			'fa-tag',
			(Select Top 1 pn.Name 
				From oyw.CategoryNames pn Inner Join oyw.CategoryRelations pr On (pr.FromCategoryId = pn.CategoryId And pr.RelationshipType = 'subClassOf') 
				Where pr.ToCategoryId = c.Id And (pn.Locale Is Null Or pn.Locale = @Locale)
				Order By pr.SortOrder
				) As IsIn
		From
			--(
				oyw.CategoryNames cn
				Inner Join
				oyw.Categories c On (cn.CategoryId = c.Id)
			--)		
			--Left Join
			--oyw.CategoryRelations pr On (pr.ToCategoryId = c.Id)
			--Left Join
			--oyw.CategoryNames pn On (pr.FromCategoryId = pn.CategoryId And Locale Is Null Or Locale = @Locale)
		Where
			'category' In (Select item From dbo.Split(@Classes, ','))
			And
			Name Is Not Null 
			And 
			(Locale Is Null Or Locale = @Locale)
			And
			CategoryId In (Select Id From GetSubCategoryIds(@taxonomyId))
		;
	End

	Set NoCount Off;
	Select * From @result Order By Name;
go
-- Select * From oyw.Regions
-- Select * From lookup.BaseMapFeatures
-- Select * FRom dbo.split('location, category, street', ',')
-- Select TaxonomyId From oyw.Realms r Where r.[Key] = 'kvm'
-- Exec oyw.SearchSuggestions 'onyourway', 'oyw-Test-Baden', 'location, category, city', 'en'
-- Exec oyw.SearchSuggestions 'vonmorgen', 'Beyreuth', 'location, category, street', 'de'
-- Exec oyw.SearchSuggestions 'transformap', 'Graz', 'category', 'de'
-- Exec oyw.SearchSuggestions 'onyourway', 'tm-Graz', 'location, category, city', 'en'
go


-- #endregion Functions and Procedures
