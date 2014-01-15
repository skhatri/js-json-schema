var fs = require('fs'), helper = require('./commons');


var generate = function (types, options) {

    var findReference = function (type, q) {
        for (var t in types) {
            if (t.toLowerCase() === type.toLowerCase()) {
                var typeInstance = (typeof types[t] === "object") ? types[t]: new types[t]();
                if (typeInstance.extend) {
                    if (typeInstance.extend[q]) {
                        return q.capitalize() + type.capitalize();
                    }
                } else {
                    return type.capitalize();
                }
            }
        }
        return type.capitalize();
    };


    var generator = function (instance, name) {




        var createSchema = function (collection, description, category, validations, validationPath) {
            var schema = {};
            schema.title = name;
            schema.type = 'object';
            schema["$schema"] = "http://json-schema.org/schema#";
            schema.properties = {};
            schema.required = [];
            for (var i = 0; i < collection.length; i += 1) {
                var attribute = collection[i];
                var element = helper.inspect(attribute);

                var name, type;
                name = element.name;
                type = element.type;
                schema.properties[name] = {};
                schema.properties[name].id = "#" + name;
                schema.properties[name].description = description + name;
                helper.addValidations(schema.properties[name], element.name, validations, validationPath);
                helper.handleTypes(schema, name, type, element, category, options, findReference);
            }
            return schema;
        };

        var schema = createSchema(instance.attributes ? instance.attributes : [], 'Description for ', '',
            instance.validations ? instance.validations : {}, "properties");

        save(schema, name.capitalize());


        for (var q in instance.extend) {
            var extended = instance.extend[q];
            var subSchema = createSchema(
                extended, 'description for ' + q + ', ', q, instance.validations ? instance.validations : {}, q);
            subSchema.allOf = [
                {"$ref": name.capitalize() + options.ext}
            ];
            save(subSchema, q.capitalize() + name);
        }
    };

    var save = function (instance, name) {
        var json = JSON.stringify(instance);
        if (options.log) {
            console.log(name);
            console.log(json);
        }
        fs.writeFileSync(options.schemaDir + '/' + name + options.ext, json, 'utf8');
    };
    for (var x in types) {
        var typeName = types[x];
        if(typeof typeName === "object")
            generator(typeName, x);
        else
            generator(new typeName(), x);
    }
};
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
 *  A setup such as above will create Address schema and along with it User, StaffUser and Member
 *  using all of specification from the generated Sub type schemas.
 */

var exported = function (types, options) {
    helper.cleanser(types, options, {schemaDir: 'bottomup', ext: '.schema.json'});
    generate(types, options);
};

module.exports = {
    generate: exported
};

