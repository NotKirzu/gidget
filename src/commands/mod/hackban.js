import Command from '../../utils/command.js';
export default class extends Command {
  constructor(options) {
    super(options);
    this.aliases = ['hkb'];
    this.guildonly = true;
    this.description = "Ban a user who is not on the server.";
    this.permissions = {
      user: [4, 0],
      bot: [4, 0]
    }
  }
  async run(message, args) {
    if (!args[1]) return message.channel.send('Put a ~~snowflake~~ user ID to hackban them.');
    try {
      await message.guild.members.ban(args[1]);
      message.channel.send(`I've hackbanned that user.`);
    } catch (err) {
      if (err.code === 50035) return message.channel.send("Invalid ID!");
      message.channel.send(`I couldn't hackban that user. Here's a debug: ${err}`);
    }
  }
}