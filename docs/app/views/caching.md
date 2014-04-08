## CACHING

The caching mechanism enables us to store the state of an already accessed resource in a cache store.
 If we accessed the resource again and the data inside the cache hasn’t yet expired,
  we would get the resource directly from the cache store.
  By doing so, we can reduce network traffic and still have access to some
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
      store: MemoryStore,
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
          }
        },
        directories {
          store: MemoryStore,
          ttl: 60,
        }
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
      <td><code>number</code></td>
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
        poolSize: 10
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
      <td> To enable `Memcached` should be equal to `memcached`
        or `MemcachedStore`
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td><code>string</code>, <code>array</code>,
        <code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>
        Server locations.
        The server locations is designed to work with different formats.
        These formats are all internally parsed to the correct format so
        our consistent hashing scheme can work with it.
        </br>You can either use:
        <ul>
          <li><code>String</code>, this only works if you have are running a single server instance of Memcached. It's as easy a suppling a string in the following format: hostname:port. For example 192.168.0.102:11212 This would tell the client to connect to host 192.168.0.102 on port number 11212.</li>
          <li><code>Array</code>, if you are running a single server you would only have to supply one item in the array. The array format is particularly useful if you are running a cluster of Memcached servers. This will allow you to spread the keys and load between the different servers. Giving you higher availability for when one of your Memcached servers goes down.</li>
          <li><code>Object</code>, when you are running a cluster of Memcached servers it could happen to not all server can allocate the same amount of memory. You might have a Memcached server with 128mb, 512, 128mb. If you would the array structure all servers would have the same weight in the consistent hashing scheme. Spreading the keys 33/33/33 over the servers. But as server 2 has more memory available you might want to give it more weight so more keys get stored on that server. When you are using a object, the key should represent the server location syntax and the value the weight of the server. By default all servers have a weight of 1. `{ '192.168.0.102:11212': 1, '192.168.0.103:11212': 2, '192.168.0.104:11212': 1 }` would generate a 25/50/25 distribution of the keys.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>There 2 kinds of options that can be configured.
        A global configuration that will be inherited by all
        Memcached servers instances and a client specific configuration
        that can be used to overwrite the globals. The options should be
        formatted in an JavaScript object.
        They both use the same object structure:
        <ul>
            <li><code>maxKeySize</code>: <em>250</em>, the max size of they key allowed by the Memcached server.</li>
            <li><code>maxExpiration</code>: <em>2592000</em>, the max expiration of keys by the Memcached server
            in seconds.</li>
            <li><code>maxValue</code>: <em>1048576</em>, the max size of a value that is allowed by the
            Memcached server.</li>
            <li><code>poolSize</code>: <em>10</em>, the maximum connections we can allocate in our connection pool.</li>
            <li><code>algorithm</code>: <em>crc32</em>, the hashing algorithm that should be used to generate
            the hashRing values.</li>
            <li><code>reconnect</code>: <em>18000000</em>, when the server is marked as dead we will attempt to
            reconnect every x milliseconds.</li>
            <li><code>timeout</code>: <em>5000</em>, after x ms the server should send a timeout if we can't
            connect. This will also be used close the connection if we are idle.</li>
            <li><code>retries</code>: <em>5</em>, How many times to retry socket allocation for given request</li>
            <li><code>failures</code>: <em>5</em>, Number of times a server may have issues before marked dead.</li>
            <li><code>retry</code>: <em>30000</em>, time to wait between failures before putting server back in
            service.</li>
            <li><code>remove</code>: <em>false</em>, when the server is marked as dead you can remove it from
            the pool so all other will receive the keys instead.</li>
            <li><code>failOverServers</code>: <em>undefined</em>, the ability use these servers as failover when
            the dead server get's removed from the consistent hashing scheme. This must be
            an array of servers confirm the server_locations specification.</li>
            <li><code>keyCompression</code>: <em>true</em>, compress keys using md5 if they exceed the
            maxKeySize option.</li>
            <li><code>idle</code>: <em>5000</em>, the idle timeout for the connections.</li>
        </ul>
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
      <td><code>number</code></td>
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
        poolSize: 10
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
      <td> To enable `Memcached` should be equal to `memcached`
        or `MemcachedStore`
      </td>
    </tr>
    <tr>
      <td><code>connection</code></td>
      <td><code>string</code>, <code>array</code>,
        <code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>
        A new redis connection,
        port defaults to 6379 and host defaults to 127.0.0.1. If you have redis-server running on the same computer as node, then the defaults for port and host are probably fine.
      </td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>optional, <code>global</code></td>
      <td>There 2 kinds of options that can be configured.
        A global configuration that will be inherited by all
        Memcached servers instances and a client specific configuration
        that can be used to overwrite the globals. The options should be
        formatted in an JavaScript object.
        They both use the same object structure:
        <ul>
            <li><code>maxKeySize</code>: <em>250</em>, the max size of they key allowed by the Memcached server.</li>
            <li><code>maxExpiration</code>: <em>2592000</em>, the max expiration of keys by the Memcached server
            in seconds.</li>
            <li><code>maxValue</code>: <em>1048576</em>, the max size of a value that is allowed by the
            Memcached server.</li>
            <li><code>poolSize</code>: <em>10</em>, the maximum connections we can allocate in our connection pool.</li>
            <li><code>algorithm</code>: <em>crc32</em>, the hashing algorithm that should be used to generate
            the hashRing values.</li>
            <li><code>reconnect</code>: <em>18000000</em>, when the server is marked as dead we will attempt to
            reconnect every x milliseconds.</li>
            <li><code>timeout</code>: <em>5000</em>, after x ms the server should send a timeout if we can't
            connect. This will also be used close the connection if we are idle.</li>
            <li><code>retries</code>: <em>5</em>, How many times to retry socket allocation for given request</li>
            <li><code>failures</code>: <em>5</em>, Number of times a server may have issues before marked dead.</li>
            <li><code>retry</code>: <em>30000</em>, time to wait between failures before putting server back in
            service.</li>
            <li><code>remove</code>: <em>false</em>, when the server is marked as dead you can remove it from
            the pool so all other will receive the keys instead.</li>
            <li><code>failOverServers</code>: <em>undefined</em>, the ability use these servers as failover when
            the dead server get's removed from the consistent hashing scheme. This must be
            an array of servers confirm the server_locations specification.</li>
            <li><code>keyCompression</code>: <em>true</em>, compress keys using md5 if they exceed the
            maxKeySize option.</li>
            <li><code>idle</code>: <em>5000</em>, the idle timeout for the connections.</li>
        </ul>
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
      <td><code>number</code></td>
      <td>optional</td>
      <td>Each resource “region” can have a separate cache options.
      </td>
    </tr>
  </tbody>
</table>