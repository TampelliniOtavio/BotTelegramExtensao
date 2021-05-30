//conectando ao mongoDB com variaveis de ambiente
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const userDB = process.env.MONGODB_USER;
const senhaDB = process.env.MONGODB_PASSWORD;
const clusterDB = process.env.MONGODB_CLUSTER;
const databaseDB = process.env.MONGODB_DATABASE;

mongoose.connect(
    `mongodb+srv://${userDB}:${senhaDB}@${clusterDB}/${databaseDB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
);

const messages = mongoose.connection;
messages.on("error", console.error.bind(console, "Conexão NOT OK: "));
messages.once("open", () => console.log("Conexão OK"));

// importando funções necessárias do arquivo functions
const {
    findItemOnDatabaseArray,
    get,
    arrayStringToInlineString,
    clamp,
    makeKeyboard,
    returnJsonObjectOnItem,
    maxPage,
} = require("./utils/functions");

// constrtuindo o bot
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TOKEN);

// biblioteca para a criação do teclado -> https://github.com/RealPeha/telegram-keyboard
const { Key } = require("telegram-keyboard");
// biblioteca para a sessão local -> https://realspeaker.github.io/telegraf-session-local/index.html
const LocalSession = require("telegraf-session-local");

// criando a sessão local
const session = "data";
const localSession = new LocalSession({
    database: "sessions.json",
    property: "sessions",
    storage: LocalSession.storageFileAsync,
    format: {
        serialize: (obj) => JSON.stringify(obj, null, 2),
        deserialize: (str) => JSON.parse(str),
    },
});
bot.use(localSession.middleware(session));

// pegar toda a base do mongoDB e depois fazer as operações com o bot
// strings de entrada, ajuda, configurações e desculpas
const helpMessage =
    "Utilizar esse Bot é bem fácil!\n\nComeçe fazendo uma pergunta diretamente, caso não saiba por onde começar, digite /start!!";
const settingsMessage = "Ainda não tenho configurações para ajustar.";
const sorryMessage = "Desculpe, ainda não sei nada sobre isso.";

//criando o teclado
const itemsPerPage = 4;
let maxP;
let keyboard;

// comando /start
bot.start(async (ctx) => {
    ctx[session].counter = 0;
    const retorno = get({ key: "/start" });
    retorno
    .then((i) => {
        const obj = i[0];
        actualMessage = arrayStringToInlineString(obj.value);
        maxP = maxPage(obj.buttons, itemsPerPage);
        keyboard = makeKeyboard(obj.buttons, itemsPerPage, true);
        const OptionalParams = {
            parse_mode: "Markdown",
            reply_markup: keyboard.construct(ctx[session].counter).inline()
                .reply_markup,
        };
        ctx
            .replyWithMarkdownV2(actualMessage, OptionalParams)
            .catch((err) => console.log("Erro no /start\nErro: " + err));
        })
        .catch((err) =>
            console.log("Erro ao pesquisar na base de dados. \nErro: " + err)
        );
});


// quando clica num botão inline
bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data === "right") {
        ctx[session].counter = clamp(ctx[session].counter + 1, 0, maxP);
        // Adiciona Markdown na mensagem e o teclado abaixo
        const OptionalParams = {
            parse_mode: "Markdown",
            reply_markup: keyboard.construct(ctx[session].counter).inline()
                .reply_markup,
        };
        // Responde a requisição do botão e edita o texto com a mensagem e o teclado
        ctx
            .answerCbQuery()
            .then(
                ctx
                    .editMessageText(actualMessage, OptionalParams)
                    .catch((err) =>
                        console.log("deu erro atualizando o texto\nErro: " + err)
                    )
            )
            .catch((err) =>
                console.log("deu erro respondendo os botões\nErro: " + err)
            );
    } else if (data === "left") {
        ctx[session].counter = clamp(ctx[session].counter - 1, 0, maxP);
        // Adiciona Markdown na mensagem e o teclado abaixo
        const OptionalParams = {
            parse_mode: "Markdown",
            reply_markup: keyboard.construct(ctx[session].counter).inline()
                .reply_markup,
        };
        // Responde a requisição do botão e edita o texto com a mensagem e o teclado
        ctx
            .answerCbQuery()
            .then(
                ctx
                    .editMessageText(actualMessage, OptionalParams)
                    .catch((err) =>
                        console.log("deu erro atualizando o texto\nErro: " + err)
                    )
            )
            .catch((err) =>
                console.log("deu erro respondendo os botões\nErro: " + err)
            );
    } else if(data === "Enviar Tabela Verdade"){
        ctx
                .answerCbQuery()
                .then(
                    ctx
                        .replyWithPhoto({source: './img/tabela_verdade.png'})
                        .catch((err) =>
                            console.log("deu erro enviando a tabela verdade\nErro: " + err)
                        )
                )
                .catch((err) =>
                    console.log("deu erro respondendo os botões\nErro: " + err)
                );
    }else if(data === "Enviar Simbologia"){
        ctx
                .answerCbQuery()
                .then(
                    ctx
                        .replyWithPhoto({source: './img/simbologia.jpg'})
                        .catch((err) =>
                            console.log("deu erro enviando a simbologia\nErro: " + err)
                        )
                )
                .catch((err) =>
                    console.log("deu erro respondendo os botões\nErro: " + err)
                );
    }else {
        // pega o objeto baseado no callbackQuery
        const retorno = get({ key: data });
        retorno.then((i) => {
            const obj = i[0];
            // Constrói a mensagem e os botões do objeto
            try {
                actualMessage = arrayStringToInlineString(obj.value);
                keyboard = makeKeyboard(obj.buttons, itemsPerPage, data === "/start",obj.previous);
                maxP = maxPage(obj.buttons, itemsPerPage);
                ctx[session].counter = 0;
            } catch {
                keyboard = makeKeyboard([], itemsPerPage);
                actualMessage =
                    "Desculpe, mas esse botão não existe uma funcionalidade ainda.";
                ctx[session].counter = 0;
            }
            // Adiciona Markdown na mensagem e o teclado abaixo
            const OptionalParams = {
                parse_mode: "Markdown",
                reply_markup: keyboard.construct(ctx[session].counter).inline()
                    .reply_markup,
            };
            // Responde a requisição do botão e edita o texto com a mensagem e o teclado
            ctx
                .answerCbQuery()
                .then(
                    ctx
                        .editMessageText(actualMessage, OptionalParams)
                        .catch((err) =>
                            console.log("deu erro atualizando o texto\nErro: " + err)
                        )
                )
                .catch((err) =>
                    console.log("deu erro respondendo os botões\nErro: " + err)
                );
        });
    }
});

// comando /help
bot.help(
    async (ctx) =>
        await ctx
            .replyWithMarkdown(helpMessage)
            .catch((err) => console.log("Erro no /help\nErro: " + err))
);

//comando /settings
bot.settings(
    async (ctx) =>
        await ctx
            .replyWithMarkdown(settingsMessage)
            .catch((err) => console.log("Erro no /settings\nErro: " + err))
);

// quando enviam um texto no chat
bot.on("text", async (ctx) => {
    // Pesquisa a mensagem no banco
    let retornoArray = findItemOnDatabaseArray(ctx.message.text, await get());
    if (retornoArray.length > 0) {
        // Concatena a mensagem a partir do array
        const allRetorno = arrayStringToInlineString(retornoArray);
        await ctx
            .replyWithMarkdown(allRetorno)
            .catch((err) => console.log("Erro retornando a resposta\nErro: " + err));
    } else {
        await ctx
            .replyWithMarkdown(sorryMessage)
            .catch((err) =>
                console.log("Erro na mensagem de desculpas\nErro: " + err)
            );
    }
});

// quando enviar sticker
bot.on("sticker", async (ctx) => {
    await ctx
        .reply("c:")
        .catch((err) => console.log("Erro na mensagem de sticker\nErro: " + err));
});

bot.launch();

/*se nosso SO tentar interromper a execução do NodeJS,
  4 avisamos os servidores do telegram*/
process.once("SIGINT", () => {
    console.log("Desligando...");
    bot.stop("SIGINT");
    mongoose.disconnect();
});
process.once("SIGTERM", () => {
    console.log("Desligando...");
    bot.stop("SIGTERM");
    mongoose.disconnect();
});