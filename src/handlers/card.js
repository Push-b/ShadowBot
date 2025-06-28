const cron = require("node-cron")
const axios = require('axios')
const path = require('path')
require("./Message");
module.exports = CardHandler = async (client, m) => {
  try {
    let cardgames = await client.DB.get("card-game");
    const cardgame = cardgames || [];

    for (let i = 0; i < cardgame.length; i++) {
      const jid = cardgame[i];
      console.log(jid);

      if (cardgame.includes(jid)) {
        let count = 0;
        let sOr6Counter = 0;
        const sOr6Interval = 30;
        const sOr6Limit = 15;

        cron.schedule('*/20 * * * *', async () => {
          try {
            const filePath = path.join(__dirname, './card.json');
            const data = require(filePath);

            const index = Math.floor(Math.random() * data.length);
            let obj, price;

            obj = data[index];
            switch (obj.tier) {
              case "1":
                price = client.utils.getRandomInt(1000, 2500);
                break;
              case "2":
                price = client.utils.getRandomInt(2500, 35000);
                break;
              case "3":
                price = client.utils.getRandomInt(35000, 45000);
                break;
              case "4":
                price = client.utils.getRandomInt(45000, 550000);
                break;
              case "5":
                price = client.utils.getRandomInt(550000, 690000);
                break;
              case "6":
                price = client.utils.getRandomInt(700000, 800000);
                break;
              case "S":
                price = client.utils.getRandomInt(900000, 1500000);
                break;
            }
            count++;
            sOr6Counter++;
            if (sOr6Counter === sOr6Interval && sOr6Counter <= (sOr6Interval * sOr6Limit)) {
              const filteredData = data.filter(card => card.tier === "S" || card.tier === "6");
              const index = Math.floor(Math.random() * data.length);
               let obj, price;
              
              obj = data[index];
              switch (obj.tier) {
                case "6":
                  price = client.utils.getRandomInt(700000, 800000);
                  break;
                case "S":
                  price = client.utils.getRandomInt(900000, 1500000);
                  break;
              }
            }

            console.log(`Sended:${obj.tier + "  Name:" + obj.title + "  For " + price + " in " + jid}`);
            await client.cards.set(`${jid}.card`, `${obj.title}-${obj.tier}`);
            await client.cards.set(`${jid}.card_price`, `${price}`);

            if (obj.tier.includes('6') || obj.tier.includes('S')) {
              const giif = await client.utils.getBuffer(obj.url);
              const cgif = await client.utils.gifToMp4(giif);
              return client.sendMessage(jid, {
                video: cgif,
                caption: `🧧 *━『 Woah a rare card spawn 』━* 🧧\n\n🎃 Name: ${obj.title}\n\n🌐 Tier: ${obj.tier}\n\n🌀 Price: ${price}\n\n📤 *Info:* collect as much as you can.\n\n🔮 [ Use *${client.prefix}college* to claim the card, *${client.prefix}collect* to see your *Cards* ]`,
                gifPlayback: true,
              });
            } else {
              return client.sendMessage(jid, {
                image: {
                  url: obj.url,
                },
                caption: `🃏 *ᗩᑎᏆᗰᗴ ᑕᗩᖇᗞ ᗩᑭᑭᗴᗩᖇᗴᗞ* 🃏\n\n 👤 Name: ${obj.title}\n\n🌀 Tier: ${obj.tier}\n\n🛍️ Price: ${price}\n\n🧾 *Info:* collect as much as you can .\n\n🔮 [ Use *${client.prefix}claim* to collect the card, *${client.prefix}claim* to see your *Cards collection* ]`,
              });
            }

          } catch (err) {
            console.log(err)
            await client.sendMessage(jid, { image: { url: `${client.utils.errorChan()}` }, caption: `${client.utils.greetings()} Error-Chan Dis\n\nCommand no error wa:\n${err}` })
          }

          cron.schedule('*/5 * * * *', () => {
            client.cards.delete(`${jid}.card`);
            client.cards.delete(`${jid}.card_price`);
            console.log(`Card deleted after 19 minutes`)
          });

        });

      }
    }

  } catch (error) {
    console.log(error)
  }
}
function newFunction() {
  return "card-game";
}
