/*

CREATE TABLE [oyw].[Message] (
    [Locale] NVARCHAR (5)   NOT NULL,
    [Key]    VARCHAR (300)  NOT NULL,
    [Text]   NVARCHAR (MAX) NULL
);

*/


Truncate Table oyw.[Message];

INSERT INTO oyw.[Message] (Locale, [Key], [Text]) VALUES

	 ('', 'home.preview', 'Public Preview with Testdata')
	,('de', 'home.preview', 'Public Preview mit Testdaten')

	,('', 'nav.search.advanced.text', 'When & Where')
	,('de', 'nav.search.advanced.text', 'Wann & Wo')
	,('', 'nav.search.advanced.title', 'Advanced Search')
	,('de', 'nav.search.advanced.title', 'Erweiterte Suche')
	,('', 'nav.search.placeholder', 'Fruit, Bakery, Fair, ...')
	,('de', 'nav.search.placeholder', 'Obst, Heurige, Bio, ...')
	,('', 'nav.search.title', 'Search')
	,('de', 'nav.search.title', 'Suchen')

	,('', 'siteCollector.selectRegion', 'Selected region/map')
	,('de', 'siteCollector.selectRegion', 'Karte/Region wählen')
	,('', 'siteCollector.title.add', 'Add a new site')
	,('de', 'siteCollector.title.add', 'Standort hinzufügen')

;

Select * From oyw.[Message]
