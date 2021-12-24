import { Second } from './Unit'

type AnimFn = (timeStamp: number) => void
type RenderFn = (time: Second) => void

export default class Animation {
	private animId?: number
	private lastTimeRender?: number
	private renderFn: RenderFn
	constructor(fn: RenderFn) {
		this.renderFn = fn
	}

	run() {
		const wrappedFn: AnimFn = (timeStamp: number) => {
			const _time = this.lastTimeRender ? timeStamp - this.lastTimeRender : 0
			const time = new Second(_time / 1000)
			this.lastTimeRender = timeStamp
			this.renderFn(time)
			this.animId = window.requestAnimationFrame(wrappedFn)
		}

		this.animId = window.requestAnimationFrame(wrappedFn)
	}

	stop() {
		if (this.animId) {
			window.cancelAnimationFrame(this.animId)
			this.animId = undefined
			this.lastTimeRender = undefined
		}
	}
}
