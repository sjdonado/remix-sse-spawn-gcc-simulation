import invariant from 'tiny-invariant';
import { eq } from 'drizzle-orm';

import { LoaderFunctionArgs } from '@remix-run/node';

import { db } from '~/db/database.server';
import { simulationsTable } from '~/db/tables.server';

import { startSimulation } from '~/jobs/simulation.server';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.simulationId, 'Missing simulationId param');

  const [simulation] = await db
    .select()
    .from(simulationsTable)
    .where(eq(simulationsTable.id, params.simulationId))
    .limit(1);

  if (!simulation) {
    throw new Error('Simulation not found');
  }

  const stream = await startSimulation(simulation);

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
};
