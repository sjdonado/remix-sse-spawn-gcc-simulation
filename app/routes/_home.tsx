import { Outlet } from '@remix-run/react';

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

export default function HomeLayout() {
  return (
    <main className="flex h-screen flex-col items-center justify-start p-12">
      <h1 className="my-12 text-3xl font-bold">Charging Simulator</h1>
      <Outlet />
    </main>
  );
}
