/// <reference path="../../../reference/jquery.d.ts" />

declare var $:any;

import Base = require('core/base');

export = ExploreCarousel;

/**
 * 'Interactive' carousel on view-featured pages
 * Each slide contains layers which can be animated individually
 * by setting data-entrance/exit attributes.
 *
 *
 * @class ExploreCarousel
 */
class ExploreCarousel extends Base.Widget {
    hasShown: boolean;
    autoTimer: any;
    autoSpeed: number;

    constructor(private _root:JQuery) {
        super(_root);
        this.log('ExploreCarousel : Constructor');

        this.init();
    }


    /**
     * Sets variables (autospeed) and initializes first-run settings
     */
    init() {
        var self:ExploreCarousel = this;
        self.log('ExploreCarousel : init');

        self.autoSpeed = parseFloat(self.$root.attr('data-slide-timer')) || 500;

        if(!self.$root.find('.explore-carousel__slide').length){
            return;
        }

        self.bindPagination();

        // the background shows up for a second when transitioning between slides,
        // this prevents the background from looking weird
        self.$root.css('background-image', 'url(' + self.$root.find('.explore-carousel__slide.is-active').find('.bg > img').attr('src') + ')');

        self.hasShown = false;

        // setting pagination light/dark
        if(self.$root.find('.explore-carousel__slide.is-active').hasClass('is-light')){
            self.$root.find('.explore-carousel__pagination').removeClass('is-dark').addClass('is-light');
        }else{
            self.$root.find('.explore-carousel__pagination').removeClass('is-light').addClass('is-dark');
        }

        self.bindWindow();
    }

    /**
     * Begins the autoplay cycle. Timer calls ExploreCarousel.autoSlide()
     */
    beginAutoPlay():void {
        // 1 or less slides = return
        if(this.$root.find('.explore-carousel__slide').length <= 1){
            return;
        }

        // define auto timer based on carousel autoSpeed
        this.autoTimer = window.setInterval(()=>this.autoSlide(), this.autoSpeed);
    }

    /**
     * Auto play timer function, calls onPaginationClick with 'auto' direction
     */
    autoSlide():void {
        this.onPaginationClick(null,'auto');
    }

    /**
     * Binds window 'resize' event and 'scroll' if not mobile
     */
    bindWindow():void {
        if((/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent)){
            // Mobile shouldn't wait til in viewport to show the first slide
            // (should already be there by the time the user gets there)
            this.hasShown = true;
            this.animateSlideEntrance( this.$root.find('.explore-carousel__slide.is-active').index() );
        }else{
            // Desktop will show the first slide when it's in view
            this.bindWindowEvent('scroll', this.onScrollEvent);
        }
        this.bindWindowEvent('resize', this.onWindowResize);
    }

    /**
     * Window scroll event handler. Checks if carousel is in view, and if so, if it has animated in yet or not
     * @param {number} scrollTop Current Window ScrollTop
     * @param {number} winWidth  Current Window Width
     * @param {number} winHeight Current Window Height
     */
    onScrollEvent(scrollTop:number, winWidth:number, winHeight:number):void {
        if(!this.hasShown && scrollTop >= (this.$root.offset().top - (winHeight*0.75) )){
            this.hasShown = true;
            this.animateSlideEntrance( this.$root.find('.explore-carousel__slide.is-active').index() );
            this.beginAutoPlay();
        }
    }

    /**
     * Animates target slide into view based on layers and data-entrance attributes
     * @param {number} idx Index of slide to animate into view
     * @param {any}    cb? Callback
     */
    animateSlideEntrance(idx:number, cb?:any):void {
        var self:ExploreCarousel = this,
            $slide:any = self.$root.find('.explore-carousel__slide').eq(idx),
            $v:JQuery,
            count:number = $slide.find('[data-entrance]').length,
            thisCount:number = 0;

        // Filter out the 'bg' layer from the data-entrance collection
        $slide.find('[data-entrance]').sort(function(a,b){
            return $(b).hasClass('bg');
        }).each(function(i,v){
        // and then animate each layer based on the data-entrance-* properties
            $v = $(v);

            self.Walt.animate({
                'el': $v.show(),
                'animation': $v.attr('data-entrance') || 'fadeIn',
                'delay': $v.attr('data-entrance-delay') || (((i+1)*150)+'ms'),
                'duration': $v.attr('data-entrance-duration') || '0.2s',
                'onComplete': function($el){ thisCount++; if(thisCount === count-1){ cb&&cb(); } },
                'useTimeout': true
            });
        });
    }

    /**
     * Animates target slide out of view based on layers and data-exit attributes
     * @param {number} idx Index of slide to animate out of view
     * @param {any}    cb? Callback
     */
    animateSlideExit(idx:number, cb?:any):void {
        var self:ExploreCarousel = this,
            $slide:any = self.$root.find('.explore-carousel__slide').eq(idx),
            $v:JQuery,
            count:number = $slide.find('[data-exit]').length,
            thisCount:number = 0;

        // Filter out the 'bg' layer from the data-exit collection
        $slide.find('[data-exit]').sort(function(a,b){
            return $(b).hasClass('.bg');
        }).each(function(i,v){
        // and then animate each layer based on the data-exit-* properties
            $v = $(v);

            self.Walt.animate({
                'el': $v.show(),
                'animation': $v.attr('data-exit') || 'fadeOut',
                'delay': $v.attr('data-exit-delay') || ((i+1)*150)+'ms',
                'duration': $v.attr('data-exit-duration') || '0.2s',
                'onComplete': function($el){ $el.hide(); thisCount++; if(thisCount === count-1){ cb&&cb(); } },
                'useTimeout': true
            });
        });
    }

    /**
     * Window resize event handler. Keeps 1920:1080 proportions
     * @param {number} scrollTop Current Window ScrollTop
     * @param {number} winWidth  Current Window Width
     * @param {number} winHeight Current Window Height
     */
    onWindowResize(scrollTop:number, winWidth:number, winHeight:number):void {
        // images are 1920px wide by 1080px high
        // 1080h / 1920w
        // xh / $(window).width();
        // x = (1080*$(window).width())/1920
        this.$root.css('height', Math.floor((1080*winWidth)/1920) + 'px');

        this.$root.css({
            'padding': this.$root.height()/4 + 'px 0'
        });
    }

    /**
     * Bind pagination buttons and set up the pagination text
     */
    bindPagination() {
        var self:ExploreCarousel = this;
        // 1 or less slides = hide pagination
        if(self.$root.find('.explore-carousel__slide').length <= 1){
            self.$root.find('.explore-carousel__pagination').hide();
            return;
        }
        self.$root.find('.explore-carousel__pagination-prev').unbind().on('click touchstart', <any>( (e)=>self.onPaginationClick(e,'prev') ) );
        self.$root.find('.explore-carousel__pagination-next').unbind().on('click touchstart', <any>( (e)=>self.onPaginationClick(e,'next') ) );
        self.$root.find('.explore-carousel__pagination-text').html('<span>1</span> / ' + self.$root.find('.explore-carousel__slide').length);
    }

    /**
     * Pagination button click event handler
     * @param {MouseEvent} e   Click event object
     * @param {string}     dir Direction carousel should rotate ('prev', 'next', 'auto')
     */
    onPaginationClick(e:MouseEvent, dir:string){
        if(e && e.preventDefault){ e.preventDefault(); }
        var self:ExploreCarousel = this;

        // if animating, ignore pagination click
        if(self.$root.find('[class*="walt-"]').length){
            return;
        }

        // auto but !viewport = dont slide
        if(dir === 'auto' && !self.$root.is(':in-viewport')){
            return;
        // not auto but have timer = remove timer
        }else if(dir !== 'auto' && self.autoTimer){
            window.clearInterval(self.autoTimer);
        }

        // get next slide in line
        var $active:JQuery = self.$root.find('.explore-carousel__slide.is-active'),
            activeIndex:number = $active.index(),
            $next:JQuery = (dir === 'next'||dir === 'auto' ? $active.next('.explore-carousel__slide') : $active.prev('.explore-carousel__slide'));

        if(!$next.length){
            if(dir === 'prev'){
                $next = self.$root.find('.explore-carousel__slide').last();
            }else{
                $next = self.$root.find('.explore-carousel__slide').first();
            }
        }

        var nextIndex:number = $next.index();

        // animate the active slide out of the way,
        // then set up the next stuff and animate that in
        self.animateSlideExit(activeIndex, function(){
            $active.removeClass('is-active');
            $next.addClass('is-active');

            // change pagination colors based is-dark/light class on slide
            if($next.hasClass('is-light')){
                self.$root.find('.explore-carousel__pagination').removeClass('is-dark').addClass('is-light');
            }else{
                self.$root.find('.explore-carousel__pagination').removeClass('is-light').addClass('is-dark');
            }
            self.$root.find('.explore-carousel__pagination-text').find('span').text(nextIndex+1);


            // animate the slide
            self.animateSlideEntrance(nextIndex, function(){
                // prevent background from getting weird
                self.$root.css('background-image', 'url(' + $next.find('.bg > img').attr('src') + ')');
            });
        });
    }

    /**
     * Removes the autoTimer if necessary (also calls Base.Widget.dispose())
     */
    dispose():void {
        super.dispose();

        if(this.autoTimer){
            window.clearInterval(this.autoTimer);
        }
    }
}
