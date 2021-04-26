const dotenv = require("dotenv");
dotenv.config();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);

const base = [
    {
        key:'if',
        value:'if é uma *estrutura de seleção* presente em muitas linguagens de programação. \n\nVeja um exemplo em Java: \n\nif (condicao){\n //código a ser executado se a condição for verdadeira\n}'
    },
    {
        key:'while',
        value:'while é uma *palavra reservada* e *estrutura de repetição* em muitas linguagens de programação. \n\nVeja um exemplo em Java: \n\nwhile (condicao) {\n//código a ser repetido enquanto acondição for verdadeira\n}'
    },
    {
        key:'seleção',
        value:'Estruturas de seleção permitem que o programador especifique trechos de código que devem ser *executados somente quando determinadas condições* - também especificadas por ele - forem avaliadas como *verdadeiras*.'
    },
    {
        key:'repetição',
        value:'Estruturas de repetição podem ser utilizadas para *automatizar a repetição de código*. A ideia é permitir que o programador *escreva uma única vez* um bloco de código que deseja executar repetidamente ao invés de ter de copiar e colocar o bloco de código diversas vezes.'
    }
]
const avaliableHelp = base.map(key =>{
    return "*"+ key.key +"* "
})
const startMessage = 'Bem vindo!';
const helpMessage = 'Sou fácil de usar. Basta perguntar!\n\n*Perguntas disponíveis*: \n\n'+avaliableHelp;

const settingsMessage = 'Ainda não tenho configurações para ajustar.';

const sorryMessage = 'Desculpe, ainda não sei nada sobre isso.'

bot.start(ctx => ctx.reply(startMessage));
bot.help(ctx => ctx.replyWithMarkdown(helpMessage));
bot.settings(ctx => ctx.reply(settingsMessage));


bot.on('text', (ctx) => {
    console.log(ctx)
    try{
        const resp = base.find (item =>
    
        ctx.message.text.toLowerCase().includes(item.key));
    
        ctx.replyWithMarkdown(resp.value);
    }
    catch (err){
        console.log (err)
        ctx.reply(sorryMessage)
    }
})


bot.launch();

/*se nosso SO tentar interromper a execução do NodeJS,
4 avisamos os servidores do telegram*/
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
