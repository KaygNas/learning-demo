<template>
	<div>
		<template v-for="(f, i) in floors">
			<div>
				<span
					class="floor-director"
					:class="{ 'floor-director--current': f.floor === elevatorStatus.floor }"
				>
					{{ f.floor }}
				</span>
				<!-- <button @click="callElevator(f.floor, 'up')">↑</button> -->
				<button @click="callElevator(f.floor, 'down')">↓</button>
				<!-- <span v-show="f.up" style="margin-left: 10px; color: red">↑</span> -->
				<span v-show="f.down" style="margin-left: 10px; color: red">↓</span>
			</div>
		</template>
		<div style="height: 1px; width: 100%; background-color: #000; margin: 10px 0"></div>
		<div>
			F{{ elevatorStatus.floor }}-{{ elevatorStatus.direction }}
			{{ elevatorStatus.idle ? '🛑' : '🔄' }}
		</div>
	</div>
</template>
<script lang="ts" setup>
import { EventEmitter } from 'events'
import { reactive, watch } from 'vue'
import {
	Elevator,
	Floor,
	ElevatorStatus,
	Direction,
	Event,
	getFloor,
	getMaxFloor,
} from './Elevator'

const MAX_FLOOR = 10
const floors = reactive<Floor[]>(
	new Array(MAX_FLOOR).fill(0).map((f, i) => ({
		floor: MAX_FLOOR - i,
		up: false,
		down: false,
	})),
)
const elevatorStatus = reactive<ElevatorStatus>({ floor: 1, direction: 'up', idle: true })
const emitter = new EventEmitter()
const callElevator = (floor: number, direction: Direction) => {
	const curFloor = getFloor(floors, floor)
	curFloor.down = true
	const event: Event = {
		floors: floors,
		targetFloor: floor,
		elevatorStatus: elevatorStatus,
		direction,
	}

	console.log('click', event)
	emitter.emit('click', event)
}

const elevator = Elevator(emitter, 'click')
elevator.subscribe((status) => {
	Object.assign(elevatorStatus, status)
	const curFloor = getFloor(floors, status.floor)
	const direction = elevatorStatus.direction

	curFloor[direction] = false
})
watch(
	() => elevatorStatus.floor,
	() => {
		// 电梯抵达一楼后，检查有没有其他楼层正在召唤
		if (elevatorStatus.floor === 1) {
			elevatorStatus.direction = 'up'
			const maxFloor = getMaxFloor(floors, 'down')
			// 没有则休息
			if (!maxFloor) return
			// 有则继续调度电梯
			const event: Event = {
				floors: floors,
				targetFloor: maxFloor.floor,
				elevatorStatus: elevatorStatus,
				direction: 'down',
			}
			emitter.emit('click', event)
		}
	},
)
</script>
<style>
.floor-director {
	display: inline-block;
	margin: 0 10px;
	padding: 0 5px;
	width: 20px;
	text-align: center;
}
.floor-director--current {
	background-color: orange;
}
</style>
