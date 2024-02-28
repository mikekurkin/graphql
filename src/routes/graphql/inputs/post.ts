import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import { UUIDType } from '../types/uuid.js';

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    authorId: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    authorId: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }),
});
