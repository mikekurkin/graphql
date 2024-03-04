import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { MemberTypeIdType } from './member-type-id.js';
import { MemberTypeType } from './member-type.js';
import { UserType } from './user.js';
import { UUIDType } from './uuid.js';

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    memberType: {
      type: MemberTypeType,
      resolve: ({ memberTypeId }, _args, { loaders }) =>
        loaders.memberType.load(memberTypeId),
    },
    userId: { type: new GraphQLNonNull(UUIDType) },
    user: {
      type: UserType,
      resolve: ({ userId }, _args, { loaders }) => loaders.user.load(userId),
    },
  }),
});

export const profileQueries = {
  profile: {
    type: ProfileType,
    args: { id: { type: new GraphQLNonNull(UUIDType) } },
    resolve: (_obj, { id }, { loaders }) => loaders.profile.load(id),
  },
  profiles: {
    type: new GraphQLList(ProfileType),
    resolve: (_obj, _args, { loaders }) => loaders.profiles.load(),
  },
};

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeIdType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    // userId: { type: UUIDType },
    memberTypeId: { type: MemberTypeIdType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }),
});

export const profileMutations = {
  createProfile: {
    type: ProfileType,
    args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
    resolve: async (_obj, { dto }, { db }) => await db.profile.create({ data: dto }),
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
  deleteProfile: {
    type: GraphQLString,
    args: { id: { type: new GraphQLNonNull(UUIDType) } },
    resolve: async (_obj, { id }, { db }) =>
      void (await db.profile.delete({ where: { id } })),
  },
};
