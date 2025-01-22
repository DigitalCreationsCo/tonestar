import { GoToApp } from "@/components/go-to-app-button";
import { App } from "@/lib/App";

export default function Hero() {
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <div className="gap-6 flex-col flex place-items-center">
        <h1 className='font-mono font-black text-7xl tracking-wide'>{App.name}</h1>
        <h2 className="text-xl">{App.description}</h2>
        <GoToApp size="lg" className="rounded-lg p-8 text-xl" />
      </div>
    </main>
  );
}
