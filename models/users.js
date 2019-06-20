var uuid = require("uuid/v4");

class User {
	constructor(name, password) {
		this.uuid = uuid();
		this.name = name;
		this.password = password;
	}
}

module.exports = User;