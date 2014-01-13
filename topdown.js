var fs = require('fs'),
    types = require('./../routes/types');

String.prototype.capitalize = function () {
    return this.length ? this.slice(0, 1).toUpperCase() + this.slice(1) : this;
};

var varType = /([a-zA-Z]+):([A-Za-z\s,_]+)/;

var isDefaultType = function(typeName) {
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

var generator = function (instance, name) {

    var schema = {};
    schema.title = name;
    schema.type = 'object';
    schema["$schema"] = "http://json-schema.org/schema#";
    schema.properties = {};
    schema.required = [];
    var propertiesEvaluator = function (collection, schema, description) {
        for (var i = 0; i < collection.length; i += 1) {
            var attribute = collection[i];
            var element = inspect(attribute);

            var name, type;
            name = element.name;
            type = element.type;
            schema.properties[name] = {};
            schema.properties[name].id = "#" + name;
            schema.properties[name].description = description + name;
            if (type.toLowerCase() === "enum") {
                schema.properties[name].enum = element.enum;
            } else {
                schema.properties[name].type = type.toLowerCase();
                if (type.toLowerCase() === "number") {
                    schema.properties[name].minimum = 0;
                }
                if (type.toLowerCase() === "date") {
                    schema.properties[name].type = "string";
                    schema.properties[name].format = "date";
                }
                if(!isDefaultType(schema.properties[name].type.toLowerCase())) {
                    schema.properties[name].type = 'object';
                    schema.properties[name]["$ref"] = type.capitalize() + '.schema.json';
                }
            }
        }
    };
    propertiesEvaluator(instance.attributes, schema, 'Description for ');

    schema.definitions = {};
    var propertyDefine = function (name, collection) {
        schema.definitions[name] = {};
        schema.definitions[name].properties = {};
        propertiesEvaluator(collection, schema.definitions[name], 'applies to ' + name + ', ');
    };

    var extDefinitions = [];
    for (var q in instance.extend) {
        var extended = instance.extend[q];
        propertyDefine(q, extended);
        extDefinitions.push(q);
    }

    if (extDefinitions.length) {
        schema.oneOf = [];
        for (var i = 0; i < extDefinitions.length; i += 1) {
            schema.oneOf.push({"$ref": "#/definitions/" + extDefinitions[i]});
        }
    }

    return schema;
};

var save = function (instance, name) {
    console.log(name);
    var json = JSON.stringify(instance);
    console.log(json);
    fs.writeFileSync('schema/topdown/' + name.capitalize() + '.json', json, 'utf8');
}

/**
 * eg.
 * var Address = function(){};
 * Address.prototype.attributes = ["addressLine1", "addressLine2", "city", "postcode:Integer", "country"];
 *
 * var User = function(){};
 * User.prototype.attributes = ["name", "email", "password", "address:Address", "active:enum Active,Inactive"];
 * User.prototype.extend = {};
 * User.prototype.extend.staffUser = ["staffId", "department"];
 * User.prototype.extend.member = ["memberId"];
 *
 * var types = {User:User, Address:Address};
 *
 *  A setup such as above will create Address schema and along with it User schema with inheritence handled
 *  by oneOf specification.
 */
for (var x in types) {
    save(generator(new types[x](), x), x + '.schema');
}

