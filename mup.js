module.exports = {
	servers: {
		one: {
			"host": "159.203.28.108",
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
			image: 'abernix/meteord:node-8-base',
			args: [
				"-p 8080:8080"
			]
		},
		env: {
			// ROOT_URL: "https://volemon.cloudalto.net",
			ROOT_URL: "http://volemon.cloudalto.net",
			MONGO_URL: 'mongodb://localhost/meteor'
		},
		deployCheckWaitTime: 240,
		enableUploadProgressBar: true
	},

	// proxy: {
	// 	domains: 'volemon.cloudalto.net',
	// 	nginxServerConfig: './mup/default',
	// 	ssl: {
	// 		forceSSL: true,
	// 		letsEncryptEmail: 'clesquir@gmail.com'
	// 	}
	// },

	mongo: {
		version: '4.0.2',
		oplog: true,
		port: 27017,
		servers: {
			one: {},
		},
	},
};
