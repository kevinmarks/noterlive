noterlive
=========

A tool for indieweb live noting (aka live tweeting/live blogging).

To try it go to http://www.noterlive.com

For those wishing to properly display the available hovercard output on their websites, they should include the [javascript file](https://github.com/kevinmarks/noterlive/blob/master/web/hovercards.js) included in the repository in their root web folder and ensure that the displaying webpage includes `<script src="/hovercards.js"></script>`. One will also need to include appropriate CSS for displaying these cards, a possible sample can be found in `/resources/noterlive.css`.

TO DO
=====
add a logout button for twitter

add title and header/footer composition for full posts

import hCards to speaker buttons as well as twitter handles

persist to localStorage to survive accidental refresh

add micropub support for noting elsewhere

add micropub/atompub/metaweblog for posting articles elsewhere

DONE
====
better twitter length estimation (via Tantek's cassis.js)
autolink in the html version (via Tantek's cassis.js)
