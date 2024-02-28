import { Type } from '@fastify/type-provider-typebox';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from 'graphql';
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
        resolve: (_obj, { id }, { db }) => db.user.findUnique({ where: { id } }),
      },
      users: {
        type: new GraphQLList(UserType),
        resolve: (_obj, _args, { db }) => db.user.findMany(),
      },
      profile: {
        type: ProfileType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (_obj, { id }, { db }) => db.profile.findUnique({ where: { id } }),
      },
      profiles: {
        type: new GraphQLList(ProfileType),
        resolve: (_obj, _args, { db }) => db.profile.findMany(),
      },
      memberType: {
        type: MemberTypeType,
        args: { id: { type: new GraphQLNonNull(MemberTypeIdType) } },
        resolve: (_obj, { id }, { db }) => db.memberType.findUnique({ where: { id } }),
      },
      memberTypes: {
        type: new GraphQLList(MemberTypeType),
        resolve: (_obj, _args, { db }) => db.memberType.findMany(),
      },
      post: {
        type: PostType,
        args: { id: { type: new GraphQLNonNull(UUIDType) } },
        resolve: (_obj, { id }, { db }) => db.post.findUnique({ where: { id } }),
      },
      posts: {
        type: new GraphQLList(PostType),
        resolve: (_obj, _args, { db }) => db.post.findMany(),
      },
    }),
  }),
});
