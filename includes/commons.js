if (String.prototype.capitalize === undefined) {
    String.prototype.capitalize = function () {
        return this.length ? this.slice(0, 1).toUpperCase() + this.slice(1) : this;
    };
}

if (String.prototype.startsWith === undefined) {
    String.prototype.startsWith = function (text) {
        text = text.replace(".", "\\.");
        return new RegExp("^" + text).test(this)
    };
}


var varType = /([a-zA-Z]+):([A-Za-z\s,_]+)/;

var isDefaultType = function (typeName) {
    var jsonTypes = ['integer', 'number', 'object', 'array', 'boolean', 'string'];
    return jsonTypes.indexOf(typeName) !== -1;
};

var inspect = function (attribute) {
    var item = {};
    var matcher = varType.exec(attribute);
    if (!matcher) {
        item.type = 'String';
        item.name = attribute;
    } else {
        item.name = matcher[1];
        item.type = matcher[2];
    }
    var enumExp = /enum\s+([A-Za-z,\s_]+)/;
    var enumMatcher = enumExp.exec(item.type);
    if (enumMatcher) {
        item.type = "enum";
        item.enum = String(enumMatcher[1]).replace(/\s/, '').split(",");
    }
    return item;
};

var cleanser = function (types, options, defaults) {
    if (!types) {
        throw {name: "TypesNotFound", message: "Types should be an object containing other json specs"};
    }
    options = options || {};
    options.schemaDir = options.schemaDir || defaults.schemaDir;
    options.ext = options.ext || defaults.ext;
    options.log = options.log === undefined || options.log;
    if (!options.ext.startsWith(".")) {
        options.ext = "." + options.ext;
    }
};


module.exports = {
    isDefaultType: isDefaultType,
    inspect: inspect,
    cleanser: cleanser
};
