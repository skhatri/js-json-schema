js-json-schema
==============

JS to JSON schema generator


```
 var Address = function(){};
 Address.prototype.attributes = ["addressLine1", "addressLine2", "city", "postcode:Integer", "country"];
 
 var User = function(){};
 User.prototype.attributes = ["name", "email", "password", "address:Address", "active:enum Active,Inactive"];
 User.prototype.extend = {};
 User.prototype.extend.staffUser = ["staffId", "department"];
 User.prototype.extend.member = ["memberId"];
 
 var types = {User:User, Address:Address};
```

using top down approach
-----------------------
```
 require('js-json-schema').topdown.generate({schemaDir:'td-schema', ext:'.schema.json'});
```
using bottom up approach
-----------------------
```
 require('js-json-schema').bottomup.generate({schemaDir:'bu-schema', ext:'.schema.json'});
```

