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
      /*.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })*/
      .when('/home', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/client', {
        templateUrl: 'views/client.html',
        controller: 'MainCtrl'
      })
      .when('/apiKey', {
        templateUrl: 'views/apiKey.html',
        controller: 'MainCtrl'
      })
      .when('/account', {
        templateUrl: 'views/account.html',
        controller: 'MainCtrl'
      })
      .when('/accountStoreMapping', {
        templateUrl: 'views/accountStoreMapping.html',
        controller: 'MainCtrl'
      })
      .when('/application', {
        templateUrl: 'views/application.html',
        controller: 'MainCtrl'
      })
      .when('/authenticationResult', {
        templateUrl: 'views/authenticationResult.html',
        controller: 'MainCtrl'
      })
      .when('/cache', {
        templateUrl: 'views/cache.html',
        controller: 'MainCtrl'
      })
      .when('/cacheManager', {
        templateUrl: 'views/cacheManager.html',
        controller: 'MainCtrl'
      })
      .when('/collectionResource', {
        templateUrl: 'views/collectionResource.html',
        controller: 'MainCtrl'
      })
      .when('/customData', {
        templateUrl: 'views/customData.html',
        controller: 'MainCtrl'
      })
      .when('/directory', {
        templateUrl: 'views/directory.html',
        controller: 'MainCtrl'
      })
      .when('/group', {
        templateUrl: 'views/group.html',
        controller: 'MainCtrl'
      })
      .when('/groupMembership', {
        templateUrl: 'views/groupMembership.html',
        controller: 'MainCtrl'
      })
      .when('/resourceError', {
        templateUrl: 'views/resourceError.html',
        controller: 'MainCtrl'
      })
      .when('/tenant', {
        templateUrl: 'views/tenant.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/home'
      });
  });
