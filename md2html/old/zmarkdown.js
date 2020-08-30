const pm2 = new (require('pm2').custom)({
	daemon_mode: false,
})

module.exports = () =>
	new Promise((resolve, reject) => {
		pm2.connect(true, function (err) {
			if (err) {
				console.error(err)
				process.exit(2)
			}

			/*	pm2.list((err, list) => {
				console.log(err, list)
			})*/

			//pm2.stop('zmarkdown', (err, proc) => {})

			//pm2.restart('zmarkdown', (err, proc) => {})

			pm2.start(
				{
					name: 'zmarkdown',
					// Script to be run
					script: require.resolve(
						'/home/epakompri/Documents/scripts/zmarkdown-test/node_modules/zmarkdown/'
					),
					// Allows your app to be clustered
					exec_mode: 'cluster',
					// Optional: to spread the app across all CPUs - 1
					instances: -1,
					// Restarts your app if it reaches 150Mo
					max_memory_restart: '150M',
					force: true,
				},
				function (err, apps) {
					//pm2.disconnect() // Disconnects from PM2
					if (err)
						return reject(err)
						//
						//
						//
						//
					;[
						`exit`,
						`SIGINT`,
						`SIGUSR1`,
						`SIGUSR2`,
						`uncaughtException`,
						`SIGTERM`,
					].forEach((eventType) => {
						process.on(
							eventType,
							(() => {
								console.log('sigkill')
								pm2.delete('all', function () {
									// works and calls this
									console.log('is never called')

									process.exit()
								})
							}).bind(null, eventType)
						)
					})

					resolve(apps)
				}
			)
		})
	})

//module.exports().then(console.log).catch(console.error)
