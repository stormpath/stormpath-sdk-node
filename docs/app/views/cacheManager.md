## Cache manager

Provides an access to [Cache](cache) store instance and cache stats.

---

<a name="getCache"></a>
### <span class="member">method</span> getCache()

Returns current instance of cache store.

#### Usage

Example:
```javascript
var cache = cacheManager.getCache();
```

#### Returns

Cache store instance.

---

<a name="createCache"></a>
### <span class="member">method</span>createCache([options])

Creates an instance of cache store.

#### Usage

Example:
```javascript
cache.createCache(options);
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
      <td>`options`</td>
      <td>`object`</td>
      <td>required</td>
      <td>Cache store options.</td>
    </tr>
  </tbody>
</table>

#### Returns

void; creates an instance of cache store