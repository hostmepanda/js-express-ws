'use strict';

class CommonError {
    code;
    text;

    constructor(text, code = 401) {
        this.text = text;
        this.code = code;
    }
}

module.exports = {
    CommonError,
};
