const md5 = require('md5')

const md2html = require('./ipc/server.js')

function MakeQuerablePromise(promise) {
	// Don't modify any promise that has been already modified.
	if (promise.isResolved) return promise

	// Set initial state
	let isPending = true
	let isRejected = false
	let isFulfilled = false
	let data = undefined

	// Observe the promise, saving the fulfillment in a closure scope.
	let result = promise.then(
		function (v) {
			isFulfilled = true
			isPending = false
			data = v
			return v
		},
		function (e) {
			isRejected = true
			isPending = false
			throw e
		}
	)

	result.isFulfilled = () => isFulfilled
	result.isPending = () => isPending
	result.isRejected = () => isRejected
	result.data = () => data
	return result
}

module.exports = async function (
	content,
	memory,
	silent = true,
	body = true,
	forExport = false
) {
	if (!silent) console.time('render')

	if (forExport)
		return format(
			memory.map((e) => e.unformatedOutput).join(''),
			true
		)

	let chunks = ('\n' + content)
		.replace(/\n[\/][\*]((\n|.)+?)[\*][\/]/gm, '')
		.replace(/!=/gm, '≠')
		//.replace(/^(#+ [^ ])/gm, '![]() \n\n$1')
		.split(/^#/m)
		.filter((e) => e !== '')
		.map((e) =>
			('#' + e)
				.split(/^-#/m)
				.filter((e) => e !== '')
				.map((e, id) => (id > 0 ? '-#' + e : e))
		)
		.flat()

	if (chunks[0] === '\n') chunks.shift()
	else chunks[0] = chunks[0].slice(2)

	const newMem = []

	chunks = chunks
		.map((e) => ({ content: e }))
		.filter((e, id) => {
			//important because not async
			const old = memory.findIndex(
				(m) =>
					typeof m !== 'undefined' &&
					m.content === e.content
			)

			if (old !== -1) {
				memory[old].isNew = false
				newMem.push(memory[old])
				return false
			} else {
				e.id = 'a' + md5(e.content + id.toString())
				e.isNew = true
				e.oldId = id

				newMem.push(e)
				return true
			}
		})
		.map(async (e, id) => {
			//important because async
			console.log(e.oldId + ' :> ' + e.id)
			e = Object.assign(
				e,
				await md2html(e.content).catch(console.log)
			)
			e.unformatedOutput = e.output
			e.output = format(e.output)
			e.output =
				'<div id="' +
				e.id +
				'" level="' +
				e.level +
				'">' +
				e.output +
				'</div>'
			e.insertionId = e.oldId

			return e
		})
		.map((prom) => {
			prom.catch(console.log)
			return prom
		})

	return {
		newMem,
		all: Promise.all(chunks).catch(console.log),
	}
	function format(result, forExport = false) {
		if (!forExport)
			result = result
				.replace(/<li>\s*<p>/gm, '<li>')
				.replace(/<\/p>\s*<\/li>/gm, '</li>')
		if (!silent)
			console.log(
				result.split('\n').slice(0, 30).join('\n')
			)

		if (!silent) console.timeEnd('render')

		return result
	}
}
