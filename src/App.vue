<template>
	<div>
		<template v-for="(f, i) in floors">
			<div>
				{{ f.floor }} <button @click="pressDown(f.floor)">↓</button>
				<span v-show="f.down" style="margin-left: 10px; color: red">↓</span>
			</div>
		</template>
		<div style="height: 1px; width: 100%; background-color: #000; margin: 10px 0"></div>
		<div>F{{ elevatorStatus.floor }}-{{ elevatorStatus.direction }}</div>
	</div>
</template>
<script lang="ts" setup>
import { EventEmitter } from 'events'
import { reactive, watch } from 'vue'
import { Elevator, Floor, ElevatorStatus, Event } from './Elevator'

const MAX_FLOOR = 10
const floors = reactive<Floor[]>(
	new Array(MAX_FLOOR).fill(0).map((f, i) => ({
		floor: MAX_FLOOR - i,
		up: false,
		down: false,
	})),
)
const getFloor = (floor: number) => floors[MAX_FLOOR - floor]
const getMaxFloor = () => {
	for (let floorNum = MAX_FLOOR; floorNum > 0; floorNum--) {
		const floor = getFloor(floorNum)
		if (floor.down) {
			return getFloor(floor.floor)
		}
	}
}
const elevatorStatus = reactive<ElevatorStatus>({ floor: 1, direction: 'stop' })
const emitter = new EventEmitter()
const elevator = Elevator(emitter, 'click')
const pressDown = (floor: number) => {
	const curFloor = getFloor(floor)
	curFloor.down = true
	const event: Event = {
		floors: floors,
		targetFloor: floor,
		elevatorStatus: elevatorStatus,
	}

	emitter.emit('click', event)
	console.log('click', event)
}
elevator.subscribe((status) => {
	Object.assign(elevatorStatus, status)
	const curFloor = getFloor(status.floor)
	const direction = elevatorStatus.direction
	if (direction === 'stop') {
		curFloor.up = false
		curFloor.down = false
	} else {
		curFloor[direction] = false
	}
})
watch(
	() => elevatorStatus.floor,
	() => {
		// 电梯抵达一楼后，检查有没有其他楼层正在召唤
		if (elevatorStatus.floor === 1) {
			const maxFloor = getMaxFloor()
			// 没有则休息
			if (!maxFloor) return
			// 有则继续调度电梯
			const event: Event = {
				floors: floors,
				targetFloor: maxFloor.floor,
				elevatorStatus: elevatorStatus,
			}
			emitter.emit('click', event)
		}
	},
)
</script>
<style></style>
