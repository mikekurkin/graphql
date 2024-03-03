import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { ChangePostInput, CreatePostInput } from './inputs/post.js';
import { ChangeProfileInput, CreateProfileInput } from './inputs/profile.js';
import { ChangeUserInput, CreateUserInput } from './inputs/user.js';
import { MemberTypeIdType } from './types/member-type-id.js';
import { MemberTypeType } from './types/member-type.js';
import { PostType } from './types/post.js';
import { ProfileType } from './types/profile.js';
import { UserType } from './types/user.js';
import { UUIDType } from './types/uuid.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
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
      profile: {
        type: ProfileType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (_obj, { id }, { loaders }) => loaders.profile.load(id),
      },
      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: (_obj, _args, { loaders }) => loaders.profiles.load(),
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: new GraphQLNonNull(MemberTypeIdType) } },
        resolve: (_obj, { id }, { loaders }) => loaders.memberType.load(id),
      },
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        resolve: (_obj, _args, { loaders }) => loaders.memberTypes.load(),
      },
      post: {
        type: PostType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (_obj, { id }, { loaders }) => loaders.post.load(id),
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: (_obj, _args, { loaders }) => loaders.posts.load(),
      },
    }),
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      createUser: {
        type: UserType,
        args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
        resolve: async (_obj, { dto }, { db }) => await db.user.create({ data: dto }),
      },
      createProfile: {
        type: ProfileType,
        args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
        resolve: async (_obj, { dto }, { db }) => await db.profile.create({ data: dto }),
      },
      createPost: {
        type: PostType,
        args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
        resolve: async (_obj, { dto }, { db }) => await db.post.create({ data: dto }),
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
      changeProfile: {
        type: ProfileType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangeProfileInput) },
        },
        resolve: async (_obj, { id, dto }, { db }) =>
          await db.profile.update({ where: { id }, data: dto }),
      },
      changePost: {
        type: PostType,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
          dto: { type: new GraphQLNonNull(ChangePostInput) },
        },
        resolve: async (_obj, { id, dto }, { db }) =>
          await db.post.update({ where: { id }, data: dto }),
      },
      deleteUser: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_obj, { id }, { db }) =>
          void (await db.user.delete({ where: { id } })),
      },
      deleteProfile: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_obj, { id }, { db }) =>
          void (await db.profile.delete({ where: { id } })),
      },
      deletePost: {
        type: GraphQLString,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: async (_obj, { id }, { db }) =>
          void (await db.post.delete({ where: { id } })),
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
    }),
  }),
});
