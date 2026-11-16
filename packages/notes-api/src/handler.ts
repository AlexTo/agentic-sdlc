import {
  awsLambdaRequestHandler,
  CreateAWSLambdaContextOptions,
} from '@trpc/server/adapters/aws-lambda';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { appRouter } from './router.js';

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: (ctx: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) =>
    ctx,
});
