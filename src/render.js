const path = require('path')

const md5 = require('md5')

const filename = path.resolve(process.argv[2])
const imagesFolder =
	filename.split('/').slice(0, -1).join('/') + '/'
const smileysFolder =
	__dirname.split('/').slice(0, -2).join('/') +
	'/front/images/smileys/svg/'

const md2html = require('mse-md2html')(
	imagesFolder,
	smileysFolder
)

function MakeQuerablePromise(promise) {
	// Don't modify any promise that has been already modified.
	if (promise.isResolved) return promise

	// Set initial state
	let isPending = true
	let isRejected = false
	let isFullFilled = false
	let data = undefined

	// Observe the promise, saving the fulfillment in a closure scope.
	let result = promise.then(
		function (v) {
			isFullFilled = true
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

	result.isFullFilled = () => isFullFilled
	result.isPending = () => isPending
	result.isRejected = () => isRejected
	result.data = () => data
	return result
}

function format(result, silent, forExport = false) {
	if (!forExport)
		result = result
			.replace(
				/^<p>&#x3C;inlined><\/p>(\n)*<h([0-9])/g,
				'<h$2 class="inlined"'
			)
			.replace(/<li>\s*<p>/gm, '<li>')
			.replace(/<\/p>\s*<\/li>/gm, '</li>')
			.replace(/<-{5,}\>/g, '<div class="break"></div>')

	if (!silent)
		console.log(result.split('\n').slice(0, 30).join('\n'))

	if (!silent) console.timeEnd('render')

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
			silent,
			true
		)

	let chunks = ('\n' + content)
		.replace(/\n[\/][\*]((\n|.)+?)[\*][\/]/gm, '')
		.replace(/!=/gm, '≠')
		//.replace(/^(#+ [^ ])/gm, '![]() \n\n$1')
		.split(/^#(?=(#* ))/m)
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
		//important because not async
		.filter((e, id) => {
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
		//important because async
		.map(async (e, id) => {
			const zmarkdownResult = await md2html(e.content)
				.then((res) => {
					res = new Object(res)

					//console.log(res)
					return {
						output: res.contents,
						level: res.data.depth,
					}
				})
				.catch(console.log)

			e = Object.assign(e, zmarkdownResult)
			e.unformatedOutput = e.output
			e.output = format(e.output, silent)
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
}
