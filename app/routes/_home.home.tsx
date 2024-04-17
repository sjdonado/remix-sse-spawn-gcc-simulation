import { sql, eq } from 'drizzle-orm';
import { deepParseJson } from 'deep-parse-json';

import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, validationError } from 'remix-validated-form';

import { useLoaderData } from '@remix-run/react';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';

import { db } from '~/db/database.server';
import { simulationsResultsTable, simulationsTable } from '~/db/tables.server';
import { CreateSimulationSchema, SerializedSimulationSchema } from '~/schemas/simulation';

import { logger } from '~/utils/logger.server';

import CharingValuesDayGraph from '../components/CharingValuesDayGraph';
import ChargingPointsGraph from '../components/ChargingPointsGraph';
import ChargingSummaryTable from '../components/ChargingSummaryTable';
import { Input } from '~/components/Input';

const validator = withZod(CreateSimulationSchema);

export const action = async ({ request }: ActionFunctionArgs) => {
  const fieldValues = await validator.validate(await request.formData());

  if (fieldValues.error) {
    logger.error(fieldValues.error);
    return validationError(fieldValues.error);
  }

  const { numChargePoints, arrivalMultiplier, carConsumption, chargingPower } =
    fieldValues.data;

  const [simulation] = await db
    .insert(simulationsTable)
    .values({
      numChargePoints,
      arrivalMultiplier,
      carConsumption,
      chargingPower,
    })
    .returning();

  return redirect(`/home?id=${simulation.id}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const simulationId = url.searchParams.get('id');

  if (!simulationId) {
    return null;
  }

  const sqSimulationResults = db
    .select({
      simulationId: simulationsResultsTable.simulationId,
      results: sql`
            json_group_array(
              json_object(
                'totalEnergyCharged', ${simulationsResultsTable.totalEnergyCharged},
                'chargingValuesPerHour', ${simulationsResultsTable.chargingValuesPerHour},
                'chargingEvents', ${simulationsResultsTable.chargingEvents},
                'createdAt', ${simulationsResultsTable.createdAt},
                'updatedAt', ${simulationsResultsTable.updatedAt}
              )
            ) `.as('results'),
    })
    .from(simulationsResultsTable)
    .groupBy(simulationsResultsTable.simulationId)
    .as('sqSimulationResults');

  const [simulation] = await db
    .select({
      id: simulationsTable.id,
      status: simulationsTable.status,
      numChargePoints: simulationsTable.numChargePoints,
      arrivalMultiplier: simulationsTable.arrivalMultiplier,
      carConsumption: simulationsTable.carConsumption,
      chargingPower: simulationsTable.chargingPower,
      results: sql`COALESCE(${sqSimulationResults.results}, '[]')`.as('results'),
      createdAt: simulationsTable.createdAt,
      updatedAt: simulationsTable.updatedAt,
    })
    .from(simulationsTable)
    .leftJoin(
      sqSimulationResults,
      eq(sqSimulationResults.simulationId, simulationsTable.id)
    )
    .where(eq(simulationsTable.id, simulationId as string))
    .limit(1);

  const serializedSimulation = await SerializedSimulationSchema.parseAsync({
    ...simulation,
    results: deepParseJson(simulation.results),
  });

  return serializedSimulation;
};

export default function HomePage() {
  const simulation = useLoaderData<typeof loader>();

  return (
    <div className="flex w-full flex-col gap-12">
      <ValidatedForm
        validator={validator}
        method="post"
        className="m-auto flex max-w-3xl flex-col gap-4"
      >
        <div className="flex gap-4">
          <Input name="numChargePoints" type="number" label="Number of charge points" />
          <Input
            name="arrivalMultiplier"
            type="number"
            min={20}
            max={200}
            label="Arrival Multiplier"
          />
          <Input name="carConsumption" type="number" label="Car Consumption" />
          <Input name="chargingPower" type="number" label="Charging Power" />
        </div>
        <button type="submit" className="btn">
          Submit
        </button>
      </ValidatedForm>
      {simulation?.results && simulation.results.length > 0 && (
        <div className="flex flex-col gap-8">
          <ChargingSummaryTable
            totalEnergyCharged={simulation.results[0].totalEnergyCharged}
            chargingEvents={simulation.results[0].chargingEvents}
          />
          <ChargingPointsGraph data={simulation.results[0].chargingValuesPerHour} />
          <CharingValuesDayGraph data={simulation.results[0].chargingValuesPerHour} />
        </div>
      )}
    </div>
  );
}
