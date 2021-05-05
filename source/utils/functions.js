const Message = require('../models/messageSchema');
const { Keyboard, Key } = require('telegram-keyboard');

async function get(){
    let retorno = await Message.find().then(res =>{
        return res;
    }).catch(err=>{
        return err;
    })
    return retorno;
}

module.exports.get = get();

module.exports.findItemOnDatabaseArray = (item,database) =>{
    let retornoArray = [];
    database.find(row =>{
        if (item.toLowerCase().includes(row.key.toLowerCase())){
            const retorno = this.arrayStringToInlineString(row.value);
            retornoArray = [...retornoArray,retorno];
        }
    });
    return retornoArray;
};

module.exports.arrayStringToInlineString = array =>{
    let retorno = '';
    array.map(linha => {
        retorno += linha + '\n';
    })
    return retorno;
};

module.exports.makeKeyboard = (itemsVector,itemsPerPage = 4,minPage = 0) =>{
        
    return Keyboard.make((page) => {
        const pageItems = itemsVector.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);
        const maxPage =Math.ceil( itemsVector.length / itemsPerPage) -1;

        return Keyboard.combine(
            Keyboard.make(pageItems, { columns: 2 }),
            Keyboard.make([
                Key.callback('<----', 'left', page === minPage),
                Key.callback('---->', 'right', page === maxPage || itemsVector.length < itemsPerPage),
            ])
        );
    });
};
module.exports.clamp = (n, from, to) => Math.max(from, Math.min(to, n));
