import {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { PostType } from './post.js';
import { ProfileType } from './profile.js';
import { UUIDType } from './uuid.js';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    profile: {
      type: ProfileType,
      resolve: ({ id: userId }, _args, { loaders }) =>
        loaders.profileByUserId.load(userId),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: ({ id: authorId }, _args, { loaders }) =>
        loaders.postsByAuthorId.load(authorId),
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: ({ id }, _args, { loaders }) => loaders.userSubscribedToByUserId.load(id),
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: ({ id }, _args, { loaders }) => loaders.subscribedToUserByUserId.load(id),
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: GraphQLFloat, defaultValue: 0 },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const userQueries = {
  user: {
    type: UserType,
    args: { id: { type: new GraphQLNonNull(UUIDType) } },
    resolve: (_obj, { id }, { loaders }) => loaders.user.load(id),
  },
  users: {
    type: new GraphQLList(UserType),
    resolve: (_obj, _args, { loaders }, info) => {
      const include = {};
      ['subscribedToUser', 'userSubscribedTo'].forEach(
        (field) =>
          (include[field] =
            parseResolveInfo(info)?.fieldsByTypeName.User[field] !== undefined),
      );
      return loaders.users.load({ include });
    },
  },
};

export const userMutations = {
  createUser: {
    type: UserType,
    args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
    resolve: async (_obj, { dto }, { db }) => await db.user.create({ data: dto }),
  },
  changeUser: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(UUIDType) },
      dto: { type: new GraphQLNonNull(ChangeUserInput) },
    },
    resolve: async (_obj, { id, dto }, { db }) =>
      await db.user.update({ where: { id }, data: dto }),
  },
  deleteUser: {
    type: GraphQLString,
    args: { id: { type: new GraphQLNonNull(UUIDType) } },
    resolve: async (_obj, { id }, { db }) =>
      void (await db.user.delete({ where: { id } })),
  },
  subscribeTo: {
    type: UserType,
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_obj, { userId: subscriberId, authorId }, { db }) =>
      await db.user.update({
        where: { id: subscriberId },
        data: { userSubscribedTo: { create: { authorId } } },
      }),
  },
  unsubscribeFrom: {
    type: GraphQLString,
    args: {
      userId: { type: new GraphQLNonNull(UUIDType) },
      authorId: { type: new GraphQLNonNull(UUIDType) },
    },
    resolve: async (_obj, { userId: subscriberId, authorId }, { db }) =>
      void (await db.subscribersOnAuthors.delete({
        where: { subscriberId_authorId: { subscriberId, authorId } },
      })),
  },
};
