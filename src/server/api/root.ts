import { hospitalRouter } from '~/server/api/routers/hospital';
import { logsRouter } from '~/server/api/routers/logs';
import { nurseRouter } from '~/server/api/routers/nurse';
import { patientRouter } from '~/server/api/routers/patient';
import { postRouter } from '~/server/api/routers/post';
import { userRouter } from '~/server/api/routers/user';
import { visitRouter } from '~/server/api/routers/visit';
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  hospital: hospitalRouter,
  nurse: nurseRouter,
  patient: patientRouter,
  visit: visitRouter,
  logs: logsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
