import logger from "@logger";
import { Interaction, MessageEmbed, TextChannel } from "discord.js";

import guildSchema from "@schemas/guild";

import { footerText, footerIcon, successColor } from "@config/embed";

export default {
  execute: async (interaction: Interaction) => {
    if (interaction === null) return;

    if (interaction.guild === null) return;

    const guildData = await guildSchema.findOne({
      guildId: interaction.guild.id,
    });

    const { client } = interaction;

    if (guildData === null) return;

    if (guildData.audits.status !== true) return;
    if (!guildData.audits.channelId) return;

    const channel = client.channels.cache.get(`${guildData.audits.channelId}`);

    if (channel === null) return;

    (channel as TextChannel).send({
      embeds: [
        new MessageEmbed()
          .setColor(successColor)
          .setDescription(
            `
            **Interaction created by** ${interaction.user.username} **in** ${interaction.channel}
            `
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .addFields([{ name: "Event", value: "interactionCreate" }])
          .setTimestamp()
          .setFooter({
            text: footerText,
            iconURL: footerIcon,
          }),
      ],
    });
  },
};
