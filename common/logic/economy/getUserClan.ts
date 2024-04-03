import { prisma } from "../../../prisma";

export async function getUserClan(userId: string, guildId: string) {
  return await prisma.clan.findFirst({
    where: {
      discordGuildId: guildId,
      members: {
        some: {
          discordUserId: userId,
        },
      },
    },
  });
}
