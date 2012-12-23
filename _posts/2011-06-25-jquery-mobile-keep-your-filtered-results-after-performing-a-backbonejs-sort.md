---
layout: post
title: jQuery Mobile: Keep Your Filtered Results After Performing a Backbone.js Sort
---

One of the features that [jQuery Mobile](http://jquerymobile.com/) brings to
the table are
[lists](http://jquerymobile.com/demos/1.0b1/?#/demos/1.0b1/docs/lists/lists-
search-inset.html). If you add `data-filter="true"` to your `listview`, then
you'll be presented with a nicely styled input box like so:

[![](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-filter1.png)](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-filter1.png)

Your list will be filtered by whatever has been typed into the `input` box.

[![](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-filter-results1.png)](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-filter-results1.png)

For one of the projects I am working on, I've been using the
[Backbone.js](http://documentcloud.github.com/backbone/) library to help keep
the application from looking like a bowl of jQuery spaghetti. Part of the
application allows the users to sort the `listview` in different fashions via
Backbone's [sort](http://documentcloud.github.com/backbone/#Collection-sort)
method. After the sort was executed I was losing my filtered results and was
again presented with the entire list. Boo!

[![](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-bad-filter-after-sort.png)](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-bad-filter-after-sort.png)

The jQuery Mobile `listview filter` binds to the `keyup` event on the input
box. We just have to trigger that event after our Backbone `sort` and voila!

    
    
        sort: function (e) {
          CoolList.sort();
          $('input[data-type="search"]').trigger('keyup');
        }
    

  
The best of both worlds!

[![](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-good-filter-after-sort.png)](http://dl.dropbox.com/u/21470950/scottwoodall.com/images/listview-good-filter-after-sort.png)

