// programs/030-chat-plan-and-check-night.js
bot.chat("beta: Sandstone walls + wood roof at (10, 67, -25) is perfect! I'll craft sandstone for walls, you provide wood roof & door.")

const t = lib.time()
console.log(`TIME: ${t.timeOfDay} (${t.phase}) | canSleep: ${t.canSleep}`)

const ticksUntilDawn = t.timeOfDay < 23460 ? 23460 - t.timeOfDay : 0
const secondsUntilDawn = Math.round(ticksUntilDawn / 20)
console.log(`Dawn in ~${secondsUntilDawn}s (${ticksUntilDawn} ticks)`)

const h = lib.hostiles(16)
console.log(`Hostiles within 16 blocks: ${h.length}`)

return { time: t, secondsUntilDawn }
