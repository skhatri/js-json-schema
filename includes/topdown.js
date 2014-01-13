var fs = require('fs'), helper = require('./commons');

var generate = function (types, options) {

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
                    var element = helper.inspect(attribute);

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
                        if (!helper.isDefaultType(schema.properties[name].type.toLowerCase())) {
                            schema.properties[name].type = 'object';
                            schema.properties[name]["$ref"] = type.capitalize() + options.ext;
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
            var json = JSON.stringify(instance);
            if (options.log) {
                console.log(name);
                console.log(json);
            }
            fs.writeFileSync(options.schemaDir + '/' + name.capitalize() + options.ext, json, 'utf8');
        };

        for (var x in types) {
            save(generator(new types[x](), x), x);
        }
    }
    ;

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

var exported = function (types, options) {
    helper.cleanser(types, options, {schemaDir: 'topdown', ext: '.schema.json'});
    generate(types, options);
};

module.exports = {
    generate: exported
};

