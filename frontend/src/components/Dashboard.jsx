import { createSignal, onCleanup, onMount } from "solid-js";

const Dashboard = () => {
  const [dashboardDisplay, setDashboardDisplay] = createSignal(false);

  const toggleDashboard = () => {
    setDashboardDisplay(!dashboardDisplay());
  };

  return (
    <div
      class="absolute w-[40vw] flex flex-col h-[90vh]
    items-center gap-0.5 mt-[10vh] ml-[60vw] bg-black
    border-solid border-2 border-indigo-600"
    >
      <span class="text-white">Dashboard</span>
    </div>
  );
};

export default Dashboard;
