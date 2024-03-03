import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { UserType } from './user.js';
import { UUIDType } from './uuid.js';

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: new GraphQLNonNull(UUIDType) },
    author: {
      type: UserType,
      resolve: ({ authorId }, _args, { loaders }) => loaders.users.load(authorId),
    },
  }),
});
