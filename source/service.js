
const Message = require('./models/messageSchema')


async function get(){
    let retorno = await Message.find().then(res =>{
        return res
    }).catch(err=>{
        return err
    })
    return retorno
}

module.exports.get =  get()

module.exports.arrayStringToInlineString = array =>{
    let retorno = ''
    array.map(linha => {
        retorno += linha + '\n'
    })
    return retorno
}