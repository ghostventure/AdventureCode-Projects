import BasicLanding from "./components/BasicLanding";
import { HomeServiceBrollShowcase } from "./components/HomeServiceBroll";

export default function Home() {
  return (
    <main className="dashboard-page">
      <BasicLanding />
      <HomeServiceBrollShowcase />
    </main>
  );
}
