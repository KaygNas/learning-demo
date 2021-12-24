import { Degree } from './Unit'
type Cord = [number, number]
interface Rotation {
	degree: Degree
	centerPoint: Cord
}
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
	rotation: Rotation
	get right() {
		return this.left + this.width
	}
	get bottom() {
		return this.top + this.height
	}

	constructor(info: ElementInfo) {
		this.top = info.top
		this.left = info.left
		this.width = info.width
		this.height = info.height
		this.color = info.color || '#000'
		this.rotation = {
			degree: new Degree(0),
			centerPoint: [0, 0],
		}
	}

	rotate(degree: Degree, centerPoint?: Cord): this {
		this.rotation.degree = this.rotation.degree.clac((v) => v + degree.value)
		if (centerPoint) this.rotation.centerPoint = centerPoint
		return this
	}

	render(ctx: CanvasRenderingContext2D): this {
		ctx.translate(...this.rotation.centerPoint)
		ctx.rotate(this.rotation.degree.toAngle().value)
		ctx.translate(...(this.rotation.centerPoint.map((v) => v * -1) as Cord))

		ctx.fillStyle = this.color
		ctx.fillRect(this.left, this.top, this.width, this.height)
		ctx.setTransform(1, 0, 0, 1, 0, 0)
		return this
	}
}
