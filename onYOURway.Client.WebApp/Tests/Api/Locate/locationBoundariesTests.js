//using the host setting from App/app.config.js (copy and configure appConfig.template.js if doesn't exist)

QUnit.module("Api: Locate");

QUnit.test('locate/Realms', function (assert) {
	assert.expect(2);

	var action = config.host + '/api/locate/Realms';

	var asyncCompleted = assert.async();
	$.ajax({
		url: action,
		dataType: "json",
		type: "GET",
		timeout: 1000
	}).done(function (results) {
		assert.ok(results.length > 0, results.length + " realms found");
		if (results.length) {
			for (var i = 0; i < results.length; i++) {
				if (results[i].Key === 'onYOURway') {
					assert.ok(true, "One of the Realms is onYOURway");
				}
			}
		}
	}).fail(function (x, text, thrown) {
		assert.ok(false, "Querying realms failed: " + text);
	}).always(function () {
		asyncCompleted();
	});

});


QUnit.test('locate/Regions', function (assert) {
	assert.expect(2);

	var action = config.host + '/api/locate/Regions';

	var asyncCompleted = assert.async();
	$.ajax({
		url: action,
		dataType: "json",
		type: "GET",
		timeout: 1000
	}).done(function (results) {
		assert.ok(results.length > 0, results.length + " regions found");
		if (results.length) {
			assert.ok(results[0].Name === 'Testdaten (Baden)', "First region has test data");
		}
	}).fail(function (x, text, thrown) {
		assert.ok(false, "Querying regions failed: " + text);
	}).always(function () {
		asyncCompleted();
	});

});
