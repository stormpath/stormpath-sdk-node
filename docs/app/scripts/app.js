'use strict';

angular.module('docsApp', [
    'ngCookies',
    //'ngResource',
    'ngRoute',
    'ngSanitize',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true); //make our app's content SEO friendly!
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/client', {
        templateUrl: 'views/client.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
