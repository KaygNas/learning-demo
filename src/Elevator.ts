import { fromEvent, interval, take } from 'rxjs'
import { map, switchMap, concatWith, filter } from 'rxjs/operators'

export type ElevatorStatus = {
	floor: number
	direction: 'up' | 'stop' | 'down'
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
export const getMaxFloor = (floors: Floor[]) => {
	for (let floorNum = floors.length; floorNum > 0; floorNum--) {
		const floor = getFloor(floors, floorNum)
		if (floor.down) {
			return floor
		}
	}
}

export function Elevator(emitter: any, type: string) {
	return fromEvent(emitter, 'click').pipe(
		// 过滤掉以下情况的事件，保证电梯能够执行一次完整的上下行：
		filter((e) => {
			const { floors, targetFloor, elevatorStatus } = e as Event
			// 1. 电梯正在下行，忽略新的召唤电梯
			if (elevatorStatus.direction === 'down') return false
			// 2. 电梯正在上行且召唤电梯的楼层在下面，忽略新的召唤
			if (elevatorStatus.direction === 'up' && targetFloor <= elevatorStatus.floor) return false
			return true
		}),
		// 把点击事件映射电梯的事件流
		switchMap((e) => {
			const { floors, elevatorStatus } = e as Event
			const targetFloor = getMaxFloor(floors)?.floor || 1
			const curFloorAtMomemt = elevatorStatus.floor

			// 把点击事件映射 n 次的事件流（模拟电梯上行一层楼），间隔 1s,
			const up = interval(1000).pipe(
				map<number, ElevatorStatus>((x) => {
					const newFloor = x + curFloorAtMomemt
					return {
						floor: newFloor,
						direction: newFloor === targetFloor ? 'stop' : 'up',
					}
				}),
				take(targetFloor + 1 - curFloorAtMomemt),
			)
			// 和另外一个 n 次的事件流（模拟电梯抵达楼层后下行），间隔 1s,
			const down = interval(1000).pipe(
				map<number, ElevatorStatus>((x) => {
					const newFloor = targetFloor - x
					return {
						floor: newFloor,
						direction: newFloor === 1 ? 'stop' : 'down',
					}
				}),
				take(targetFloor),
			)
			// 将两个事件流合并为一个完整的上行、下行事件流
			return up.pipe(concatWith(down))
		}),
	)
}
