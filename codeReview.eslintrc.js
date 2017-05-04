module.exports = {
	"env": {
        "node": true
    },
	"parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "strict",
    },
    "extends": "eslint:recommended",
    "rules": {
		"indent": ["error", "tab"],
        "semi": ["error", "always"],
		"linebreak-style":["error","windows"],
        "no-cond-assign": ["error", "always"],
        "no-console": "off",
    }
}