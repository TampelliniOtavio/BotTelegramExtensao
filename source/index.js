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
    makeKeyboard,
    returnJsonObjectOnItem,
    maxPage
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
    const startMessage = 'Bem vindo!\n\nEsse bot foi desenvolvido para turmas de pré-programação tirarem suas dúvidas\n\nEscolha uma das opções abaixo para receber uma explicação sobre o assunto\n';
    let actualMessage;

    const helpMessage = 'Utilizar esse Bot é bem fácil!\n\nComeçe fazendo uma pergunta diretamente, caso não saiba por onde começar, digite /start!!';
    
    const settingsMessage = 'Ainda não tenho configurações para ajustar.';
    
    const sorryMessage = 'Desculpe, ainda não sei nada sobre isso.';

    //criando o teclado
    const itemsPerPage = 4;
    let maxP;
    let keyboard;

    bot.command("teste",async ctx =>{
        const arr = ["Função é um conjunto de instruções, que realiza uma determinada tarefa. É criado da mesma maneira que outro algoritmo qualquer, deve ser identificado e possuir variáveis e operações.","As funções também podem ser utilizadas como variáveis, por retornar valores associados ao seu nome.","Veja um exemplo em java: ","","//O _public_ indica que a função pode ser utilizada por outras classes além da em que a função foi instanciada, para negar o acesso, utilize _private_","","//o _int_ após public indica o tipo (int = inteiro) de retorno, para funções sem retorno, utilizar _void_ ","","_public_ _int_ soma(int num1, int num2) {","int soma = num1 + num2;","return soma;","}",""," Você pode utilizar essa operação como variável, como o exemplo abaixo: ","","int exemplo = 3 + soma(2,4);","","O valor de exemplo será 9, por executar a função soma, que dá o resultado 6 naquele caso e, por fim, somar 3.","Note que a função soma requer dois *parâmetros*."]
        const butt = ["Parâmetros"];
        const str = arrayStringToInlineString(arr);
        ctx[session].counter = 0;

        keyboard = makeKeyboard(butt,itemsPerPage);
        const OptionalParams = {
            parse_mode: 'Markdown',
            reply_markup: keyboard.construct(ctx[session].counter).inline().reply_markup
        };

        await ctx.replyWithMarkdown(str,OptionalParams);
    })

    // comando /start
    bot.start(async ctx =>{
        ctx[session].counter = 0;
        actualMessage = startMessage;
        const obj = returnJsonObjectOnItem("/start",base);
        maxP = maxPage(obj.buttons,itemsPerPage);
        keyboard = makeKeyboard(obj.buttons,itemsPerPage, true);
        const OptionalParams = {
            parse_mode: 'Markdown',
            reply_markup: keyboard.construct(ctx[session].counter).inline().reply_markup
        };
        await ctx.replyWithMarkdownV2(actualMessage,OptionalParams)
                .catch((err)=>console.log("Erro no /start\nErro: "+err));
    });

    // comando /help
    bot.help(async ctx => await ctx.replyWithMarkdown(helpMessage)
                                    .catch((err)=>console.log("Erro no /help\nErro: "+err)));

    //comando /settings
    bot.settings(async ctx => await ctx.replyWithMarkdown(settingsMessage)
                                        .catch((err)=>console.log("Erro no /settings\nErro: "+err)));
    
    // quando enviar sticker
    bot.on("sticker",async ctx =>{
        await ctx.reply("Queria saber usar sticker 😭😭😭😭😭😭")
                .catch((err)=>console.log("Erro na mensagem de sticker\nErro: "+err));
    });

    // quando clica num botão inline
    bot.on('callback_query', async (ctx) => {
        const data = ctx.callbackQuery.data;
        let notError = true;
        if (data === 'right'){
            ctx[session].counter = clamp(ctx[session].counter + 1, 0, maxP);
            
        }else if (data === 'left'){
            ctx[session].counter = clamp(ctx[session].counter - 1, 0, maxP);
            
        }else {
            // pega o objeto baseado no callbackQuery
            const obj = returnJsonObjectOnItem(data,base);
            // Constrói a mensagem e os botões do objeto
            try{
                actualMessage = arrayStringToInlineString(obj.value);
                keyboard = makeKeyboard(obj.buttons,itemsPerPage, data==="/start")
                maxP = maxPage(obj.buttons,itemsPerPage);
                ctx[session].counter = 0;
            }catch{
                const obj = returnJsonObjectOnItem("/start",base);
                maxP = maxPage(obj.buttons,itemsPerPage);
                keyboard = makeKeyboard([],itemsPerPage);
                const OptionalParams = {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard.construct(ctx[session].counter).inline().reply_markup
                };
                notError = false;
                await ctx.answerCbQuery().then(ctx.editMessageText("Desculpe, mas esse botão não existe uma funcionalidade ainda.",OptionalParams))
            }

        }
        // Adiciona Markdown na mensagem e o teclado abaixo 
        if (notError){
            const OptionalParams = {
                parse_mode: 'Markdown',
                reply_markup: keyboard.construct(ctx[session].counter).inline().reply_markup
            };
            // Responde a requisição do botão e edita o texto com a mensagem e o teclado
            await ctx.answerCbQuery()
                    .then(ctx.editMessageText(actualMessage, OptionalParams)
                            .catch((err) => console.log("deu erro atualizando o texto\nErro: "+err)))
                    .catch((err)=>console.log("deu erro respondendo os botões\nErro: "+err));
        }
      });
    
    // quando enviam um texto no chat
    bot.on('text', async (ctx) => {
        // Pesquisa a mensagem no banco
        let retornoArray = findItemOnDatabaseArray(ctx.message.text,base);
        if (retornoArray.length > 0){
            // Concatena a mensagem a partir do array
            const allRetorno = arrayStringToInlineString(retornoArray);
            await ctx.replyWithMarkdown(allRetorno)
                    .catch((err)=>console.log("Erro retornando a resposta\nErro: "+err));
        }else{
            await ctx.replyWithMarkdown(sorryMessage)
                    .catch((err)=>console.log("Erro na mensagem de desculpas\nErro: "+err));
        }
        
    });

    bot.launch();
    
    /*se nosso SO tentar interromper a execução do NodeJS,
    4 avisamos os servidores do telegram*/
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
});