console.log('Unparking inside base at:', bot.entity.position)
const time = lib.time()
console.log('Time info:', time)

bot.chat('alpha: Good morning! Dawn is here. Fuel is ready in the chest, furnaces at (295, 72, -55) and (295, 72, -54) are ready!')

// Check door
const doorBlock = bot.blockAt(new Vec3(294, 72, -54))
console.log('Door at (294, 72, -54):', doorBlock ? doorBlock.name : 'null')

// Check if Alpha is nearby
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
} else {
  console.log('Alpha is returning from shelter')
}

// Check chest
const chest = await lib.chestContents()
console.log('Base chest contents:', JSON.stringify(chest, null, 2))

// Ensure Beta is wearing iron_leggings and holding weapon
await lib.equipArmor()
await lib.equipWeapon()

console.log('Beta inventory:', JSON.stringify(lib.inv()))
console.log('Beta gear:', JSON.stringify(lib.tools()))
return { time, chest, inv: lib.inv(), alpha: alpha ? alpha.position : null }
