//Highlight field in red & show first validation message
//
//Outputs first validation message for 'propertyName' or if null: previous controls value binding
//Needs ancestor with 'control-group' class to set class 'error' for Bootstrap error display
//
//Example:
//<td class="control-group">
//    <input class="input-block-level text-right" data-bind="value: id" />
//    <span class="help-inline" data-bind="breezeValidation: null"></span>
//</td>
//
//Does not and cannot validate keys that already exist in cache. knockout write calls breeze which throws uncaught error

ko.bindingHandlers.breezeValidation = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here

        var $msgElement = $(element);
        var entity = viewModel && viewModel.entityAspect ? viewModel : bindingContext.$root.item();
        var app = bindingContext.$root.app;
		 
        var propNames = valueAccessor();
        // if this is no inline error (propNames === null), then we don't have a groupElement!
        var $groupElement = propNames === null ? $msgElement : ($msgElement.prev());

        if (propNames === null || typeof propNames === 'string') {
            propNames = [propNames];
        }

        onValidationChange();               //fire immediately (especially for added)
        //... and anytime validationErrors are changed fire onValidationChnange
        entity.entityAspect.validationErrorsChanged.subscribe(onValidationChange);

        element.onchange = function () {
            //Should never have updates pushed from validation msgElement
            $msgElement.text("readonly error");
        };


        function onValidationChange() {
            $msgElement.empty();
            var hasError = false;
            for (var idx in propNames) {
                var propName = propNames[idx];
                var errors = entity.entityAspect.getValidationErrors(propName);
                if (errors && errors.length) {
                    var appMsg = app.msg;
                    var errValidMsg = appMsg.error.validation;
                    for (var i in errors) {
                        var err = errors[i];
                        if (!hasError) {
                            hasError = true;
                            if (propName == null) {
                                $msgElement.append($('<div/>', { text: app.getMsg('header', null, errValidMsg) })); /*Speichern nicht möglich! Korrigieren Sie zuerst die Fehler.'*/
                            }
                        }
                        if (propName != null || err.isServerError) {
                            var errMsg = undefined;
                            if (err.key) {
                                //try to get translated message by key
                                var typeName = err.property && err.property.parentType && err.property.parentType.shortName;
                                var attrName = err.propertyName || propName;
                                var variables = [(attrName && app.tryMsg(attrName, undefined, appMsg.property)) || attrName, (typeName && app.tryMsg(typeName, undefined, appMsg.objectType)) || typeName];
                                errMsg = app.tryMsg(err.key, variables, errValidMsg);
                                if (!errMsg) {
                                    //if the key contains a colon and no message was found, 
                                    //retry with the part before the colon
                                    var errKeys = err.key.split(':');
                                    if (errKeys.length) {
                                        errMsg = app.tryMsg(errKeys[0], variables, errValidMsg);
                                    }
                                }
                            }
                            $msgElement.append($('<div/>', { text: errMsg || err.errorMessage }));
                        }
                    }
                }
            }
            if (hasError) {
                $groupElement.addClass('error');
                $msgElement.addClass('error');
            }
            else {
                $groupElement.removeClass('error');
                $msgElement.removeClass('error');
            }
            return true;
        }


    }
    //Not interested in changes to valueAccessor - it is only the fieldName.
    //update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
};