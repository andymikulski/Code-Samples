# LaterGator

![Later, Gator!](http://i.imgur.com/zLV1wbG.jpg)

String-based deferred/lazy loader for JavaScript and JavaScript-like substances.

Currently depends on jQuery, but someday it'll be $-free.


## Usage
1) Load a page via ajax

```
LaterGator.load('/my-page', '.main-content-el-for-my-page', 'data-gator', {
  'error': function(){ console.log('oh no!', arguments); },
  'success': function($content, contentString){ console.log('Your content has arrived.'); },
  'done': function(){ console.log('This fires on error AND success.'); }
});
```


2) Fetch pieces of the page you just loaded

```
LaterGator.fetch('/my-page', '#cool-content', {
  'error': function(){ console.log('oh no!', arguments); },
  'success': function($content, contentString){ console.log('Your content has arrived.'); },
  'done': function(){ console.log('This fires on error AND success.'); }
});
```
