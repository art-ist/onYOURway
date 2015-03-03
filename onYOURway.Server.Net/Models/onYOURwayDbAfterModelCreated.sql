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
		Lang, 
		Title Collate SQL_Latin1_General_CP1_CI_AS As Name, 
		Convert(bit, Case When Comment = 'hidden' Then 0 Else 1 End) As Show,
		Description As [Description]
	From
		mind_Transformap.Mind.NodeTexts 
;
*/
go

Create Function oyw.BoundingBox(@geom geography) returns geography As Begin
	If @geom Is Null return null; 
	-- Convert to geometry via WKB
	Declare @bounding geometry = geometry::STGeomFromWKB( @geom.STAsBinary(), @geom.STSrid );
	-- Check Validity
	If (@bounding.STIsValid() = 0) Set @bounding = @bounding.MakeValid();
	-- Use STEnvelope()
	Declare @boundingbox geometry = @bounding.STEnvelope();
	-- Convert result back to geography via WKB
	Return geography::STGeomFromWKB(@boundingbox.STAsBinary(), @boundingbox.STSrid);
End
go
-- Select oyw.BoundingBox(Geography::STGeomFromText('LINESTRING(0 0, 10 10, 21 2)', 4326)).ToString();

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

CREATE Proc oyw.GetLocationInfoXml (@Region nvarchar(40), @Lang char(2) = 'de') As
	--  Declare @lang char(2) ='de', @Region nvarchar(40) = 'Test';

	Select (
		Select
			l.Id,
			l.Name,
			(
				Select a.Name, a.Locale
				From oyw.EntryLocalizations a
				Where a.EntryId = l.Id And (a.Locale Is Null Or a.Locale = @lang)
				For Xml Path ('Alias'), type
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
					oyw.GetCategoriessOf(l.Id) t
				Where  
					(t.Locale Is Null Or t.Locale = @lang)
				For Xml Path ('Tag'), type
			), -- As Categories,
			(
				Select 
					ll.Title As Title, ll.Locale As Lang, ll.Url
				From 
					oyw.EntryLinks ll
				Where 
					ll.EntryId = l.Id 
					And 
					(ll.Locale Is Null Or ll.Locale = @lang)
				For Xml Path ('Link'), type
			), -- As Links,
			l.OpeningHours
		From
			oyw.Entries l
		Where
			l.Discriminator = 'Location'
			And 
			l.Position.STWithin((Select r.BoundingBox From oyw.Regions r Where r.[Key] = @Region)) = 1
		For Xml Path('Locations'), type
	)
	For Xml Path('LocationsInfo')
;
go
-- Exec oyw.GetLocationInfo '00000000-0000-0000-0000-000000000001', 'de';

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
go
-- Select * From oyw.GetSubCategoryIds('00000000-0000-0000-0000-000000000265');

Create Function oyw.GetSubCategoriesXml(@parentId as uniqueidentifier, @lang varchar(2) = '') Returns Xml
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
					cn.CategoryId = c.Id And (cn.Locale Is Null Or cn.Locale = '' Or cn.Locale = @lang)
				For Xml Path('name'), Type
			),
			r.FromCategoryId As ParentId,
			oyw.GetSubCategoriesXml(c.Id, @lang)
		From
			oyw.Categories c
			Left Join
			oyw.CategoryRelations r On (r.ToCategoryId = c.Id)
		Where		
			r.FromCategoryId = @parentId
			And
			r.RelationshipType = 'subClassOf'
			And
			Exists (Select * From oyw.CategoryNames _cn Where _cn.CategoryId = c.Id And (_cn.Locale Is Null Or _cn.Locale = '' Or _cn.Locale = @lang))
        For Xml Path('category'), Type
    )
End;
go
-- Select oyw.GetSubCategoriesXml('00000000-0000-0000-0000-000000000265', 'de');
-- Select oyw.GetSubCategoriesXml('00000000-0000-0000-0000-000000000001', 'de');
-- Select oyw.GetSubCategoriesXml('00000000-0000-0000-0000-000000000001', 'en');

Create Function dbo.Split(@items nvarchar(max), @seperator nvarchar(100) = ',') Returns @result Table (Item nvarchar(max)) As Begin
	Declare @listx xml = '<s>' + Replace(Replace(Replace(@items, @seperator+' ', @seperator), ' '+@seperator, @seperator), @seperator, '</s><s>') + '</s>';
	Insert Into @result Select item.value('.[1]', 'nvarchar(max)') From @listx.nodes('s') l(item);
	Return;
End
go
-- Select * From dbo.Split('Sepp,Franz, Fritz', ',') Order By Item;

Create Proc oyw.SearchSuggestions ( @Realm nvarchar(20) = null, @Region nvarchar(40) = null, @Classes nvarchar(max) = null, @Lang char(2) = null ) As 
	Declare @bounding Geography;
	Declare @taxonomyId uniqueidentifier;
	
	Select @taxonomyId = TaxonomyId From oyw.Realms r Where r.[Key] = @Realm;
	If @Region Is Not Null Select @bounding = BoundingBox From oyw.Regions Where [Key] = @Region;
	If @Classes Is Null Set @Classes = Case When @Region Is Null Then 'category,location,city,street' Else 'category,location,street' End;
	If @Lang Is Null Set @Lang = 'en';

	Declare @result table (
		Class nvarchar(10) Null,
		Id varchar(100),
		Name nvarchar(200),
		CssClass nvarchar(100),
		IconCssClass nvarchar(100),
		IconUrl nvarchar(200),
		Street nvarchar(200),
		Zip nvarchar(100),
		City nvarchar(100),
		IsIn nvarchar(100)
	);

	If Exists(Select * From dbo.Split(@Classes, ',') Where Item = 'location') Begin
	Insert Into @result
		Select 
			'location' As Class, Convert(nvarchar(100), l.Id),
			IsNull((Select Top 1 Name From oyw.EntryLocalizations Where EntryId = l.Id And Locale = @Lang), l.Name) As Name, 
			l.CssClass, IsNull(l.IconCssClass, 'fa-map-marker'), l.IconUrl, 
			l.Street, l.Zip, l.City, Concat(l.City, ', ' + l.Street) As IsIn
		From
			oyw.Entries l
		Where
			l.Discriminator = 'Location'
			And
			l.Published = 1
			And
			(l.ApprovalRequired = 0 Or l.ApprovedBy Is Not Null)
			And
			(l.Position.STWithin(@bounding) = 1 Or @Region Is Null)
			--And
			--'location' In (Select item From dbo.Split(@Classes, ','))
		--Union 
		--Select 'location' As Class, Name From oyw.LocationAlias Where Lang Is Null Or Lang = @Lang --And LocationId In (Select Id From @locs)
	End

	Select 
		Class, f.Id,
		IsNull((Select Top 1 Name From Lookup.BaseMapFeaturesLocalized Where Class = f.Class And Id = f.Id And Locale = @Lang), f.Name) As Name, 
		null, Case Class When 'country' Then 'fa-flag' When 'city' Then 'fa-university ' When 'street' Then 'fa-road' End As IconCssClass, null, 
		null, null, null, IsIn --TODO: add city
	From
		Lookup.BaseMapFeatures f
	Where
		Class In (Select item From dbo.Split(@Classes, ','))
		--And
		--(@Region Is Null Or f.Position.STWithin(@bounding) = 1 Or f.Boundary.STIntersects(@bounding) = 1) --TODO: evaluate these

	If Exists(Select * From dbo.Split(@Classes, ',') Where Item = 'location') Begin
		Select 
			'category' As Class, c.Id,
			cn.Name, 
			null, 'fa-tag', null, null, null, null, null --pn.Name
		From
			--(
				oyw.CategoryNames cn
				Inner Join
				oyw.Categories c On (cn.CategoryId = c.Id)
			--)		
			--Left Join
			--oyw.CategoryRelations pr On (pr.ToCategoryId = c.Id)
			--Left Join
			--oyw.CategoryNames pn On (pr.FromCategoryId = pn.CategoryId And Locale Is Null Or Locale = @Lang)
		Where
			'category' In (Select item From dbo.Split(@Classes, ','))
			And
			Name Is Not Null 
			And 
			(Locale Is Null Or Locale = @Lang)
			And
			CategoryId In (Select Id From GetSubCategoryIds(@taxonomyId))
	End

	Select * From @result Order By Name;
go
-- Select * From oyw.Regions
-- Select * From lookup.BaseMapFeatures
-- Select * FRom dbo.split('location, category, street', ',')
-- Select TaxonomyId From oyw.Realms r Where r.[Key] = 'kvm'
-- Exec oyw.SearchSuggestions 'oyw', 'Test', 'location, category, city', 'de'
-- Exec oyw.SearchSuggestions 'kvm', 'Beyreuth', 'location, category, street', 'de'
-- Exec oyw.SearchSuggestions 'tm', 'Graz', 'category', 'de'

-- #endregion Functions and Procedures
