//using the host setting from App/app.config.js (copy and configure appConfig.template.js if doesn't exist)
var action = config.host + '/api/locate/Regions';

QUnit.module("Api");
QUnit.test(action, function (assert) {

	assert.expect(2);

	var asyncCompleted = assert.async();
	$.ajax({
		url: action,
		dataType: "json",
		type: "GET",
		timeout: 1000
	}).done(function (results) {
		assert.ok(results.length > 0, results.length + " regions found");
		if (results.length) {
			assert.ok(results[0].Boundary, "First region has a boundary");
		}
		//else assert.ok(false, "No regions found");
	}).fail(function (x, text, thrown) {
		assert.ok(false, "Querying regions failed: " + text);
	}).always(function () {
		asyncCompleted();
	});

});
