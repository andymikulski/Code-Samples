;
(function($, window, document, undefined) {

  $.widget('mondo.input', $.mondo.base, {
    'options': {
      'type': 'all',
      'valid': 'is-valid',
      'invalid': 'is-invalid'
    },

    'validationTimer': null,

    // validation tasks
    // key = type of input to validate
    // value = array of functions to run to qualify as validated
    //
    // function parameters can be defined using :'s
    // e.g. ['hi:there'] would call widget.hi('there')
    'validations': {
      'all': ['valueExists'],
      'length': ['hasLengthAtleast:3', 'hasLengthAtMost:8'],
      'email': ['emailFormat', 'hasCharacter:@', 'hasLengthAtleast:6'],
      'phone': ['hasDigits:10:16']
    },

    /**
     * Constructor. Runs on widget instantiation.
     * Options are passed in via widget constructor function, which
     * becomes this.options.
     *
     * @return {void}
     */
    '_create': function() {
      var widget = this;

      widget._super('_create');
    },

    /**
     * 'Re-init' function. Used when widget constructor is called on
     * an element that already has it. Basically a straight refresh.
     * @return {[type]} [description]
     */
    'refresh': function() {
      var widget = this;
      widget.bindChange();
    },

    /**
     * Bind events to the widget dom element
     * Pretty much just binds keyup (_not_ change) to the change handler
     * @return {void}
     */
    'bindChange': function() {
      var widget = this,
        eventName = widget.generateUniqueEvent('keyup'),
        $el = widget.element;

      $el.unbind(eventName).on(eventName, widget.onInputChange.bind(widget));
    },

    /**
     * Input change event handler. Validates field value based on chosen config
     * @param  {KeyboardEvent} evt Keyup Event Object
     * @return {void}
     */
    'onInputChange': function(evt) {
      var widget = this,
        $el = widget.element,
        validates = widget.validateType($el.val());

      // here we simply report validation errors to the console.
      // in the future we should use a tooltip to display this with the field
      if (validates.success === false) {
        console && console.log && console.log(validates.message);
      }

      // update field appearance based on validity
      widget.setValidity(validates.success);
    },

    /**
     * Changes field appearance based on validity or not
     * @param  {Boolean} isValid Is this field valid?
     * @return {void}
     */
    'setValidity': function(isValid) {
      var widget = this,
        $el = widget.element;

      widget.emitValidity(isValid);
      if (isValid) {
        $el.removeClass(widget.options.invalid);
        $el.addClass(widget.options.valid);
      } else {
        $el.addClass(widget.options.invalid);
        $el.removeClass(widget.options.valid);
      }
    },

    /**
     * Tests a value against a field type to determine validity.
     * e.g. email inputs must look like emails, phone numbers must have numbers, etc
     * @param  {string}  value Input contents to test against type
     * @param  {string}  type  Optional: Type of input to define validation
     * @return {boolean}       Does this input type/value pass validation?
     */
    'validateType': function(value, type) {
      var widget = this,
        type = type || widget.options.type,
        // our currently referenced group of validation checks
        validationFunctions,
        //temp loop variable
        loopIndex,
        // object that will ultimately be returned
        returnData = {
          'success': true,
          'message': []
        };


      // loop through the 'all' group (regardless of type)
      validationFunctions = widget.validations['all'] || [];
      for (loopIndex = 0; loopIndex < validationFunctions.length; loopIndex++) {
        returnData = widget.runValidationFunction(type, value, validationFunctions[loopIndex], returnData);
      }

      // type-specific validation checks
      if (type !== 'all' && widget.validations.hasOwnProperty(type)) {
        validationFunctions = widget.validations[type];
        for (loopIndex = 0; loopIndex < validationFunctions.length; loopIndex++) {
          returnData = widget.runValidationFunction(type, value, validationFunctions[loopIndex], returnData);
        }
      }

      // return the compiled set of data on validated data
      return returnData;
    },

    /**
     * Function to call a selected validation method
     * @param  {string}   type           Type of field about to validated
     * @param  {string}   value          String value to validate
     * @param  {string}   funcDefinition String definition of function to run (from widget.validations)
     * @param  {object}   returnData     Existing returnData object passed in from widget.validateType
     * @return {Object}                  {'success': boolean, 'message': string[]}
     */
    'runValidationFunction': function(type, value, funcDefinition, returnData) {
      var widget = this,
        validMethod, // actual function reference to call
        validationResponse; // response from the function to call

      // function parameters can be defined using :'s
      // e.g. ['hi:there'] would call widget.hi('there')
      funcDefinition = funcDefinition.split(':');

      // get the referenced function off the widget
      validMethod = widget[funcDefinition[0]];

      // hold onto the response (will be true, string, or null (if validMethod is not found)
      validationResponse = (validMethod && validMethod(value, funcDefinition.slice(1)));

      // not true = not validation
      // note strict equals here
      if (validationResponse !== true) {
        // success flag will be false (all must pass for 'true')
        returnData.success = false;
        // string = function responded with an error message
        if (typeof validationResponse === 'string') {
          returnData.message.push(validationResponse);
        } else {
          // something else = probably null or an error or something
          returnData.message.push('Error validating "' + type + '"');
        }
      }

      return returnData;
    },


    /**
     * Validation method to determine if string matches general email format
     * @param  {string} value     Value to compare
     * @return {boolean|string}   True if successful or message relating to failed validation
     */
    'emailFormat': function(value) {
      var widget = this,
        emailRegex = (/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

      if (emailRegex.test(value) === true) {
        return true;
      } else {
        return 'This does not look like an email address.'
      }
    },

    /**
     * Validation method to determine if string contains one or more characters
     * @param  {string}         value       Value to compare
     * @param  {Array<string>}  characters  Array of characters to search for in string
     * @return {boolean|string}             True if successful or message relating to failed validation
     */
    'hasCharacter': function(value, characters) {
      var widget = this,
        index,
        missingChars = [];

      // loop through each and keep those that are missing
      for (index = 0; index < characters.length; index++) {
        if (value.indexOf(characters[index]) < 0) {
          missingChars.push(characters[index]);
        }
      }

      // return a string with the missing characters if necessary
      if (missingChars.length > 0) {
        return 'Character' + (missingChars.length > 1 ? 's' : '') + ' missing: ' + missingChars.join(', ');
      } else {
        return true;
      }
    },


    /**
     * Validation method to determine if a string/number has enough digits
     * @param  {string} value     Value to compare
     * @param  {Array}  params    Array containing the minRange and maxRange, respectively
     * @return {boolean|string}   True if successful or message relating to failed validation
     */
    'hasDigits': function(value, params) {
      var widget = this,
        // assume first two parameters are what we need
        minRange = params[0],
        maxRange = params[1];

      if (typeof minRange === 'undefined' || typeof maxRange === 'undefined') {
        return 'ValidationModel : hasDigits : both minRange and maxRange must be defined';
      }

      minRange = parseInt(minRange, 10);
      maxRange = parseInt(maxRange, 10);

      // use regex to look for digits only
      value = value.replace(/\D/g, '');
      // if we're within the range, just return true
      if ((value.length >= minRange && value.length <= maxRange) === true) {
        return true;
      } else {
        // else we'll specify where we fall outside that range
        if (value.length < minRange) {
          return 'Value has too few digits.';
        } else if (value.length > maxRange) {
          return 'Value has too many digits.';
        }
      }
    },

    /**
     * Validation method to determine if variable is null (and if a string is empty)
     * @param  {string} value     Value to compare
     * @return {boolean|string}   True if successful or message relating to failed validation
     */
    'valueExists': function(value) {
      var widget = this;

      if (value && value !== '') {
        return true;
      } else {
        return 'Value is empty';
      }
    },


    /**
     * Validation method to determine if a string is long enough
     * @param  {string} value     Value to compare
     * @param  {Array}  param     Length to compare
     * @return {boolean|string}   True if successful or message relating to failed validation
     */
    'hasLengthAtleast': function(value, param) {
      var widget = this,
        length = param[0];

      if (typeof length === 'undefined') {
        return 'ValidationModel : hasLengthAtleast : length must be defined';
      }

      length = parseInt(length, 10);

      if (value.length >= length) {
        return true;
      } else {
        return 'Value is not long enough'
      }
    },

    /**
     * Validation method to determine if a string is long enough
     * @param  {string} value     Value to compare
     * @param  {Array}  param     Length to compare
     * @return {boolean|string}   True if successful or message relating to failed validation
     */
    'hasLengthAtMost': function(value, param) {
      var widget = this,
        length = param[0];

      if (typeof length === 'undefined') {
        return 'ValidationModel : hasLengthAtMost : length must be defined';
      }

      length = parseInt(length, 10);

      if (value.length <= length) {
        return true;
      } else {
        return 'Value is too long'
      }
    },

    /**
     * Broadcasts the validity of the current field.
     * The emit is throttled due to the fact that key input is not throttled
     * (should probably switch that!)
     * @param  {Boolean} isValid Is the field valid or invalid?
     * @return {void}
     */
    'emitValidity': function(isValid) {
      var widget = this,
        emitFunction = (function(widget, isValid) {
          return function() {
            widget.emit('input:validChange', {
              'valid': isValid
            });
            widget.emit('input:' + (isValid ? 'valid' : 'invalid'), {
              'valid': isValid
            });
          }
        })(widget, isValid);

      // throttlage
      if (widget.validationTimer) {
        clearTimeout(widget.validationTimer);
      }
      widget.validationTimer = setTimeout(emitFunction, 250);
    }
  });

})(jQuery, window, document);
