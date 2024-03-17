import { SlashCommandBuilder, type Interaction } from "discord.js";
import type { Command } from "../../common/types";

export const github = {
	data: new SlashCommandBuilder()
		.setName("github")
		.setDescription("Shows the source code of the bot."),
	async execute(interaction: Interaction) {
		if (!interaction.isRepliable()) {
			return;
		}

		await interaction.reply(
			"My source code is open and available [here](https://github.com/TheUndo/gogobot).",
		);
	},
} satisfies Command;
