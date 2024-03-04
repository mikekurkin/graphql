import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';
import { UUID } from 'crypto';
import DataLoader from 'dataloader';
import { MemberTypeId } from '../member-types/schemas.js';

export const createLoaders = (db: PrismaClient) => {
  const loaders = {
    users: {
      load: async (args?: {
        include: { subscribedToUser: boolean; userSubscribedTo: boolean };
      }) => {
        const { include } = args ?? { include: null };
        const users: (User & {
          subscribedToUser?: { subscriberId: UUID; authorId: UUID }[];
          userSubscribedTo?: { subscriberId: UUID; authorId: UUID }[];
        })[] = await db.user.findMany({
          include,
        });
        users.forEach((user) => {
          const subscribedToUser =
            user.subscribedToUser?.flatMap((sub) => {
              const subscriber = users.find((u) => u.id == sub.subscriberId);
              return subscriber ? [subscriber] : [];
            }) ?? [];
          const userSubscribedTo =
            user.userSubscribedTo?.flatMap((sub) => {
              const author = users.find((u) => u.id == sub.authorId);
              return author ? [author] : [];
            }) ?? [];
          loaders.subscribedToUserByUserId.prime(user.id as UUID, subscribedToUser);
          loaders.userSubscribedToByUserId.prime(user.id as UUID, userSubscribedTo);
        });
        return users;
      },
    },
    user: new DataLoader<UUID, User | null>(async (ids) => {
      const res = await db.user.findMany({
        where: { id: { in: [...ids] } },
      });

      return ids.map((id) => res.find((r) => r.id == id) ?? null);
    }),
    userSubscribedToByUserId: new DataLoader<UUID, User[]>(async (ids) => {
      const res = await db.user.findMany({
        where: { subscribedToUser: { some: { subscriberId: { in: [...ids] } } } },
        include: { subscribedToUser: true },
      });
      return ids.map(
        (id) =>
          res.filter((r) => r.subscribedToUser.map((s) => s.subscriberId).includes(id)) ??
          [],
      );
    }),
    subscribedToUserByUserId: new DataLoader<UUID, User[]>(async (ids) => {
      const res = await db.user.findMany({
        where: { userSubscribedTo: { some: { authorId: { in: [...ids] } } } },
        include: { userSubscribedTo: true },
      });
      return ids.map(
        (id) =>
          res.filter((r) => r.userSubscribedTo.map((s) => s.authorId).includes(id)) ?? [],
      );
    }),

    posts: { load: async () => await db.post.findMany() },
    post: new DataLoader<UUID, Post | null>(async (ids) => {
      const res = await db.post.findMany({ where: { id: { in: [...ids] } } });
      return ids.map((id) => res.find((r) => r.id == id) ?? null);
    }),
    postsByAuthorId: new DataLoader<UUID, Post[]>(async (ids) => {
      const res = await db.post.findMany({ where: { authorId: { in: [...ids] } } });
      return ids.map((id) => res.filter((r) => r.authorId == id) ?? []);
    }),

    profiles: { load: async () => await db.profile.findMany() },
    profile: new DataLoader<UUID, Profile | null>(async (ids) => {
      const res = await db.profile.findMany({ where: { id: { in: [...ids] } } });
      return ids.map((id) => res.find((r) => r.id == id) ?? null);
    }),
    profileByUserId: new DataLoader<UUID, Profile | null>(async (ids) => {
      const res = await db.profile.findMany({ where: { userId: { in: [...ids] } } });
      return ids.map((id) => res.find((r) => r.userId == id) ?? null);
    }),

    memberTypes: { load: async () => await db.memberType.findMany() },
    memberType: new DataLoader<MemberTypeId, MemberType | null>(async (ids) => {
      const res = await db.memberType.findMany({ where: { id: { in: [...ids] } } });
      return ids.map((id) => res.find((r) => r.id == id) ?? null);
    }),
  };
  return loaders;
};
