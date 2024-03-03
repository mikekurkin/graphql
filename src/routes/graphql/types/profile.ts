import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
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
