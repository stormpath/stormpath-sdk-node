'use strict';

function newItem(name, href, children) {
  var item = {
    name: name,
    href: '/' + name.toLowerCase()
  };

  if (href) {
    item.href = href;
  }

  item.children = children ? children : null;

  return item;
}

angular.module('docsApp')
  .controller('MainNavController', function ($scope,$location) {

    $scope.oneAtATime = true;

    $scope.items = [
      newItem('Overview'),
      //newItem('stormpath'),
      newItem('Client', null, [
        newItem('Client', '/client#ctor'),
        newItem('createApplication', '/client#createApplication'),
        newItem('createDirectory', '/client#createDirectory'),
        newItem('getAccount', '/client#getAccount'),
        newItem('getApplications', '/client#getApplications'),
        newItem('getDirectories', '/client#getDirectories'),
        newItem('getDirectory', '/client#getDirectory'),
        newItem('getGroup', '/client#getGroup'),
        newItem('getGroupMembership', '/client#getGroupMembership')
      ]),

      newItem('authc/ApiKey'),

      newItem('cache/Cache'),
      newItem('cache/CacheEntry'),
      newItem('cache/CacheManager'),
      newItem('cache/CacheStats'),
      newItem('cache/DisabledCache'),
      newItem('cache/MemoryStore'),
      newItem('cache/RedisStore'),

      newItem('ds/DataStore'),
      newItem('ds/RequestExecutor'),

      newItem('error/ResourceError'),

      newItem('resource/Account'),
      newItem('resource/Application'),
      newItem('resource/CollectionResource'),
      newItem('resource/Directory'),
      newItem('resource/DirectoryChildResource'),
      newItem('resource/Group'),
      newItem('resource/GroupMembership'),
      newItem('resource/InstanceResource'),
      newItem('resource/Resource'),
      newItem('resource/ResourceFactory'),
      newItem('resource/Tenant')
    ];

    $scope.changeView = function (path) {
      $location.path(path);
    };

    $scope.$on('$viewContentLoaded', function() {
      Prism.highlightAll();
    });
  });
