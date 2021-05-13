const Message = require('../models/messageSchema');
const { Keyboard, Key } = require('telegram-keyboard');

async function get(){
    let retorno = await Message.find().then(res =>{
        return res;
    }).catch(err=>{
        return err;
    });
    return retorno;
}
module.exports.get = get();

function arrayStringToInlineString(array){
    let retorno = '';
    array.map(linha => {
        retorno += linha + '\n';
    });
    return retorno;
}
module.exports.arrayStringToInlineString = arrayStringToInlineString;

function returnJsonObjectOnItem(item, database){
    return database.find(line => line.key == item);
}
module.exports.returnJsonObjectOnItem = returnJsonObjectOnItem;

function findItemOnDatabaseArray(item,database){
    let retornoArray = [];
    database.find(row =>{
        if (item.toLowerCase().includes(row.key.toLowerCase())){
            const retorno = arrayStringToInlineString(row.value);
            retornoArray = [...retornoArray,retorno];
        }
    });
    return retornoArray;
}
module.exports.findItemOnDatabaseArray = findItemOnDatabaseArray;

function makeKeyboard(itemsVector,itemsPerPage = 4, isInStart = false){
    let minPage = 0;
    return Keyboard.make((page) => {
        if (itemsVector.length > 0){
            const pageItems = itemsVector.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);
            const maxPage =Math.ceil( itemsVector.length / itemsPerPage) -1;
            let endButtons;

            if(isInStart){
                endButtons = [
                    Key.callback('<----', 'left', page === minPage),
                    Key.callback('---->', 'right', page === maxPage || itemsVector.length < itemsPerPage),
                ]
            }else{
                endButtons = [
                    Key.callback('<----', 'left', page === minPage),
                    Key.callback('Inicio','/start', isInStart),
                    Key.callback('---->', 'right', page === maxPage || itemsVector.length < itemsPerPage),
                ]
            }
            return Keyboard.combine(
                Keyboard.make(pageItems, {columns: 2}),
                Keyboard.make(endButtons,{columns:isInStart?2:3})
            );
        }else{
            return Key.callback('Inicio','/start', isInStart);
        }
    });
}
module.exports.makeKeyboard = makeKeyboard;

function clamp(n, from, to){
    return Math.max(from, Math.min(to, n));
}
module.exports.clamp = clamp;

function maxPage(vector, itemsPerPage){
    return Math.ceil(vector.length/itemsPerPage)-1;
}
module.exports.maxPage = maxPage
