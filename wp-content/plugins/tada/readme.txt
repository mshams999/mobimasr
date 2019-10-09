=== Tada: Instant Webpage Loading, Fast Website Browsing ===
Contributors: BinaryMoon
Tags: speed, user experience, UX, optimization
Requires at least: 4.0
Tested up to: 5.2
Stable tag: 1.0

Make your website load more quickly.

== Description ==

Make browsing your website a more pleasant experience.

Uses the [Instant.Page](https://instant.page/) script to make browsing between pages on your website super fast.

The Instant.Page script prefetches pages that are about to be clicked on so that they start loading whilst you are on the current page. By the time you click on the link a lot of the loading process has happened and so the page appears to load much more quickly.

Increased website speed (even just the appearance of increased speed) improves user experience, and conversion rates, and stickiness, and all the good things that make users love you.

== FAQ ==

= How does this work? =

Tada checks to see if your users are hovering over a link, and then uses the browsers built in prefetching mechanism to prefetch the html for the link that is about to be clicked.

= Why are my pages still slow? =

Whilst Tada does speed up the process, it will only reduce the time required to load the page - it won't elminitate it. This means that heavy pages, and slow web hosts may not appear instantly. In addition, I have found that the WordPress admin interface can be quite slow and so the best experience happens for users who are logged out. I use the Incognito mode in my browser to test this.

= What WordPress Themes work with Instant Pages? =

Most WordPress themes will work fine with Instant Pages, however there are a few that may not. These are themes that use javascript to link to internal pages. For instance if the theme is built with React or Vue (or similar) then it may not work (but equally - probably isn't needed). Also if the theme applies transitions to page loads (such as fading in and out) then you may not see an improvement. However these are specialist cases, and most themes will work great.

== Installation ==

1. Install and Activate the plugin through the plugins page.
2. Done. Everything else is setup automatically.

== Changelog ==

= 1.1.1 - 25th July 2019 =
* Add support for async attribute in script enqueue. Currently only works with the Jarvis theme, but may be coming to core (one day).

= 1.1 - 18th March 2019 =
* Minify the script for more speed.

= 1.0 - 16th March 2019 =
* Initial Release
