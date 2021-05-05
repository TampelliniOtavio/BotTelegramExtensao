//conectando ao mongoDB com variaveis de ambiente
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');

const userDB = process.env.MONGODB_USER;
const senhaDB = process.env.MONGODB_PASSWORD;
const clusterDB = process.env.MONGODB_CLUSTER;
const databaseDB = process.env.MONGODB_DATABASE;

mongoose.connect(`mongodb+srv://${userDB}:${senhaDB}@${clusterDB}/${databaseDB}?retryWrites=true&w=majority`, {useNewUrlParser: true,useUnifiedTopology: true});

const messages = mongoose.connection;
messages.on('error', console.error.bind(console, 'Conexão NOT OK: '));
messages.once('open', ()=>console.log("Conexão OK"));

// importando funções necessárias do arquivo functions
const { 
    findItemOnDatabaseArray, 
    get, 
    arrayStringToInlineString, 
    clamp, 
    makeKeyboard
} = require('./utils/functions');

// constrtuindo o bot
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);

// biblioteca para a criação do teclado -> https://github.com/RealPeha/telegram-keyboard
const { Key } = require('telegram-keyboard');
// biblioteca para a sessão local -> https://realspeaker.github.io/telegraf-session-local/index.html
const LocalSession = require('telegraf-session-local');

// criando a sessão local
const session = 'data';
const localSession = new LocalSession({
    database:'sessions.json',
    property:'sessions',
    storage: LocalSession.storageFileAsync,
    format: {
        serialize: (obj)=> JSON.stringify(obj,null,2),
        deserialize: (str)=>JSON.parse(str)
    }
});
bot.use(localSession.middleware(session));

// pegar toda a base do mongoDB e depois fazer as operações com o bot
get.then(base=>{
    //após o retorno da base de dados


    // strings de entrada, ajuda, configurações e desculpas
    const startMessage = 'Bem vindo!\n\nEsse bot foi desenvolvido para turmas de pré-programação tirarem suas dúvidas';
    let actualMessage = startMessage;

    const helpMessage = 'Precisa de ajuda?\n\nTemos duas opções: \n\nFaça uma pergunta diretamente;\nDigite /start.';
    
    const settingsMessage = 'Ainda não tenho configurações para ajustar.';
    
    const sorryMessage = 'Desculpe, ainda não sei nada sobre isso.';

    let vetor = [];
    base.map(linha=>{
        vetor = [...vetor,Key.callback(linha.key,linha.key)];
    });
    //criando o teclado
    const itemsPerPage = 4;
    const maxPage = vetor.length/itemsPerPage;
    let keyboard = makeKeyboard(vetor,itemsPerPage);

    // comandos /start, /help e /settings
    bot.start(async ctx =>{
        ctx[session].counter = 0;
        actualMessage = startMessage + "\n\nEscolha uma das opções abaixo para receber uma explicação sobre o assunto";
        await ctx.replyWithMarkdown(actualMessage,keyboard.construct(ctx[session].counter).inline()).catch((err)=>console.log("Erro no /start\nErro: "+err));
    });

    bot.help(async ctx => await ctx.replyWithMarkdown(helpMessage),{reply_markup:{remove_keyboard:true}});
    bot.settings(async ctx => await ctx.replyWithMarkdown(settingsMessage),{reply_markup:{remove_keyboard:true}});
    
    // quando enviar sticker
    bot.on("sticker",async ctx =>{
        await ctx.reply("Queria saber usar sticker 😭😭😭😭😭😭");
    });

    // quando clica num botão inline
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data;
        let retornoArray = findItemOnDatabaseArray(ctx.callbackQuery.data,base);
        if (data === 'right'){
            ctx[session].counter = clamp(ctx[session].counter + 1, 0, maxPage);
        }else if (data === 'left'){
            ctx[session].counter = clamp(ctx[session].counter - 1, 0, maxPage);
        }else if(retornoArray.length > 0){
            actualMessage = arrayStringToInlineString(retornoArray);  
            ctx[session].counter = 0;
        }else{
        }
        const OptionalParams = {
            parse_mode: 'Markdown',
            reply_markup: keyboard.construct(ctx[session].counter).inline().reply_markup
        };
        await ctx.answerCbQuery();
        await ctx.editMessageText(actualMessage, OptionalParams).catch(() => console.log("deu erro atualizando o texto"));
      });
    
    // quando enviam um texto no chat
    bot.on('text', (ctx) => {
        let retornoArray = findItemOnDatabaseArray(ctx.message.text,base);
        if (retornoArray.length > 0){
            const allRetorno = arrayStringToInlineString(retornoArray);
            ctx.replyWithMarkdown(allRetorno,{reply_markup:{remove_keyboard:true}});
        }else{
            ctx.replyWithMarkdown (sorryMessage,{reply_markup:{remove_keyboard:true}});
        }
        
    });

    bot.launch();
    
    /*se nosso SO tentar interromper a execução do NodeJS,
    4 avisamos os servidores do telegram*/
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
});