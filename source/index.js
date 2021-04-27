const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');

const userDB = process.env.MONGODB_USER;
const senhaDB = process.env.MONGODB_PASSWORD;
const clusterDB = process.env.MONGODB_CLUSTER;
const databaseDB = process.env.MONGODB_DATABASE;

mongoose.connect(`mongodb+srv://${userDB}:${senhaDB}@${clusterDB}/${databaseDB}?retryWrites=true&w=majority`, {useNewUrlParser: true,useUnifiedTopology: true});

const messages = mongoose.connection;
messages.on('error', console.error.bind(console, 'Conexão NOT OK: '))
messages.once('open', ()=>{
    console.log("Conexão OK")
    
})

const Message = require('./models/messageSchema')
const service = require('./inserting')
const parse = require('./lib/parseStrings')


const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);

service.get.then(base=>{

    
    
    const avaliableHelp = base.map(key =>{
        return "*"+ key.key +"* "
    })
    const startMessage = 'Bem vindo!';
    const helpMessage = 'Sou fácil de usar. Basta perguntar!\\n\\n*Perguntas disponíveis*: \\n\\n'+avaliableHelp;
    
    const settingsMessage = 'Ainda não tenho configurações para ajustar.';
    
    const sorryMessage = 'Desculpe, ainda não sei nada sobre isso.'
    
    bot.start(ctx => ctx.replyWithMarkdown(startMessage));
    bot.help(ctx => ctx.replyWithMarkdown(helpMessage));
    bot.settings(ctx => ctx.replyWithHTML(settingsMessage));
    
    
    bot.on('text', (ctx) => {
        try{
            
            const resp = base.find (item =>ctx.message.text.toLowerCase().includes(item.key));
            ctx.reply(res.value);
        }
        catch (err){
            console.log (sorryMessage)
            ctx.reply(sorryMessage)
        }
    })
    
    
    bot.launch();
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))
}).catch(err =>{
    console.log(err);
    () => bot.stop('SIGINT');
    () => bot.stop('SIGTERM');

})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
/*se nosso SO tentar interromper a execução do NodeJS,
4 avisamos os servidores do telegram*/
