import { Degree } from './Unit'
type Cord = [number, number]
export interface ElementInfo {
	top: number
	left: number
	width: number
	height: number
	color?: string
}
export class Element {
	top: number
	left: number
	width: number
	height: number
	color: string
	rotateDegree: Degree
	get right() {
		return this.left + this.width
	}
	get bottom() {
		return this.top + this.height
	}

	get rotateCenterPoint(): Cord {
		return [this.left + this.width / 2, this.top + this.height / 2]
	}

	constructor(info: ElementInfo) {
		this.top = info.top
		this.left = info.left
		this.width = info.width
		this.height = info.height
		this.color = info.color || '#000'
		this.rotateDegree = new Degree(0)
	}

	rotate(degree: Degree): this {
		this.rotateDegree = this.rotateDegree.clac((v) => v + degree.value)
		return this
	}

	translate(x: number, y: number): this {
		this.left += x
		this.top += y
		return this
	}

	render(ctx: CanvasRenderingContext2D): this {
		ctx.translate(...this.rotateCenterPoint)
		ctx.rotate(this.rotateDegree.toAngle().value)
		ctx.translate(...(this.rotateCenterPoint.map((v) => v * -1) as Cord))

		ctx.fillStyle = this.color
		ctx.fillRect(this.left, this.top, this.width, this.height)
		ctx.setTransform(1, 0, 0, 1, 0, 0)
		return this
	}
}
