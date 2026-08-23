import { prisma } from "./prisma";

export async function getLikedPostIds(userId: string): Promise<string[]> {
  const likes = await prisma.like.findMany({
    where: { userId },
    select: { postId: true },
  });
  return likes.map((l) => l.postId);
}
