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
				<button
					:class="{
						calling: f.up,
					}"
					@click="callElevator(f.floor, 'up')"
				>
					↑
				</button>
				<button
					:class="{
						calling: f.down,
					}"
					@click="callElevator(f.floor, 'down')"
				>
					↓
				</button>
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
import { Elevator, Floor, ElevatorStatus, Direction, Event, getFloor } from './Elevator'

const MAX_FLOOR = 24
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
	curFloor[direction] = true
	const event: Event = {
		floors: floors,
		targetFloor: floor,
		elevatorStatus: elevatorStatus,
	}
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
			floors.forEach((floor) => {
				if (floor.up) callElevator(floor.floor, 'up')
				if (floor.down) callElevator(floor.floor, 'down')
			})
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
.calling {
	background-color: orange;
	color: white;
}
</style>
