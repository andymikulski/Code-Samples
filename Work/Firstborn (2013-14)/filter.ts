declare var $:any; // (245,12): error TS2094: The property 'error' does not exist on value of type 'JQueryXHR'.
declare var moment:any;

import Base = require('core/base');
export = WorkFilter;

/**
 * Main functionality for the /work/list page.
 * On page load, WorkFilter makes a call to the server for
 * all the work information in JSON format. this is held in memory
 * and used for searching + filtering.
 * @class WorkFilter
 * @extends Base.Widget
 */
class WorkFilter extends Base.Widget {

    $workList: JQuery;
    $searchResults:JQuery;
    $textSearch: JQuery;
    $clearButton: JQuery;

    request: JQueryXHR;
    LIST_DATA: any;
    LIST_COUNT: number;

    RESULTS: {
        text: Array<string>;
        client: Array<string>;
        industry: Array<string>;
        tags: Array<string>;
    };
    SEARCH: {
        text: string;
        client: string;
        industry: string;
        tags: string;
    };
    RESULTS_HAS_INPUT: {
        text: boolean;
        client: boolean;
        industry: boolean;
        tags: boolean;
    };

    $errorTemplate: JQuery;
    isMobile: boolean;

    constructor(private _root:JQuery) {
        super(_root);
        var self:WorkFilter = this;

        // this shouldn't run on the work/featured page
        if(window.location.href.indexOf('work/list') < 0){ return; }

        self.log('WorkFilter : Constructor');

        // prevents flash of content if user is landing on the page with filters already set
        self.$workList = $('.work-content-area');
        if(window.location.hash !== '' && window.location.hash.indexOf(':') > 0){
            self.$workList.hide();
            self.$workList.first().show();
            $('.year-separator').hide();
        }

        self.init();
    }


    /**
     * Variable initialization,
     * begins retrieval of filter data, binds years,
     * binds filters for sorting
     */
    init():void {
        var self:WorkFilter = this;
        self.log('WorkFilter : init');

        self.$searchResults = $('.work-search__results > .work-list');
        self.$textSearch = self.$root.find('.search-text');
        self.$clearButton = self.$root.find('.work-subnav__filters-clear');

        self.isMobile = (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent);

        self.RESULTS = {
            'text': [],
            'client': [],
            'industry': [],
            'tags': []
        };

        self.SEARCH = {
            'text': '',
            'client': '',
            'industry': '',
            'tags': ''
        };

        self.RESULTS_HAS_INPUT = {
            'text': false,
            'client': false,
            'industry': false,
            'tags': false
        };



        // get work information, save to memory
        self.getData();

        // bind years (for responsive design)
        self.bindMobilePagination();

        // bind filter widgets
        self.bindFilters();
        self.bindTextSearch();
    }


    /**
     * Binds click event of mobile and tablet year headers
     * to WorkFilter.onYearClick. Responsive-only code
     */
    bindMobilePagination():void {
        this.log('WorkFilter : bindMobilePagination');

        var $workAreas = $('.work-content-area');
        $workAreas.unbind().on('click', <any>( (e)=>this.onYearClick(e) ));
    }

    /**
     * Mobile and tablet year header click event handler.
     * Expands/collapses year section
     * @param {Event} e Click event object
     */
    onYearClick(e:Event){
        if($(e.target).attr('href') || (!this.isMobile && this.$window.width() > 1024)){ return; }
        e && e.preventDefault && e.preventDefault();

        // Rmove/apply .is-showing as necessary
        var $target = $(e.currentTarget);
        if($target.hasClass('is-showing')){
            $target.removeClass('is-showing');
        }else{
            $('.work-content-area.is-showing').removeClass('is-showing');
            $target.addClass('is-showing');
            $('html, body').animate({
                'scrollTop': $target.offset().top - 50
            }, 300);
            this.Analytics.track('button', 'click', 'Project Archive - Year accordion - ' + $target.text());
        }
    }


    /**
     * Parse any filter variables from the URL and
     * apply any necessary filters (via .click'ing the Dropdown widgets)
     */
    parseURLvars():void {
        var self:WorkFilter = this,
            hashString:string = window.location.hash,
            $dropWidget:any;
        // no hash = no run
        if(hashString === ''){ return; }

        // remove the # sign
        hashString = hashString.slice(1, hashString.length);

        var hash:Array<string> = hashString.split('/'),
            values:Array<string>,
            wasFound:boolean = false,
            $v:JQuery;

        // update filters based on values parsed from the URL
        for(var i = hash.length; i > 0; --i){
            values = hash[i-1].split(':');

            // 'text' filters need to target the text-search widget
            if(values[0] === 'text'){
                $dropWidget = self.$root.find('[data-widget="text-search"]').data('fb-widget');
                $dropWidget.setText(values[1]);
            }else{
                // the others need to target the dropdowns
                // (but tags is labeled slightly differently, so we need to make note of that here)
                if(values[0] === 'tags'){
                    $dropWidget = self.$root.find('[data-widget="dropdown"][data-widget-data="tag"]');
                }else{
                    $dropWidget = self.$root.find('[data-widget="dropdown"][data-widget-data="' + values[0] + '"]');
                }

                // look for the corresponding option in the dropdown and trigger a click on it
                wasFound = false;
                $dropWidget.find('li').each(function(i,v){
                    if(!wasFound){
                        $v = $(v);
                        if($v.attr('data-widget-data') === values[1] || encodeURIComponent($v.text().toLowerCase()) === values[1]){
                            wasFound = true;
                            $v.trigger('click');
                        }
                    }
                });
            }
        }


        // ##todo : filter -> scroll -> go into work -> back button -> [scrolls to last position after loading filters]
        // var lastTop = this.PushState.getLastTop();
        // if(lastTop){
        //     $('html, body').animate({
        //         'scrollTop': lastTop
        //     }, 500);
        // }
    }

    /**
     * Binds the Dropdown widgets' custom 'click' events to WorkFilter.onDropdownClick()
     */
    bindFilters():void {
        var $v:JQuery,
            currentWidg:Base.Widget,
            self:WorkFilter = this;

        this.$root.find('[data-widget="dropdown"]').each(function(i,v){
            $v = $(v);
            currentWidg = $v.data('fb-widget');
            if(!currentWidg){ return; }
            currentWidg.on('click', (data)=>self.onDropdownClick(data));
        });
    }

    /**
     * Dropdown widget custom 'click' event handler
     * @param {any} data Data passed in from the Dropdown custom click event
     */
    onDropdownClick(data:any):void {
        var self:WorkFilter = this;
        // this.log('onDropdownClick', data);

        // Depending on the type of data that was filtered,
        // search based on value or textValue
        if(data.name === 'client'){
            self.searchFor(data.value, ['client_id']);
        }else if(data.name === 'industry'){
            self.searchFor(data.textValue, ['industry']);
        }else if(data.name === 'tag'){
            self.searchFor(data.textValue, ['tags']);
        }else{
            self.searchFor(data.value, [data.name]);
        }
    }


    /**
     * Binds the clear button to WorkFilter.onClearButton()
     */
    bindClearButton():void {
        this.$clearButton.unbind().on('click', <any>( (e) => this.onClearButton(e) ));
    }


    /**
     * Clear button click event handler.
     * Resets each filter widget, as well as
     * the results/results_has_input objects
     * @param {MouseEvent} e [description]
     */
    onClearButton(e:MouseEvent):void {
        e && e.preventDefault && e.preventDefault();

        var self:WorkFilter = this,
            $v:JQuery;

        self.Analytics.track('button', 'click', 'Project Archive - Clear filters', true);

        $('[data-widget="dropdown"],[data-widget="text-search"]').each(function(i,v){
            $v = $(v);
            if($v.data('fb-widget') && $v.data('fb-widget').reset){
                $v.data('fb-widget').reset();
            }
        });

        self.RESULTS = {
            'text': [],
            'client': [],
            'industry': [],
            'tags': []
        };
        self.RESULTS_HAS_INPUT = {
            'text': false,
            'client': false,
            'industry': false,
            'tags': false
        };

        self.showItems(true);

        self.hideClearButton();
    }


    /**
     * Fades the Clear button into view
     */
    showClearButton():void {
        this.bindClearButton();
        this.$clearButton.fadeIn();
    }

    /**
     * Fades the Clear button out of view
     */
    hideClearButton():void {
        this.$clearButton.fadeOut();
    }


    /**
     * Make a call to the server to get the list
     * of work data in JSON format
     */
    getData():void {
        var self:WorkFilter = this;
        self.request && self.request.abort && self.request.abort();

        self.request = $.ajax({
            'url': '/work/list',
            'dataType': 'json'
        }).error( (e1,e2,e3)=>self.onDataError(e1,e2,e3) )
        .success( (res)=>self.onDataSuccess(res) );
    }


    /**
     * Retrieval of work list data error handler
     */
    onDataError(e1:any, e2:string, e3:any):void {
        this.log('WorkFilter : onDataError', e1, e2, e3);
    }

    /**
     * Successful work list data load event handler
     * Holds the work information in memory for faster lookup in WorkFilter.searchFor
     * @param {any} response Server response of work in JSON format
     */
    onDataSuccess(response:any):void {
        var self:WorkFilter = this;
        self.log('WorkFilter : onDataSuccess', response);
        self.LIST_DATA = response.projectsByYear;
        self.LIST_COUNT = response.totalProjects;

        // mend the data coming in to work how we expect it to
        self.modifyData();


        // since we have data to filter through,
        // we can show the filter panel ($root) now
        self.Walt.animate({
            'el': self.$root.show(),
            'animation': 'fadeInDown',
            'duration': '0.5s'
        });

        // see if there is anything in the URL we need to load into place
        self.parseURLvars();
    }

    /**
     * Some attributes of the data passed back from the server needs to be modified
     * before we can use it. For instance, the server returns 'industry' as an object,
     * and not a string. Tag formatting also is slightly modified.
     */
    modifyData():void {
        var year,
            i, j, k,
            thisYearsWork,
            thisWork,
            tagString = '',
            self:WorkFilter = this;

        for(year in self.LIST_DATA){
            if(self.LIST_DATA.hasOwnProperty(year)){
                thisYearsWork = self.LIST_DATA[year];
                for(i = thisYearsWork.length; i > 0; --i){
                    thisWork = thisYearsWork[i-1];


                    // we want industry to be a string
                    if(thisWork.hasOwnProperty('industry')){
                        thisWork.industry = thisWork.industry.title;
                    }


                    // tags also need to be a string
                    if(thisWork.hasOwnProperty('tags')){
                        tagString = '';

                        for(k in thisWork.tags){
                            if(thisWork.tags.hasOwnProperty(k)){
                                tagString += thisWork.tags[k].title.toLowerCase() + ' ';
                            }
                        }
                        thisWork.tags = tagString.slice(0,-1);
                    }
                }
            }
        }
    }

    /**
     * Binds the text field's custom 'change' event to WorkFilter.onTextChange
     */
    bindTextSearch():void {
        var $v:JQuery,
            currentWidg:Base.Widget,
            self:WorkFilter = this;

        self.$root.closest('[data-widget-container*="work-filter"]').find('[data-widget="text-search"]').each(function(i,v){
            $v = $(v);
            currentWidg = $v.data('fb-widget');
            if(!currentWidg){ return; }
            currentWidg.on('change', (data)=>self.onTextChange(data));
        });
    }

    /**
     * Text field's custom 'change' event handler
     * Pretty much just calls WorkFilter.searchFor()
     * @param {Event} e Custom 'change' event data
     */
    onTextChange(e:Event):void {
        console.time && console.time('Text Search');
        this.searchFor( this.$textSearch.val() );
        console.timeEnd && console.timeEnd('Text Search');
    }

    /**
     * Main filtering functionality.
     * Searches over work information held in memory
     * @param {string}      searchString     Value to search work for
     * @param {string[]}    props?  Specific attributes to search for string (no props = text search)
     */
    searchFor(searchString:string, props?:string[]):void {
        console.time && console.time('Searching Projects');

        if(searchString.trim){ searchString = searchString.trim(); }

         // properties to search on
        var self:WorkFilter = this,
            isTextSearch:boolean = false,
            foundIDs:Array<string> = [];

        // if no properties are given, this must be a text search
        if(!props || !props.length){
            isTextSearch = true;
            // default properties to search
            props = ['description', 'full_description', 'title', 'sub_title', 'industry', 'tags'];
        }


        // if nothing to search for or is default or whatever,
        // just clear the results for whatever prop we just searched on
        if(!searchString || searchString === '' || searchString.toLowerCase() === 'all'){
            console.timeEnd && console.timeEnd('Searching Projects');
            if(isTextSearch){
                self.RESULTS.text = foundIDs;
                self.RESULTS_HAS_INPUT.text = false;
                self.SEARCH.text = '';
            }else{
                var propName:string = props[0];
                // our objects use .client, not .client_id
                if(propName === 'client_id'){ propName = 'client'; }
                self.RESULTS[propName] = foundIDs;
                self.RESULTS_HAS_INPUT[propName] = false;
                self.SEARCH[propName] = '';
            }
            self.showItems();
            return;
        }


        // Loop through each year and work and examine properties until search is satisfied,
        // and then move onto the next work
        var year,
            thisYearsWork,
            thisWork,
            i:number, j:number, k:number,
            tempProp:string,
            tempString:string,
            regExp:RegExp = new RegExp(searchString, 'gi'),
            wasFound:boolean = false;


        // for each year we have..
        for(year in self.LIST_DATA){
            if(self.LIST_DATA.hasOwnProperty(year)){

                // we'll get the array of work
                thisYearsWork = self.LIST_DATA[year];

                // and then loop through each work
                for(i = thisYearsWork.length; i > 0; --i){
                    // thisWork is the one we're currently looking at
                    thisWork = thisYearsWork[i-1];
                    // wasFound denotes if we need to keep looking through
                    // properties or not (once found, we wont need to keep searching the same work)
                    wasFound = false;
                    // loop through work properties and search for whatever we're looking for
                    for(j = props.length; j > 0; --j){
                        // break if we already know this work is cool
                        if(wasFound){
                            break;
                        }

                        // property we're examining
                        tempProp = props[j-1];

                        // once its confirmed that this work is part of the search results,
                        // we append the work ID to our foundIDs array (and look it up later)

                        // if looking for an exact match (client or industry are unique),
                        // we can just do an === on it
                        if(tempProp === 'client_id' || tempProp === 'industry'){
                            if(searchString === thisWork[tempProp]){
                                foundIDs.push(thisWork.id);
                                wasFound = true;
                            }
                        // tags are not an exact match so we do indexOf to check it out
                        }else if(tempProp === 'tags'){
                            if(thisWork[tempProp].indexOf(searchString.toLowerCase()) >= 0){
                                foundIDs.push(thisWork.id);
                                wasFound = true;
                            }
                        // anyhting else we do an approximate match using a regex
                        }else if(regExp.test( (thisWork[tempProp]+'').replace(/(<([^>]+)>)/ig,'') )){
                            foundIDs.push(thisWork.id);
                            wasFound = true;
                        }
                    }
                }
            }
        }

        console.timeEnd && console.timeEnd('Searching Projects');
        self.log('Found ' + foundIDs.length + ' items');

        if(isTextSearch){
            self.RESULTS.text = foundIDs;
            self.RESULTS_HAS_INPUT.text = true;
            self.SEARCH.text = encodeURIComponent(searchString.toLowerCase());
        }else{
            var foundPropName:string = props[0];
            // our objects use .client, not .client_id
            if(foundPropName === 'client_id'){ foundPropName = 'client'; }
            self.RESULTS[foundPropName] = foundIDs;
            self.RESULTS_HAS_INPUT[foundPropName] = true;
            self.SEARCH[foundPropName] = encodeURIComponent(searchString.toLowerCase());
        }

        self.showItems();
    }


    /**
     * Clears the search results area, resets filter widgets
     * also changes URL back to /work/list
     */
    resetSearch():void {
        console.time && console.time('Reset Search');

        var self:WorkFilter = this;

        // Remove search results and hide
        self.$searchResults.empty().hide();

        // show the normal work list and animate it in
        $('.year-separator').show();
        self.Walt.animate({
            'el': self.$workList.show(),
            'animation': 'fadeIn',
            'duration': '1s'
        });


        // change URL back to /work/list
        var href = window.location.protocol + '//' + window.location.host + '/work/list',
            safeHref = href.replace(window.location.host, '').replace(window.location.protocol + '//', '');

        if(safeHref === ''){
            safeHref = href;
        }

        // weird fb_push_state thing again
        if(window.hasOwnProperty('fb_push_state') && window.history.pushState){
            window.history.pushState({
                'url': safeHref
            }, '', safeHref);
            window['fb_push_state'].addHistory(safeHref);
        }

        console.timeEnd && console.timeEnd('Reset Search');
    }



    /**
     * Utility function to find the common elements in two arrays
     * @param  {Array<any>} a Array to compare
     * @param  {Array<any>} b Array to compare
     * @return {Array<any>}   Array of common elements
     */
    intersect_safe(a:Array<any>, b:Array<any>):Array<any> {
        var ai:number = 0,
            bi:number = 0,
            result:Array<any> = [];

        while (ai < a.length && bi < b.length) {
            if (a[ai] < b[bi]) {
                ai++;
            } else if (a[ai] > b[bi]) {
                bi++;
            } else /* they're equal */ {
                result.push(a[ai]);
                ai++;
                bi++;
            }
        }

        return result;
    }


    /**
     * If no search results are found, displays the filter-error template
     * found on the index-list.blade
     */
    noResults():void {
        var self:WorkFilter = this;
        if(!self.$errorTemplate || self.$errorTemplate.length){
            self.$errorTemplate = $($('[data-template="filter-error"]').html());
        }
        self.$errorTemplate.find('.work-filter__error-reset').unbind().on('click', <any>( (e) => self.onClearButton(e) ));
        self.$workList.hide();
        $('.year-separator').hide();
        self.$searchResults.empty().append(self.$errorTemplate.addClass('is-showing').fadeIn());
    }


    /**
     * Determines if at least one of the filters are different than their default value
     * @return {boolean}
     */
    hasSearchFilters():boolean {
        var self:WorkFilter = this;
        return self.RESULTS_HAS_INPUT.text || self.RESULTS_HAS_INPUT.client || self.RESULTS_HAS_INPUT.industry || self.RESULTS_HAS_INPUT.tags;
    }

    /**
     * Compares the search results (in WorkFilter.RESULTS) and
     * displays only the common elements
     * @param {boolean} earlyScroll Do we want to scroll the page before updating the work?
     */
    showItems(earlyScroll?:boolean):void {
        console.time && console.time('Show Items');

        // this.log('showItems', this.RESULTS, this.RESULTS_HAS_INPUT);

        // If we want to scroll before changing results, DO IT NOW
        var self:WorkFilter = this,
            scrollTo:number;

        if(earlyScroll){
            scrollTo = self.$window.scrollTop() > 124 ? 124 : 0;
            $('html, body').animate({
                'scrollTop': scrollTo
            }, 300);
        }


        var i:number,
            selector:string = '',
            $found:JQuery,
            href:string,
            safeHref:string,
            common:Array<string>,
            options:string = '';

        // for each possible result set (tag, client, etc)
        for(var search in self.RESULTS){
            // if RESULTS_HAS_INPUT = true, that means we should have results ready to go
            if(self.RESULTS.hasOwnProperty(search) && self.RESULTS_HAS_INPUT[search]){
                // if the common array is empty, just set it to whatever this set is
                // (should only run once)
                if(!common){
                    common = self.RESULTS[search];
                }else{
                // compare what's in the common array with this search result
                    common = self.intersect_safe(common, self.RESULTS[search]);
                }
            }
        }

        // if there is NO common array (or it's empty)..
        if(!common || !common.length){ common = []; }
        if(common.length <= 0){
            //and we have filters..
            if(self.hasSearchFilters()){
                // show no results
                self.noResults();


                // set URL to include filters
                href = window.location.protocol + '//' + window.location.host + '/work/list';
                safeHref = href.replace(window.location.host, '').replace(window.location.protocol + '//', '');
                if(safeHref === ''){
                    safeHref = href;
                }
                options = '';
                for(var field in self.RESULTS){
                    if(self.RESULTS_HAS_INPUT[field]){
                        if(options !== ''){ options += '/'; }
                        options += field+':'+self.SEARCH[field];
                    }
                }
                if(options !== ''){
                    safeHref += '#' + options;
                }
                if(window.hasOwnProperty('fb_push_state') && window.history.pushState){
                    window.history.pushState({
                        'url': safeHref
                    }, '', safeHref);
                    window['fb_push_state'].addHistory(safeHref);
                }
            }else{
                // if we DONT have filters then we're not searching and should just reset
                self.resetSearch();
            }

        // if there ARE search results found..
        }else{
            var $v:JQuery,
                $kiuWait:JQuery;

            // find all of the elements on the page that have the same data-id as our found set
            // and duplicate them (to be put into the search results area)
            for(i = common.length; i > 0; --i){
                selector += '.work-list__item[data-id="' + common[i-1] + '"]' + (i-1 > 0 ? ',' : '');
            }
            $found = self.$workList.find(selector);
            $found = $found.clone();

            // show the reset button and hide the years
            self.showClearButton();
            self.$workList.hide();
            $('.year-separator').hide();


            // for each item found, reset the data-kiu and make sure the correct styles are applied
            // (this is a little gross)
            $found.find('[data-kiu]').attr('data-kiu', null);
            $found.find('[data-kiu-wait]').each(function(i,v){
                $v = $(v);
                $v.attr('data-kiu-wait', null).attr('style', $v.attr('data-style'));
            });

            // make sure Kiu knows now to include these clones in lists
            self.Kiu.updateLists();

            // show the new stuff
            self.$searchResults.empty().hide().append($found);


            // make sure items fit into the grid system
            self.fixShownItems();

            // animate each work item into view
            self.$searchResults.show().find('.work-list__item').each(function(i,v){
                $v = $(v);
                $v.find('[data-kiu]').attr('data-kiu', null);

                self.Walt.animate({
                    'el': $v,
                    'animation': 'fadeInUp',
                    'duration': '0.5s',
                    'delay': (0.1 * i)+'s'
                });
            });


            // change the url to include the search filters
            href = window.location.protocol + '//' + window.location.host + '/work/list',
            safeHref = href.replace(window.location.host, '').replace(window.location.protocol + '//', '');
            if(safeHref === ''){
                safeHref = href;
            }
            options = '';
            for(var resultsField in self.RESULTS){
                if(self.RESULTS_HAS_INPUT[resultsField]){
                    if(options !== ''){ options += '/'; }
                    options += resultsField+':'+self.SEARCH[resultsField];
                }
            }
            if(options !== ''){
                safeHref += '#' + options;
            }
            if(window.hasOwnProperty('fb_push_state') && window.history.pushState){
                window.history.pushState({
                    'url': safeHref
                }, '', safeHref);
                window['fb_push_state'].addHistory(safeHref);
            }

            console.timeEnd && console.timeEnd('Show Items');
        }


        // if we didn't scroll before replacing stuff, we should scroll now
        if(!earlyScroll){
            scrollTo = self.$window.scrollTop() > 124 ? 124 : 0;
            $('html, body').animate({
                'scrollTop': scrollTo
            }, 300);
        }
    }


    /**
     * Fit search results items into the grid appropriately
     * Readjusts no-margin classes and double checks Kiu won't act up
     */
    fixShownItems():void {
        console.time && console.time('Fix Shown Items');
        var self:WorkFilter = this,
            $v:JQuery;

        self.$searchResults.find('.work-list__item').each(function(i,v){
            $v = $(v);
            $v.find('a').unbind().attr('data-push', null).attr('data-kiu', 'scroll-in-view').attr('data-kiu-wait', 'true').attr('data-kiu-scroll', null);

            if(i % 4 === 3){
                $v.addClass('no-margin');
            }else{
                $v.removeClass('no-margin');
            }
        });

        // update kiu
        self.Kiu.updateLists();
        // make sure the new links ajax appropriately
        self.PushState.bindLinks(self.$searchResults);

        console.timeEnd && console.timeEnd('Fix Shown Items');
    }

}
