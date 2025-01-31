// Dependencies
import { Permissions, CommandInteraction } from "discord.js";

// Configurations
import { errorColor, footerText, footerIcon } from "@config/embed";

// Handlers
import logger from "@logger";

// Modules
import pterodactyl from "./modules/pterodactyl";
import credits from "./modules/credits";
import points from "./modules/points";
import welcome from "./modules/welcome";
import audits from "./modules/audits";
import shop from "./modules/shop";
import { SlashCommandSubcommandGroupBuilder } from "@discordjs/builders";

// Function
export default {
  data: (group: SlashCommandSubcommandGroupBuilder) => {
    return group
      .setName("guild")
      .setDescription("Guild settings.")
      .addSubcommand(pterodactyl.data)
      .addSubcommand(credits.data)
      .addSubcommand(points.data)
      .addSubcommand(welcome.data)
      .addSubcommand(audits.data)
      .addSubcommand(shop.data);
  },
  execute: async (interaction: CommandInteraction) => {
    // Destructure member
    const { memberPermissions, options } = interaction;

    // Check permission
    if (!memberPermissions?.has(Permissions?.FLAGS?.MANAGE_GUILD)) {
      logger?.verbose(`User does not have permission to execute command.`);

      return interaction?.editReply({
        embeds: [
          {
            title: ":tools: Settings - Guild",
            color: errorColor,
            description: "You do not have permission to use this command.",
            timestamp: new Date(),
            footer: {
              iconURL: footerIcon as string,
              text: footerText as string,
            },
          },
        ],
      });
    }

    if (options?.getSubcommand() === "pterodactyl") {
      logger?.verbose(`Executing pterodactyl subcommand`);

      return pterodactyl.execute(interaction);
    }

    if (options?.getSubcommand() === "credits") {
      logger?.verbose(`Executing credits subcommand`);

      return credits.execute(interaction);
    }

    if (options?.getSubcommand() === "points") {
      logger?.verbose(`Executing points subcommand`);

      return points.execute(interaction);
    }

    if (options?.getSubcommand() === "welcome") {
      logger?.verbose(`Executing welcome subcommand`);

      return welcome.execute(interaction);
    }

    if (options?.getSubcommand() === "audits") {
      logger?.verbose(`Executing audit subcommand`);

      return audits.execute(interaction);
    }

    if (options?.getSubcommand() === "shop") {
      logger?.verbose(`Executing shop subcommand`);

      return shop.execute(interaction);
    }

    logger?.verbose(`No subcommand found`);
  },
};
