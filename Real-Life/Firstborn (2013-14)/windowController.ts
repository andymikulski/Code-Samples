/**
 * Responsible for maintaining window bindings,
 * request animation frame
 */


/// <reference path="../reference/jquery.d.ts" />
declare var $:any;

import Logger = require('core/logger');
import Kiu = require('core/kiu');

export = WindowController;

// BINDINGS array uses this format
interface WindowBinding {
  type: string;
  fn: any;
  context: any;
  id: string;
}

module WindowController {
    var log:any = Logger.log,
        $win:JQuery = $(window),
        BINDINGS:Array<WindowBinding> = [],
        bindThreshold:number = 100,
        bindThresholdTimer:any,
        lastTop:number = -1,
        lastDimensions:number = -1,
        hasScrolled:boolean = false,
        hasResized:boolean = false,
        runEventsTemp:WindowBinding = null,
        runEventsSTop:number = null,
        runEventsWinWidth:number = null,
        runEventsWinHeight:number = null,
        runEventsTempType:string = null,
        runNewDimensions:number = null;

    /**
     * Binds window events (scroll, resize, etc) and inits
     * the requestAnimationFrame loop
     * @return {void}
     */
    export function init():void {
        log('WindowController : init');

        bindWindow();
        initRAF();
        hasScrolled = hasResized = true;
        windowLoop();
    }

    /**
     * Binds scroll/resize events on window,
     * updates hasScrolled/hasResized variables on event.
     * These should be the ONLY scroll/resize bindings on the window
     * @return {void}
     */
    function bindWindow():void {
        $win.on('scroll', function(e){
            hasScrolled = true;
        });

        $win[0]['onorientationchange'] = function(){
            hasResized = true;
            hasScrolled = true;
        };

        $win[0]['orientationchange'] = function(){
            hasResized = true;
            hasScrolled = true;
        };

        $win.on('resize', function(e){
            if('ontouchstart' in window && hasScrolled){
              hasScrolled = true;
              hasResized = true;
            }else{
              hasResized = true;
              hasScrolled = true;
            }
        });
    }

    /**
     * requestAnimationFrame shim
     * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
     * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
     * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
     * MIT license
     */
    function initRAF():void {
        var lastTime:number = 0,
            vendors:Array<string> = ['ms', 'moz', 'webkit', 'o'];

        for(var x:number = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame){
            window.requestAnimationFrame = function(callback) {
                var currTime:number = +new Date(),
                    timeToCall:number = Math.max(0, 16 - (currTime - lastTime)),
                    id:any = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }

        if (!window.cancelAnimationFrame){
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
        }
    }



    /**
     * Actual RAF loop - calls runEvents();
     * @return {void}
     */
    function windowLoop():void {
        runEvents();
        window.requestAnimationFrame( windowLoop );
    }

    /**
     * Function to run through list of active event listeners and fire what's necessary
     * @param  {boolean} force?         If 'true', events will be run upon binding attachment
     * @return {void}
     */
    function runEvents(force?:boolean):void {
        // If the scroll or resize event hasn't fired, get outta here
        if(!force && (!hasResized && !hasScrolled)){ return; }

        // these will be used in the binding execution loop
        runEventsTemp = null;
        runEventsTempType = null;
        // pulling these variables before looping increases performance
        runEventsSTop = $win.scrollTop();
        runEventsWinWidth = $win.width();
        runEventsWinHeight = $win.height();
        runNewDimensions = runEventsWinWidth * runEventsWinHeight;

        // if scroll or dimensions are the same as last time, just return
        if(!force && (lastTop === runEventsSTop && lastDimensions === runNewDimensions)){
            hasScrolled = hasResized = false;
            return;
        }

        // made it this far then something needs updating
        for(var i = BINDINGS.length; i > 0; --i){
            runEventsTemp = BINDINGS[i-1];

            // for each one, we'll double check if it needs firing
            runEventsTempType = runEventsTemp.type;
            if(runEventsTempType === 'scroll' && (force || (hasScrolled && runEventsSTop !== lastTop))){
              runEventsTemp.fn.apply(runEventsTemp.context, [runEventsSTop, runEventsWinWidth, runEventsWinHeight]);
            }else if(runEventsTempType === 'resize' && (force || (hasResized && runNewDimensions !== lastDimensions))){
              runEventsTemp.fn.apply(runEventsTemp.context, [runEventsSTop, runEventsWinWidth, runEventsWinHeight]);
            }
        }

        // if new is different from old, update values
        if(force || (lastTop !== runEventsSTop)){ lastTop = runEventsSTop; }
        if(force || (lastDimensions !== runNewDimensions)){ lastDimensions = runNewDimensions; }

        // We should only begin recognizing a new scroll/resize when this is done
        hasScrolled = hasResized = false;
    }


    /**
     * Exposed bind function. Used to apply event handlers to the window
     * @param  {string} type             'resize' or 'scroll'
     * @param  {function} fn             event handling function
     * @param  {any} context             context (this) of handler
     * @return {string}                  unique ID of event handler (used to unbind later)
     */
    export function bind(type:string, fn:any, context:any):String {
        var id:string = (+new Date() + (Math.random()*99999)).toFixed(0);
        log('WindowController : bind', type, context, id);

        BINDINGS.push({
            'type': type,
            'fn': fn,
            'context': context,
            'id': id
        });

        if(bindThresholdTimer){
          clearTimeout(bindThresholdTimer);
        }
        bindThresholdTimer = setTimeout(function(){
          runEvents(true);
        }, bindThreshold);


        return id;
    }

    /**
     * Alias for bind function
     * @param  {string} type             'resize' or 'scroll'
     * @param  {function} fn             event handling function
     * @param  {any} context             context (this) of handler
     * @return {string}                  unique ID of event handler (used to unbind later)
     */
    export function on(type:string, fn:any, context:any):any {
        return bind(type, fn, context);
    }

    /**
     * Unbind registered window event
     * @param  {String}     unique ID string of registered event
     * @return {boolean}    successful deletion?
     */
    export function unbind(id:String):boolean {
        if(typeof id === 'undefined'){ return; }
        var temp;
        for(var i = BINDINGS.length; i > 0; --i){
            temp = BINDINGS[i-1];
            if(temp.id === id){
                BINDINGS.splice(i-1,1);
                log('WindowController : unbind', true);
                return true;
            }
        }

        log('WindowController : unbind', false, id, BINDINGS);
        return false;
    }

    /**
     * Alias for unbind function
     * @param  {String}     unique ID string of registered event
     * @return {boolean}    successful deletion?
     */
    export function off(id:String):boolean {
        return unbind(id);
    }


    /**
     * Manually trigger a WindowController event
     * @param {String} evt Event to trigger ('scroll', 'resize')
     */
    export function trigger(evt:String):void {
      log('WindowController : trigger', evt);
        switch(evt){
            case 'resize':
                hasResized = true;
                break;
            case 'scroll':
                hasScrolled = true;
                break;
            default:
                break;
        }
        runEvents(true);
    }

    log('WindowController : Constructor');
}
