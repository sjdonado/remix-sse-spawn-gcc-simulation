import { sql, eq } from 'drizzle-orm';
import { deepParseJson } from 'deep-parse-json';

import { useCallback, useEffect, useState } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, validationError } from 'remix-validated-form';

import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
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
import ProgressBar from '~/components/ProgressBar';
import ChargingSummaryTable from '../components/ChargingSummaryTable';
import ChargingDemandPerHour from '~/components/ChargingDemandPerHour';
import ChargingEventsPerDay from '~/components/ChargingEventsPerDay';

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

  return redirect(`?id=${simulationId}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const simulationId = url.searchParams.get('id');

  const sqSimulationResults = db
    .select({
      simulationId: simulationsResultsTable.simulationId,
      results: sql`
        json_group_array(
          json_object(
            'id', ${simulationsResultsTable.id},
            'totalEnergyConsumed', ${simulationsResultsTable.totalEnergyConsumed},
            'maxPowerDemand', ${simulationsResultsTable.maxPowerDemand},
            'theoreticalMaxPowerDemand', ${simulationsResultsTable.theoreticalMaxPowerDemand},
            'concurrencyFactor', ${simulationsResultsTable.concurrencyFactor},
            'chargingEvents', ${simulationsResultsTable.chargingEvents},
            'createdAt', ${simulationsResultsTable.createdAt}
          )
          ORDER BY ${simulationsResultsTable.createdAt} DESC
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

  if (!simulation) {
    return null;
  }

  const serializedSimulation = await SerializedSimulationSchema.parseAsync({
    ...simulation,
    results: deepParseJson(simulation.results),
  });

  return serializedSimulation;
};

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const simulation = useLoaderData<typeof loader>();

  const [loading, setLoading] = useState<
    { time: string; percentage: number; message: string } | undefined
  >();

  const startSearchJob = useCallback(async () => {
    if (simulation?.status === SimulationStatus.Scheduled) {
      const eventSource = new EventSource(`/simulation/${simulation?.id}/start`);

      eventSource.onmessage = event => {
        const [time, percentage, message, payload] = event.data.split('|');

        setLoading({ time, percentage: Number(percentage), message });

        if (message == RESULTS_MESSAGE) {
          const newSimulationResult = deepParseJson(payload);
          Object.assign(simulation, {
            status: SimulationStatus.Success,
            results: [newSimulationResult, ...simulation.results],
          });
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
  }, []);

  const simulationResultId = searchParams.get('result') ?? simulation?.results?.[0]?.id;
  const simulationResult = simulation?.results.find(
    result => result.id === simulationResultId
  );

  console.log('rendering', simulation);

  return (
    <div className="flex w-full flex-col gap-12 pb-8">
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
      {simulation?.status === SimulationStatus.Running && loading && (
        <ProgressBar progress={loading.percentage} message={loading.message} />
      )}
      {simulation?.status === SimulationStatus.Success && simulationResult && (
        <div className="flex flex-col gap-8">
          <h2 className="text-xl font-bold">
            Simulation {simulationResult.id.split('-')[0]} ({simulationResult.createdAt})
          </h2>
          <ChargingSummaryTable
            totalEnergyConsumed={simulationResult.totalEnergyConsumed}
            chargingEvents={simulationResult.chargingEvents}
            maxPowerDemand={simulationResult.maxPowerDemand}
            theoreticalMaxPowerDemand={simulationResult.theoreticalMaxPowerDemand}
            concurrencyFactor={simulationResult.concurrencyFactor}
          />
          <ChargingDemandPerHour data={simulationResult.chargingEvents} />
          <ChargingEventsPerDay data={simulationResult.chargingEvents} />
        </div>
      )}
      {simulation?.status === SimulationStatus.Success &&
        simulation.results.length > 1 && (
          <div className="flex flex-col gap-8 mt-8">
            <h2 className="text-xl font-bold">Previous results</h2>
            <div className="flex flex-col gap-2">
              {simulation.results.map(result => (
                <Link
                  key={result.id}
                  to={`?id=${simulation.id}&result=${result.id}`}
                  className="flex justify-between border-b pb-2"
                >
                  <p className="underline">Simulation {result.id.split('-')[0]} </p>{' '}
                  <span>{simulationResult?.createdAt}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
