var jsonschema = require('./index');

var Address = function () {
};
Address.prototype.attributes = ["addressLine1", "addressLine2", "city", "postcode:Integer", "country"];

var User = function () {
};
User.prototype.attributes = ["name", "email", "password", "address:Address", "active:enum Active,Inactive"];
User.prototype.extend = {};
User.prototype.extend.staffUser = ["staffId", "department"];
User.prototype.extend.member = ["memberId"];

var types = {User: User, Address: Address};


jsonschema.bottomup.generate(types, {schemaDir: "schema", ext: "bottomup.json", log: false});

jsonschema.topdown.generate(types, {schemaDir: "schema", ext: "topdown.json", log: false});

