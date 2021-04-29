
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

module.exports.findItemOnDatabaseArray = (item,database) =>{
    let retornoArray = []
    database.find(row =>{
        if (item.toLowerCase().includes(row.key.toLowerCase())){
            const retorno = this.arrayStringToInlineString(row.value);
            retornoArray = [...retornoArray,retorno]
        }
    });
    return retornoArray
}

module.exports.arrayStringToInlineString = array =>{
    let retorno = ''
    array.map(linha => {
        retorno += linha + '\n'
    })
    return retorno
}