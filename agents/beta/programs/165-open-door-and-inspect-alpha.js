console.log('Opening door for Alpha at (294, 72, -54)...')
try {
  await lib.door(294, 72, -54, true)
} catch (e) {
  console.log('Door open note:', e.message)
}

bot.chat('alpha: Door is open, come inside the base safe!')

const alpha = Object.values(bot.entities).find(e => e.username === 'alpha')
if (alpha) {
  console.log('Alpha entity:', {
    pos: alpha.position,
    held: alpha.heldItem?.name,
    equipment: alpha.equipment?.map(eq => eq ? eq.name : 'null')
  })
}

// Check time
console.log('Time info:', lib.time())
