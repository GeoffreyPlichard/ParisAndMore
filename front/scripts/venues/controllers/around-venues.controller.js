'use strict';
var controllername = 'aroundVenues';

module.exports = function(app) {
    var fullname = app.name + '.' + controllername;
    /*jshint validthis: true */

    var deps = ['$scope', app.name + '.VenuesService', '$ionicLoading'];

    function controller($scope, VenuesService, $ionicLoading) {
        var vm = this;
        vm.controllername = fullname;

        vm.getVenues = getVenues;
        vm.initMap = initMap;

        activate();

        function activate() {
            $ionicLoading.show({
                template: 'loading'
            });
            vm.getVenues();
            vm.initMap();
            $scope.$on('leafletDirectiveMarker.click', function(e, args) {
                $scope.markerVenueId = args.model.venueId;
            });
        }

        function getVenues() {
            var categories = VenuesService.getVenuesCats();

            VenuesService.getVenues({
                categoryId: categories
            }).then(function(result) {
                vm.venues = result.response.venues;
                var length = vm.venues.length;
                console.log(vm.venues);
                vm.markers = [];
                for(var i = 0; i < length; i++) {
                    vm.markers.push({
                        venueId: vm.venues[i].id,
                        lat: vm.venues[i].location.lat,
                        lng: vm.venues[i].location.lng,
                        getMessageScope: function() { return $scope; },
                        message: '<div><h2>' + vm.venues[i].name + '</h2><button ui-sref="app.venue({venueId:markerVenueId})">Voir</button></div>'
                    });
                }
                $ionicLoading.hide();
            });
        }

        function initMap() {
            vm.center = {
                lat: 48.853,
                lng: 2.35,
                zoom: 16
            };

            vm.layers = {
                baselayers: {
                    mapbox_terrain: {
                        name: 'Mapbox Terrain',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: 'pk.eyJ1IjoiZ2VvZmZyZXlwbCIsImEiOiJjaWducG90ZDUwMDNqbHVrdDZtM2xmNGs0In0.KeeItsK30xU8aEOAcFBpGw',
                            mapid: 'geoffreypl.o3do1117'
                        }
                    }
                }
            };

        }
    }

    controller.$inject = deps;
    app.controller(fullname, controller);
};
