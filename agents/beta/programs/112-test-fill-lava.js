console.log('Testing lib.fillBucket("lava")...')
const res = await lib.fillBucket('lava')
console.log('Result:', res)
console.log('Lava buckets:', lib.count('lava_bucket'))
return res
