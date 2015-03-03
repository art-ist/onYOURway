//using the host setting from App/app.config.js (copy and configure appConfig.template.js if doesn't exist)

QUnit.module("Api: Locate");

QUnit.test('locate/Realms', function (assert) {
	assert.expect(2);

	var action = config.host + '/locate/Realms';

	var asyncCompleted = assert.async();
	$.ajax({
		url: action,
		dataType: "json",
		type: "GET",
		timeout: 1000
	}).done(function (results) {
		assert.ok(results.length > 0, results.length + " realms found");
		if (results.length) {
			var found = false;
			for (var i = 0; i < results.length; i++) {
				if (results[i].Key === 'onyourway') {
					found = true; break;
				}
			}
			assert.ok(found, "One of the Realms is onYOURway");
		}
	}).fail(function (x, text, thrown) {
		assert.ok(false, "Querying realms failed: " + text);
	}).always(function () {
		asyncCompleted();
	});

});


QUnit.test('locate/Regions', function (assert) {
	assert.expect(2);

	var action = config.host + '/locate/Regions';
	var asyncCompleted = assert.async();
	$.ajax({
		url: action,
		dataType: "json",
		type: "GET",
		timeout: 1000
	}).done(function (results) {
		assert.ok(results.length > 0, results.length + " regions found globaly");
		//if (results.length) {
		//	assert.ok(results[0].Name === 'Test', "First region has test data");
		//}
	}).fail(function (x, text, thrown) {
		assert.ok(false, "Querying regions failed: " + text);
	}).always(function () {
		asyncCompleted();
	});

	action = config.host + '/locate/onyourway/Regions';
	var asyncCompletedRealm = assert.async();
	$.ajax({
		url: action,
		dataType: "json",
		type: "GET",
		timeout: 1000
	}).done(function (results) {
		assert.ok(results.length > 0, results.length + " regions found in realm onYOURway");
		//if (results.length) {
		//	assert.ok(results[0].Name === 'Test', "First region has test data");
		//}
	}).fail(function (x, text, thrown) {
		assert.ok(false, "Querying regions failed: " + text);
	}).always(function () {
		asyncCompletedRealm();
	});

});
