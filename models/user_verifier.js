var jwt = require("jsonwebtoken");

class UserVerifier {
	constructor(privateKey, publicKey) {
		this.privateKey = privateKey;
		this.publicKey = publicKey;
	}

	verify(claimedUsername, token) {
		//console.log(`${claimedUsername} claims ${token}`);
		let actualUsername = jwt.verify(token, this.publicKey, {algorithms : 'RS256'});
		return claimedUsername == actualUsername;
	}
}

module.exports = UserVerifier;