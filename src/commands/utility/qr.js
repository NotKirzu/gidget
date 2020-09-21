import { MessageAttachment } from "discord.js";
import Command from "../../utils/command.js";

export default class extends Command {
  constructor(options) {
    super(options)
    this.description = "Generate a QR";
    this.permissions = {
      user: [0, 0],
      bot: [0, 32768]
    };
  }
  async run(message, args) {
    let text = args.slice(1).join(" ");
    if (!text) {
      return message.channel.send("Put some text!");
    }
    message.channel.startTyping();

    message.channel.send(new MessageAttachment(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${text.replace(new RegExp(" ", "g"), "%20")}`, 'qr.png')).then(() => message.channel.stopTyping());
  }
}