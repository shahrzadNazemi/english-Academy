# StringTrimmer

**Strip whitespace or other characters.**

This module help you strip whitespace or other characters, and it supports old
browsers like IE8.

## Install

```sh
npm install string-trimmer --save
```

## Example

Import in HTML

```html
<script src="string-trimmer.js"></script>
```

Or in Node.js/WebPack

```javascript
const StringTrimmer = require("string-trimmer");
```

```javascript
StringTrimmer.trim("  test  "); //=> "test"
StringTrimmer.trimLeft("  test  "); //=> "test  "
StringTrimmer.trimRight("  test  "); //=> "  test"
 
StringTrimmer.trim("test", "t"); //=> "es"
StringTrimmer.trim("testing", "ing"); //=> "test"
StringTrimmer.trimLeft("test", "t"); //=> "est"
StringTrimmer.trimRight("test", "t"); //=> "tes"

// Optionally, you could apply these methods to String.prototype.
StringTrimmer.applyTo(String.prototype);

" test ".trim(" t"); //=> "es"
```