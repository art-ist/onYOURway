define(['squire'], function (Squire) {

	QUnit.module("Api: Account");
	QUnit.test("Login", function (assert) {

		//login with User=Admin with password=Pa$$w0rd
		var asyncTestCompleted = assert.async();
		require(['services/auth'], function (auth) {

			var username = 'Admin',
				password = 'Pa$$w0rd';

			assert.expect(0);

			$.ajax({
				type: "POST",
				url: auth.routes.loginUrl,
				contentType: 'application/x-www-form-urlencoded',
				data: ['grant_type=password',
						'username=' + username,
						'password=' + password
				].join('&'),
			}).done(function (result, textStatus, jqXHR) {

				assert.ok(result.userName, 'Logged in as ' + result.userName);
				assert.ok(result.access_token, 'with token ' + result.access_token);
				assert.ok(result.expires_in, 'token expires in' + moment.duration(result.expires_in, 'seconds').humanize());

			}).fail(function (jqXHR, textStatus, errorThrown) {
				assert.ok(false, 'Login failed: ' + textStatus, errorThrown);
			});

			asyncTestCompleted();
		}); //require
	}); //test Login

	QUnit.test("Get Groups", function (assert) {

		assert.ok(false, "IMPLEMENT TEST");

	}); //test Get Groups

}); //module
