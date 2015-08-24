# WaltJS 2.1
## Composable CSS3 Animation Manager

JavaScript wrapper for CSS3 animation events. Allows for composing/extending animations on the fly. Combine with Animate.css for tons of fun!

### Dependencies
Requires jQuery (for now) and [caolan/async](https://github.com/caolan/async).

Got bower? `bower install andymikulski/walt`


### Usage

```
var superCoolFade = new Walt()
  .name('fadeInUp')
  .duration(250)
  .delay(1000)
  .target('#test1');

// we can fork the base animation and alter that instance
// so we fork and have an animation with 250 duration and 1000 delay targeting #test1
// (and whatever the defaults are for the other options)
superCoolFade
    .fork()
    // we're now working on a new Walt instance
    .target('#test2')
    // we still have the 1000 delay here,
    // but we can override other options
    .duration(5000)
    .animate();

// currently to stagger child delays etc,
// you have to loop via jquery or something
$('#test4').children().each(function(i,v){
    superCoolFade.fork().name('fadeInUp').duration((i+1) * 2000).target(v).animate();
});


// ..oh and animations only start when you want them to
superCoolFade.animate();
// keep in mind this only triggers our inital animation;
// forked instances need to be triggered separately
```

### Usage Explained

First step is to create an animation composition. There are default animation options, but those can be overridden.

```
var fadeInYourDiv = new Walt().target('#your-div').name('fadeIn').duration(2500);

fadeInYourDiv.animate();
```
Here, we're defining a precomposed animation to `fadeIn` for `2500ms` (along with the remaining default settings).
Calling `animate` triggers the animation to begin.


Composing animations allows you to create one 'definition' and vary or apply as necessary to other elements.
You can `fork` animations to create variations of existing compositions, and use `target` to set the element(s)

```
var superCoolFade = new Walt()
  .name('yourAwesomeCSSAnimation')
  .duration(250)
  .timing('cubic-bezier(0.86, 0, 0.07, 1)');

// we now have a composition definition, but no target
// forking allows us to take the existing definition and alter it a little,
// without messing with our main definition

var evenCoolerFade = superCoolFade.fork().duration(2500);
```

Going even further, we can use this ^ forked comp as basis for _another_ animation.
Say you want to stagger animations across a group of elements:

```
$('.stuff').each(function(i, v) {
  // we fork and re-target/re-delay to create variation in our base anim composition
  evenCoolerFade.fork().target(v).delay(i * 50).animate();
});
```

===

Animating multiple elements, as in the example above? If you're using the same animation definition
across all elements, you can simply target a collection:
```
evenCoolerFade.fork().target('.stuff').animate();
```

===

### Callbacks and chaining

A huge benefit of Walt is managing callbacks and chaining animations.
Using `before` and `after` (or `then` if you're into that), you can attach handlers to animation events.


```
yourAnimation.then(yourOtherAnimation.animate.bind(yourOtherAnimation)).animate();
```



### Playing + composing multiple animations on the fly

An ambitious effort in creating Walt is the ability play multiple animations on an element at once. This is proving tricky, but we're getting there.

```
// using a typical Walt animation object..
var ourMergedAnimation = new Walt().compose('yourCoolAnimation', 'fadeIn rubberBand');
```
Compose takes a name to identify the new animation as, and a space-delineated string of animations to merge together (to create the new animation).

After `compose`-ing, your generated animation will be created and embedded into the page, and the current animation object will set itself to play it.

Alternatively, you can request Walt to merge and embed a new animation onto the page _without_ needing to create a new Walt object:

```
var newAnimation = Walt.compose('yourObjectlessAnimation', 'oneAnimation anotherAnimation aaaandAnother');
// this registers the new animation, and returns the compiled CSS keyframe string.
```

Walt also allows easy-access to viewing keyframe information about animations. Calling `getKeyframes` will return an object of keyframes and their respective style changes.

```
console.log('Your cool generated animation:', Walt.getKeyframes('yourCoolAnimation'));
```


### List of Available Functions


```
new Walt()
  .target(element) // element to run animation on
  .name('animationName') // name of the CSS animation to apply
  .duration(1000) // animation speed (in ms)
  .delay(1000) // animation delay (in ms)
  .count(3) // how many anims to play (default 1)
  .fill('forwards') // fill mode
  
  // custom timings are available,
  .timing('cubic-bezier(0.86, 0, 0.07, 1)')
  // and walt provides timing easings built-in
  .timing(Walt.ease.inOut.quint)

  // there are some control functions
  .pause() // pauses animation
  .resume() // resumes/plays an animation
  .play() // resumes/plays an animation

  // animation creation helper functions
  .fork() // clone animation definition with current settings

  // you can also add before/after functions to fire before/after the animation
  .before(function($el, settings){ console.log('before anim starts'); })
  .after(function($el, settings){ console.log('after anim ends'); })

  // you can specify 'each' commands if you're animating a collection of elements
  // and want a handler per-item
  .beforeEach(function($el, settings){ console.log('before each individual anim starts'); })
  .afterEach(function($el, settings){ console.log('after each individual anim ends'); })


  // for multiple animations simultaneously
  .compose('yourNewAnimName', 'animToMerge1 otherAnim andSoOn');


// Non-instanced functions
Walt.compose('animName', 'anim1 anim2'); // merges and registers a new keyframed animation.
Walt.getKeyframes('animName'); // returns an object of keyframe data for the specified animation
Walt.animate(...) // used for 1.x-style animation (not grealty supported)
```


### Easings

Walt comes pre-packaged with [easings](http://easings.net) to use with the `.timing()` function.


"Defaults" are provided under `Walt.ease.defaults` :
- linear
- ease
- easeIn
- easeOut
- easeInOut

More exact timings are present under and `Walt.ease.in`, `Walt.ease.out`, and `Walt.ease.inOut` objects:
- quad
- cubic
- quart
- quint
- sine
- expo
- circ
- back

ex: `..timing(Walt.ease.in.quint)..`


===


### Legacy Walt (1.x) Support

While singleton-style Walt is deprecated, Walt 2.x supports the old style of animating:

```
Walt.animate({
  'el': $('#yourelement'),
  'animation': 'fadeInUp'
});
```

is equivalent to

```
new Walt().target('#yourelement').name('fadeInUp').animate();
```

**Please note** the legacy-style format does not currently support all of Walt 2.x's features, nor are there any current plans for supporting this format further in the future.


===


### Credits

Developed by [Andy Mikulski](http://www.andymikulski.com/).

Thanks to [Daniel Eden](https://daneden.me/) for making [Animate.css](https://daneden.github.io/animate.css/), which inspired this project.
