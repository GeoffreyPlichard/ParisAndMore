'use strict';

module.exports = function(app) {
    // inject:start
    require('./firebase.constant')(app);
    require('./foursquare.constant')(app);
    // inject:end
};