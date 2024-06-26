import { createWallet } from "!/bot/logic/economy/createWallet";
import { guardEconomyChannel } from "!/bot/logic/guildConfig/guardEconomyChannel";
import { Colors, type Command } from "!/bot/types";
import { addCurrency } from "!/bot/utils/addCurrency";
import { formatNumber } from "!/bot/utils/formatNumber";
import { prisma } from "!/core/db/prisma";
import {
  EmbedBuilder,
  type Interaction,
  SlashCommandBuilder,
} from "discord.js";
import { sprintf } from "sprintf-js";
import { WorkType, coolDowns } from "./lib/workConfig";

export const weekly = {
  data: new SlashCommandBuilder()
    .setName("weekly")
    .setDescription("Get weekly reward"),
  async execute(interaction: Interaction) {
    if (!interaction.isRepliable() || !interaction.isChatInputCommand()) {
      return;
    }

    const guildId = interaction.guild?.id;

    if (!guildId) {
      return await interaction.reply(
        "This command can only be used in a server.",
      );
    }

    const guard = await guardEconomyChannel(
      guildId,
      interaction.channelId,
      interaction.user.id,
    );

    if (guard) {
      return await interaction.reply({
        ephemeral: true,
        ...guard,
      });
    }

    await createWallet(interaction.user.id, guildId);

    const userId = interaction.user.id;

    const baseReward = 250_000;
    const randomBonus = Math.floor(Math.random() * 10_00);

    const [lastWork, clan] = await Promise.all([
      prisma.work.findFirst({
        where: {
          userDiscordId: userId,
          guildDiscordId: guildId,
          type: WorkType.Weekly,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.clan.findFirst({
        where: {
          members: {
            some: {
              discordUserId: userId,
            },
          },
          discordGuildId: guildId,
        },
      }),
    ]);

    if (
      lastWork &&
      lastWork.createdAt.getTime() + coolDowns.WEEKLY > Date.now()
    ) {
      return await interaction.reply({
        content: sprintf(
          "You've already claimed your weekly reward. Next claim <t:%d:R>",
          Math.floor((lastWork.createdAt.getTime() + coolDowns.WEEKLY) / 1000),
        ),
      });
    }

    const clanRewardMultiplier = 1 + (clan?.level ?? 0) / 10;
    const weeklyReward = baseReward + randomBonus;
    const reward = Math.round(weeklyReward * clanRewardMultiplier);

    await prisma.$transaction([
      prisma.work.create({
        data: {
          userDiscordId: userId,
          guildDiscordId: guildId,
          type: WorkType.Weekly,
        },
      }),
      prisma.wallet.update({
        where: {
          userDiscordId_guildId: {
            userDiscordId: userId,
            guildId,
          },
        },
        data: {
          balance: {
            increment: reward,
          },
        },
      }),
    ]);

    const mainPart = sprintf("**+%s**", addCurrency()(formatNumber(reward)));

    const weeklyRewardPart = sprintf(
      "Weekly reward: %s",
      addCurrency()(formatNumber(weeklyReward)),
    );

    const clanBonusPart = clan
      ? sprintf(
          "Clan bonus (%s): %s",
          `${(clanRewardMultiplier * 100 - 100).toFixed(0)}%`,
          addCurrency()(formatNumber(reward - weeklyReward)),
        )
      : null;

    const embed = new EmbedBuilder()
      .setTitle(mainPart)
      .setDescription(
        [weeklyRewardPart, clanBonusPart].filter(Boolean).join("\n"),
      )
      .setFooter({
        text: "Come back next week!",
      })
      .setColor(Colors.Success);

    return await interaction.reply({
      embeds: [embed],
    });
  },
} satisfies Command;
