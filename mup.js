module.exports = {
	servers: {
		one: {
			"host": "volemon.cloudalto.net",
			"username": "root"
			// pem:
			// password:
			// or leave blank for authenticate from ssh-agent
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
			image: 'abernix/meteord:base',
			args: [
				"-p 8080:8080"
			]
		},
		env: {
			"PORT": 80,
			"ROOT_URL": "http://volemon.cloudalto.net",
			MONGO_URL: 'mongodb://localhost/meteor'
		},

		deployCheckWaitTime: 120
	},

	mongo: {
		oplog: true,
		port: 27017,
		servers: {
			one: {},
		},
	},
};
