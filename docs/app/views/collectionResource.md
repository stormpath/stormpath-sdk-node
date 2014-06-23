## CollectionResource

A `CollectionResource` is an object that represents a [Stormpath REST API Collection Resource](http://docs.stormpath.com/rest/product-guide/#collection-resources).  It is itself a resource with its own properties, but it contains other REST resources.

Every collection resource has the following fields:

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Field</th>
      <th>Type</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`href`</td>
      <td>`string`</td>
      <td>The fully qualified location URI of the Collection Resource.</td>
    </tr>
    <tr>
      <td>`offset`</td>
      <td>`integer`</td>
      <td>The zero-based starting index in the entire collection of the first item to return. The default value is 0. This is a [pagination](http://docs.stormpath.com/rest/product-guide/#pagination)-specific attribute.</td>
    </tr>
    <tr>
      <td>`limit`</td>
      <td>`integer`</td>
      <td>The maximum number of collection items to return for a single request. Minimum value is 1. The maximum value is 100 and the default value is 25. This is a [pagination](http://docs.stormpath.com/rest/product-guide/#pagination)-specific attribute.</td>
    </tr>
    <tr>
      <td>`items`</td>
      <td>`array`</td>
      <td>An array containing the current page of resources. The size of this array can be less than the requested limit. For example, if the limit requested is greater than the maximum allowed or if the response represents the final page in the total collection and the item count of the final page is less than the limit. This is a [pagination](http://docs.stormpath.com/rest/product-guide/#pagination)-specific attribute.</td>
    </tr>
  </tbody>
</table>

Here is an example of a `CollectionResource`'s JSON representation (in this case, a random [Tenant](tenant)'s collection of [Application](application)s:

```javascript
{
  href: 'https://api.stormpath.com/v1/tenants/1X2vlZCo4vd8Ar6LD7UHjj/applications',
  offset: 0,
  limit: 100,
  items: [
    { ... app0 name/value pairs ... },
    { ... app1 name/value pairs ... },
    ...,
    { ... app99 name/value pairs ... }
  }
}
```

**Instantiation**

The Stormpath REST API already defines all available collections - you should never need to explicitly create a new CollectionResource instance. CollectionResource instances are returned automatically when requesting an existing REST API collection.

#### <a name="pagination"></a>Automatic Pagination

If you request a collection directly from the REST API, and the collection is sufficiently large, the Stormpath REST API servers will not return all items within the collection in a single response.  Instead, a technique known as [pagination](http://docs.stormpath.com/rest/product-guide/#pagination) is used to break up the results into one or more of pages of data.

However, this is not something  you need to worry about when using the Stormpath SDK for Node.js.  If you call the [each](collectionResource#each) method to iterate over the collection items, it will automatically paginate for you during iteration:

As iteration executes, if the `CollectionResource` encounters the end of a page of results, it will request the next page automatically, internalize the results, and those will be used to continue iteration.  This simulates the entire collection being available in memory.

##### Disable Automatic Pagination

If you do not prefer automatic pagination, you can just ignore this feature: don't call the `each` method and instead interact directly with the collection's `items` array.

Once you exhaust an `items` array, you will then be required request the collection's `href` and [pagination query parameters](http://docs.stormpath.com/rest/product-guide/#pagination) to obtain further pages of data.

**Since**: 0.1

---

<a name="forEach"></a>
<a name="each"></a>
### <span class="member">method</span> each(iterator, callback)

Applies the function `iterator` to each item in `collection` resource, in parallel.
The `iterator` is called with an item from the list, and a callback for when it
has finished. If the `iterator` passes an error to its `callback`, the main
`callback` (for the `each` function) is immediately called with the error.

Note, that since this function applies `iterator` to each item in parallel,
there is no guarantee that the iterator functions will complete in order.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function iterator(application, cb){
  console.log(application);
  cb();
}

applications.each(iterator, function(err){
  // if any of the iterator calls produced an error, err would equal that error
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function to apply to each item in `arr`.
            The iterator is passed a `callback(err)` which must be called once it has
            completed. If no error has occurred, the `callback` should be run without
            arguments or with an explicit `null` argument.
      </td>
    </tr>
    <tr>
      <td>`callback(err)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called when all `iterator` functions
            have finished, or an error occurs.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="forEachSeries"></a>
<a name="eachSeries" ></a>
### <span class="member">method</span> eachSeries(iterator, callback)

The same as [`each`](collectionResource#each), only `iterator` is applied
to each item in `collection` resource in series.
The next `iterator` is only called once the current one has completed.
This means the `iterator` functions will complete in order.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="forEachLimit"> </a>
<a name="eachLimit"> </a>
### <span class="member">method</span> eachLimit(limit, iterator, callback)

The same as [`each`](collectionResource#each), only no more than `limit` `iterator`s
will be simultaneously running at any time.

Note that the items in `collection` resource are not processed in batches,
so there is no guarantee that the first `limit` `iterator` functions will
complete before any others are started.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function processApplication(application, cb){
  //do some work with application
  cb();
}

async.eachLimit(20, processApplication, function(err){
  // if any of the saves produced an error, err would equal that error
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`limit`</td>
      <td>`Number`</td>
      <td>**required**</td>
      <td>The maximum number of `iterator`s to run at any time.</td>
    </tr>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function to apply to each item in `arr`.
            The iterator is passed a `callback(err)` which must be called once it has
            completed. If no error has occurred, the `callback` should be run without
            arguments or with an explicit `null` argument.
      </td>
    </tr>
    <tr>
      <td>`callback(err)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called when all `iterator` functions
            have finished, or an error occurs.
      </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="map"></a>
### <span class="member">method</span> map(iterator, callback)

Produces a new array of values by mapping each value in `collection` resource through
the `iterator` function. The `iterator` is called with an item from `collection` and a
callback for when it has finished processing. Each of these callback takes 2 arguments:
an `error`, and the transformed item from `collection`. If `iterator` passes an error to his
callback, the main `callback` (for the `map` function) is immediately called with the error.

Note, that since this function applies the `iterator` to each item in parallel,
there is no guarantee that the `iterator` functions will complete in order.
However, the results array will be in the same order as the original `collection` resource items.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function pluckAppName(application, cb){
  cb(null, application.name);
}

applications.map(pluckAppName, function(err, results){
  // results is now an array of name for each application
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function to apply to each item in `arr`.
            The iterator is passed a `callback(err, transformed)` which must be called once
            it has completed with an error (which can be `null`) and a transformed item.
      </td>
    </tr>
    <tr>
      <td>`callback(err, results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called when all `iterator`
            functions have finished, or an error occurs. Results is an array of the
            transformed items from the `collection` resource.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="mapSeries"></a>
### <span class="member">method</span> mapSeries(iterator, callback)

The same as [`map`](collectionResource#map), only the `iterator` is applied
to each item in `collection` resource in series.
The next `iterator` is only called once the current one has completed.
The results array will be in the same order as the original.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="mapLimit"></a>
### <span class="member">method</span> mapLimit(limit, iterator, callback)

The same as [`map`](collectionResource#map), only no more than `limit` `iterator`s
will be simultaneously running at any time.

Note that the items are not processed in batches, so there is no guarantee that
the first `limit` `iterator` functions will complete before any others are started.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function pluckAppName(application, cb){
  cb(null, application.name);
}

applications.map(pluckAppName, function(err, results){
  // results is now an array of name for each application
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`limit`</td>
      <td>`Number`</td>
      <td>**required**</td>
      <td>The maximum number of `iterator`s to run at any time.
      </td>
    </tr>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function to apply to each item in `arr`.
            The iterator is passed a `callback(err, transformed)` which must be called once
            it has completed with an error (which can be `null`) and a transformed item.
      </td>
    </tr>
    <tr>
      <td>`callback(err, results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called when all `iterator`
            functions have finished, or an error occurs. Results is an array of the
            transformed items from the `collection` resource.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="select"></a>
<a name="filter"></a>
### <span class="member">method</span> filter(iterator, callback)

__Alias:__ `select`

Returns a new array of all the values in `collection` resource items which pass an async truth test.
_The callback for each `iterator` call only accepts a single argument of `true` or
`false`; it does not accept an error argument first!_ This is in-line with the
way node libraries work with truth tests like `fs.exists`. This operation is
performed in parallel, but the results array will be in the same order as the
original.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function isAppContainsTest (application, cb){
  cb(/test/.test(application.name));
}

applications.filter(isAppContainsTest, function(results){
  // results now equals an array of the existing files
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A truth test to apply to each item in `arr`.
            The `iterator` is passed a `callback(truthValue)`, which must be called with a
            boolean argument once it has completed.
      </td>
    </tr>
    <tr>
      <td>`callback(results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called after all the `iterator`
            functions have finished.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="selectSeries"></a>
<a name="filterSeries"></a>
### <span class="member">method</span> filterSeries(iterator, callback)

__Alias:__ `selectSeries`

The same as [`filter`](collectionResource#filter) only the `iterator` is applied
to each item in `collection` resource in series.
The next `iterator` is only called once the current one has completed.
The results array will be in the same order as the original.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="reject"></a>
### <span class="member">method</span> reject(iterator, callback)

The opposite of [`filter`](collectionResource#filter). Removes values that pass an `async` truth test.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="rejectSeries"></a>
### <span class="member">method</span> rejectSeries(iterator, callback)

The same as [`reject`](collectionResource#reject), only the `iterator` is applied to each item in `arr`
in series.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="reduce"></a>
### <span class="member">method</span> reduce(memo, iterator, callback)

__Aliases:__ `inject`, `foldl`

Reduces `collection` resource items into a single value using an async `iterator` to return
each successive step. `memo` is the initial state of the reduction.
This function only operates in series.

For performance reasons, it may make sense to split a call to this function into
a parallel `map`, and then use the normal `Array.prototype.reduce` on the results.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

applications.reduce(0, function(memo, item, callback){
  // pointless async:
  process.nextTick(function(){
      callback(null, memo++)
  });
}, function(err, result){
  // result is now equal to the last value of memo, which is count of applications
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`memo`</td>
      <td>`any`</td>
      <td>**required**</td>
      <td>The initial state of the reduction.
      </td>
    </tr>
    <tr>
      <td>`iterator(memo, item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function applied to each item in the
            `collection` resource to produce the next step in the reduction.
            The `iterator` is passed a
            `callback(err, reduction)` which accepts an optional error as its first
            argument, and the state of the reduction as the second. If an error is
            passed to the callback, the reduction is stopped and the main `callback` is
            immediately called with the error.
      </td>
    </tr>
    <tr>
      <td>`callback(err, results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called after all the `iterator`
            functions have finished. Result is the reduced value.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="reduceRight"></a>
### <span class="member">method</span> reduceRight(memo, iterator, callback)

__Alias:__ `foldr`

Same as [`reduce`](collectionResource#reduce), only operates on `collection` resource in reverse order.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="detect"></a>
### <span class="member">method</span> detect(iterator, callback)

Returns the first value in `collection` resource that passes an async truth test. The
`iterator` is applied in parallel, meaning the first iterator to return `true` will
fire the detect `callback` with that result. That means the result might not be
the first item in the original `collection` resource (in terms of order) that passes the test.

If order within the original `collection` resource is important,
 then look at [`detectSeries`](collectionResource#detectSeries).

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function isAppNameInLowerCase(application, cb){
  cb(application.name === application.name.toLowerCase());
}

applications.detect(isAppNameInLowerCase, function(result){
  // result now equals the first application in the list that has name in lower case
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A truth test to apply to each item in `collection` resource.
            The iterator is passed a `callback(truthValue)` which must be called with a
            boolean argument once it has completed.
      </td>
    </tr>
    <tr>
      <td>`callback(results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called as soon as any iterator returns
            `true`, or after all the `iterator` functions have finished. Result will be
            the first item in the array that passes the truth test (iterator) or the
            value `undefined` if none passed.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="detectSeries"></a>
### <span class="member">method</span> detectSeries(iterator, callback)

The same as [`detect`](collectionResource#detect), only the `iterator` is applied to each
item in `collection` resource in series.
This means the result is always the first in the original `collection` resource
(in terms of items order) that passes the truth test.

Iterates (with automatic pagination - see above) over all resources within the collection.

---------------------------------------

<a name="sortBy"></a>
### <span class="member">method</span> sortBy(iterator, callback)

Sorts a list by the results of running each `collection` resource value through an async `iterator`.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

applications.sortBy(function(application, callback){
  callback(null, application.name);
}, function(err, results){
  // results is now the array of application sorted by
  // application name
});
```

__Sort Order__

By modifying the callback parameter the sorting order can be influenced:

```javascript
//case insensitive order
applications.sortBy(function(application, callback){
  callback(err, application.name.toLowerCase());
}, function(err,result){
  //result callback
} );

//case sensitive order
applications.sortBy(function(application, callback){
    callback(null, application.name);
}, function(err,result){
  //result callback
} );
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function to apply to each item in `arr`.
            The iterator is passed a `callback(err, sortValue)` which must be called once it
            has completed with an error (which can be `null`) and a value to use as the sort
            criteria.
      </td>
    </tr>
    <tr>
      <td>`callback(err, results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called after all the `iterator`
            functions have finished, or an error occurs. Results is the items from
            the original `arr` sorted by the values returned by the `iterator` calls.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="some"></a>
### <span class="member">method</span> some(iterator, callback)

__Alias:__ `any`

Returns `true` if at least one element in the `collection` resource satisfies an async test.
_The callback for each iterator call only accepts a single argument of `true` or
`false`; it does not accept an error argument first!_ This is in-line with the
way node libraries work with truth tests like `fs.exists`. Once any iterator
call returns `true`, the main `callback` is immediately called.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function isAppNameHasTest(application, cb){
  cb(/test/.test(application.name));
}

applications.some(isAppNameHasTest, function(result){
  // if result is true then at least one of the files exists
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A truth test to apply to each item in the `collection` resource
            in parallel. The iterator is passed a callback(truthValue) which must be
            called with a boolean argument once it has completed.
      </td>
    </tr>
    <tr>
      <td>`callback(results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called as soon as any iterator returns
            `true`, or after all the iterator functions have finished. Result will be
            either `true` or `false` depending on the values of the async tests.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="every"></a>
### <span class="member">method</span> every(iterator, callback)

__Alias:__ `all`

Returns `true` if every element in `collection` resource satisfies an async test.
_The callback for each `iterator` call only accepts a single argument of `true` or
`false`; it does not accept an error argument first!_ This is in-line with the
way node libraries work with truth tests like `fs.exists`.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function isAppNameHasSecure(application, cb){
  cb(/secure/.test(application.description);
}

applications.every(isAppNameHasSecure, function(result){
  // if result is true then every application has 'secure' word in description
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A truth test to apply to each item in the array
            in parallel. The iterator is passed a callback(truthValue) which must be
            called with a  boolean argument once it has completed.
      </td>
    </tr>
    <tr>
      <td>`callback(results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called after all the `iterator`
            functions have finished. Result will be either `true` or `false` depending on
            the values of the async tests.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="concat"></a>
### <span class="member">method</span> concat(iterator, callback)

Applies `iterator` to each item in `collection` resource, concatenating the results. Returns the
concatenated list. The `iterator`s are called in parallel, and the results are
concatenated as they return. There is no guarantee that the results array will
be returned in the original order of `collection` resource items passed to the `iterator` function.

Iterates (with automatic pagination - see above) over all resources within the collection.

#### Usage

```javascript
// assuming applications is a collection resource

function pluckAppNameAndHref(application, cb){
  cb(null, {href: application.href, name: application.name});
}

applications.concat(pluckAppNameAndHref, function(err, apps){
  // apps is now a list of app names and hrefs
});
```

#### Parameters

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Presence</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>`iterator(item, callback)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A function to apply to each item in `arr`.
            The iterator is passed a `callback(err, results)` which must be called once it
            has completed with an error (which can be `null`) and an array of results.
      </td>
    </tr>
    <tr>
      <td>`callback(err, results)`</td>
      <td>`function`</td>
      <td>**required**</td>
      <td>A callback which is called after all the `iterator`
      <td>A callback which is called after all the `iterator`
            functions have finished, or an error occurs. Results is an array containing
            the concatenated results of the `iterator` function.
       </td>
    </tr>
  </tbody>
</table>

---------------------------------------

<a name="concatSeries"></a>
### <span class="member">method</span> concatSeries(arr, iterator, callback)

Same as [`concat`](collectionResource#concat), but executes in series instead of parallel.

Iterates (with automatic pagination - see above) over all resources within the collection.
