## GroupMembership

A `GroupMembership` resource represents the association between an [Account](account) and a [Group](group). When an Account is added to a Group or a Group is assigned to an Account, a `GroupMembership` is created.

**Since**: 0.1

---

<a name="getAccount"></a>
### <span class="member">method</span> getAccount(*[options,]* callback)

Retrieves the membership's associated [Account](account) and provides it to the specified `callback`.

#### Usage

```javascript
membership.getAccount(function(err, account) {
  console.log(account);
});
```

You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:

```javascript
membership.getAccount({expand:'groups'}, function(err, account) {
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
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion).</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Account](account) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved [Account](account) resource will be provided to the `callback` as the callback's second parameter.

---

<a name="getGroup"></a>
### <span class="member">method</span> getGroup(*[options,]* callback)

Retrieves the membership's associated [Group](group) and provides it to the specified `callback`.

#### Usage

```javascript
membership.getGroup(function(err, group) {
  console.log(group);
});
```

You can also use [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion) options (query params) to obtain linked resources in the same request:

```javascript
membership.getGroup({expand:'accounts'}, function(err, group) {
  console.log(group);
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
      <td>_`options`_</td>
      <td>`object`</td>
      <td>_optional_</td>
      <td>Name/value pairs to use as query parameters, for example, for [resource expansion](http://docs.stormpath.com/rest/product-guide/#link-expansion).</td>
    </tr>
    <tr>
      <td>`callback`</td>
      <td>function</td>
      <td>required</td>
      <td>The callback to execute upon resource retrieval. The 1st parameter is an `Error` object.  The 2nd parameter is the retrieved [Group](group) resource.</td>
        </tr>
  </tbody>
</table>

#### Returns

void; the retrieved [Group](group) resource will be provided to the `callback` as the callback's second parameter.
