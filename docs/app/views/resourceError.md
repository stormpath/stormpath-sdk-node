## ResourceError

A `ResourceError` is an `Error` subclass  object that represents a [Stormpath REST API Error Response](http://docs.stormpath.com/rest/product-guide/#errors).  It contains various properties to help better represent what problem occurred.

Every `ResourceError` has the following fields:

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
      <td>`status`</td>
      <td>`integer`</td>
      <td>This is the same as the HTTP Status Code, only included in the resource body so you don't have to inspect the HTTP Response status code if you don't want to.</td>
    </tr>
    <tr>
      <td>`code`</td>
      <td>`integer`</td>
      <td>A [Stormpath-specific error code](http://docs.stormpath.com/errors/) that represents a Stormpath-specific error condition.</td>
    </tr>
    <tr>
      <td>`message`</td>
      <td>`string`</td>
      <td>The error's constructed message String - a string-representation of this error response object.</td>
    </tr>
    <tr>
      <td>`userMessage`</td>
      <td>`string`</td>
      <td>A user-friendly, safe error message that _you can show directly to your application end-user_ if you desire.  This helps offload the work of you trying to figure out what to show the user if something goes wrong.</td>
    </tr>
    <tr>
      <td>`developerMessage`</td>
      <td>`string`</td>
      <td>A technical error message intended to be read and understood by developers building applications that communicate with Stormpath.</td>
    </tr>
  </tbody>
</table>

Here is an example of an `ResourceError`'s representation (in this case, a [2001](http://docs.stormpath.com/errors/2001/), indicating a desired group name was in use and could not be specified)s:

```javascript
{
  name: 'ResourceError',
  status: 409, //HTTP 409 Conflict
  code: 2001,
  userMessage: 'There is already another Group with the same name.',
  developerMessage: 'The property value must be unique. A property submitted must have a unique value. There is already another resource that has the same property value.',
  message: 'HTTP 409, Stormpath 2001 (http://docs.stormpath.com/errors/2001): The property value must be unique. A property submitted must have a unique value. There is already another resource that has the same property value.'
  moreInfo: 'http://docs.stormpath.com/errors/2001'
}
```

### Usage

`ResourceError`s that occur as a result of a REST request will be presented to any callback function as the callback's first parameter:

```javascript
someObject.doSomethingWrong(..., function myCallback(err, result) {

  ...
});
```
In the above example, the `err` parameter to the `myCallback` function could be a `ResourceError`.

**Since**: 0.1