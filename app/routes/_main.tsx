import { Link, Outlet } from '@remix-run/react';

export default function MainLayout() {
  return (
    <main className="flex h-screen flex-col items-center justify-start p-12">
      <div className="flex flex-col justify-center gap-4 my-12">
        <Link to="/" className="underline text-center">
          <h1 className="text-3xl font-bold">EV Charging Simulator</h1>
        </Link>
        <p className="text-slate-500">
          Optimizing Energy Consumption for Your Parking Lot. (Educational demo)
        </p>
      </div>
      <Outlet />
    </main>
  );
}
