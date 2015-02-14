//using the urls from auth.routes

define(['squire', 'services/auth'], function (Squire, auth) {
	QUnit.module("Api: Account");

	var accessToken = '';

	//login with User=Admin with password=Pa$$w0rd
	QUnit.test("Login", function (assert) {
		assert.expect(5);

		var username = 'Admin',
			password = 'Pa$$w0rd';

		var action = auth.routes.loginUrl;
		assert.ok(true, action);

		var asyncCompleted = assert.async();
		$.ajax({
			type: "POST",
			url: action,
			contentType: 'application/x-www-form-urlencoded',
			data: ['grant_type=password',
					'username=' + username,
					'password=' + password
			].join('&'),
		}).done(function (result, textStatus, jqXHR) {

			assert.ok(result, 'Call succeeded: \n' + JSON.stringify(result));
			assert.ok(result.userName, 'Logged in as ' + result.userName);
			assert.ok(result.access_token && result.token_type === 'bearer', 'received bearer token');
			assert.ok(result.expires_in, 'token expires in ' + moment.duration(result.expires_in, 'seconds').humanize());
			accessToken = result.access_token;
			asyncCompleted();

		}).fail(function (jqXHR, textStatus, errorThrown) {
			assert.ok(false, 'Login failed: ' + textStatus, errorThrown);
			asyncCompleted();
		});

	}); //test "Login"

	//get user profile
	QUnit.test("Get UserProfile", function (assert) {
		assert.expect(2);

		var action = auth.routes.userInfoUrl;
		assert.ok(true, action);

		var asyncTestCompleted = assert.async();
		$.ajax({
			headers: { "Authorization": "Bearer " + accessToken },
			type: "GET",
			url: action,
			contentType: 'application/x-www-form-urlencoded',
		}).done(function (result, textStatus, jqXHR) {

			assert.ok(result, 'User Profile: ' + JSON.stringify(result));
			asyncTestCompleted();

		}).fail(function (jqXHR, textStatus, errorThrown) {
			assert.ok(false, 'Get UserProfile failed: ' + errorThrown + ' - ' + JSON.stringify(jqXHR));
			asyncTestCompleted();
		});

	}); //test "Get UserProfile"

	//change Admin password to Pa$$w0rd1 and back
	QUnit.test("Change Password", function (assert) {
		assert.expect(3);

		var action = auth.routes.changePasswordUrl;
		assert.ok(true, action);

		var oldPwd = 'Pa$$w0rd',
			newPwd = 'Pa$$w0rd1;'

		var changeCompleted = assert.async();
		$.ajax({
			headers: { "Authorization": "Bearer " + accessToken },
			type: "POST",
			url: action,
			contentType: 'application/x-www-form-urlencoded',
			data: ['oldpassword=' + oldPwd
				  ,'newpassword=' + newPwd
				  ,'confirmpassword=' + newPwd
			].join('&'),
		}).done(function (result, textStatus, jqXHR) {

			assert.ok(true, 'Password changed');
			changeCompleted();

			var changeBackCompleted = assert.async();
			$.ajax({
				headers: { "Authorization": "Bearer " + accessToken },
				type: "POST",
				url: action,
				contentType: 'application/x-www-form-urlencoded',
				data: ['OldPassword=' + newPwd
					  , 'NewPassword=' + oldPwd
					  , 'ConfirmPassword=' + oldPwd
				].join('&'),
			}).done(function (result, textStatus, jqXHR) {

				assert.ok(true, 'Password changed back');
				changeBackCompleted();

			}).fail(function (jqXHR, textStatus, errorThrown) {
				assert.ok(false, 'Changing back failed: ' + errorThrown + ' - ' + JSON.stringify(jqXHR));
				changeBackCompleted();
			});

		}).fail(function (jqXHR, textStatus, errorThrown) {
			assert.ok(false, 'Change failed: ' + errorThrown + ' - ' + JSON.stringify(jqXHR));
			changeCompleted();
		});

		

	}); //test "Change Password"

	//logout user Admin
	QUnit.test("Logout", function (assert) {
		assert.expect(2);

		var action = auth.routes.logoutUrl;
		assert.ok(true, action);

		var asyncTestCompleted = assert.async();
		$.ajax({
			headers: { "Authorization": "Bearer " + accessToken },
			type: "POST",
			url: action,
		}).done(function (result, textStatus, jqXHR) {

			assert.ok(true, 'Logged out');
			//TODO: maybe test for unauthorized accessing another action without login
			asyncTestCompleted();

		}).fail(function (jqXHR, textStatus, errorThrown) {
			assert.ok(false, 'Logout failed: ' + errorThrown + ' - ' + JSON.stringify(jqXHR));
			asyncTestCompleted();
		});

	}); //test "Logout"

}); //module
