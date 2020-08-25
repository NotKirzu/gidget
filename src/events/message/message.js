const Discord = require("discord.js");
const b = require("../../utils/badwords");
const badwords = new b();
badwords.setOptions({whitelist: ["crap"]});
const Levels = require("../../utils/discord-xp");
const timer = new Discord.Collection();
//Start message event
module.exports = async (bot, message = new Discord.Message(), nolevel = false) => {
  if (message.author.bot) return;
  //Guild-only things
  if (message.guild) {
    // Autoresponses
    let msgDocument = message.guild.cache.customresponses ? message.guild.customresponses : await message.guild.getCustomResponses(); 
    if (msgDocument) {
      const { responses } = msgDocument;
      if (responses) {
        const arr = Object.entries(responses);
        for (let i in arr) {
          const regex = new RegExp(arr[i][0], "gmi");
          if (regex.test(message.content) && message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) {
            await message.channel.send(arr[i][1]).catch(err => { });
          }
        }
      }
    }

    // Level system
    if (!nolevel) {
      let msgDocument2 = message.guild.cache.levelconfig ? message.guild.levelconfig : await message.guild.getLevelConfig();
      if (msgDocument2 && msgDocument2.levelsystem) {
        if (!timer.get(message.author.id)) {
          timer.set(message.author.id, true);
          setTimeout(() => {
            timer.delete(message.author.id);
          }, 120000);
          const randomAmountOfXp = Math.floor(Math.random() * 9) + 1; // Min 1, Max 10
          const hasLeveledUp = await Levels.appendXp(
            message.author.id,
            message.guild.id,
            randomAmountOfXp
          );
          if (hasLeveledUp) {
            const user = await Levels.fetch(message.author.id, message.guild.id);
            let { roles } = msgDocument2;
            if (roles[user.level - 1]) {
              let toadd = roles[user.level - 1].filter(e => message.guild.roles.cache.has(e) && message.guild.roles.cache.get(e).editable && !message.guild.roles.cache.get(e).managed)
              message.member.roles.add(toadd);
            }
          }
          if (hasLeveledUp && msgDocument2.levelnotif) {
            const user = await Levels.fetch(message.author.id, message.guild.id);
            message.channel.send(
              `${message.author}, congratulations! You have leveled up to **${user.level}**. :tada:`
            ).catch(err => { });
          }
        }
      }
    }
    //Things for Wow Wow Discord
    if (message.guild.id === process.env.GUILD_ID && !message.channel.nsfw) {
      if (badwords.isProfane(message.content.toLowerCase()) && !message.member.hasPermission("ADMINISTRATOR")) {
        await message.delete()
        await message.reply("swearing is not allowed in this server!", { allowedMentions: { parse: ["users"] } });
      }
    }
  }

  // Command handler and custom prefix. Check that the channel is not a DM to check the prefix.

  let PREFIX;
  if (message.guild) {
    PREFIX = message.guild.cache.prefix ? message.guild.prefix : await message.guild.getPrefix();
  } else {
    console.log(message.author.tag + ' "' + message.content + '"');
    PREFIX = "g%";
  }
  //Mention check.
  if (message.mentions.users.get(bot.user.id) && message.content.startsWith("<@")) message.channel.send("My prefix in this server is " + PREFIX);
  //Check if message starts with prefix before starting any command
  if (!message.content.startsWith(PREFIX)) return;
  //Command structure
  //Arguments with spaces
  let args = message.content.substring(PREFIX.length).split(/ +/g);
  //let args = message.content.slice(PREFIX.length).trim().split(/ +/g);
  if (!args[0]) return;
  const command = bot.commands.get(args[0].toLowerCase()) || bot.commands.find(a => a.aliases.includes(args[0].toLowerCase()))
  if (command) {
    if (message.guild && message.channel.permissionsFor(bot.user).has("SEND_MESSAGES")) {
      if(command.owner && message.author.id !== "577000793094488085") return message.channel.send("Only AndreMor can use this command");
      if(command.dev && !(["577000793094488085"].includes(message.author.id))) return message.channel.send("Only Gidget developers can use this command");
      if(command.onlyguild && message.guild.id !== process.env.GUILD_ID) return message.channel.send("This command only works on Wow Wow Discord");
      const userperms = message.member.permissions;
      const userchannelperms = message.channel.permissionsFor(message.member);
      const botperms = message.guild.me.permissions;
      const botchannelperms = message.channel.permissionsFor(message.guild.me);
      if(message.author.id !== "577000793094488085") {
        if(!userperms.has(command.permissions.user[0])) return message.channel.send("You do not have the necessary permissions to run this command.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.user[0]).has(8)) ? (new Discord.Permissions(command.permissions.user[0]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
        if(!userchannelperms.has(command.permissions.user[1])) return message.channel.send("You do not have the necessary permissions to run this command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.user[1]).has(8)) ? (new Discord.Permissions(command.permissions.user[1]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
      }
      if(!botperms.has(command.permissions.bot[0])) return message.channel.send("Sorry, I don't have sufficient permissions to run that command.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.bot[0]).has(8)) ? (new Discord.Permissions(command.permissions.bot[0]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
      if(!botchannelperms.has(command.permissions.bot[1])) return message.channel.send("Sorry, I don't have sufficient permissions to run that command **in this channel**.\nRequired permissions:\n`" + (!(new Discord.Permissions(command.permissions.bot[1]).has(8)) ? (new Discord.Permissions(command.permissions.bot[1]).toArray().join(", ") || "None") : "ADMINISTRATOR") + "`");
      
      command.run(bot, message, args)
        .catch(err => {
          if (err.name === "StructureError") return message.channel.send(err.message).catch(err => { });
          console.error(err);
          message.channel.send("Something happened! Here's a debug: " + err).catch(err => { });
        });
    } else if (!message.guild) {
      if(command.onlyguild) return message.channel.send("This command onlu works in Wow Wow Discord")
      if(command.guildonly) return message.channel.send("This command only works in servers");
      command.run(bot, message, args)
        .catch(err => {
          if (err.name === "StructureError") return message.channel.send(err.message).catch(err => { });
          console.error(err);
          message.channel.send("Something happened! Here's a debug: " + err).catch(err => { });
        });
    }
  }
};
