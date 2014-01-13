var fs = require('fs'),
    types = require('./../routes/types');

String.prototype.capitalize = function () {
    return this.length ? this.slice(0, 1).toUpperCase() + this.slice(1) : this;
};

var isDefaultType = function (typeName) {
    var jsonTypes = ['integer', 'number', 'object', 'array', 'boolean', 'string'];
    return jsonTypes.indexOf(typeName) !== -1;
};

var findReference = function (type, q) {
    for (var t in types) {
        if (t.toLowerCase() === type.toLowerCase()) {
            var typeInstance = new types[t]();
            if (typeInstance.extend) {
                if (typeInstance.extend[q]) {
                    return q.capitalize() + type.capitalize() + ".schema.json";
                }
            } else {
                return type.capitalize() + ".schema.json";
            }
        }
    }
    return type.capitalize() + ".schema.json";
};

var varType = /([a-zA-Z]+):([A-Za-z\s,_]+)/;

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


    var createSchema = function (collection, description, category) {
        var schema = {};
        schema.title = name;
        schema.type = 'object';
        schema["$schema"] = "http://json-schema.org/schema#";
        schema.properties = {};
        schema.required = [];
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
                if (!isDefaultType(schema.properties[name].type.toLowerCase())) {
                    schema.properties[name].type = "object";
                    schema.properties[name]["$ref"] = findReference(type, category);
                }
            }
        }
        return schema;
    };

    var schema = createSchema(instance.attributes ? instance.attributes : [], 'Description for ', '');

    save(schema, name.capitalize() + (instance.extend ? 'Base' : '') + '.schema');


    for (var q in instance.extend) {
        var extended = instance.extend[q];
        var subSchema = createSchema(extended, 'description for ' + q + ', ', q);
        subSchema.allOf = [
            {"$ref": name.capitalize() + 'Base.schema.json'}
        ];
        save(subSchema, q.capitalize() + name + '.schema');
    }
};

var save = function (instance, name) {
    console.log(name);
    var json = JSON.stringify(instance);
    console.log(json);
    fs.writeFileSync('schema/bottomup/' + name + '.json', json, 'utf8');
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
 *  A setup such as above will create Address schema and along with it UserBase, StaffUser and Member
 *  using all of specification from the generated Sub type schemas.
 */
for (var x in types) {
    generator(new types[x](), x);
}
