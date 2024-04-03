import {
  SlashCommandBuilder,
  EmbedBuilder,
  type Interaction,
} from "discord.js";
import type { Command } from "~/common/types";

export const fun = {
  data: new SlashCommandBuilder()
    .setName("fun")
    .setDescription("Try it out to find out")
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription("hug kiss diss pat")
        .addChoices(
          { name: "Kiss", value: "kiss" },
          { name: "Hug", value: "hug" },
          { name: "Pat", value: "pat" },
          { name: "Diss", value: "diss" },
        )
        .setRequired(true),
    )
    .addUserOption((option) =>
      option
        .setName("mention")
        .setDescription("Mention the user")
        .setRequired(true),
    ),
  async execute(interaction: Interaction) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand()) {
      return;
    }
    const query = interaction.options.getString("options");
    const id = interaction.options.getUser("mention");

    if (query === "hug") {
      const embed = new EmbedBuilder()
        .setDescription(`**${interaction.user.username} hugs ${id}**`)
        .setImage(
          "https://i.pinimg.com/originals/96/de/2f/96de2ffb76bbc84446461e9a7afa95cb.gif",
        )
        .setFooter({ text: "HUGGIES!!" });
      return await interaction.reply({ embeds: [embed] });
    }
    if (query === "kiss") {
      const embed = new EmbedBuilder()
        .setDescription(`**${interaction.user.username} kisses ${id}**`)
        .setImage(
          "https://i.pinimg.com/originals/b9/ef/3a/b9ef3a0b2d9ed41e467ed18d8afa8a3a.gif",
        )
        .setFooter({ text: "KISSIES!!!" });
      return await interaction.reply({ embeds: [embed] });
    }
    if (query === "pat") {
      const embed = new EmbedBuilder()
        .setDescription(`**${interaction.user.username} pats ${id}**`)
        .setImage(
          "https://64.media.tumblr.com/6289c42ea805f475698f02207da0a377/tumblr_p14hcsxPsb1tm1dgio1_500.gif",
        )
        .setFooter({ text: "Pat pat" });
      return await interaction.reply({ embeds: [embed] });
    }
    if (query === "diss") {
      return await interaction.reply(`**Suggondese Nutz!!! BEETCHH ${id} **`);
    }

    return await interaction.reply({
      ephemeral: true,
      content: "Invalid option",
    });
  },
} satisfies Command;
