'use strict';
var controllername = 'venue';

module.exports = function(app) {
    var fullname = app.name + '.' + controllername;
    /*jshint validthis: true */

    var deps = ['$state', '$scope', app.name + '.VenuesService', '$stateParams', '$ionicLoading', 'main.common.FirebaseService', '$firebaseObject', '$firebaseArray'];

    function controller($state, $scope, VenuesService, $stateParams, $ionicLoading, FirebaseService, $firebaseObject, $firebaseArray) {
        var vm = this;
        var venueId = $stateParams.venueId;
        vm.controllername = fullname;
        vm.getVenue = getVenue;
        vm.getRate = getRate;
        vm.getDays = getDays;
        vm.like = like;
        vm.checkLike = checkLike;
        vm.getLikers = getLikers;
        vm.likers = [];
        vm.initMap = initMap;
        activate();

        function activate() {
            $ionicLoading.show({
                template: 'Chargement'
            });
            vm.getVenue();
            vm.checkLike(venueId);
            vm.getLikers();
        }

        function getVenue() {
            VenuesService.getVenue({
                venueId: venueId
            }).then(function(result) {
                vm.venue = result.response.venue;
                vm.venue.ratingTab = [];
                vm.initMap(vm.venue.location);
                if(vm.venue.rating) {
                    vm.getRate(vm.venue.rating);
                }
                if(vm.venue.popular != undefined) {
                    vm.getDays(vm.venue.popular.timeframes);
                }
                $ionicLoading.hide();

            });
        }

        function checkLike(venueId) {
            var userReference = FirebaseService.getAuthDatas();
            var userLikes = userReference.child('venues/' + venueId);
            FirebaseService.getAuthDatas().child('venues').child(venueId).once('value', function(snapshot) {
                if(snapshot.val()) {
                    vm.isLiked = true;
                } else {
                    vm.isLiked = false;
                }
            });
        }

        function like(venue) {
            var userReference = FirebaseService.getAuthDatas();
            var userLikes = userReference.child('venues/' + venue.id);
            FirebaseService.getAuthDatas().child('venues').child(venue.id).once('value', function(snapshot) {
                if(snapshot.val()) {
                    vm.isLiked = false;
                    userLikes.remove();
                } else {
                    vm.isLiked = true;
                    userLikes.set({
                        name: venue.name
                    });
                }
            });
        }

        function getLikers() {
            var users = $firebaseArray(FirebaseService.getFirebaseReference().child('users'));
            users.$loaded(function(result) {
                angular.forEach(result, function(liker, key) {
                    if(liker.venues && liker.$id !== FirebaseService.getAuthUid()) {
                        angular.forEach(liker.venues, function(value, key) {
                            if(key === venueId) {
                                vm.likers.push({
                                    id: liker.$id,
                                    name: liker.name,
                                    photo: liker.photo,
                                    age: liker.age
                                });
                            } else {
                            }
                        });
                    }
                });
            });
        }

        function getDays(days) {
            vm.venue.days = [];

            var jours = [];
            vm.venue.monday = 0;
            vm.venue.currendDay = null;
            var k = 0;
            var m = 0;

            for(var i = 0; i < days.length; i++) {
                if(days[i].days.indexOf('lun') > -1)
                   vm.venue.monday = i;
               if (days[i].days.indexOf('Aujourd\'hui') > -1)
                   vm.venue.currendDay = i;
            }

            for(var j = 0; j < days.length ; j++){

                if(j < days.length - vm.venue.monday ){

                  jours.push({
                        days : days[vm.venue.monday + m].days,
                        horaire : days[vm.venue.monday + m].open[0].renderedTime
                    });
                    m++;

                }else{
                   jours.push({
                        days : days[k].days,
                        horaire : days[k].open[0].renderedTime
                    });
                    k++;
                }

                jours[j].days = jours[j].days.replace("lun.", "Lundi ");
                jours[j].days = jours[j].days.replace("mar.", "Mardi ");
                jours[j].days = jours[j].days.replace("mer.", "Mercredi ");
                jours[j].days = jours[j].days.replace("jeu.", "Jeudi ");
                jours[j].days = jours[j].days.replace("ven.", "Vendredi ");
                jours[j].days = jours[j].days.replace("sam.", "Samedi ");
                jours[j].days = jours[j].days.replace("dim.", "Dimanche ");
                jours[j].days = jours[j].days.replace("–", "- ");

                jours[j].horaire = jours[j].horaire.replace("–", " - ");

               if(jours[j].horaire == 'Aucun')
                    jours[j].horaire = 'Fermé';
            }
            vm.venue.jour = jours;
        }
        function getRate(rating){
            vm.venue.rating = Math.round(rating/2);
            for(var i = 0; i < vm.venue.rating; i++){
                 vm.venue.ratingTab.push(true);
            }
        }

        function initMap(location) {
            $scope.center = {
                lat: location.lat,
                lng: location.lng,
                zoom: 16
            };

            vm.layers = {
                baselayers: {
                    mapbox_terrain: {
                        name: 'Mapbox Terrain',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        type: 'xyz',
                        layerOptions: {
                            apikey: '', // Replace with your API key
                            mapid: '' // Replace with your map id
                        }
                    }
                }
            };
            vm.markers = [];
            vm.markers.push({
                lat: location.lat,
                lng: location.lng
            });
        }

    }

    controller.$inject = deps;
    app.controller(fullname, controller);
};
