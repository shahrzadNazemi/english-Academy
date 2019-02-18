/**
 * Strips whitespace or specified characters at the beginning and the end of a
 * string.
 * @param str The string that needs to be trimmed.
 * @param chars What kind of chars that needs to be stripped.
 */
declare function StringTrimmer(str: string, chars?: string): string;

declare namespace StringTrimmer {
    /**
     * Strips whitespace or specified characters at the beginning and the end 
     * of a string.
     * @param str The string that needs to be trimmed.
     * @param chars What kind of chars that needs to be stripped.
     */
    function trim(str: string, chars?: string): string;

    /**
     * Strips whitespace or specified characters at the beginning of a string.
     * @param str The string that needs to be trimmed.
     * @param chars What kind of chars that needs to be stripped.
     */
    function trimLeft(str: string, chars?: string): string;

    /**
     * Strips whitespace or specified characters at the end of a string.
     * @param str The string that needs to be trimmed.
     * @param chars What kind of chars that needs to be stripped.
     */
    function trimRight(str: string, chars?: string): string;

    /**
     * Apply the functions to an object's prototype, e.g. `String.prototype`.
     * @param {any} proto Normally, this should be `String.prototype`.
     */
    function applyTo(proto: any): void;
}

export = StringTrimmer;