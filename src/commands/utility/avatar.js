import Command from '../../utils/command.js';
import Discord from 'discord.js';
export default class extends Command {
	constructor(options) {
		super(options);
		this.description = "User avatar";
		this.permissions = {
			user: [0, 0],
			bot: [0, 16384]
		};
	}
	async run(message, args) {
		//Needs rewrite
		if (args[1] === 'server') {
			if (message.channel.type !== 'dm') {
				var avatar = message.guild.iconURL({ dynamic: true });
				const embed = new Discord.MessageEmbed()
					.setTitle('Server icon')
					.setImage(avatar)
				return message.channel.send(embed);
			} else {
				return message.channel.send('This command only works on servers.');
			}
		}

		let memberId = message.content.substring(message.content.indexOf(' ') + 1);
		let member = message.client.users.cache.get(memberId);
		console.log(memberId);

		if (member) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${member.username}'s avatar`)
				.setImage(`${member.displayAvatarURL({ format: "png", size: 1024, dynamic: true })}`)
			return message.channel.send(embed);
		} else if (!message.mentions.users.size) {
			var avatar = message.author.displayAvatarURL({ format: "png", size: 1024, dynamic: true });
			const embed = new Discord.MessageEmbed()
				.setTitle('Your avatar')
				.setImage(avatar)
			return message.channel.send(embed);
		}

		const avatarList = message.mentions.users.map(user => {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${user.username}'s avatar`)
				.setImage(`${user.displayAvatarURL({ format: "png", size: 1024, dynamic: true })}`)
			message.channel.send(embed);
		});
	}
}