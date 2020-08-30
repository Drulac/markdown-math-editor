function insertAfter(newNode, referenceNode) {
	try {
		referenceNode.parentNode.insertBefore(
			newNode,
			referenceNode.nextSibling
		)
	} catch (err) {
		console.error(err)
	}
}

async function waitElement(selector) {
	try {
		const querySelector = document.querySelector(selector)
		if (querySelector === null) {
			/* return await waitElement(selector) */
			return document.querySelector('#init')
		}

		return querySelector
	} catch (err) {
		console.log(err)
		return document.querySelector('#init')
	}
}
function removeFirstInlinedTitleMargin() {
	return Array.from(document.querySelectorAll('p'))
		.filter(
			(p) =>
				Array.from(p.querySelectorAll('.img')).length !== 0
		)
		.filter((p) =>
			p.isSameNode(p.parentNode.lastElementChild)
		)
		.map((p) => p.parentNode.nextElementSibling)
		.filter(
			(div) => div !== null && div.childNodes.length >= 2
		)
		.map((div) => div.childNodes[1])
		.filter((el) => el.classList.contains('inlined'))
		.map((title) => {
			title.style['margin-top'] = '0'
			return title
		})
}

const rq = (url) =>
	new Promise((resolve, reject) => {
		const xmlhttp = new XMLHttpRequest()

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == XMLHttpRequest.DONE) {
				/* XMLHttpRequest.DONE == 4     */
				if (xmlhttp.status == 200) {
					resolve(xmlhttp.responseText)
				} else if (xmlhttp.status == 400) {
					reject('There was an error 400')
				} else {
					reject(
						'something else other than 200 was returned'
					)
				}
			}
		}

		xmlhttp.open('GET', url, true)
		xmlhttp.send()
	})

window.addEventListener('load', () => {})

window.addEventListener('scroll', () => {
	console.log('have scrolled')

	document.title = JSON.stringify([
		window.pageYOffset,
		window.innerHeight + window.scrollY + 10 >=
			Math.max(
				document.body.scrollHeight,
				document.documentElement.scrollHeight,
				document.body.offsetHeight,
				document.documentElement.offsetHeight,
				document.body.clientHeight,
				document.documentElement.clientHeight
			),
	])
})

const imgDblClick = async (mouseEvent) => {
	console.log('click on', mouseEvent.target)
	const result = await rq(
		'http://127.0.0.1:3045/open/' +
			encodeURIComponent(
				JSON.stringify({
					file: mouseEvent.target.src.replace(
						'file://',
						''
					),
				})
			)
	).catch(console.error)

	console.log(result)
}

const mde = {
	append: async function (output) {
		console.log('append')

		const wrapper = document.createElement('div')
		wrapper.innerHTML = output.output

		Array.from(
			wrapper.querySelectorAll(
				'span.img + br + br + span.img'
			)
		).forEach((e) => {
			e.parentNode.removeChild(e.previousElementSibling)
			e.parentNode.removeChild(e.previousElementSibling)
		})

		insertAfter(
			wrapper.firstChild,
			await waitElement('#' + output.beforeId)
		)
	},
	delete: async function (keepIds) {
		console.log('delete', keepIds)

		Array.from(
			document.querySelectorAll(
				'#content > section > div:not(#init)'
			)
		).forEach((el, elid) => {
			console.log(elid)
			if (!keepIds.includes(el.id)) {
				console.log('remove', el.id)
				el.parentNode.removeChild(el)
				el = null
			}
		})

		console.log('delete code ended well')
	},
	order: function (tree) {
		console.log('order')

		return Promise.all(
			tree.map(async ([e, previous], id) => {
				try {
					insertAfter(
						await waitElement('#' + e),
						await waitElement('#' + previous)
					)
				} catch (err) {
					console.error(e, previous)
					console.error(err)
				}
			})
		)
	},
	releaseStack: async (stack) => {
		console.log('releaseStack', stack)

		console.log(
			Array.from(
				document.querySelectorAll(
					'#content > section > div:not(#init)'
				)
			).map((el) => el.id)
		)

		for (let [funcIndex, arg] of stack) {
			await mde[funcIndex](arg)
		}

		Array.from(
			document.querySelectorAll('#content > section > div')
		).map((el) => {
			const setMarge = function (element, lvl) {
				element.style['margin-left'] = lvl * 30 + 'px'
			}
			/*
			const setMarge = (lvl) => {
				//if (lvl < 0) lvl = 0
				el.style['margin-left'] =
					parseInt(
						el.style['margin-left'].replace('px', '') || 0
					) +
					lvl * 30 +
					'px'
			}
*/
			let level = parseInt(
				(
					el.querySelector('h1,h2,h3,h4,h5,h6') || {
						tagName: 'h1',
					}
				).tagName.slice(1)
			)

			el.setAttribute('level', level)

			if (level < 0) level = 0
			setMarge(el, level)

			const titre = el.querySelector(
				'h1, h2, h3, h4, h5, h6, h7, h8, h9'
			)
			if (titre !== null) {
				if (level > 0.5) setMarge(titre, -0.5)
				else setMarge(titre, -level)
			}

			/*Array.from(el.querySelectorAll('img'))
				.map((img) => img.parentNode.parentNode)
				.concat(Array.from(el.querySelectorAll('table')))
				.forEach((img) => {
					if (level > 2) setMarge(img, -2)
					else setMarge(img, -level)
				})*/
		})

		Array.from(
			document.querySelectorAll('img:not(.smiley)')
		).forEach((img) => {
			img.parentNode.ondblclick = imgDblClick
			img.parentNode.style['marginTop'] = '0px'
		})

		Array.from(document.querySelectorAll('p')).forEach(
			(p) =>
				(p.innerHTML = p.innerHTML.split('\n').join('<br>'))
		)

		Array.from(document.querySelectorAll('figure')).forEach(
			(el) => {
				el.style.display = 'table'

				const titre = el.querySelector('figcaption')

				titre.innerHTML = titre.innerHTML
					.split('\\n')
					.join('<br>')

				const img = el.querySelector('img')

				if (titre) el.insertBefore(titre, img)

				if (img.getAttribute('width') !== '') {
					el.style.width = `calc(${img.getAttribute(
						'width'
					)} - 1em)`
					img.setAttribute('width', '')
				}

				/*const emWidth = parseFloat(
					getComputedStyle(el.parentNode).fontSize
				)
				const figWidth = parseFloat(
					getComputedStyle(el).width
				)
				const figParentWidth = parseFloat(
					getComputedStyle(el.parentNode).width
				)
				console.log(
					Math.round(figWidth) ===
						Math.round(figParentWidth) ||
						Math.round(figWidth + emWidth) ===
							Math.round(figParentWidth),
					Math.round(figWidth),
					Math.round(figWidth + emWidth),
					Math.round(figParentWidth),
					el
				)
				if (
					Math.round(figWidth) ===
						Math.round(figParentWidth) ||
					Math.round(figWidth + emWidth) ===
						Math.round(figParentWidth)
				) {
					el.style['marginRight'] = '0'
				} else {
					el.style['marginRight'] = '1em'
				}*/
			}
		)

		Array.from(
			document.querySelectorAll('.smiley')
		).forEach((img) => {
			img.src =
				'images/' + img.src.split('/').slice(-3).join('/')
		})

		Array.from(
			document.querySelectorAll(
				'.main .content-container .article-content img:not(.smiley), .main .content-container .message-content img:not(.smiley)'
			)
		).forEach((img) => {
			img.parentNode.style.display = 'table'
			img.parentNode.style.float = 'left'

			if (img.getAttribute('width') !== '') {
				img.parentNode.style.width = `calc(${img.getAttribute(
					'width'
				)} - 1em)`
				img.setAttribute('width', '')
			}
		})

		removeFirstInlinedTitleMargin()
	},
	scrollTo: function (previousScrolling) {
		console.log(`scrollTo(0, ${previousScrolling})`)
		window.scrollTo(0, previousScrolling)
	},
	reloadImages: function () {
		d = new Date()
		const s =
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

		Array.from(
			document.querySelectorAll('img:not(.smiley)')
		).forEach((e) => {
			window.URL.revokeObjectURL(e.src)

			let img = document.createElement('img')
			img.src = e.src + '?t=' + d.getTime()

			//TODO : check if still needed ? maybe should be removed
			if (e.classList.contains('alted'))
				img.classList.add('alted')
			/*************/

			img.style = e.style
			img.width = e.width
			img.ondblclick = imgDblClick
			e.src = s //trick to clean cache
			e.parentNode.insertBefore(img, e)
			e.parentNode.removeChild(e)
			setTimeout(() => {
				e = null
			}, 1000) //trick to clean cache
		})

		mde.releaseStack([])
	},
}
