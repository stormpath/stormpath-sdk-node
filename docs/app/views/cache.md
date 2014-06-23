## Cache

Generic wrapper for cache providers like redis and memcached,
 enables TTI and TTL functionality even if it not supported by cache provider
 (like redis). All cache provider wraps original entity into an instance of
 CacheEntry before storing it in cache.

---

<a name="get"></a>
### <span class="member">method</span> get(key, callback)

Gets cache entry referenced by `key`, retrieved `entry` passed into `callback(err, entry)`
 as second parameter.

#### Usage

Example:
```javascript
cache.get(href, function(err, entry){
  console.log(entry);
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
      <td>`key`</td>
      <td>`string`</td>
      <td>required</td>
      <td>Unique entry `key`, usually a resource `href`.</td>
    </tr>
    <tr>
      <td>`callback(err, entry)`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response.
        The 1st parameter is an `Error` object.
        The 2nd parameter is the cache `entry` returned from the cache store.</td>
    </tr>
     </tbody>
   </table>

   #### Returns

   void; an `entry` returned from the cache store will be provided to
    the `callback` as the callback's second parameter.

   ---

<a name="put"></a>
### <span class="member">method</span> put(key, value, *[isNew,]* callback)

Puts a new or updates an existing `entry` in cache store referenced by `key`.

#### Usage

Example:
Example:
```javascript
cache.put(href, account, false, function(err, res){
  console.log(res);
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
      <td>`key`</td>
      <td>`string`</td>
      <td>required</td>
      <td>Unique entry `key`, usually a resource `href`</td>
    </tr>
    <tr>
      <td>`value`</td>
      <td>`object|array|string`</td>
      <td>required</td>
      <td>A `value` to store in cache, usually an instance of a resource.</td>
    </tr>
    <tr>
      <td>_`isNew`_</td>
      <td>`boolean`</td>
      <td>_optional_</td>
      <td>A parameter that shows: is it a new key or an update to already existed.
       `true` by default.</td>
    </tr>
    <tr>
      <td>`callback(err, res)`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response.
       The 1st parameter is an `Error` object.
       The 2nd parameter depends on used store, raw response from cache server.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; raw cache server response returned from the server will be provided
 to the `callback` as the callback's second parameter.

---

<a name="delete"></a>
### <span class="member">method</span> delete(key, callback)

Removes an `entry` from cache store referenced by `key`.

#### Usage

Example:
```javascript
cache.delete(href, function(err, res){
  console.log(res);
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
      <td>`key`</td>
      <td>`string`</td>
      <td>required</td>
      <td>Unique entry `key`, usually a resource `href`.</td>
    </tr>
    <tr>
      <td>`callback(err, res)`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response.
       The 1st parameter is an `Error` object.
       The 2nd parameter depends on used store, a raw response from cache server.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; raw cache server response returned from the server will be provided
 to the `callback` as the callback's second parameter.

---

<a name="clear"></a>
### <span class="member">method</span> clear(callback)

Delete all the keys in cache store.

#### Usage

Example:
```javascript
cache.clear(function(err, res){
  console.log(res);
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
      <td>`callback(err, res)`</td>
      <td>`function`</td>
      <td>required</td>
      <td>The callback to execute upon server response.
       The 1st parameter is an `Error` object.
       The 2nd parameter depends on used store, raw response from cache server.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; raw cache server response returned from the server will be provided
 to the `callback` as the callback's second parameter.

---

<a name="size"></a>
### <span class="member">method</span> size(callback)

Return the number of keys in the cache store.

#### Usage

Example:
```javascript
cache.size(function(err, size){
  console.log(size);
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
      <td>`callback(err, size)`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon server response.
       The 1st parameter is an `Error` object.
       The 2nd parameter is a cache store `size` - count of keys in cache store.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; the `size` returned from the server will be provided to
 the `callback` as the callback's second parameter.

---