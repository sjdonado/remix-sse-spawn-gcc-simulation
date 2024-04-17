import { sql, eq } from 'drizzle-orm';
import { deepParseJson } from 'deep-parse-json';

import { useCallback, useEffect, useState } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, validationError } from 'remix-validated-form';

import { useLoaderData } from '@remix-run/react';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';

import { db } from '~/db/database.server';
import { simulationsResultsTable, simulationsTable } from '~/db/tables.server';
import { CreateSimulationSchema, SerializedSimulationSchema } from '~/schemas/simulation';

import { logger } from '~/utils/logger.server';
import {
  DONE_JOB_MESSAGE,
  RESULTS_MESSAGE,
  SimulationStatus,
} from '~/constants/simulation';

import { scheduleSimulation } from '~/services/simulation.server';

import { Input } from '~/components/Input';
import CharingValuesDayGraph from '../components/CharingValuesDayGraph';
import ChargingPointsGraph from '../components/ChargingPointsGraph';
import ChargingSummaryTable from '../components/ChargingSummaryTable';
import ProgressBar from '~/components/ProgressBar';

const validator = withZod(CreateSimulationSchema);

export const action = async ({ request }: ActionFunctionArgs) => {
  const fieldValues = await validator.validate(await request.formData());

  if (fieldValues.error) {
    logger.error(fieldValues.error);
    return validationError(fieldValues.error);
  }

  const { numChargePoints, arrivalMultiplier, carConsumption, chargingPower } =
    fieldValues.data;

  const simulationId = await scheduleSimulation(
    numChargePoints,
    arrivalMultiplier,
    carConsumption,
    chargingPower
  );

  return redirect(`/home?id=${simulationId}`);
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
            'totalEnergyConsumed', ${simulationsResultsTable.totalEnergyConsumed},
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

  const [loading, setLoading] = useState<
    { time: string; percentage: number; message: string } | undefined
  >();

  const startSearchJob = useCallback(async () => {
    if (simulation && simulation?.status === SimulationStatus.Scheduled) {
      const eventSource = new EventSource(`/simulation/${simulation?.id}/start`);

      eventSource.onmessage = event => {
        const [time, percentage, message, payload] = event.data.split('|');

        setLoading({ time, percentage: Number(percentage), message });

        if (message == RESULTS_MESSAGE) {
          simulation.results = deepParseJson(payload);
        }

        if (message === DONE_JOB_MESSAGE) {
          eventSource.close();
          setTimeout(() => {
            setLoading(undefined);
          }, 500);
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [simulation]);

  useEffect(() => {
    startSearchJob();
  }, [startSearchJob]);

  return (
    <div className="flex w-full flex-col gap-12">
      <ValidatedForm
        validator={validator}
        method="post"
        className="m-auto flex max-w-3xl flex-col gap-4"
      >
        <div className="flex gap-4">
          <Input
            name="numChargePoints"
            type="number"
            label="Number of charge points"
            defaultValue={simulation?.numChargePoints ?? 5}
          />
          <Input
            name="arrivalMultiplier"
            type="number"
            label="Arrival Multiplier"
            min={20}
            max={200}
            defaultValue={simulation?.arrivalMultiplier ?? 100}
          />
          <Input
            name="carConsumption"
            type="number"
            label="Car Consumption"
            defaultValue={simulation?.carConsumption ?? 18}
          />
          <Input
            name="chargingPower"
            type="number"
            label="Charging Power"
            defaultValue={simulation?.chargingPower ?? 11}
          />
        </div>
        <button type="submit" className="btn">
          Submit
        </button>
      </ValidatedForm>
      {loading && <ProgressBar progress={loading.percentage} message={loading.message} />}
      {simulation?.results && simulation.results.length > 0 && (
        <div className="flex flex-col gap-8">
          <ChargingSummaryTable
            totalEnergyConsumed={simulation.results[0].totalEnergyConsumed}
            chargingEvents={simulation.results[0].chargingEvents}
          />
          <ChargingPointsGraph
            data={simulation.results[0].chargingValuesPerHour.slice(0, 24)}
          />
          <CharingValuesDayGraph
            data={simulation.results[0].chargingValuesPerHour.slice(0, 24)}
          />
        </div>
      )}
    </div>
  );
}
