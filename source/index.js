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
const { Router, Markup } = Telegraf
const bot = new Telegraf(process.env.TOKEN);

// pegar toda a base do mongoDB e depois fazer as operações com o bot
service.get.then(base=>{
    //após o retorno da base de dados
    const avaliableHelp = base.map(key =>{
        return "*"+ key.key +"* "
    })

    // strings de entrada, ajuda, configurações e desculpas
    const startMessage = 'Bem vindo!';
    const helpMessage = 'Sou fácil de usar. Basta perguntar!\n\n*Perguntas disponíveis*: \n\n'+avaliableHelp;
    
    const settingsMessage = 'Ainda não tenho configurações para ajustar.';
    
    const sorryMessage = 'Desculpe, ainda não sei nada sobre isso.'
    
    // comandos /start, /help e /settings
    bot.start(ctx => ctx.replyWithMarkdown(startMessage));
    bot.help(ctx => ctx.replyWithMarkdown(helpMessage));
    bot.settings(ctx => ctx.replyWithMarkdown(settingsMessage));
    // comando personalizado /teste
    // bot.command("teste",ctx => ctx.editMessageReplyMarkup(inlineMessageRatingKeyboard))
    // //quando o  comando acima funciona
    // .then(text => console.log("ELE FUNCIONA ALSKDJHFGHASLJKDDFBASJDHFDGASDJDHFAS"))
    // //quando tem algum erro no comando
    // .catch(err=>console.log("Não funcionou \nerro: "+err))

    
    
    bot.on("sticker",ctx =>{
        ctx.reply("Queria saber usar sticker 😭😭😭😭😭😭")
    })
    bot.on('text', (ctx) => {
        try{
            let retornoArray = []
            base.find (item =>{
                if (ctx.message.text.toLowerCase().includes(item.key.toLowerCase())){
                    let retorno = service.arrayStringToInlineString(item.value);
                    retornoArray = [...retornoArray,retorno]
                }
            });
            let allRetorno = ''
            if (retornoArray.length > 0){
                allRetorno = service.arrayStringToInlineString(retornoArray);
                ctx.replyWithMarkdown(allRetorno)
            }else{
                ctx.replyWithMarkdown (sorryMessage)
            }
        }
        catch (err){
            console.log (err)
            ctx.replyWithMarkdown (sorryMessage)
        }
    })
    
    
    bot.launch();
    
    /*se nosso SO tentar interromper a execução do NodeJS,
    4 avisamos os servidores do telegram*/
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
})