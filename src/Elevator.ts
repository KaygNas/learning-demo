import { fromEvent, interval, take } from 'rxjs'
import { map, switchMap, concatWith, filter } from 'rxjs/operators'
export type Direction = 'up' | 'down'
export type ElevatorStatus = {
	floor: number
	direction: Direction
	idle: boolean
}
export type Floor = {
	floor: number
	up: boolean
	down: boolean
}
export type Event = {
	floors: Floor[]
	targetFloor: number
	elevatorStatus: ElevatorStatus
	direction: Direction
}

export const getFloor = (floors: Floor[], floor: number) => floors[floors.length - floor]
export const getMaxFloor = (floors: Floor[], direction: Direction) => {
	return floors.find((f) => f[direction])
}

const getElevatorCalls = (
	floors: Floor[],
	elevatorStatus: ElevatorStatus,
	direction: Direction,
) => {
	const FIRST_FLOOR = 1
	const baseFloor = elevatorStatus.floor
	const maxFloor = getMaxFloor(floors, direction)!.floor

	if (direction === 'up') {
		const upCalls = floors.filter((f) => f.up).map((f) => f.floor)
		const downCalls = [maxFloor]
		return upCalls.concat(downCalls)
	} else {
		const upCalls = [baseFloor]
		const downCalls = floors
			.filter((f) => f.down)
			.map((f) => f.floor)
			.concat([FIRST_FLOOR])
		return upCalls.concat(downCalls)
	}
}
const spiltCallsToPair = (floors: number[]) => {
	const callPairs: [number, number][] = []
	floors.forEach((floor, i) => {
		if (i >= floors.length - 1) return
		const nextFloor = floors[i + 1]
		callPairs.push([floor, nextFloor])
	})
	return callPairs
}

const commandElevator = ([floorFrom, floorTo]: [number, number]) => {
	if (floorTo > floorFrom) {
		// 把点击事件映射 n 次的事件流（模拟电梯上行一层楼），间隔 1s,
		return interval(1000).pipe(
			map<number, ElevatorStatus>((x) => {
				const newFloor = x + floorFrom
				return {
					floor: newFloor,
					direction: 'up',
					idle: newFloor === floorTo,
				}
			}),
			take(floorTo + 1 - floorFrom),
		)
	} else {
		// 和另外一个 n 次的事件流（模拟电梯抵达楼层后下行），间隔 1s,
		return interval(1000).pipe(
			map<number, ElevatorStatus>((x) => {
				const newFloor = floorFrom - x
				return {
					floor: newFloor,
					direction: 'down',
					idle: newFloor === floorTo,
				}
			}),
			take(floorFrom + 1 - floorTo),
		)
	}
}

export function Elevator(emitter: any, type: string) {
	return fromEvent(emitter, 'click').pipe(
		// 过滤掉以下情况的事件，保证电梯能够执行一次完整的上下行：
		filter((e) => {
			const { floors, targetFloor, elevatorStatus, direction } = e as Event
			// 1. 电梯正在下行，上层有新的召唤
			if (elevatorStatus.direction === 'down' && targetFloor > elevatorStatus.floor) return false
			return true
		}),

		// 把点击事件映射电梯的事件流
		switchMap((e) => {
			const { floors, direction, elevatorStatus } = e as Event

			// 收集此刻的上行电梯召唤和下行电梯召唤
			const elevatorCalls = getElevatorCalls(floors, elevatorStatus, direction)
			// 将每个召唤分别映射为一段事件流，以表示从x楼到y楼，再从y楼到z楼
			const run = spiltCallsToPair(elevatorCalls)
				.map((fromTo) => commandElevator(fromTo))
				// 将所有事件流拼接起来
				.reduce((pre, cur) => pre.pipe(concatWith(cur)))
			return run
		}),
	)
}
