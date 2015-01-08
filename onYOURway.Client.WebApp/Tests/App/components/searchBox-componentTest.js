define(['squire'], function (Squire) {

    var MOCKED_SUGGESTIONS = ["1st suggestion", "suggestion2", "foobar", "suggestion3"];

    QUnit.module("App");
    QUnit.test("searchBoxComponent getSearchSuggestions", function (assert) {
        setupSearchBox(operateCallback);
        var testQuery = {
            term: "suggestion",
            callback: checkTestResultCallback
        };

        function operateCallback(searchBoxViewModel) {
            searchBoxViewModel.getSearchSuggestions(testQuery);
        }

        assert.expect(4);
        var asyncTestCompleted = assert.async();

        function checkTestResultCallback(searchTermSuggestions) {
            assert.ok(searchTermSuggestions.results.length == 3, "all 3 matching suggestions found");
            assert.ok(searchTermSuggestions.results[0].text.indexOf('suggestion') == 0, "1st suggestion starts with search term");
            assert.ok(searchTermSuggestions.results[1].text.indexOf('suggestion') == 0, "2nd suggestion starts with search term");
            assert.ok(searchTermSuggestions.results[2].text.indexOf('suggestion') > 0, "3rd suggestion contains search term");
            asyncTestCompleted();
        }

    });

    function setupSearchBox(callback) {
        setupMocks().require(["components/searchBox-component"], function (searchBoxComponent) {
            var sbViewModel = new searchBoxComponent.viewModel();
            callback(sbViewModel);
        });
    }

    function setupMocks() {
        var injector = new Squire();
        injector.mock("services/location", createLocationServiceMock());
        return injector;
    }

    function createLocationServiceMock() {
        return {
            searchSuggestions: function () {
                return MOCKED_SUGGESTIONS;
            }
        };
    }

});
