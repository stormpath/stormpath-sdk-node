## Custom Data

Stormpath resources have predefined fields that are useful to many Applications,
but you are likely to have your own requirements and custom fields that you need
to associate with Stormpath resources. For this reason, `Accounts`, `Groups`,
`Applications`, `Directories` and `Tenant` resources support a linked `CustomData`
resource that you can use for your own needs.

For each of those resources you can use the `getCustomData()` method to retrieve the
the custom data resource as a `CustomData` instance.

#### Usage example

```javascript
client.getAccount(accountHref,function(err,account){
  account.getCustomData(function(err,customData){
    console.log('my custom property',customData.myCustomProperty);
  });
});
```

**Since**: 0.1.2

---

<a name="delete"></a>
### <span class="member">method</span> delete(callback)

This function is used to delete the contents of the resource's custom data resource.
 This will delete all of the respective custom data fields, but it leaves
 the `customData` placeholder in the account or group resource. You cannot delete the `customData`
 resource entirely – it will be permanently deleted when the parent resource is deleted.

#### Usage

```javascript
account.getCustomData(function(err,customData){
  customData.delete(function(err){
    if(err) throw err;
  });
})

```


#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| `callback` | function | `required` | The callback to execute upon resource deletion. The only parameter is an `Error` object.

#### Returns
void; the callback function if specified will return an `Error` object if an error occurred.  There is no body to return of a successful deletion call.

---

<a name="remove"></a>
### <span class="member">method</span> remove(fieldName)

Call to this methods queues removal of any `CustomData` field until next
 update of `Account`,`Group` or `CustomData` via `save()` method.

#### Usage

```javascript
account.getCustomData(function(err,customData){
  customData.remove('address1');
});

```

#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| `fieldName` | string | `required` | The name of `CustomData` field to remove.


#### Return

Current custom data instance, so remove calls can be chained.

---

<a name="save"></a>
### <span class="member">method</span> save(callback)

Calling this method updates `CustomData` resource directly.

#### Usage

```javascript
account.getCustomData(function(err,customData){
  customData.remove('address1');
  customData.save(function(err){
    if(err) throw err;
  })
});

```

#### Parameters

| Parameter   | Type            | Presence   | Description
|-------------|---------------- |----------- | -----------
| `callback` | function | `required` | The callback to execute upon
 resource update. Parameters are `Error` and `CustomData` objects.


#### Return

void; the callback function if specified will be called with an
`Error`(if an error occurred) and
`CustomData`(if update was successful) objects.