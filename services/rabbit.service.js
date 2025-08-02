import amqp from "amqplib"

let connection, channel;


async function connect(){
    connection = await amqp.connect(process.env.RABBIT_URL);
    channel = await connection.createChannel();
    console.log("Rabbit MQ Connected Successfully 🎉.")
}

async function subscribeToQueue(queueName,callback){
    if(!channel) await connect();
    await channel.assertQueue(queueName);
    channel.consume(queueName, (message)=>{
        callback(message.content.toString())
        channel.ack(message);
    })

}

async function publishToQueue(queueName, data){
    if (!channel) await connect();
    await channel.assertQueue(queueName);
    channel.sendToQueue(queueName, Buffer.from(data))
}

export {subscribeToQueue, publishToQueue, connect}
