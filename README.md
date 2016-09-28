# Plenary Server

This is a freeswitch-based multi-point videoconferencing server to implement a
"plenary" model, where a handful of people are "on stage", and a much larger
number of people are in the audience.

The `ansible/` directory contains an [ansible](https://docs.ansible.com/)
configuration for deploying a complete server.

The `app/` directory contains a nodejs app for serving the videoconference.

## Resources

[Verto docs](http://evoluxbr.github.io/verto-docs)
[Freeswitch mod_conference docs](https://freeswitch.org/confluence/display/FREESWITCH/mod_conference)
[Chad's cluecon talk gist](https://gist.github.com/thehunmonkgroup/446370910266f006cdcf25df5e28df7b#file-verto-example-code-js)

### Other links (maybe useful)

[An example salt config for freeswitch](https://github.com/unhangout/unhangout-video-server/).  See especially the [Freeswitch conf templates](https://github.com/unhangout/unhangout-video-server/tree/master/salt/salt/service/freeswitch/conf).

Documentation for [nginx-rtmp-module](https://github.com/arut/nginx-rtmp-module/wiki/Directives), and the [fork that seems most up to date](https://github.com/arut/nginx-rtmp-module/wiki/Directives) (original is abandoned).

Dash.js and other players:
 - [dash.js](https://github.com/Dash-Industry-Forum/dash.js/wiki) - canonical, but buggy.
 - [shaka](https://github.com/google/shaka-player) - google's, more reliable; though still doesn't fully tolerate nginx-rtmp-module's bugs.
 - [video.js](http://docs.videojs.com/) - good for playing flash
