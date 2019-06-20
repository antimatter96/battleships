var uuid = require("uuid/v4");
var bcrypt = require("bcrypt");
var User = require("./users");
const immutable = require('immutable');

class UserDB {
	constructor(userVerifier) {
		this.userVerifier = userVerifier;
		this._array = immutable.Map();
	}

	hasUserId (userId) {
		if(this._array.get(userId, false))
			return true;
		
		return false;
	}

	has (username) {
		for (let key in this._array) {
			if (this._array.hasOwnProperty(key)) {
				console.log(key + " -> " + p[key]);
			}
		}	
		if(this._array[userId]) {
			return true;
		}
		return false;
	}

	async add (username, password) {
		try {
			let pwdHash = await bcrypt.hash(password, 10);
			let user = new User(username, pwdHash);
			this._array[user.uuid] = user;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	verifyJWT (claimedUsername, token) {
		return this.userVerifier.verify(claimedUsername, token);
	}

	async verifyPassword (username, password) {
		if(!this._array[username]) {
			return new Error("No User");
		}
		try {
			let verified = await bcrypt.compare(password, this._array[username].password);
			return verified;
		} catch (e) {
			console.error(e);
			return e;
		}
	}
}

module.exports = UserDB;