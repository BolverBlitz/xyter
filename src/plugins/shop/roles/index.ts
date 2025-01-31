// Dependencies
import { SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

// Handlers
import logger from "../../../logger";

import { errorColor, footerText, footerIcon } from "@config/embed";

// Modules
import buy from "./modules/buy";
import cancel from "./modules/cancel";

import guildSchema from "@schemas/guild";

// Function
export default {
  data: (group: SlashCommandSubcommandGroupBuilder) => {
    return group
      .setName("roles")
      .setDescription("Shop for custom roles.")
      .addSubcommand(buy.data)
      .addSubcommand(cancel.data);
  },
  execute: async (interaction: CommandInteraction) => {
    const { options, guild } = interaction;

    const guildDB = await guildSchema?.findOne({
      guildId: guild?.id,
    });

    if (guildDB === null) return;

    if (!guildDB.shop.roles.status) {
      logger.verbose(`Shop roles disabled.`);

      return interaction?.editReply({
        embeds: [
          {
            title: ":dollar: Shop - Roles",
            description: "This server has disabled shop roles.",
            color: errorColor,
            timestamp: new Date(),
            footer: {
              iconURL: footerIcon,
              text: footerText,
            },
          },
        ],
      });
    }

    if (options?.getSubcommand() === "buy") {
      logger.verbose(`Executing buy subcommand`);

      await buy.execute(interaction);
    }

    if (options?.getSubcommand() === "cancel") {
      logger.verbose(`Executing cancel subcommand`);

      await cancel.execute(interaction);
    }
  },
};
