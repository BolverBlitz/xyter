// Dependencies
import {
  CommandInteraction,
  ColorResolvable,
  GuildMemberRoleManager,
} from "discord.js";

// Configurations
import config from "../../../../../config.json";

// Models
import shopRolesSchema from "../../../../database/schemas/shopRole";
import guildSchema from "../../../../database/schemas/guild";

// Helpers
import pluralize from "../../../../helpers/pluralize";
import fetchUser from "../../../../helpers/fetchUser";

// Function
export default async (interaction: CommandInteraction) => {
  const { options, guild, user, member } = interaction;

  const optionName = options?.getString("name");
  const optionColor = options?.getString("color");

  // If amount is null
  if (optionName === null) {
    // Embed object
    const embed = {
      title: ":dollar: Shop - Roles [Buy]" as string,
      description: "We could not read your requested name." as string,
      color: config?.colors?.error as ColorResolvable,
      timestamp: new Date(),
      footer: {
        iconURL: config?.footer?.icon as string,
        text: config?.footer?.text as string,
      },
    };

    // Send interaction reply
    return interaction?.editReply({ embeds: [embed] });
  }

  await guild?.roles
    .create({
      name: optionName,
      color: optionColor as ColorResolvable,
      reason: `${user?.id} bought from shop`,
    })
    .then(async (role) => {
      // Get guild object
      const guildDB = await guildSchema?.findOne({
        guildId: guild?.id,
      });

      const userDB = await fetchUser(user, guild);

      if (userDB === null) return;
      if (guildDB === null) return;
      if (guildDB.shop === null) return;

      const { pricePerHour } = guildDB.shop.roles;

      userDB.credits -= pricePerHour;

      await userDB?.save();

      await shopRolesSchema?.create({
        roleId: role?.id,
        userId: user?.id,
        guildId: guild?.id,
        pricePerHour,
        lastPayed: new Date(),
      });

      await (member?.roles as GuildMemberRoleManager)?.add(role?.id);
      await shopRolesSchema?.find()?.then((role: any) => console.log(role));

      const embed = {
        title: ":shopping_cart: Shop - Roles [Buy]" as string,
        description:
          `You have bought ${role?.name} for ${guildDB?.shop?.roles?.pricePerHour} per hour.` as string,
        color: config?.colors?.success as ColorResolvable,
        fields: [
          {
            name: "Your balance" as string,
            value: `${pluralize(userDB?.credits, "credit")}` as string,
          },
        ],
        timestamp: new Date(),
        footer: {
          iconURL: config?.footer?.icon as string,
          text: config?.footer?.text as string,
        },
      };
      return interaction?.editReply({
        embeds: [embed],
      });
    })
    .catch(console.error);
};