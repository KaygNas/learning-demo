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
}

export const getFloor = (floors: Floor[], floor: number) => floors[floors.length - floor]
export const getMaxFloor = (floors: Floor[], direction: Direction) => {
	return floors.find((f) => f[direction])
}

const getElevatorCalls = (floors: Floor[], elevatorStatus: ElevatorStatus) => {
	const FIRST_FLOOR = 1
	const baseFloor = elevatorStatus.floor

	// 上行召唤时，由于由从下向上行，所以需要将召唤按低到高排序
	const _floors = (JSON.parse(JSON.stringify(floors)) as Floor[])
		// sort 方法会 mutate 数组，所以要拷贝一份
		.sort((a, b) => a.floor - b.floor)
	const upCalls = _floors
		.filter((f) => f.up && !(elevatorStatus.direction === 'up' && f.floor < elevatorStatus.floor))
		.map((f) => f.floor)

	const downCalls = floors
		.filter(
			(f) => f.down && !(elevatorStatus.direction === 'down' && f.floor > elevatorStatus.floor),
		)
		.map((f) => f.floor)
	// 起点设为电梯的当前楼层，终点设为一层
	return [baseFloor, ...upCalls, ...downCalls, FIRST_FLOOR]
}

/**
 * 把相邻的召唤划为一组，如输入 [1, 2, 3] 将输出 [[1, 2], [2, 3]]
 * 用于后续将 [1, 2] 转换为从 F1 到 F2 的事件流
 * @param floors
 * @returns
 */
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
	const direction: Direction = floorTo > floorFrom ? 'up' : 'down'
	const sign = direction === 'up' ? +1 : -1
	const distance: number = Math.abs(floorFrom - floorTo)

	return interval(1000).pipe(
		map<number, ElevatorStatus>((x) => {
			const newFloor = floorFrom + x * sign
			return {
				floor: newFloor,
				direction: direction,
				idle: newFloor === floorTo,
			}
		}),
		take(distance + 1),
	)
}

export function Elevator(emitter: any, type: string) {
	return fromEvent(emitter, type).pipe(
		// 过滤掉以下情况的事件，保证电梯能够执行一次完整的上下行：
		filter((e) => {
			const { floors, elevatorStatus, targetFloor } = e as Event
			// 1. 电梯正在上行，下层的召唤
			if (elevatorStatus.direction === 'up' && targetFloor < elevatorStatus.floor) return false
			// 2. 电梯正在下行，上层的召唤
			if (elevatorStatus.direction === 'down' && targetFloor > elevatorStatus.floor) return false
			return true
		}),
		// 把点击事件映射电梯的事件流
		switchMap((e) => {
			const { floors, elevatorStatus } = e as Event
			// 收集此刻的上行电梯召唤和下行电梯召唤
			const elevatorCalls = getElevatorCalls(floors, elevatorStatus)
			// 将每个召唤分别映射为一段事件流，以表示从x楼到y楼，再从y楼到z楼
			const run = spiltCallsToPair(elevatorCalls)
				.map((fromTo) => commandElevator(fromTo))
				// 将所有事件流拼接起来
				.reduce((pre, cur) => pre.pipe(concatWith(cur)))
			return run
		}),
	)
}
