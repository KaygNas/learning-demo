<template><canvas ref="canvasRef" width="1000" height="1000" /></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Animation from './modules/Animation'
import { Element } from './modules/Element'
import { Degree, DegreePerSecond } from './modules/Unit'
const canvasRef = ref<HTMLCanvasElement>()
onMounted(() => {
	const ctx = canvasRef.value!.getContext('2d')!
	const rect = new Element({ top: 100, left: 100, width: 50, height: 100, color: 'green' })
	const rotateSpeed = new DegreePerSecond(90)
	const animation = new Animation((time) => {
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, 1000, 1000)
		const degree: Degree = rotateSpeed.map((speed) => new Degree(speed * time.value))
		rect.rotate(degree, [125, 150])
		rect.render(ctx)
	})
	animation.run()
})
</script>
