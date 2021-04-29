const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');

const userDB = process.env.MONGODB_USER;
const senhaDB = process.env.MONGODB_PASSWORD;
const clusterDB = process.env.MONGODB_CLUSTER;
const databaseDB = process.env.MONGODB_DATABASE;

//conectando ao mongoDB com variaveis de ambiente
mongoose.connect(`mongodb+srv://${userDB}:${senhaDB}@${clusterDB}/${databaseDB}?retryWrites=true&w=majority`, {useNewUrlParser: true,useUnifiedTopology: true});

const messages = mongoose.connection;
messages.on('error', console.error.bind(console, 'Conexão NOT OK: '))
messages.once('open', ()=>{
    console.log("Conexão OK")
    
})
// importando arquivo para as funções necessárias
const service = require('./service')
// criando o bot
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);

// https://github.com/RealPeha/telegram-keyboard
const { Keyboard, Key } = require('telegram-keyboard');

// pegar toda a base do mongoDB e depois fazer as operações com o bot
service.get.then(base=>{
    //após o retorno da base de dados
    const avaliableHelp = base.map(key =>{
        return " \n*"+ key.key +"*"
    })

    // strings de entrada, ajuda, configurações e desculpas
    const startMessage = 'Bem vindo!\n\nEsse bot foi desenvolvido para turmas de pré-programação tirarem suas dúvidas\n\nDigite /help para ver as perguntas disponíveis';
    const helpMessage = '*Perguntas disponíveis*: \n'+avaliableHelp;
    
    const settingsMessage = 'Ainda não tenho configurações para ajustar.';
    
    const sorryMessage = 'Desculpe, ainda não sei nada sobre isso.'
    
    // comandos /start, /help e /settings
    bot.start(ctx => ctx.replyWithMarkdown(startMessage));
    bot.help(ctx => ctx.replyWithMarkdown(helpMessage),{reply_markup:{remove_keyboard:true}});
    bot.settings(ctx => ctx.replyWithMarkdown(settingsMessage),{reply_markup:{remove_keyboard:true}});
    // comando personalizado /teste
    let vetor = []
    base.map(linha=>{
        vetor = [...vetor,Key.callback(linha.key,linha.key)]
    })
    const teclado = Keyboard.make(vetor,{columns:2}).reply()
    bot.command("teste",ctx => {

        // await ctx.reply('Isso é um teste com o botão no teclado',teclado.reply())
        ctx.reply('Escolha uma das opções',teclado)
    })
    
    //quando o  comando acima funciona
    // .then(text => console.log("ELE FUNCIONA ALSKDJHFGHASLJKDDFBASJDHFDGASDJDHFAS"))
    //quando tem algum erro no comando
    // .catch(err=>console.log("Não funcionou \nerro: "+err)))

    
    bot.on("sticker",ctx =>{
        ctx.reply("Queria saber usar sticker 😭😭😭😭😭😭")
    })
    // bot.on('callback_query', (ctx) => {
    //     console.log(ctx.callbackQuery.data)
    //   })
    bot.on('text', (ctx) => {
        let retornoArray = service.findItemOnDatabaseArray(ctx.message.text,base)
        if (retornoArray.length > 0){
            const allRetorno = service.arrayStringToInlineString(retornoArray);
            ctx.replyWithMarkdown(allRetorno,{reply_markup:{remove_keyboard:true}})
        }else{
            ctx.replyWithMarkdown (sorryMessage,{reply_markup:{remove_keyboard:true}})
        }
        
    })
    
    
    bot.launch();
    
    /*se nosso SO tentar interromper a execução do NodeJS,
    4 avisamos os servidores do telegram*/
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
})