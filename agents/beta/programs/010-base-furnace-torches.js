// 010-base-furnace-torches.js - check chest, coordinate furnace & torches
bot.chat('beta: roof is 100% sealed! Chest is placed at (293, 72, -57). Place your furnace when ready. Do you have coal or logs for charcoal?')

// Check chest contents
try {
  const contents = await lib.chestContents(293, 72, -57)
  console.log('Chest at (293, 72, -57) contents:', JSON.stringify(contents))
} catch (e) {
  console.log('Chest read error:', e.message)
}

// Deposit extra door and table into chest to keep inventory clean
try {
  await lib.deposit({ oak_door: 'all', crafting_table: 'all' }, 293, 72, -57)
  console.log('Deposited spare door/table into chest')
} catch (e) {
  console.log('Deposit error:', e.message)
}

// Check nearby furnace
const furnaces = lib.find('furnace', { maxDistance: 6 })
console.log('Furnaces nearby:', furnaces.map(f => lib.fmt(f.position)).join(', '))

// Check torches
const torches = lib.find('torch', { maxDistance: 6 })
console.log('Torches nearby:', torches.map(t => lib.fmt(t.position)).join(', '))

console.log('Inventory now:', JSON.stringify(lib.inv()))
console.log('Time:', lib.time())
console.log('Hostiles:', lib.hostiles(16))
