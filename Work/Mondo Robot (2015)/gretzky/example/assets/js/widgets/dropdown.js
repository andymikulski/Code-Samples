;
(function($, window, document, undefined) {

  $.widget('mondo.dropdown', $.mondo.base, {
    'options': {
      'type': 'content'
    },

    '$list': $(),
    '$items': $(),
    '$select': $(),

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

      if (widget.options.type === 'select') {
        widget.getList();
        widget.bindList();
      }
    },


    /**
     * Find the associated list with select-type dropdowns
     * Sets/updates widget.$list and widget.$items
     * @return {void}
     */
    'getList': function() {
      var widget = this;

      widget.$list = widget.element.find('[data-list]');
      widget.createListItems();
      widget.$items = widget.$list.find('li');
    },


    /**
     * Generates list items for our custom select-type dropdown based
     * on the existing options of the widget's select element
     * @return {void}
     */
    'createListItems': function() {
      var widget = this,
        $v, vName, vValue;

      // find our select
      widget.$select = widget.element.find('select');

      // for each option, loop and add to our custom list (if it doesn't already exist)
      widget.$select.find('option').each(function(i, v) {
        $v = $(v);
        vName = $v.text();
        vValue = $v.attr('value');

        if (!widget.$list.find('[data-value="' + vValue + '"]').length) {
          widget.$list.append('<li data-value="' + vValue + '">' + vName + '</li>');
        }
      });
    },

    /**
     * Bind the items in our select-type dropdown to the onItemSelect function
     * @return {void}
     */
    'bindList': function() {
      var widget = this,
        clickEvent = widget.generateUniqueEvent('click'),
        $v;

      widget.$items.each(function(i, v) {
        $v = $(v);
        $v.unbind(clickEvent).on(clickEvent, widget.onItemSelect.bind(widget));
      });
    },


    /**
     * Select-type item click event handler
     * @param  {Event}  evt  Click event object
     * @return {void}
     */
    'onItemSelect': function(evt) {
      var widget = this,
        $el = widget.element,
        $target = $(evt.currentTarget),
        targetText = $target.text(),
        targetValue = $target.attr('data-value');

      // close our accordion piece
      $el.trigger('accordion:close()');

      // un-select whatever was selected before
      widget.$select.find('option').prop('selected', false);
      // select the new value behind the scenes
      widget.$select.find('option[value="' + targetValue + '"]').prop('selected', true);

      // denote that we're no longer pristine
      widget.element.addClass('is-dirty');

      // find the dropdown's switch and update the text
      // (this updates the 'current value' displayed to the user)
      widget.element.find('[data-widget*="switch"]').text(targetText);

      // emit that the dropdown value has changed
      widget.emit('dropdown:select', {
        '$item': $target,
        'itemValue': targetValue,
        'itemText': targetText
      });
    }
  });

})(jQuery, window, document);
