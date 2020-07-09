module.exports = () =>
	new Promise(async (resolve, reject) => {
		const mathjax = await require('mathjax')
			.init({
				loader: { load: ['input/asciimath', 'output/svg'] },
			})
			.catch((err) => console.log(err.message))
		/*
		const svg = MathJax.tex2svg('\\frac{1}{x^2-1}', {
			display: true,
		})
		console.log(MathJax.startup.adaptor.outerHTML(svg))
	*/
		resolve((str, opts) => {
			try {
				const svg = MathJax.asciimath2svg(str, {
					display: true,
				})
				return MathJax.startup.adaptor.outerHTML(svg)
			} catch (error) {
				console.error(error)
			}
		})
	})
