# `send-webmention` change log

`send-webmention` adheres to [Semantic Versioning](http://semver.org/).

## 2.0.0 - 2018-07-12

### Changed

* Dependency upgrades
* Switch from Perjury to Vows 1.0 alpha (which is Perjury's codebase)

### Breaking

* Drop Node 4 and Node 6 support

## 1.0.2 - 2018-02-25

### Fixed

* `coveralls` and `nyc` are no longer marked as production dependencies instead of dev dependencies

## 1.0.1 - 2017-11-24

### Fixed

* Send `application/x-www-form-urlencoded` as the `Content-Type` of Webmention POST requests

## 1.0.0 - 2017-11-24

### Added

* Initial release
