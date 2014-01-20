'use strict';

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
        return this.lastIndexOf(str, 0) === 0;
    };
}
