'use strict';

function anchor(name, aName) {
  return {
    name: name, //display name in the nav menu list
    aName: (aName ? aName : name) //anchor 'name' attribute
  };
}

function item(name, href, anchors) {
  var item = {
    name: name,
    href: (href ? href : ('/' + name.toLowerCase()))
  };

  if (anchors) {
    var children = [];
    for(var i =0; i < anchors.length; i++) {
      var anchor = anchors[i];
      var child = {
        name: anchor.name,
        href: item.href + '#' + anchor.aName
      };
      children.push(child);
    }
    item.children = children;
  }

  return item;
}

function items() {
  return [
    item('Overview', '/'),
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
    item('CollectionResource', '/collectionResource'),
    item('Directory'),
    item('Group'),
    item('GroupMembership', '/groupMembership'),
    item('InstanceResource', '/instanceResource'),
    item('Resource'),
    item('ResourceError'),
    item('Tenant')
  ];
}


angular.module('docsApp')
  .controller('MainNavController', function ($scope,$location) {

    $scope.oneAtATime = true;

    $scope.items = items();

    $scope.changeView = function (path) {
      $location.path(path);
    };

    $scope.$on('$viewContentLoaded', function() {
      Prism.highlightAll();
    });
  });
