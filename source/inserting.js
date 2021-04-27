
const Message = require('./models/messageSchema')

 function pass(str) {
    str = str.Replace('%','<')
    str = str.Replace('&','/')
    return str;
} 

async function get(){
    let retorno = await Message.find().then(res =>{
        return res
    }).catch(err=>{
        return err
    })
    return retorno
}

module.exports.pass = pass
module.exports.get =  get()