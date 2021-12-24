export abstract class Unit {
	abstract readonly value: number
	abstract readonly unit: string
	abstract create(value: number): any
	clac(fn: (v: number) => number): this {
		return this.create(fn(this.value))
	}
	map<T extends Unit>(fn: (v: number) => T): T {
		return fn(this.value)
	}
}

const SecondType: unique symbol = Symbol()
export class Second extends Unit {
	[SecondType]: void
	readonly value: number
	readonly unit: string
	constructor(value: number) {
		super()
		this.value = value
		this.unit = 's'
	}
	create(value: number) {
		return new Second(value)
	}
}

const AngleType: unique symbol = Symbol()
export class Angle extends Unit {
	[AngleType]: void
	readonly value: number
	readonly unit: string
	constructor(value: number) {
		super()
		this.value = value
		this.unit = 'px'
	}
	create(value: number) {
		return new Angle(value)
	}
}

const DegreeType: unique symbol = Symbol()
export class Degree extends Unit {
	[DegreeType]: void
	readonly value: number
	readonly unit: string
	constructor(value: number) {
		super()
		this.value = value
		this.unit = '°'
	}
	create(value: number) {
		return new Degree(value)
	}
	toAngle() {
		return new Angle(this.value * (Math.PI / 180))
	}
}

const DegreePerSecondType: unique symbol = Symbol()
export class DegreePerSecond extends Unit {
	[DegreePerSecondType]: void
	readonly value: number
	readonly unit: string
	constructor(value: number) {
		super()
		this.value = value
		this.unit = '°/s'
	}
	create(value: number) {
		return new DegreePerSecond(value)
	}
}
