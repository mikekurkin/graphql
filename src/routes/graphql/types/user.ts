import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
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
