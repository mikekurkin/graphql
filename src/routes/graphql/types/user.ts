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
      resolve: (user, _args, { db }) =>
        db.profile.findUnique({ where: { userId: user.id } }),
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (user, _args, { db }) =>
        db.post.findMany({ where: { authorId: user.id } }),
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (user, _args, { db }) =>
        db.user.findMany({
          where: { subscribedToUser: { some: { subscriberId: user.id } } },
        }),
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (user, _args, { db }) =>
        db.user.findMany({
          where: { userSubscribedTo: { some: { authorId: user.id } } },
        }),
    },
  }),
});
