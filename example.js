var jsonschema = require('./index');

var Address = function () {
};
Address.prototype.attributes = ["addressLine1", "addressLine2", "city", "postcode:Integer", "country"];

var User = function () {
};
User.prototype.attributes = ["id", "age:Integer", "manager_id:Integer", "name", "email", "password", "address:Address[]", "active:enum Active,Inactive"];
User.prototype.extend = {};
User.prototype.extend.staffUser = ["staffId", "department"];
User.prototype.extend.member = ["memberId"];

User.prototype.validations = {};
User.prototype.validations.properties = {
    "id": {"required": true, "minLength": 1, "maxLength": 20, description: "User Id value", data: "uuid"}
};
User.prototype.validations.staffUser = {
    "staffId": {required: true}
};
var types = {User: User, Address: Address, "Phone": {
    "attributes": [
        "type:enum primary,mobile",
        "number"
    ],
    "validations": {
        "properties": {
            "number": {required: true, maxLength: 15}
        }
    }
}};


jsonschema.bottomup.generate(types, {schemaDir: "schema", ext: "bottomup.json", log: false});

jsonschema.topdown.generate(types, {schemaDir: "schema", ext: "topdown.json", log: false});

