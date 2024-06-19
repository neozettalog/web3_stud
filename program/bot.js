const { isAddress } = require('web3-validator');
const { Transaction } = require('../models');
const sequelize = require('../database/db.js');
const config = require('../configs/config');
const { Bot, session, InlineKeyboard, Context } = require("grammy");
const { getCompleteNative, getCompleteERC20 } = require("./balance");
const { emojiParser } = require('@grammyjs/emoji');
const { Router } = require("@grammyjs/router");
const bot = new Bot("7322853855:AAEl5SL_YTNuoQlwBUEYNbKAXCXiGM7nbt0");
const { addReplyParam, autoQuote } = require("@roziscoding/grammy-autoquote");

const allowList = [5482770289];


const router_withdrawal = new Router((ctx) => ctx.session.step);
bot.use(emojiParser());
// bot.use(autoQuote());
bot.use(session({ initial: () => ({ step: "idle" }) }));
bot.use(router_withdrawal);

const labelDataPairs = [
    ["Show Balance", "show-balance"],
    ["Request Withdrawal", "withdrawal-request"],
];
const buttonRow = labelDataPairs
    .map(([label, data]) => InlineKeyboard.text(label, data));
const keyboard = InlineKeyboard.from([buttonRow]);


bot.command("start", async (ctx) => {
    const user = ctx.from;
    const messageReply = ctx.emoji`
<strong>Hi, ${user?.first_name} ${user?.last_name} !</strong>

<strong>Welcome to Web3 Telegram Bot ${"smiling_face_with_open_hands"}, </strong>
in this bot you can perform : 

1. Show Balance
2. Withdrawal Request

<strong>Press button below to proceed</strong> ${"down_left_arrow"}
`;
    await ctx.reply(messageReply, { parse_mode: "HTML", reply_markup: keyboard });
});

bot.callbackQuery("show-balance", async (ctx) => {
    // ctx.reply(`Got it, I am checking it right away! \n\nGive me a few seconds...`);
    await ctx.replyWithChatAction("typing");
    const native_balance = await getCompleteNative()
    const erc_20_balance = await getCompleteERC20()

    const message_reply = ctx.emoji`
<strong>Here are the remaining balances of the contract : </strong>

${"down_arrow"} ${"down_arrow"} ${"down_arrow"} ${"down_arrow"}

Native SEI Balance : ${native_balance}
ERC20 Balance : ${erc_20_balance}`;

    await ctx.reply(
        message_reply,
        {
            parse_mode: "HTML",
        }
    );
    await ctx.answerCallbackQuery();
});

bot.callbackQuery("withdrawal-request", async (ctx) => {
    if (allowList.includes(ctx.from.id) === false) {
        const error_permission = ctx.emoji`
Oops!
<strong>You do not have permission to request for withdrawal.</strong> 
We are sorry ${"grinning_face_with_sweat"}
`;
        await ctx.reply(error_permission, { parse_mode: "HTML" });
        await ctx.answerCallbackQuery();
        return;
    }

    ctx.session.step = "withdrawal";
    const message1 = ctx.emoji`
Sure! I can help you withdraw ${"smiling_face_with_smiling_eyes"}

Can you provide me a wallet address that I can withdraw to?
`;

    await ctx.reply(message1, { parse_mode: "HTML" });
});



//STEP 1 : WITHDRAWAL (get receiver address)
const withdrawal = router_withdrawal.route("withdrawal");
withdrawal.on("message:text", async (ctx) => {
    const address = ctx.msg.text;
    console.log("Withdrawal Message : ", address);

    const error_for_message1 = ctx.emoji`
Oops! Address provided is not valid. ${"grinning_face_with_sweat"}

Please provide a valid address.
        `;

    const message2 = ctx.emoji`
Got it! ${"star_struck"}
Now, please provide the amount to withdraw (e.g 0.5)?
        `;
    !(address.startsWith('0x') || address.startsWith('0X'))
    if (isAddress(address) === false) {
        await ctx.reply(error_for_message1, { parse_mode: "HTML" });
        return;
    }

    ctx.session.last_withdrawal_request_address = address.toString();
    ctx.session.step = "withdrawal_step2";
    await ctx.reply(message2, { parse_mode: "HTML" });
});
//STEP 1 : WITHDRAWAL END



//STEP 2 : WITHDRAWAL (get amount)
const withdrawal_step2 = router_withdrawal.route("withdrawal_step2");
withdrawal_step2.on("message:text", async (ctx) => {
    const amount = ctx.msg.text;
    // console.log("Withdrawal Step 2 Message : ", amount);
    // console.log('Testing retrive last address : ', ctx.session.last_withdrawal_request_address)

    const error_for_message2 = ctx.emoji`
Oops! Amount provided must be number. ${"grinning_face_with_sweat"}

Please provide a valid number for amount (e.g. 0.5, 10, 1.0).
        `;
    const message3 = ctx.emoji`
Alright! I got all the details now. ${"star_struck"}
I am helping you to submit your request.
        `;

    const message4 = ctx.emoji`
Hooray! Your withdrawal request is submitted. ${"party_popper"}
We are all good!
        `;

    const user_amount = parseFloat(amount);
    if (!isNaN(user_amount) === false) {
        await ctx.reply(error_for_message2, { parse_mode: "HTML" });
        return;
    }

    await ctx.reply(message3, { parse_mode: "HTML" });
    await ctx.replyWithChatAction("typing");

    var epochtime = Math.floor(new Date().getTime() / 1000)
    //Add withdrawal request to DB
    const transaction = await sequelize.transaction();
    try {
        await Transaction.create({
            contract_address: config.contract.contract_address,
            transfer_from_address: config.wallet.account, //actually we dont need this, but since already it, I will jus add in
            transfer_address: ctx.session.last_withdrawal_request_address,
            amount: user_amount,
            status: 'PROCESSING',
            created_at: epochtime,
            updated_at: epochtime,
            is_delete: 0,
        }, { transaction: transaction })
        await transaction.commit();
        ctx.session.last_withdrawal_request_address = undefined;
        ctx.session.step = "idle";
        await ctx.reply(message4, { parse_mode: "HTML" });
    } catch (error) {
        await transaction.rollback();
        ctx.session.last_withdrawal_request_address = undefined;
        ctx.session.step = "idle";
        await ctx.reply(`<strong>Something went wrong! Please try again later.</strong>`, { parse_mode: "HTML" });
        return;
    }
});
//STEP 2 : WITHDRAWAL END


bot.on("message", async (ctx) => {
    // ctx.api.config.use(addReplyParam(ctx));
    await ctx.reply("Got your message!");
});

bot.start();








































// bot.use(createConversation(withdrawal));
// bot.use(createConversation(withdrawal_step2));

// async function withdrawal_dummy(conversation, ctx) {
//     // TODO: code the conversation
//     const message1 = ctx.emoji`
// Sure! I can help you withdraw ${"smiling_face_with_smiling_eyes"}

// Can you provide me a wallet address that I can withdraw to?
//     `;
//     const message2 = ctx.emoji`
// Got it! ${"star_struck"}
// I am helping you to submit your request.
//     `;
//     const message3 = ctx.emoji`
// Yay! Your withdrawal request is submitted. ${"party_popper"}
//     `;

//     const error_for_message1 = ctx.emoji`
// Oops! Address provided is not valid. ${"grinning_face_with_sweat"}

// Please provide a valid address.
//     `;
//     await ctx.reply(message1, { parse_mode: "HTML" });
//     //Check if the the address given is valid
//     await ctx.conversation.enter('withdrawal_step2');
//     // withdrawal_step2(answer1.message.text, ctx, conversation);
// }


// async function withdrawal_step2(conversation, ctx) {
//     const answer1 = await conversation.wait();
//     const message2 = ctx.emoji`
// Got it! ${"star_struck"}
// I am helping you to submit your request.
//     `;
//     const error_for_message1 = ctx.emoji`
// Oops! Address provided is not valid. ${"grinning_face_with_sweat"}

// Please provide a valid address.
//     `;

//     if (answer1.message.text.substring(0, 2) === "0x") {
//         await ctx.reply(message2, { parse_mode: "HTML" });
//     } else {
//         await ctx.reply(error_for_message1, { parse_mode: "HTML" });
//         // const user_answer2 = await conversation.wait();
//         await ctx.conversation.enter('withdrawal_step2');
//     }
// }













// await ctx.reply(`Yay! You are requesting a withdrawal. It is processing`);
// await ctx.replyWithChatAction("typing");
// setTimeout(async function () {
//     await ctx.answerCallbackQuery();
//     await ctx.reply(`Cool\\!, your request submitted\\.`, { parse_mode: "MarkdownV2" });
// }, 3000)