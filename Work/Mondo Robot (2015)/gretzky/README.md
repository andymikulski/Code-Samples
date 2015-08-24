# gretzky.js
#### aka thegreatone.js
#### aka gretz.js
##### aka thewhitetornado.js
###### aka waynedouglasgretzky.js

![Gretzky Face](images/gretzky.png?raw=true)

---

A JS widget framework built on top of the [jQuery Widget Factory](http://www.smashingmagazine.com/2011/10/11/essential-jquery-plugin-patterns/) pattern at [Mondo Robot](http://mondorobot.com).

### Installation

Install via Bower"

```
bower install https://github.com/mondorobot/gretzky.git
```

or add to your project's `bower.json` file:

```
"dependencies": {
  "gretzky": "0.0.1"
  ...
```

Then include it in your project:

```
bower install
```

Then include `base.js` and `factory.js` your HTML template:

```
<script src="<path/to/base.js>"></script>
<script src="<path/to/factory.js>"></script>
```

### Usage

Create widgets that inherit from the base widget class:

```
$.widget('mondo.*YourWidgetNameHere*', $.mondo.base, { ...`
```


Call `window.WidgetFactory.refresh()` to instantiate/refresh widgets

### Dependencies
- jQuery
- jQuery UI (just the Widget module)
- Vanilla JS (at least v5.0)
