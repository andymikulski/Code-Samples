Andy Mikulski Sample Code
Firstborn.com
===


## About the Project

Timeline: 5 months(ish)
Team: 2 developers (myself on front end, and Ziad Hilal on back end)
Tech: TypeScript, Laravel, Sass, RequireJS
Responsibilities: Front-end dev (mobile, desktop), QA (IE8+, Mobile), analytics implementation

After having the same flash-based website for about seven years, digital ad agency [firstborn](http://www.firstborn.com/) decided it was time to move on and enlisted their best developers to execute the designs.

With myself on front end and [Ziad Hilal](https://www.linkedin.com/profile/view?id=224257185) on back end, we developed the site in about five months. This time included execution of designs, execution of re-designs, content creation, and QA.

## About the Tech

Understanding the potential longevity of the site, I knew that creating a clean, maintainable codebase was integral. With that in mind, I chose to use [TypeScript](http://www.typescriptlang.org/) on the front end. TypeScript affords features such as structure, strict-ish typing, and error checking. These aid in maintaining code quality, even if code is modified by multiple developers.

Beyond its safe coding features, TS allowed easy creation and extension of multiple classes, breaking down functionality into sensible modules. By compartmentalizing several commonly used functions/features and refining them through iteration, ultimately a small framework covering everything from debug logging to DOM animation was created.


## About the Samples

- `pushState.ts` AJAX is used to load/display pages across the site, with an elegant fallback to normal link behavior if history.pushState is not supported (IE9-).

- `windowController.ts` Window events such as resize and scroll are bound to the window only once, and handled through a central module (the WindowController). The WindowController accepts bindings to these events, and then fires them when necessary later on (using requestAnimationFrame as the loop).

- `filter.ts` The Project Archive page uses a search/filter system based entirely in memory on the front end. Data is passed in from the back end, and search/filters are operated upon that data. The DOM is only affected once the list of result ID's is ready. This relieves pressure on the backend and allows faster search results on the front end.

- `walt.ts` Animation in the site is driven through "Walt," a small set of tools to animate elements using CSS3 animations. In this repo you'll find the version used in production, however a more up to date version of Walt can be found under the `Personal:Misc` code sample directory


Questions, comments, concerns? Contact me at [andy.mikulski@gmail.com](andy.mikulski@gmail.com).