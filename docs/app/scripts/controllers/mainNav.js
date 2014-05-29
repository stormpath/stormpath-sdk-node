'use strict';

function anchor(name, aName) {
  return {
    name: name, //display name in the nav menu list
    aName: (aName ? aName : name) //anchor 'name' attribute
  };
}

function item(name, href, anchors) {
  var anItem = {
    name: name,
    href: (href ? href : name.toLowerCase())
  };

  if (anchors) {
    var children = [];
    for(var i =0; i < anchors.length; i++) {
      var anchor = anchors[i];
      var child = {
        name: anchor.name,
        href: anItem.href + '#' + anchor.aName
      };
      children.push(child);
    }
    anItem.children = children;
  }

  return anItem;
}

function items() {
  return [

    item('Overview', 'home', [
      anchor('Install', 'install'),
      anchor('Quickstart', 'quickstart')
    ]),

    item('Client', null, [
      anchor('Overview', 'top'),
      anchor('Client', 'ctor'),
      anchor('createApplication'),
      anchor('createDirectory'),
      anchor('getAccount'),
      anchor('getApplication'),
      anchor('getApplications'),
      anchor('getCurrentTenant'),
      anchor('getDirectories'),
      anchor('getDirectory'),
      anchor('getGroup'),
      anchor('getGroupMembership')
    ]),

    item('ApiKey', 'apiKey', [
      anchor('Overview', 'top'),
      anchor('ApiKey', 'ctor'),
      anchor('toString')
    ]),

    item('Account', null, [
      anchor('Overview', 'top'),
      anchor('addToGroup'),
      anchor('getGroups'),
      anchor('getGroupMemberships'),
      anchor('getDirectory'),
      anchor('getTenant'),
      anchor('getCustomData')
    ]),

    item('Application', null, [
      anchor('Overview', 'top'),
      anchor('authenticateAccount'),
      anchor('createAccount'),
      anchor('createGroup'),
      anchor('getAccounts'),
      anchor('getGroups'),
      anchor('getTenant'),
      anchor('sendPasswordResetEmail'),
      anchor('verifyPasswordResetToken')
    ]),

    item('AuthenticationResult', 'authenticationResult', [
      anchor('Overview', 'top'),
      anchor('getAccount')
    ]),

    item('Cache', 'cache', [
      anchor('Overview', 'top'),
      anchor('get'),
      anchor('put'),
      anchor('delete'),
      anchor('clear'),
      anchor('size')
    ]),

    item('Cache manager', 'cacheManager', [
      anchor('Overview', 'top'),
      anchor('getCache'),
      anchor('createCache'),
    ]),

    item('CollectionResource', 'collectionResource', [
      anchor('Overview', 'top'),
      anchor('each'),
      anchor('eachSeries'),
      anchor('eachLimit'),
      anchor('map'),
      anchor('mapSeries'),
      anchor('mapLimit'),
      anchor('filter'),
      anchor('filterSeries'),
      anchor('reject'),
      anchor('rejectSeries'),
      anchor('reduce'),
      anchor('reduceRight'),
      anchor('detect'),
      anchor('detectSeries'),
      anchor('sortBy'),
      anchor('some'),
      anchor('every'),
      anchor('concat'),
      anchor('concatSeries')
    ]),

    item('CustomData', 'customData', [
      anchor('Overview', 'top'),
      anchor('get', 'get'),
      anchor('delete', 'delete'),
      anchor('remove', 'remove'),
      anchor('save', 'save')
    ]),

    item('Directory', null, [
      anchor('Overview', 'top'),
      anchor('createAccount'),
      anchor('createGroup'),
      anchor('getAccounts'),
      anchor('getGroups'),
      anchor('getTenant')
    ]),

    item('Group', null, [
      anchor('Overview', 'top'),
      anchor('addAccount'),
      anchor('getAccounts'),
      anchor('getAccountMemberships'),
      anchor('getDirectory'),
      anchor('getTenant'),
      anchor('getCustomData')
    ]),

    item('GroupMembership', 'groupMembership', [
      anchor('Overview', 'top'),
      anchor('getAccount'),
      anchor('getGroup')
    ]),

    //item('InstanceResource', 'instanceResource'),
    //item('Resource'),

    item('ResourceError', 'resourceError', [
      anchor('Overview', 'top')
    ]),

    item('Tenant', null, [
      anchor('Overview', 'top'),
      anchor('createApplication'),
      anchor('createDirectory'),
      anchor('getApplications'),
      anchor('getDirectories'),
      anchor('verifyAccountEmail')
    ])
  ];
}


angular.module('docsApp')
  .controller('MainNavController', function ($scope,$location, $window) {

    $scope.oneAtATime = true;

    $scope.items = items();

    $scope.changeView = function (path) {
      $location.path(path);
      $window.scrollTo(0,0);
    };

    $scope.$on('$viewContentLoaded', function() {
      /*global Prism:true*/
      Prism.highlightAll();

      //apply table styles
      angular.element(document.getElementsByTagName('table')).addClass('table table-striped table-hover table-curved');
    });
  });
