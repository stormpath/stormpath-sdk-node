# 1.0 Breaking changes list

An ongoing list of API cleanup that we need to do in our 1.0 release

## Application API:

* I would like to rename Application.getAccount() -> Application.getProviderAccount()

## Account Store Mappings

* Need to remove "getAccount" from the base AccountStoreMapping, it now exists on ApplicationAccountStoreMapping

## Api Authentication

* We will no longer support access tokens in the URL, we will only accept it in the Authorization header

* scope factory should return a string, not an array

* "Granted Scopes" on client credentials authentication result should be a string.

## Client Constructor:

The client constructor is confusing, as we accept the entire stormpath configuration
object.  As such, to manually specify an API Key ID and Secret, you need to
do the following:

```
new stormpath.Client({
  client: {
    apiKey: {
      id: 'xxx',
      scret: 'xxx'
    }
  }
})
```

Because the client construction will never use the sibling properties of
`stormpath.web` and `stormpath.application`, we should only accept values that
can be defined by `stormpath.client`, and as such the client construction wil
look like this:

```
new stormpath.Client({
  apiKey: {
    id: 'xxx',
    scret: 'xxx'
  }
})
```
Or this:


```
new stormpath.Client({
  apiKey: {
    file: 'xxx'
  }
})
```