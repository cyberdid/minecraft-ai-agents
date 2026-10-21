// Withdraw water_bucket from base chest
console.log('Withdrawing water_bucket from base chest...')
await lib.withdraw({ water_bucket: 1 })
console.log('Water bucket in inventory:', lib.count('water_bucket'))
console.log('Obsidian in inventory:', lib.count('obsidian'))
bot.chat('beta: got water_bucket from chest! heading down safe staircase to mine 2 more obsidian')
return { waterBucket: lib.count('water_bucket'), obsidian: lib.count('obsidian') }
