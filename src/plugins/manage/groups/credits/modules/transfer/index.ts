// Dependencies
import { CommandInteraction, MessageEmbed } from "discord.js";

// Configurations
import {
  successColor,
  errorColor,
  footerText,
  footerIcon,
} from "@config/embed";

// Handlers
import logger from "@logger";

// Helpers
import saveUser from "@helpers/saveUser";

// Models
import fetchUser from "@helpers/fetchUser";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

// Function
export default {
  data: (command: SlashCommandSubcommandBuilder) => {
    return command
      .setName("transfer")
      .setDescription("Transfer credits from one user to another.")
      .addUserOption((option) =>
        option
          .setName("from")
          .setDescription("The user to transfer credits from.")
          .setRequired(true)
      )
      .addUserOption((option) =>
        option
          .setName("to")
          .setDescription("The user to transfer credits to.")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription(`The amount of credits to transfer.`)
          .setRequired(true)
      );
  },
  execute: async (interaction: CommandInteraction) => {
    // Destructure member
    const { guild, options } = interaction;

    // Get options
    const optionFromUser = options?.getUser("from");
    const optionToUser = options?.getUser("to");
    const optionAmount = options?.getInteger("amount");

    // If amount is null
    if (optionAmount === null) {
      logger?.verbose(`Amount is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(`You must provide an amount.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    if (guild === null) {
      logger?.verbose(`Guild is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(`You must be in a guild.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }
    if (optionFromUser === null) {
      logger?.verbose(`From user is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(`You must provide a user to transfer from.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }
    if (optionToUser === null) {
      logger?.verbose(`To user is null`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(`You must provide a user to transfer to.`)
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // Get fromUser object
    const fromUser = await fetchUser(optionFromUser, guild);

    // Get toUser object
    const toUser = await fetchUser(optionToUser, guild);

    // If toUser does not exist
    if (fromUser === null) {
      logger?.verbose(`From user does not exist`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(
              `The user you provided to transfer from does not exist.`
            )
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // If toUser.credits does not exist
    if (!fromUser?.credits) {
      logger?.verbose(`From user does not have credits`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(
              `The user you provided to transfer from does not have credits.`
            )
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // If toUser does not exist
    if (toUser === null) {
      logger?.verbose(`To user does not exist`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(
              `The user you provided to transfer to does not exist.`
            )
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // If toUser.credits does not exist
    if (toUser?.credits === null) {
      logger?.verbose(`To user does not have credits`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(
              `The user you provided to transfer to does not have credits.`
            )
            .setTimestamp(new Date())
            .setColor(errorColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    }

    // Withdraw amount from fromUser
    fromUser.credits -= optionAmount;

    // Deposit amount to toUser
    toUser.credits += optionAmount;

    // Save users
    await saveUser(fromUser, toUser)?.then(async () => {
      logger?.verbose(`Saved users`);

      return interaction?.editReply({
        embeds: [
          new MessageEmbed()
            .setTitle("[:toolbox:] Manage - Credits (Transfer)")
            .setDescription(`Transferred ${optionAmount} credits.`)
            .addFields(
              {
                name: `${optionFromUser?.username} Balance`,
                value: `${fromUser?.credits}`,
                inline: true,
              },
              {
                name: `${optionToUser?.username} Balance`,
                value: `${toUser?.credits}`,
                inline: true,
              }
            )
            .setTimestamp(new Date())
            .setColor(successColor)
            .setFooter({ text: footerText, iconURL: footerIcon }),
        ],
      });
    });
  },
};
