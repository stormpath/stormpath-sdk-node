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

However, this is not something  you need to worry about when using the Stormpath SDK for Node.js.  If you call the [each](#each) method to iterate over the collection items, it will automatically paginate for you during iteration:

As iteration executes, if the `CollectionResource` encounters the end of a page of results, it will request the next page automatically, internalize the results, and those will be used to continue iteration.  This simulates the entire collection being available in memory.

##### Disable Automatic Pagination

If you do not prefer automatic pagination, you can just ignore this feature: don't call the `each` method and instead interact directly with the collection's `items` array.

Once you exhaust an `items` array, you will then be required request the collection's `href` and [pagination query parameters](http://docs.stormpath.com/rest/product-guide/#pagination) to obtain further pages of data.

**Since**: 0.1

---

<a name="each"></a>
### <span class="member">method</span> each(callback)

Iterates (with automatic pagination - see above) over all resources within the collection, invoking the `callback` function for each element in the collection.

#### Usage

For example, to iterate over a collection of [Account](account)s:

```javascript
accounts.each(function(err, account, index) {
  console.log('Index: ' + index + ', account: ' + acccount);
});
```

The callback's `index` parameter is the index (location) of the resource in the retrieved collection.  This parameter is optional and may be omitted.  For example:

```javascript
accounts.each(function(err, account) {
  console.log(account);
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
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the resource obtained during the current iteration loop.  The 3rd parameter is optional, but if specified, represents the zero-based index of the resource's location within the retrieved collection.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; each iterated resource will be provided to the iteration `callback` as the callback's second parameter, and optionally, the iteration index will be provided as the third parameter.
