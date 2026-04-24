import { useState } from "react";
import "./App.css";
import Sidebar from "./Components/Sidebar";
import Teacher from "./Pages/Teacher";
import TeacherPosition from "./Pages/TeacherPosition";

const PAGES = {
  teacher: <Teacher />,
  "teacher-position": <TeacherPosition />,
};

function App() {
  const [active, setActive] = useState("teacher");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 overflow-auto">{PAGES[active]}</main>
    </div>
  );
}

export default App;
