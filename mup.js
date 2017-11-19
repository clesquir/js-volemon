module.exports = {
	servers: {
		one: {
			"host": "volemon.cloudalto.net",
			"username": "root"
		}
	},

	meteor: {
		name: 'meteor',
		path: '.',
		servers: {
			one: {}
		},
		buildOptions: {
			serverOnly: true,
		},
		docker: {
			image: 'abernix/meteord:node-8.4.0-base',
			args: [
				"-p 8080:8080"
			]
		},
		env: {
			ROOT_URL: "http://volemon.cloudalto.net",
			MONGO_URL: 'mongodb://localhost/meteor'
		},
		deployCheckWaitTime: 240,
		enableUploadProgressBar: true
	},

	// proxy: {
	// 	domains: 'volemon.cloudalto.net',
		// ssl: {
		// 	forceSSL: true,
		// 	letsEncryptEmail: 'clesquir@gmail.com'
		// }
	// },

	mongo: {
		oplog: true,
		port: 27017,
		servers: {
			one: {},
		},
	},
};
