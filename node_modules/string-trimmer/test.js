const StringTrimmer = require("./");
const assert = require("assert");

assert(StringTrimmer.trim("  test  ") === "test");
assert(StringTrimmer.trimLeft("  test  ") === "test  ");
assert(StringTrimmer.trimRight("  test  ") === "  test");

assert(StringTrimmer.trim("test", "t") === "es");
assert(StringTrimmer.trim("testing", "ing") === "test");
assert(StringTrimmer.trimLeft("test", "t") === "est");
assert(StringTrimmer.trimRight("test", "t") === "tes");

// Optionally, you could apply these methods to String.prototype.
StringTrimmer.applyTo(String.prototype);

assert(" test ".trim(" t") === "es");

console.log("pass");