import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { MemberTypeIdType } from './member-type-id.js';

export const MemberTypeType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(MemberTypeIdType) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

export const memberTypeQueries = {
  memberType: {
    type: MemberTypeType,
    args: { id: { type: new GraphQLNonNull(MemberTypeIdType) } },
    resolve: (_obj, { id }, { loaders }) => loaders.memberType.load(id),
  },
  memberTypes: {
    type: new GraphQLList(MemberTypeType),
    resolve: (_obj, _args, { loaders }) => loaders.memberTypes.load(),
  },
};
