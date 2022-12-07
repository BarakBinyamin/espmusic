const net = require("net")
const fs  = require("fs")

const PATH         = 'example.wav'
const HOST         = '0.0.0.0'
const PORT         = 8000
const PACKET_SIZE  = 800
let   packet_number= 0

function getpacket(packetNum){
    const file_descriptor     = fs.openSync(PATH, 'r', null)
    const read_offset         = packetNum * PACKET_SIZE
    const buffer              = Buffer.alloc(PACKET_SIZE)
    const buffer_write_offset = 0
    const num_bytes_to_read   = PACKET_SIZE
    const num_bytes_read      = fs.readSync(file_descriptor, buffer, buffer_write_offset, num_bytes_to_read, read_offset)
    fs.closeSync(file_descriptor)
    return { buff: buffer, num_read: num_bytes_read}
}

async function createTCPserver(){
    let server = net.createServer( async socket => {
        let data = getpacket(packet_number)
        let addi = await new Promise (resolve=>socket.on("data",(data)=>{resolve(socket.remoteAddress)}))
        socket.write(data.buff)
        socket.destroy()
        process.stdout.write(`\rSent to ${addi} : ${packet_number}`)
        packet_number++
    })
    server.listen(PORT, HOST)
    process.on('SIGINT', () => { server.close(() => {console.log("\n\nClosing server...")})}) 
    await new Promise((resolve)=>server.on("close", resolve))
}

console.log(`Starting tcp server at port ${PORT}`)
createTCPserver()