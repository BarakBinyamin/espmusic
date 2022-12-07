const net = require("net")
const fs  = require("fs")

const PATH         = 'example.wav'
const HOST         = '0.0.0.0'
const PORT         = 8000
const PACKET_SIZE  = 6400
let   table_size   = 1
let   addr_msg     = ""
let   table        = {
        default: 0,
}

function set_addr_msg(){
    if (Object.values(table).length > table_size){
        table_size++
        addr_msg =  Object.keys(table).slice(1).toString().replace(/,/g,", ")
    }
}

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
        let addi = await new Promise (resolve=>socket.on("data",(data)=>{resolve(socket.remoteAddress)})) // wait for msg to get ip address
        let num  = Math.max(...Object.values(table)); table[`${addi}`]=num+1; set_addr_msg()              // get the max packet in the table to synchronize speakers
        let data = getpacket(num)
        socket.write(data.buff)
        socket.destroy()
        process.stdout.write(`\rSent to ${addr_msg} : ${num}`)
    })
    server.listen(PORT, HOST)
    process.on('SIGINT', () => { server.close(() => {console.log("\n\nClosing server...")})}) 
    await new Promise((resolve)=>server.on("close", resolve))
}

console.log(`Starting tcp server at port ${PORT}`)
createTCPserver()