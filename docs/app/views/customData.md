## Custom Data

Stormpath resources have predefined fields that are useful to many Applications,
but you are likely to have your own requirements and custom fields that you need
to associate with Stormpath resources. For this reason, `Accounts`, `Groups`,
`Applications`, `Directories` and `Tenant` resources support a linked `CustomData`
resource that you can use for your own needs.

Each of those resources will have an instance of `CustomData`, attached at the
property `customData`.

NOTE:  While this instance of `CustomData` is created automatically you must
expand `customData` when you request the parent resource.  Otherwise you will
need to make a second call to `customData.get()`

#### Usage example (without expansion)

```javascript

client.getAccount(accountHref,function(err,account){
  account.customData.get(function(err,customData){
    console.log('my custom property',customData.myCustomProperty);
  });
});
```

#### Usage example (with expansion)

```javascript

client.getAccount(accountHref,{expand:'customData'},function(err,account){
  console.log('my custom property',account.customData.myCustomProperty);
});
```

**Since**: 0.1.2

---

<a name="get"></a>
### <span class="member">method</span> get(callback)

Calling this method retrieves `CustomData` resource of the parent resource.

#### Usage

```javascript

// Parent resource is an Account instance
account.customData.get(function(err, customData){
  // customData
});

```

#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| *`callback`* | function | *`required`* | The callback to execute upon retrieval. Parameters are `Error` and `CustomData` objects.


#### Return

void; the callback function if specified will be called with an
`Error`(if an error occurred) and
`CustomData`(if request was successful) objects.

---

<a name="delete"></a>
### <span class="member">method</span> delete(callback)

This function is used to delete the contents of an account's or group's custom data resource.
 This will delete all of the respective account's or group's custom data fields, but it leaves
 the `customData` placeholder in the account or group resource. You cannot delete the `customData`
 resource entirely – it will be permanently deleted when the account or group is
 deleted.

#### Usage

```javascript

//Account
account.customData.delete(function(err){
  if(err) throw err;
});

//Group
group.customData.delete(function(err){
  if(err) throw err;
});

```


#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| *`callback`* | function | *`required`* | The callback to execute upon resource deletion. The only parameter is an `Error` object.

#### Returns
void; the callback function if specified will return an `Error` object if an error occurred.  There is no body to return of a successful deletion call.

---

<a name="remove"></a>
### <span class="member">method</span> remove(fieldName)

Call to this methods queues removal of any `CustomData` field until next
 update of `Account`,`Group` or `CustomData` via `save()` method.

#### Usage

```javascript

//Account
account.customData.remove('address1');

//Group
group.customData.remove('old_image_url')
  .remove('old_profile_id');

```

#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| *`fieldName`* | string | *`required`* | The name of `CustomData` field to remove.


#### Return

Current custom data instance, so remove calls can be chained.

---

<a name="save"></a>
### <span class="member">method</span> save(callback)

Calling this method updates `CustomData` resource directly.

#### Usage

```javascript

//Account
account.customData.save(function(err, customData){
  // customData
});

//Group
group.customData.save(function(err, customData){
  // customData
});

```

#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| *`callback`* | function | *`required`* | The callback to execute upon
 resource update. Parameters are `Error` and `CustomData` objects.


#### Return

void; the callback function if specified will be called with an
`Error`(if an error occurred) and
`CustomData`(if update was successful) objects.