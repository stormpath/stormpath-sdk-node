# Stormpath is Joining Okta

We are incredibly excited to announce that [Stormpath is joining forces with Okta](https://stormpath.com/blog/stormpaths-new-path?utm_source=github&utm_medium=readme&utm-campaign=okta-announcement). Please visit [the Migration FAQs](https://stormpath.com/oktaplusstormpath?utm_source=github&utm_medium=readme&utm-campaign=okta-announcement) for a detailed look at what this means for Stormpath users.

We're available to answer all questions at [support@stormpath.com](mailto:support@stormpath.com).

## What does this mean for developers who are using this library?

This library is not being patched to work with Okta.  If you are using this library, you should consider using the new [Okta Node SDK][] or manually integrating with an HTTP client.  Please see the [Okta API reference][] for more information about the API.

If you are using [Express-Stormpath][], that library is depending on the [okta branch] in this library.  That branch is being maintained for [Express-Stormpath][] only.  Using this branch directly is not supported.

## README

If you are actively using this library, you can find the readme in [OLD-README.md](OLD-README.md).
It is not possible to register for new Stormpath tenants at this time, so you must
already have a Stormpath tenant if you wish to use this library during the migration
period.

[Express-Stormpath]: https://github.com/stormpath/express-stormpath
[okta branch]: https://github.com/stormpath/stormpath-sdk-node/tree/okta
[Okta API reference]: https://okta.github.io/docs/api/resources/apps.html
[Okta Node SDK]: https://github.com/okta/okta-sdk-nodejs