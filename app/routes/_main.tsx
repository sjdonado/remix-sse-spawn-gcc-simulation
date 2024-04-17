import { Link, Outlet } from '@remix-run/react';

export default function MainLayout() {
  return (
    <main className="flex h-screen flex-col items-center justify-start p-12">
      <Link to="home" className="underline">
        <h1 className="my-12 text-3xl font-bold">Charging Simulator</h1>
      </Link>
      <Outlet />
    </main>
  );
}
