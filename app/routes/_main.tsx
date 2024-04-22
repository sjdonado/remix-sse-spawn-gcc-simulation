import { Link, Outlet } from '@remix-run/react';

export default function MainLayout() {
  return (
    <main className="flex h-screen flex-col items-center justify-start p-8">
      <div className="flex flex-col items-center justify-center gap-4 my-8">
        <Link to="/" className="underline">
          <h1 className="text-3xl font-bold">EV Charging Simulator</h1>
        </Link>
        <p className="text-slate-500 text-center">
          Optimizing Energy Consumption for Your Parking Lot. (Educational demo)
        </p>
      </div>
      <Outlet />
    </main>
  );
}
