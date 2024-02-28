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
      resolve: (profile, _args, { db }) =>
        db.memberType.findUnique({ where: { id: profile.memberTypeId } }),
    },
    userId: { type: new GraphQLNonNull(UUIDType) },
    user: {
      type: UserType,
      resolve: (profile, _args, { db }) =>
        db.user.findUnique({ where: { id: profile.userId } }),
    },
  }),
});
