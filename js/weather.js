'use strict';

var Weather  = angular.module('Weather', ['ngRoute','ngResource']);

Weather.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/weather', {templateUrl: 'partials/WeatherHome.html', controller: 'WeatherHomeCtrl'});
  $routeProvider.when('/weather/:cityName', {templateUrl: 'partials/WeatherHome.html', controller: 'WeatherHomeCtrl'});
  $routeProvider.otherwise({redirectTo: '/weather'});
}]);

/* globals */
    Weather.factory('Globals', function() {
        return {
            APIBaseUrl :"http://api.openweathermap.org/data/2.5/",
            mapsUrl : 'http://maps.googleapis.com/maps/api/staticmap?zoom=11&size=300x300&amp;maptype=roadmap&sensor=false'
        };
    });

/* Services */
    Weather.factory('OpenWeatherAPI',function($resource,$http,$q,Globals){

        var _weatherData = {}; // hold the weather data returned by the OpenWeather API

        /* fetch weather data based on a search string (city) */
        var _locationSearch = function (SearchText) {
                 if(SearchText){
                     var searchString = Globals.APIBaseUrl + 'weather?q='+SearchText+',uk&units=metric';
                     var deferred = $q.defer();
                     $http.get(searchString, {})
                         .then(function (result) {
                             if(result.data.cod==200) {
                                 angular.copy(result.data, _weatherData);
                                 /* add some extra bits into the object */
                                 _weatherData.WeatherIconURL = 'http://openweathermap.org/img/w/' + _weatherData.weather[0].icon + '.png';
                                 _weatherData.ImageURL = Globals.mapsUrl + '&markers=icon:' + _weatherData.WeatherIconURL + '%7C' + _weatherData.coord.lat + ',' + _weatherData.coord.lon;
                                 deferred.resolve();
                             }else{
                                 deferred.reject('Location not found');
                             }

                         },
                         function () {
                             deferred.reject('Service offline, please try again later.');
                         });

                     return deferred.promise;

                 }
        };
        return {
            locationSearch: _locationSearch,
            locationSearchResults: _weatherData
        };
    });


/* Controllers */
    Weather.controller('WeatherHomeCtrl',function($scope,OpenWeatherAPI,$routeParams,$route,$location) {

        $scope.Cities = ['London', 'Luton','Manchester','Birmingham']; // some example cities
        $scope.ImageURL = ""; // Google map img url
        $scope.WeatherIconURL = ""; // weather icon url

        $scope.SR = OpenWeatherAPI.locationSearchResults;
        $scope.message=""; // info message
        $scope.showInfo = false;

        /* handles button and input event to trigger search*/
        $scope.triggerSearch = function(isButtonClick){
            if(event.keyCode == 13 || isButtonClick) {
                /* set the browser hash to the city */
                $location.url('/weather/' + $scope.searchText);
            }
        };

        $scope.locationSearch = function(){
           $scope.showInfo = false;
           OpenWeatherAPI.locationSearch($scope.searchText).then(
                   function(data) {
                       $scope.showInfo = true;
                       $scope.searchText = $scope.SR.name;
                   },
                   function(data) {
                       $scope.SR={};
                       $scope.message =  data;
                   }
               );
        };


        /* see how the route is to be handled */
        if($routeParams.cityName){
            $scope.searchText =  $routeParams.cityName;
            $scope.locationSearch();
        }else{
            $scope.searchText = "";
        }


    });


