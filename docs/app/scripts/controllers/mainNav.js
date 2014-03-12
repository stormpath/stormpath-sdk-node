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
    href: (href ? href : ('/' + name.toLowerCase()))
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
    item('Overview', '/home', [
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

    item('ApiKey', '/apiKey', [
      anchor('ApiKey', 'ctor')
    ]),

    item('Account'),
    item('Application'),
    item('CollectionResource', '/collectionResource', [
      anchor('Overview', 'top'),
      anchor('each')
    ]),
    item('Directory'),
    item('Group'),
    item('GroupMembership', '/groupMembership'),
    //item('InstanceResource', '/instanceResource'),
    //item('Resource'),
    item('ResourceError', 'resourceError'),
    item('Tenant')
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
    });
  });
