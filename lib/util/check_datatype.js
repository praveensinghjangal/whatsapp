
let datatype_check_func = {};

datatype_check_func.isString = (value) => {
    return typeof value === 'string' || value instanceof String;
};

datatype_check_func.isNumber = (value) => {
    return typeof value === 'number' && isFinite(value);
};

datatype_check_func.isArray = (value) => {
    return value && typeof value === 'object' && value.constructor === Array;
};


datatype_check_func.isFunction = (value) => {
    return typeof value === 'function';
};

datatype_check_func.isObject = (value) => {
    return value && typeof value === 'object' && value.constructor === Object;
};

datatype_check_func.isNull = (value) => {
    return value === null;
};

// Returns if a value is undefined
datatype_check_func.isUndefined = (value) => {
    return typeof value === 'undefined';
};
datatype_check_func.isBoolean = (value) => {
    return typeof value === 'boolean';
};

datatype_check_func.isRegExp = (value) => {
    return value && typeof value === 'object' && value.constructor === RegExp;
};

datatype_check_func.isError = (value) => {
    return value instanceof Error && typeof value.message !== 'undefined';
};

datatype_check_func.isDate = (value) => {
    return value instanceof Date;
};

datatype_check_func.isSymbol = (value) => {
    return typeof value === 'symbol';
};


module.exports = datatype_check_func;
