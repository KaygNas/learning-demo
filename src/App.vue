<template><canvas ref="canvasRef" :width="windowWidth" :height="windowHeight" /></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import Animation from './modules/Animation'
import { Element, ElementInfo } from './modules/Element'
import { Degree, DegreePerSecond } from './modules/Unit'
const canvasRef = ref<HTMLCanvasElement>()
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight
const RECT_SIZE = 50
const rectInfo: ElementInfo = {
	top: (windowHeight - RECT_SIZE) / 2,
	left: (windowWidth - RECT_SIZE) / 2,
	width: RECT_SIZE,
	height: RECT_SIZE,
	color: 'green',
}
onMounted(() => {
	const ctx = canvasRef.value!.getContext('2d')!
	const rect = new Element(rectInfo)
	const rotateSpeed = new DegreePerSecond(540)

	// 周期的速度, 每秒1个周期
	const freqencySpeed = 0.5
	// 1s -> 360°
	const frequncyDregreeSpeed = freqencySpeed * 360
	let degree = 0

	const animation = new Animation((time) => {
    // ? 用时间来计算动画 和 用时刻来计算动画，哪种更好呢？
		ctx.fillStyle = '#fff'
		ctx.fillRect(0, 0, 1000, 1000)

		// degree 是随时间线性增长的角度值
		degree += time.value * frequncyDregreeSpeed
		// 利用 sin 函数，把时间轴视为 x, 得到周期变化的 sin(x) 值
		const x = Math.sin(new Degree(degree).toAngle().value) * 4
		// 同上用 cos 函数变化，得到周期变化的 cos(x) 值
		const y = Math.cos(new Degree(degree).toAngle().value) * 4
		const rotateDegree: Degree = rotateSpeed.map((speed) => new Degree(speed * time.value))
		// 将正方形随时间进行平移，可以形成圆形的移动轨迹
		//? 为什么 Δx=sin(t) Δy=cos(t) 可以形成圆形轨迹，如何从轨迹逆推函数呢？
		rect.translate(x, y).rotate(rotateDegree).render(ctx)
	})
	animation.run()
})
</script>

<style>
canvas,
body {
	display: block;
	margin: 0;
}
</style>
