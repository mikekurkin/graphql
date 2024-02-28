import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';
import { MemberTypeIdType } from '../types/member-type-id.js';
import { UUIDType } from '../types/uuid.js';

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
