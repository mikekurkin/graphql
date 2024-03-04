import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { parse } from 'graphql/language/index.js';
import { validate } from 'graphql/validation/index.js';
import { createLoaders } from './loaders.js';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const errors = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (errors.length > 0) return { errors };
      return graphql({
        schema: schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { db: fastify.prisma, loaders: createLoaders(fastify.prisma) },
      });
    },
  });
};

export default plugin;
