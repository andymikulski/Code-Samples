/*!
 * WaltJS 2.1
 * @author Andy Mikulski <github.com/andymikulski>
 */
;
(function(window, document, $, async, undefined) {

    /**
     * The Walt object.
     * Each animation has a Walt instance associated with it,
     * containing properties for that animation definition.
     */
    window.Walt = (function(Walt) {

        /**
         * Constructor
         */
        function Walt() {
            var anim = this;

            // we'll apply the default options to start
            anim.settings = anim.defaults;

            // for grouped animations
            // (these fire before/after full animations are done)
            anim.onBefores = [];
            anim.onAfters = [];

            // for animation items
            // (these are fired before/after each animation item is done)
            anim.onBeforeEaches = [];
            anim.onAfterEaches = [];

            return anim;
        }

        /**
         * Utility function to convert a numeric value to a milisecond string
         * 
         * @param  {number} CSS Time value (delay/duration) to parse
         * @return {string} CSS-ified time value
         */
        function convertToCSSTime(value) {
            // check for ms, then s, and if those are found then we already have a value
            // that's in css time format
            // TODO: be more accurate in checking for placement of ms/s
            if (value.indexOf && (value.indexOf('ms') > -1 || value.indexOf('s') > -1)) {
                // sall good
            } else {
                value = value + 'ms';
            }
            return value;
        }


        /**
         * Utility function to generate an animation 'css object' based on an input string
         * @param  {string}   CSS Animation shorthand CSS to apply
         * @return {object}   Compiled 'css object'
         */
        function _createCssObj(cssString) {
            var anim = this;

            return {
                '-webkit-animation': cssString || '',
                'animation': cssString || ''
            };
        }

        // Walt prototype definition
        Walt.prototype = {
            // default animation settings
            'defaults': {
                'element': $(document.body || document.documentElement),
                'animation': 'fadeIn',
                'delay': '0s',
                'duration': '1s',
                'count': 1,
                'fill': 'both',
                'direction': 'normal',
                'timing': 'ease',
                // they are paused to start for greater control;
                // they only begin once walt calls `resume` when its ready
                'state': 'paused'
            },



            // 
            // 
            // 
            // Transformation functions
            // 
            // 
            // 



            /**
             * Sets the current animation's element target
             * 
             * @param  {jQuery|Element}   Element to apply the animation to
             * @return {Walt}             This Walt animation instance
             */
            'target': function($el) {
                var anim = this;

                if (typeof $el === 'undefined') {
                    return anim.settings.element;
                }

                if ($el) {
                    $el = !($el instanceof $) ? $($el) : $el;
                    anim.settings.element = $el;
                    return anim;
                }
            },


            /**
             * Set the name of the CSS animation to apply to target.
             * 
             * @param  {string}   Name of CSS Animation
             * @return {Walt}     This Walt animation instance
             */
            'name': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.animation;
                }

                anim.settings.animation = value;

                return anim;
            },


            /**
             * Set the fill mode of the CSS animation to apply to target.
             * 
             * @param  {string}   CSS Fill mode to apply
             * @return {Walt}     This Walt animation instance
             */
            'fill': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.fill;
                }

                anim.settings.fill = value || 'none';

                return anim;
            },


            /**
             * Set the direction of the CSS animation to apply to target.
             * 
             * @param  {string}   CSS direction to apply
             * @return {Walt}     This Walt animation instance
             */
            'direction': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.direction;
                }

                anim.settings.direction = value || 'forward';

                return anim;
            },


            /**
             * Set the direction of the CSS animation to apply to target.
             * 
             * @param  {string}   CSS direction to apply
             * @return {Walt}     This Walt animation instance
             */
            'timing': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.timing;
                }

                anim.settings.timing = value || 'linear';

                return anim;
            },


            /**
             * Set the duration of the CSS animation to apply to target.
             * 
             * @param  {number|string}   Duration animation should last
             * @return {Walt}            This Walt animation instance
             */
            'duration': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.duration;
                }

                anim.settings.duration = convertToCSSTime(value);

                return anim;
            },

            /**
             * Set the delay of the CSS animation to apply to target.
             * 
             * @param  {number|string}   Delay before animation should fire
             * @return {Walt}     This Walt animation instance
             */
            'delay': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.delay;
                }

                anim.settings.delay = convertToCSSTime(value);

                return anim;
            },

            /**
             * Set the number of times the animation should play.
             * 
             * @param  {number}   Number of times animation should loop before 'done'
             * @return {Walt}     This Walt animation instance
             */
            'count': function(value) {
                var anim = this;

                if (typeof value === 'undefined') {
                    return anim.settings.count;
                }

                anim.settings.count = value;

                return anim;
            },



            // 
            // 
            // 
            // Event handling functions
            // 
            // 
            // 



            /**
             * Add function to fire just before the animation takes place
             * 
             * @param  {function}   onBefore Function
             * @return {Walt}       This Walt animation instance
             */
            'before': function(onBeforeFnc) {
                var anim = this;

                if (!onBeforeFnc) {
                    return anim.onBefores;
                }

                // gotta wrap it in a callback thing since we'll async it later
                anim.onBefores.push(function(callback) {
                    onBeforeFnc && onBeforeFnc(anim.settings.element, anim.settings);
                    callback && callback(null, null);
                });

                return anim;
            },

            /**
             * Add function to fire just before each animation item takes place
             * (This is pretty much for animation a collection of items)
             * 
             * @param  {function}   onBeforeEach Function
             * @return {Walt}       This Walt animation instance
             */
            'beforeEach': function(onBeforeEachFnc) {
                var anim = this;

                if (!onBeforeEachFnc) {
                    return anim.onBeforeEaches;
                }

                // gotta wrap it in a callback thing since we'll async it later
                anim.onBeforeEaches.push(function(callback) {
                    onBeforeEachFnc && onBeforeEachFnc(anim.settings.element, anim.settings);
                    callback && callback(null, null);
                });

                return anim;
            },


            /**
             * Add function to fire just after the animation takes place
             * 
             * @param  {function}   onAfter Function
             * @return {Walt}       This Walt animation instance
             */
            'after': function(onAfterFnc) {
                var anim = this;

                if (!onAfterFnc) {
                    return anim.onAfters;
                }

                // gotta wrap it in a callback thing since we'll async it later
                anim.onAfters.push(function(callback) {
                    onAfterFnc && onAfterFnc(anim.settings.element, anim.settings);
                    callback && callback(null, null);
                });

                return anim;
            },

            /**
             * `after` alias
             * 
             * @param  {function}   onAfter Function
             * @return {Walt}       This Walt animation instance
             */
            'then': function(thenFnc) {
                var anim = this;

                return anim.after(thenFnc);
            },

            /**
             * `after` alias
             * 
             * @param  {function}   onAfter Function
             * @return {Walt}       This Walt animation instance
             */
            'done': function(doneFnc) {
                var anim = this;

                return anim.after(doneFnc);
            },

            /**
             * Add function to fire just after each animation item takes place
             * (This is pretty much for animation a collection of items)
             * 
             * @param  {function}   onBeforeEach Function
             * @return {Walt}       This Walt animation instance
             */
            'afterEach': function(onAfterEachFnc) {
                var anim = this;

                if (!onAfterEachFnc) {
                    return anim.onAfterEaches;
                }

                // gotta wrap it in a callback thing since we'll async it later
                anim.onAfterEaches.push(function(callback) {
                    onAfterEachFnc && onAfterEachFnc(anim.settings.element, anim.settings);
                    callback && callback(null, null);
                });

                return anim;
            },



            // 
            // 
            // 
            // Control functions
            // 
            // 
            //



            /**
             * Sets the current animation state to 'paused'
             * TODO: set in-progress animation state
             * 
             * @return {Walt}       This Walt animation instance
             */
            'pause': function() {
                var anim = this;

                anim.settings.state = 'paused';

                return anim;
            },

            /**
             * Plays the current animation (via state = 'running')
             * 
             * @return {Walt}       This Walt animation instance
             */
            'play': function() {
                var anim = this;

                anim.settings.state = 'running';

                return anim;
            },

            /**
             * Resumes the current animation (via state = 'running')
             * 
             * @return {Walt}       This Walt animation instance
             */
            'resume': function() {
                var anim = this;

                anim.settings.state = 'running';

                return anim;
            },


            /**
             * Runs all of the onBefore functions,
             * then executes (begins) the animation
             * 
             * @return {Walt}       This Walt animation instance
             */
            'animate': function() {
                var anim = this;

                async.parallel(anim.onBefores, anim._executeAnim.bind(anim));

                return anim;
            },


            /**
             * Creates a new Walt instance with all of the current animation properties.
             * Before/after events may be optionally cloned with a true/false paramater
             * 
             * @param  {boolean}  eventsToo   Should the before/after events be copied too?
             * @return {Walt}                 New Walt animation instance
             */
            'fork': function(eventsToo) {
                var anim = this;

                var newGuy = new Walt();
                for (var prop in anim) {
                    if (!eventsToo && (prop === 'onBefores' || prop === 'onAfters' || prop === 'onBeforeEaches' || prop === 'onAfterEaches')) {
                        // ok
                    } else {
                        newGuy[prop] = anim[prop];
                    }
                }

                return newGuy;
            },


            /**
             * Internal function to begin the animation
             * Creates the css shorthand string, and applies to element to kick off animations
             * 
             * @return {Walt}       This Walt animation instance
             */
            '_executeAnim': function() {
                var anim = this;
                // modify the animation before we build the CSS string
                anim.play();

                var settings = anim.settings,
                    // create an animation shorthand string
                    cssString = settings.animation + ' ' + settings.duration + ' ' + settings.timing + ' ' + settings.delay + ' ' + settings.count + ' ' + settings.direction + ' ' + settings.fill + ' ' + settings.state;


                // create a count of how many elements we should be watching out for
                anim.animCount = 0;
                anim.animMax = anim.settings.element.length;

                // bind the animation end handler
                anim.settings.element.unbind('animationend.walt').on('animationend.walt', anim._onAnimEndEvent.bind(anim));
                // trigger the animation!
                anim.settings.element.css(_createCssObj(cssString));

                return anim;
            },


            /**
             * Internal handler for 'animationend' events
             * @param  {Event}      animationend Event object 
             * @return {Walt}       This Walt animation instance
             */
            '_onAnimEndEvent': function(event) {
                var anim = this,
                    $target = $(event.currentTarget);

                $target.unbind('animationend.walt');

                // reset the target css by just passing in null values for the properties
                $target.css(_createCssObj());

                // up the 'completed' count
                anim.animCount += 1;

                // fire afterEach for each one
                async.parallel(anim.onAfterEaches, function() {
                    // if we've finished animating all our items,
                    // then we can trigger the 'totally done' handler
                    if (anim.animCount > anim.animMax) {
                        anim._onAnimComplete();
                    }
                });

                return anim;
            },

            /**
             * 'Animation is totally done' event handler.
             * Basically runs through the onAfters and resets css/vars where necessary.
             * @return {Walt}       This Walt animation instance
             */
            '_onAnimComplete': function() {
                var anim = this;

                // run through the onAfter functions, then..
                async.parallel(anim.onAfters, function() {
                    // 'reset' the animation counters
                    delete anim.animCount;
                    delete anim.animMax;

                    // reset the css by just passing in null values for the properties
                    anim.settings.element.css(_createCssObj());
                });

                return anim;
            },


            /**
             * Easing definitions.
             * To be used with the `timing` functin, e.g.:
             *
             * `...timing(Walt.prototype.easings.easeInQuad)...`
             */
            'easings': {
                'default': {
                    'linear': 'cubic-bezier(0.250, 0.250, 0.750, 0.750)',
                    'ease': 'cubic-bezier(0.250, 0.100, 0.250, 1.000)',
                    'easeIn': 'cubic-bezier(0.420, 0.000, 1.000, 1.000)',
                    'easeOut': 'cubic-bezier(0.000, 0.000, 0.580, 1.000)',
                    'easeInOut': 'cubic-bezier(0.420, 0.000, 0.580, 1.000)'
                },

                'in': {
                    'quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
                    'cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
                    'quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
                    'quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
                    'sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
                    'expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
                    'circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
                    'back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)'
                },

                'out': {
                    'quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
                    'cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
                    'quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                    'quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
                    'sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
                    'expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
                    'circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
                    'back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)'
                },

                'inOut': {
                    'quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
                    'cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
                    'quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
                    'quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
                    'sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
                    'expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
                    'circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
                    'back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'
                }
            },



            /**
             * Function to apply settings to the animation based on a
             * settings object passed into the function. Optionally,
             * you may trigger an animate afterwards. 
             * 
             * @param  {Object} options      Key-value pairs of settings to apply to the animation.
             * @param  {Boolean} thenAnimate After applying the settings, trigger the animation
             * @param  {Boolean} shouldFork  Create a new animation, then apply these settings
             * @return {Walt}                Animation with new settings
             */
            'settingsFromObject': function(options, thenAnimate, shouldFork) {
                var anim = this;

                // if they want a new animation
                // WELL THEN THAT'S WHAT THEY'LL GET
                if (shouldFork) {
                    anim = anim.fork();
                }

                // sneaky way to test for backward-compatibility
                // if we don't have the function for the setting passed in,
                // then walt 2.x doesn't support it, and it just ignores.
                // (we have to check for onBefores and stuff though)
                var property;
                for (property in options) {
                    // doing null checks, so we should `var` these in-loop
                    var value, foundFunction;

                    // grab the requested value to set..
                    value = options[property];

                    // if the value exists..
                    if (options.hasOwnProperty(property) && typeof value !== 'undefined') {

                        // check if we need to update any old lingo with the new hotness
                        switch (property) {
                            case 'animation':
                                property = 'name';
                                break;
                            case 'el':
                                property = 'target';
                                break;
                            case 'onBefore':
                                property = 'before';
                                break;
                            case 'onComplete':
                                property = 'then';
                                break;
                        }

                        // try to grub a reference to the associated function on the animation
                        foundFunction = anim[property];

                        // if the property exists, and it's a function (so no altering 'private' anim properties)
                        if (foundFunction && typeof foundFunction === 'function') {
                            // then run it, applying that value to this anim
                            foundFunction.call(anim, value);
                        } else {
                            // else just print a warning
                            // should probably add a flag so this can be silenced
                            console && console.warn && console.warn('Walt : could not convert old setting ' + property);
                        }
                    }
                }
                // done setting settings!

                // if we're to animate afterwards, do eet
                if (thenAnimate) {
                    return anim.animate();
                } else {
                    return anim;
                }
            },


            '_findKeyframesRule': function(rule) {
                var ss = document.styleSheets;
                if (!ss) {
                    return null;
                }
                for (var i = 0; i < ss.length; ++i) {
                    if (ss[i].cssRules) {
                        for (var j = 0; j < ss[i].cssRules.length; ++j) {
                            if ((ss[i].cssRules[j].type == window.CSSRule.WEBKIT_KEYFRAMES_RULE || ss[i].cssRules[j].type == window.CSSRule.MOZ_KEYFRAMES_RULE || ss[i].cssRules[j].type == window.CSSRule.KEYFRAMES_RULE) && ss[i].cssRules[j].name == rule) {
                                return ss[i].cssRules[j];
                            }
                        }
                    }
                }
                return null;
            },

            'isNumber': function(val) {
                return (!isNaN(parseFloat(val)) && isFinite(val));
            },

            '_findAnimationKeyframes': function(animations) {
                // array of the animations to analyze later
                var anim = this,
                    foundAnimations = [],
                    tempKeyframes;

                // allow for space-delineation
                animations = animations.split(' ');
                for (var i = 0; i < animations.length; i++) {
                    // need to make sure that keyframes actually exists
                    tempKeyframes = anim._findKeyframesRule(animations[i]);

                    // if the keyframes dont come back as null,
                    // that means that something was found
                    if (tempKeyframes) {
                        foundAnimations.push(tempKeyframes);
                    }
                }

                return foundAnimations;
            },

            '_mergeAnimationKeyframes': function(animationCollection) {
                var anim = this,
                    compiledAnimation = {},
                    // tons of loop varaibles and stuff
                    currentAnimation,
                    thisFrame,
                    frame,
                    k,
                    existingFrame,
                    frameStyle,
                    keyText;

                for (var j = 0; j < animationCollection.length; j++) {

                    currentAnimation = animationCollection[j];

                    // for each frame int he found animation
                    if (currentAnimation && currentAnimation.cssRules) {
                        for (thisFrame in currentAnimation.cssRules) {

                            if (thisFrame && currentAnimation[thisFrame]) {
                                // get the corresponding keyframe %
                                frame = currentAnimation[thisFrame];
                                keyText = frame.keyText.split(',');


                                for (k = keyText.length - 1; k >= 0; k--) {
                                    // and see if an existing keyframe exists
                                    existingFrame = compiledAnimation[keyText[k]] || {};

                                    // for each frame we need to check the CSS style and save any relevant changes
                                    for (frameStyle in frame.style) {
                                        if (typeof frame.style[frameStyle] === 'string' && frame.style[frameStyle] !== '' && frameStyle !== 'cssText' && frameStyle !== 'length' && !anim.isNumber(frameStyle)) {

                                            if (existingFrame[frameStyle] && existingFrame[frameStyle] !== '') {
                                                if (anim.isNumber(existingFrame[frameStyle])) {
                                                    existingFrame[frameStyle] = Number(existingFrame[frameStyle]) + Number(frame.style[frameStyle]);
                                                } else {
                                                    // combining a string-based attribute
                                                    if (frameStyle.toLowerCase().indexOf('transform') > -1) {
                                                        // if it's a transform we need to do some weird stuff to it
                                                        var transformStyle = existingFrame[frameStyle].split(' ');
                                                    }

                                                    existingFrame[frameStyle] += frame.style[frameStyle];
                                                }
                                            }
                                            existingFrame[frameStyle] = frame.style[frameStyle];
                                        }
                                    }
                                    compiledAnimation[keyText[k]] = existingFrame;
                                };

                            }
                        }
                    }
                }

                return compiledAnimation;
            },

            'compose': function(newAnimationName, animations, returnString) {
                if (!animations) {
                    console && console.warn && console.warn('Walt : compose : two arguments are required');
                    return anim;
                }
                var anim = this,
                    // find the relevant keyframes amongst our stylesheets
                    foundAnimations = anim._findAnimationKeyframes(animations);

                // if there aren't any animations just return out
                if (!foundAnimations || !foundAnimations.length) {
                    console && console.warn && console.warn('Walt : compose : no animations found', animations);
                    return;
                }

                var mergedAnimations = anim._mergeAnimationKeyframes(foundAnimations),
                    animationString = anim._objectToAnimationString(newAnimationName, mergedAnimations);

                if (returnString) {
                    return animationString;
                } else {
                    anim.settings.animation = newAnimationName;
                    return anim;
                }
            },

            '_objectToAnimationString': function(newAnimName, animObject) {
                var anim = this,
                    animString = '';
                for (var keyframe in animObject) {
                    animString += '\t' + keyframe + '{ \n';
                    for (var style in animObject[keyframe]) {
                        animString += '\t\t' + style + ': ' + animObject[keyframe][style] + ';\n'
                    }
                    animString += '\t} \n';
                }

                var prefixes = ['@', '@-webkit-'],
                    baseCSS = 'keyframes ' + newAnimName + ' { \n' + animString + '\n}',
                    allToApply = [];

                for (var i = prefixes.length - 1; i >= 0; i--) {
                    allToApply.push(prefixes[i] + baseCSS);
                };

                // actually insert the generated rules into a stylesheet
                anim._insertNewRules(allToApply);

                return allToApply.join('\n\n');
            },

            '_insertNewRules': function(rulesToApply) {
                var ss = document.styleSheets;
                if (!ss) {
                    return false;
                }

                // grab the last one
                // (since we want it to be at the bottom of everything,
                // in case there's a precedence issue (which in itself
                // should probably be fixed in the future))
                var lastSS = ss[ss.length - 1];

                // loop through the rules to apply (prefixed keyframes)
                // and insert as necessar
                for (var i = rulesToApply.length - 1; i >= 0; i--) {
                    lastSS.insertRule(rulesToApply[i], 0);
                }

                return true;
            }
        };

        return Walt;
    })(window.Walt || {});

    // Walt 1.x support
    // mimics Walt as a singleton
    // usage: `Walt.animate({'el': $('#yourdiv'), 'animation': 'fadeInUp'});`
    window.Walt.animate = function(options) {
        return new Walt().settingsFromObject(options, true);
    };

    // Shortcut to Walt's provided easings
    window.Walt.easings = window.Walt.ease = window.Walt.prototype.easings;

    // Shortcut to getting merged animation keyframes
    window.Walt.compose = function(newName, animations) {
        return new Walt().compose(newName, animations, true);
    };

    // Shortcut to getting an keyframe object for an animation
    window.Walt.getKeyframes = function(animName) {
        var keyFramer = new Walt();

        return keyFramer._mergeAnimationKeyframes(keyFramer._findAnimationKeyframes(animName));
    };


})(window, document, jQuery, async);