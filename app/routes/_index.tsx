import { redirect, type MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'EVs Charging Simulator' },
    { name: 'description', content: 'Run EVs charging simulations in real time' },
  ];
};

export const loader = () => {
  return redirect('/home');
};
