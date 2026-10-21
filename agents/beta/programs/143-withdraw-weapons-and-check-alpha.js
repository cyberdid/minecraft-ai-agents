await lib.withdraw({ stone_sword: 1, stone_axe: 1 })
await lib.equipWeapon()

console.log('Equipped weapon:', lib.tools())
console.log('Beta inventory:', JSON.stringify(lib.inv()))

// Find Alpha
const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log(`Alpha is at: (${alpha.position.x.toFixed(1)}, ${alpha.position.y.toFixed(1)}, ${alpha.position.z.toFixed(1)}) dist: ${bot.entity.position.distanceTo(alpha.position).toFixed(1)}`)
} else {
  console.log('Alpha not nearby')
}

bot.chat('beta: Weapons equipped and spawn set! I have 2 stone pickaxes and 64 cobblestone. How much iron do we need?')
return lib.inv()
