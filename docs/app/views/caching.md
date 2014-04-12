## Caching

The caching mechanism enables you to store the state of an already accessed resource in a cache store.
 If you accessed the resource again and the data inside the cache hasn’t yet expired,
  you would get the resource directly from the cache store.
  By doing so, you can reduce network traffic and still have access to some
  of the resources even if there is a connectivity problem with `Stormpath`.
  Be aware, however, that when using a persistent cache store like `Redis`,
  if the data changes quickly on `Stormpath` and the `TTL` and `TTI` are set to a large value,
  you may get resources with attributes that don’t reflect the actual state.
  If this edge case won’t affect your data consistency,
  you can use the caching mechanism by providing an additional parameter
  when creating the `Client` instance parameter:

   ```javascript
    var stormpath = require('stormpath');

    //In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
    var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

    var cacheOptions = {
      store: "memory",
      connection: {},
      options: {},
      ttl: 300,
      tti: 300,
      regions: {
        applications: {
          store: 'redis',
          ttl: 300,
          tti: 300,
          connection: {
            host: 'localhost',
            port: 6739,
          },
          options: {
            // redis client options
          }
        },
        directories: {
          store: "memory",
          ttl: 60,
        }
      }
    }

    var client = new stormpath.Client({apiKey: apiKey, cacheOptions: cacheOptions});
    ```

**Since**: 0.1.2

#### Cache options parameters

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
      <td><code>store</code></td>
      <td><code>string|function</code></td>
      <td>optional, <code>global</code></td>
      <td>The name or function that representing which cache store to use.
        By default [Memory Store](caching#memory) is used.
        Available options: [memory](caching#memory),
        [memcached](caching#memcached), [redis](caching#redis)
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td><code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>The store specific connection options, if any. E.g. [Redis](caching#redis) requires a host
        and a port to be set because we need that information when accessing [Redis](caching#redis),
        while [MemoryStore](caching#memory) requires no further options.
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>The store-specific options, read more in corresponding section.</td>
    </tr>
    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional, <code>global</code></td>
      <td>Time To Live. The amount of time (in seconds) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional, <code>global</code></td>
      <td>Time To Interact. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>regions</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>Each resource “region” can have a separate cache implementation.
        E.g. [Application](application) resources are stored in [Redis](redis)
        but [Directory](directory) resources use [MemoryStore](memory).
        These kind of resource groups are called regions, each could have its own options,
        if not set default or corresponding global options will be used:
        <code>store</code>,<code>connection</code>,<code>options</code>,
        <code>ttl</code>,<code>tti</code>,<code>store</code>,
      </td>
    </tr>
  </tbody>
</table>

---

<a name="memory"></a>
### In memory cache

In memory cache provider. Supported options `ttl`, `tti`

#### Usage

   ```javascript
    var stormpath = require('stormpath');

    //In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
    var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

    var cacheOptions = {
      store: 'memory',
      ttl: 300,
      tti: 300,
      regions: {
        applications: {
          store: 'memory',
          ttl: 300,
          tti: 300,
        }
      }
    }

    var client = new stormpath.Client({apiKey: apiKey, cacheOptions: cacheOptions});
    ```

---

<a name="memcached"></a>
### Memcached

Memcached provider.

#### Usage

   ```javascript
    var stormpath = require('stormpath');

    //In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
    var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

    var cacheOptions = {
      store: 'memcached',
      connection: '192.168.0.102:11212',
      options: {
        poolSize: 10    // memcached option
      },
      ttl: 300,
      tti: 300,
      regions: {
        applications: {
          store: 'memcached',
          ttl: 300,
          tti: 300,
          connection: [ '192.168.0.102:11212', '192.168.0.103:11212', '192.168.0.104:11212' ]
      }
    }

    var client = new stormpath.Client({apiKey: apiKey, cacheOptions: cacheOptions});
    ```

#### Cache options parameters

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
      <td><code>store</code></td>
      <td><code>string|function</code></td>
      <td>optional, <code>global</code></td>
      <td> Should be equal to string `'memcached'`
        or reference to `MemcachedStore` constructor function.
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td>
        <code>object</code>,<code>string</code>,<code>array</code>
      </td>
      <td>optional, <code>global</code></td>
      <td>
        Passed to <code>new Memcached(<strong>connection</strong>, options);</code>
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>
        <p>Passed to <code>new Memcached(connection, <strong>options</strong>);</code></p>
        <p>See the <a href="https://github.com/3rd-Eden/node-memcached" target="_blank">node-memcached docmenation</a> for complete option list.<p>
      </td>
    </tr>
    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional, <code>global</code></td>
      <td>Time To Live. The amount of time (in seconds) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional, <code>global</code></td>
      <td>Time To Interact. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>regions</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>Each resource “region” can have a separate cache options.
      </td>
    </tr>
  </tbody>
</table>

---

<a name="redis"></a>
### Redis


Redis provider.

#### Usage

   ```javascript
    var stormpath = require('stormpath');

    //In this example, we'll reference the values from env vars (NEVER HARDCODE API KEY VALUES IN SOURCE CODE!)
    var apiKey = new stormpath.ApiKey(process.env['STORMPATH_API_KEY_ID'], process.env['STORMPATH_API_KEY_SECRET']);

    var cacheOptions = {
      store: 'redis',
      connection: { host: '127.0.0.1', port: 6379 },
      options: {
        return_buffers: false   //redis option
      },
      ttl: 300,
      tti: 300,
      regions: {
        applications: {
          store: 'redis',
          ttl: 300,
          tti: 300,
          connection: {host: '127.0.0.1', port: 6379}
      }
    }

    var client = new stormpath.Client({apiKey: apiKey, cacheOptions: cacheOptions});
    ```

#### Cache options parameters

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
      <td><code>store</code></td>
      <td><code>string|function</code></td>
      <td>optional, <code>global</code></td>
      <td> Should be equal to string `'redis'` or reference to `RedisStore` constructor function.
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td>
        <code>object</code>
      </td>
      <td>optional, <code>global</code></td>
      <td>
        An object that allows you to specity <code>host</code> or <code>port</code>, as strings, for your redis connection.  This is is passed to <code>redis.createClient(<strong>host</strong>,<strong>port</strong>,options)</code> and will default to 127.0.0.1 and 6379 if not provided.
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>
        <p>Options object that will be passed to <code>redis.createClient(host,port,<strong>options</strong>)</code></p>
        <p>See the <a href="https://github.com/mranney/node_redis" target="_blank">node-redis docmenation</a> for complete option list.</p>
      </td>
    </tr>
    <tr>
      <td><code>ttl</code></td>
      <td><code>number</code></td>
      <td>optional, <code>global</code></td>
      <td>Time To Live. The amount of time (in seconds) after which the stored resource data will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>tti</code></td>
      <td><code>number</code></td>
      <td>optional, <code>global</code></td>
      <td>Time To Interact. If this amount of time has passed after the resource was last accessed, it will be considered expired.
        By default, if not set, will be equal to 300 seconds.
      </td>
    </tr>
    <tr>
      <td><code>regions</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>Each resource “region” can have a separate cache options.
      </td>
    </tr>
  </tbody>
</table>