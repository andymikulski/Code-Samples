/**!
 * LaterGator by Mondo Robot
 * String-based deferred/lazy loader
 */

;
(function($, window, document, undefined) {

  var LaterGator = {
    '$request': null,
    'savedContent': {},
    'waitingElement': 'article',

    /**
     * Main loading function. Loads a url, returns the target container, and
     * any waiterTargets are _not_ inserted into the page until told to do so later
     *
     * @param  {string} url           URL of page to load
     * @param  {string} target        Element to pluck from the loaded page (e.g. '.your-content')
     * @param  {string} waiterTarget  Element identifier to prevent auto-insertion into the page (e.g. 'data-later', '.lazy-loaders')
     * @param  {Object} andThen       Hash of success/error/done event handlers
     * @return {void}
     */
    'load': function(url, target, waiterTarget, andThen) {
      var gator = this;


      // check if something is already loading and if so cancel it
      gator.$request && gator.$request.abort && gator.$request.abort();

      // generate the request
      gator.$request = $.ajax({
        'url': url,
        // page failed to load
        'error': function() {
          console && console.warn && console.warn('LaterGator : loadContent : error', arguments);
          // fire the error event handler if it exists
          andThen && andThen.error && andThen.error(arguments);
          andThen && andThen.done && andThen.done();
        },
        // page loaded, time to send it to isolation
        'success': function(response) {
          gator._isolateContent(response, url, target, waiterTarget, andThen);
        }
      });
    },

    /**
     * Function to grab the content container from a server response.
     * The target/container should be the parent to all of the items to be post-loaded later.
     * (In theory this step could be skipped, but it's sexier to handle only the content we need to)
     *
     * @param  {string} response      Raw server HTML response
     * @param  {string} url           URL associated with response
     * @param  {string} target        Target container to pluck
     * @param  {string} waiterTarget Target waiters to prevent from landing on the page
     * @param  {Object} andThen       Hash of success/error/done event handlers
     * @return {void}
     */
    '_isolateContent': function(response, url, target, waiterTarget, andThen) {
      // do a leetle reformatting on the waiters
      if (waiterTarget.charAt(0) === '.') {
        waiterTarget = 'class="' + waiterTarget.substr(1).split('.') + '"';
      } else if (waiterTarget.charAt(0) === '#') {
        waiterTarget = 'id="' + waiterTarget.substr(1) + '"';
      }

      // var init
      var gator = this,
        // morphed a bit so we'll use a new var
        rawContent = response,
        // returned later
        fullRawContent = rawContent,
        // need to slugify the target (e.g. make sure it's regex-safe)
        targetSlug = target.replace(/\-/gi, '\-'),
        // regex to find the container - currently assumes it's a div
        containerReg = new RegExp('<div ' + (targetSlug.charAt(0) === '.' ? 'class' : targetSlug.charAt(0) === '#' ? 'id' : '') + '="' + target.substr(1) + '"((.|[\r\n])*)?<\/div>', 'gi'),
        // regex to find the waiters
        itemReg = new RegExp('<' + gator.waitingElement + ' ' + waiterTarget + '((.|[\r\n])*)?<\/' + gator.waitingElement + '>', 'i'),
        itemMatch;

      // try to find the element
      rawContent = (containerReg.exec(rawContent) || [])[0];
      // full raw is not touched after this
      fullRawContent = rawContent;

      // no rawContent = didn't find the element
      if (!rawContent) {
        console && console.warn && console.warn('LaterGator : _isolateContent : No ' + target + ' found in response');
        // 'done' handler must fire
        andThen && andThen.done && andThen.done();
        return;
      }

      // find the waiters
      itemMatch = itemReg.exec(rawContent);
      // if they exist..
      if (itemMatch && itemMatch.length) {
        // save them with their associated url
        gator.savedContent[url] = itemMatch[0];
      }

      // we've extracted/saved the rest of the content,
      // so we can remove it from the content about to be inserted
      rawContent = rawContent.replace(itemReg, '');

      // the raw content should only have the 'initial load' stuff,
      // so we wrap it here, wait a sec to let the browser think,
      // then fires the success/done events (if they exist)

      var $content = $(rawContent);
      setTimeout(function() {
        andThen && andThen.success && andThen.success($content, rawContent, fullRawContent);
        andThen && andThen.done && andThen.done();
      }, 50);
    },

    /**
     * Function to grab a piece of waiting/already loaded content
     * @param  {String} url     Saved URL of page we're grubbing from
     * @param  {String} target  Selector string of target to grab (e.g. '#hi' will end up grabbing <waitingElement id="hi">..</waitingElement>)
     * @param  {Object} andThen Hash of callbacks
     * @return {void}
     */
    'fetch': function(url, target, andThen) {
      var gator = this;

      // not in memory, not loaded
      if (!gator.savedContent.hasOwnProperty(url)) {
        console && console.warn && console.warn('LaterGator : fetch : URL not in memory', url);

        andThen && andThen.error && andThen.error(url);
        andThen && andThen.done && andThen.done();
        return;
      }

      // grab the saved stuff
      var storedContent = gator.savedContent[url],
        // make the target id/class regex-safe
        targetSlug = target.replace(/\-/gi, '\-'),
        // grab the first char of the target to determine if it's class or id
        firstChar = targetSlug.charAt(0),
        // build a selector string (either class/id with respective markup, else the raw `target` dumped into the element)
        selectorString = (firstChar === '.' || firstChar === '#' ? (firstChar === '.' ? 'class' : firstChar === '#' ? 'id' : '') + '="' + targetSlug.substr(1) : targetSlug),
        // regex to grab the post-load item (ex compiled regex would be something like  /<article id="that-content">[^>]*?>(.|[\s\S\r\n])*?<\/article>/i  )
        pluckReg = new RegExp('<' + gator.waitingElement + ' ' + selectorString + '[^>]*?>(.|[\s\S\r\n])*?<\/' + gator.waitingElement + '>', 'i'),
        // try to find the element via regex
        foundContent = (pluckReg.exec(storedContent) || [])[0];

      // if we do not have any found content, let the user know and fire off the necessary callbacks
      if (!foundContent || !foundContent.length) {
        console && console.warn && console.warn('LaterGator : fetch : Target not found', target, pluckReg, [storedContent, gator.savedContent]);
        andThen && andThen.error && andThen.error(url);
        andThen && andThen.done && andThen.done();
        return;
      }

      // if we made it this far then we can pass the found content back to the success callback!
      andThen && andThen.success && andThen.success($(foundContent), foundContent);
      // finally
      andThen && andThen.done && andThen.done();
    }
  };

  // just in case there's a typo
  window.LaterGator = window.LaterGater = LaterGator;

  // heck yeah mondo namespace
  window.mondo = (window.mondo || {});
  window.mondo.LaterGator = window.mondo.LaterGater = LaterGator;

})(jQuery, window, document);
