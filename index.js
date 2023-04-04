import DHT from 'hyperdht'
import sodium from 'sodium-universal'
import fs from 'fs'

const STEPS = process.argv[2] || 200;

const dht = new DHT()
const uniqueIPs = new Set()
const nodes = new Set()

process.on('SIGINT', close);

for (let i = 0; i < STEPS; i++) {
  const target = randomBytes()
  const q = dht.findNode({ target })

  for await (let { from, closerNodes } of q) {
    log(from)
    closerNodes.forEach(log);
  }


  function log(node) {
    const address = node.host + ":" + node.port
    uniqueIPs.add(node.host)
    nodes.add(address)
    console.log(`Checked: ${i}/${STEPS} topics | unique ips= ${uniqueIPs.size} / nodes=${nodes.size} | ${address} `)
  }
}

close()

function close() {
  console.log("\n================================================")
  console.log("check data/unique-ips.txt and data/all-nodes.txt")
  console.log("================================================")
  console.log("Discovered", nodes.size, "nodes `cat ./data/all-nodes.txt`")
  console.log("Unique IPs: ", uniqueIPs.size, " `cat ./data/unique-ips.txt`")
  fs.writeFileSync('./data/unique-ips.txt', [...uniqueIPs.values()].join('\n'))
  fs.writeFileSync('./data/all-nodes.txt', [...nodes.values()].sort().join('\n'))

  dht.destroy()
  process.exit(0)
}

function randomBytes(n = 32) {
  const buf = Buffer.allocUnsafe(n)
  sodium.randombytes_buf(buf)
  return buf
}

