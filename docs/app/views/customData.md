## Custom Data

`Account` and `Group` resources have predefined fields that are useful
 to many `Applications`, but you are likely to have your own custom data
 that you need to associate with an account or group as well.

For this reason, both the account and group resources support a linked `CustomData` resource
 that you can use for your own needs.

The `CustomData` resource is a schema-less JSON object that allows you to specify whatever
 name/value pairs you wish.

The `CustomData` resource is always connected to an `account` or `group` and you can always reach
 it by calling the `CustomData()` method or `customData.get()` on the `account` or `group` resource instance:

#### Account Custom Data Resource URI

    account.customData.href

#### Group Custom Data Resource URI

    group.customData.href

In addition to your custom name/value pairs,
a `CustomData` resource will always contain 3 reserved read-only fields:

<table class="table table-striped table-hover table-curved">
  <thead>
    <tr>
      <th>Parameter</th>
      <th>Type</th>
      <th>Description<th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>href</code></td>
      <td><code>string</code></td>
      <td>The fully qualified location of the custom data resource.</td>
    </tr>
    <tr>
      <td><code>createdAt</code></td>
      <td><code>string</code></td>
      <td>the UTC timestamp with millisecond precision of when the resource was created in Stormpath
       as an ISO 8601 formatted string, for example `2017-04-01T14:35:16.235Z`</td>
    </tr>
    <tr>
      <td><code>modifiedAt</code></td>
      <td><code>string</code></td>
      <td>the UTC timestamp with millisecond precision of when the resource was last updated in Stormpath
       as an ISO 8601 formatted string.</td>
    </tr>
  </tbody>
</table>

You can store an unlimited number of additional name/value pairs in the `CustomData` resource,
 with the following restrictions:

* The total storage size of a single `CustomData` resource cannot exceed 10 MB (megabytes).
The `href`, `createdAt` and `modifiedAt` field names and values do not count against your resource size quota.
* Field names must:
  * be 1 or more characters long, but less than or equal to 255 characters long (1 <= N <= 255).
  * contain only alphanumeric characters `0-9A-Za-z`, underscores `_` or dashes `-` but cannot start with a dash `-`.
  * may not equal any of the following reserved names: `href`, `createdAt`, `modifiedAt`, `meta`, `spMeta`,
`spmeta`, `ionmeta`, or `ionMeta`.

For Custom Data, you can:

* [Create Custom Data](customData#create)
* [Retrieve Custom Data](customData#get)
* [Update Custom Data](customData#update)
* [Delete ALL Custom Data](customData#delete)
* [Delete Custom Data Field](customData#removeField)

**Since**: 0.1.2

<a name="create"></a>
## Create Custom Data

Whenever you create an account or a group, an empty `CustomData` resource is created for that
 account or group automatically – you do not need to explicitly execute a request to create it.

However, it is often useful to populate custom data at the same time you create an account or group.
 You can do this by embedding the customData directly in the account or group resource. For example:

### Example Create Account with Custom Data

```javascript
  var account = {
      username : "jlpicard",
      email : "capt@enterprise.com",
      givenName : "Jean-Luc",
      middleName : "",
      surname : "Picard",
      password : "uGhd%a8Kl!"
      status : "ENABLED",
      customData: {
          rank: "Captain",
          birthDate: "2305-07-13",
          birthPlace: "La Barre, France",
          favoriteDrink: "Earl Grey tea"
       }
  };

  directory.createAccount(account, callback)
```

### Example Create Group with Custom Data

```javascript
  var group = {
      name : "Starfleet Officers",
      customData: {
          headquarters: "San Francisco, CA"
      }
  }

  directory.createGroup(group, callback);
```

<a name="get"></a>
## Retrieve Custom Data

In order to retrieve an account's or group’s custom data directly you can get the
 `CustomData` resource through the client instance providing the custom data href:

### Example: Retrieve an Account’s Custom Data

```javascript
  client.getAccount("https://api.stormpath.com/v1/accounts/someAccountId", function(err, account){
      var customData = account.customData;
  });
```

Another alternative using link expansion:

```javascript
  application.getAccounts()
      .search({email: "some@email.com"})
      .expand({customData: true})
      .exec(function(err, accounts){
        // accounts with custom data
      })
```

### Example: Retrieve a Group with its Custom Data

```javascript
  client.getGroup("https://api.stormpath.com/v1/groups/someGroupId", function(err, group){
      var customData = group.customData;
  });
```

Another alternative using link expansion:

```javascript
  application.getGroups()
      .search({name: "Group Name"})
      .expand({customData: true})
      .exec(function(err, groups){
        // groups with custom data
      })
```

<a name="update"></a>
## Update custom data

You may update an account’s or group’s custom data, in one of two ways:
* by [updating the customData resource directly](customData#updateDirectly),
 independent of the group or account
* by [embedding customData changes in an account or group update request](customData#updateEmbedding)

<a name="updateDirectly"></a>
### Update Custom Data Directly

The first way to update an account's or group’s custom data is by saving changes
 directly to the `CustomData` resource. This allows you to interact with the customData
 resource directly, without having to do so `through` an account or group request.

In the following example request, we’re interacting with a `CustomData` resource directly,
 and we’re changing the value of an existing field named `favoriteColor` and we’re adding
  a brand new field named hobby:

```javascript
  customData.favoriteColor = "red";
  customData.hobby = "Kendo";
  customData.save();
```

<a name="updateEmbedding"></a>
### Update Custom Data as part of an Account or Group Request

Sometimes it is helpful to update an account's or group’s `CustomData` as part of
 an update request for the account or group. In this case, just submit customData
 changes in an embedded `CustomData` field embedded in the account or group request
 resource. For example:

```javascript
  account.status = "ENABLED";
  var customData = account.customData;
  customData.favoriteColor = "blue";
  customData.hobby = "Kendo";
  account.save();
```

In the above example, we’re performing 3 modifications in one request:

- We’re modifying the account’s `status` attribute and setting it to `ENABLED`.
- Changing the existing customData `favoriteColor` field value to `blue`
 (it was previously `red`) and
- Adding a new customData field `hobby` with a value of `Kendo`.

This request modifies both the account resource and that account’s custom data in a
 single request.

The same simultaneous update behavior may be performed for Group updates as well.

<a name="delete"></a>
## Delete Custom Data

You may delete all of an account's or group’s custom data by invoking
 the `delete()` method to the account's or group’s `CustomData`:

### Example: Delete all of an Account’s Custom Data

```javascript
  account.customData.delete();
```

### Example: Delete all of a Group’s Custom Data

```javascript
  group.customData.delete();
```

This will delete all of the respective account's or group's custom data fields,
 but it leaves the `CustomData` placeholder in the account or group resource.
 You cannot delete the `CustomData` resource entirely – it will be automatically
 permanently deleted when the account or group is deleted.

<a name="removeField"></a>
## Delete Custom Data Field

You may also delete an individual custom data field entirely by calling the `remove()`
 method on the account's or group's `CustomData` while stating the custom data field as a
 parameter.

```javascript
  customData.remove("favoriteColor", callback);
```

This request would remove the `favoriteColor` field entirely from the customData resource.
 The next time the resource is [retrieved](customData#get), the field will be missing entirely.