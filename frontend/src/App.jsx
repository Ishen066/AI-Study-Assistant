import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudyMaterials from "./pages/StudyMaterials";
import Quiz from "./pages/Quiz";
import Progress from "./pages/Progress";
import WeakTopics from "./pages/WeakTopics";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
          path="/materials"
          element={<StudyMaterials />}
        />
        <Route
          path="/quiz/:materialId"
          element={<Quiz />}
        />
        <Route 
          path="/progress" 
          element={<Progress />} 
        />
        <Route 
          path="/weak-topics" 
          element={<WeakTopics />} 
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;