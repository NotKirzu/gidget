import Command from '../../utils/command.js';
import safeEval from 'notevil';
import Discord from 'discord.js';
import util from 'util';
export default class extends Command {
    constructor(options) {
        super(options);
        this.description = "Evaluate JavaScript code. The bot is not at risk.";
        this.permissions = {
            user: [0, 0],
            bot: [0, 16384]
        }
    }
    async run(message, args) {
        if (!args[1]) return message.channel.send("Put something to evaluate.");
        let limit = 1005;
        let algo = 0;
        let code = args.slice(1).join(' ');
        if(code.match(/toString/gmi) && code.match(/toString/gmi).length > 1) return message.channel.send("No");
        try {
            let evalued = await safeEval(code, {
                "JSON": Object.create(JSON),
                send: function (obj1, obj2) {
                    if(algo > 2) throw new Error("Only 3 messages per instance")
                    algo++;
                    if(!obj1) throw new Error("You have not entered anything.");
                    if(obj1 instanceof Object && obj1.hasOwnProperty("allowedMentions")) throw new Error("You cannot modify that value");
                    if(obj2 instanceof Object && obj2.hasOwnProperty("allowedMentions")) throw new Error("You cannot modify that value");
                    message.channel.send(obj1, obj2);
                    return true;
                },
            }, {timeout: 200, maxIterations: 5});
            if (typeof evalued !== "string")
                evalued = util.inspect(evalued, { depth: 0 });
            let txt = "" + evalued;
            if (txt.length > limit) {
                const embed = new Discord.MessageEmbed()
                    .setAuthor("Evaluation done!", this.bot.user.displayAvatarURL())
                    .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n ${txt.slice(0, limit)}\n\`\`\``)
                    .setColor("RANDOM")
                    .setFooter("Requested by: " + message.author.tag)
                message.channel.send(embed);
            } else {
                var embed = new Discord.MessageEmbed()
                    .setAuthor("Evaluation done!", this.bot.user.displayAvatarURL())
                    .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                    .addField("Output", `\`\`\`js\n ${txt}\n\`\`\``)
                    .setColor("RANDOM")
                    .setFooter("Requested by: " + message.author.tag)
                message.channel.send(embed);
            }
        } catch (err) {
            const embed = new Discord.MessageEmbed()
                .setAuthor("Something happened!", this.bot.user.displayAvatarURL())
                .addField("Input", `\`\`\`js\n${code}\n\`\`\``)
                .addField("Output", `\`\`\`js\n${err}\n\`\`\``)
                .setColor("RANDOM")
                .setFooter("Requested by: " + message.author.tag)
            message.channel.send(embed);
        }
    }
}