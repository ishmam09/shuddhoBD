import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { GoogleMapsProvider } from "./context/GoogleMapsContext";
import AuthPage from "./pages/AuthPage";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import News from "./pages/News";
import AnonymousReport from "./pages/AnonymousReport";
import AssetData from "./pages/AssetData";
import Constituency from "./pages/Constituency";
import RepresentativeProfile from "./pages/RepresentativeProfile";
import MapPage from "./pages/MapPage";
import ProjectStatus from "./pages/ProjectStatus";
import ProjectTimeline from "./pages/ProjectTimeline";
import CivicAnalyst from "./pages/CivicAnalyst";

function App() {
  return (
    <GoogleMapsProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/news" element={<News />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="assets" element={<AssetData />} />
            <Route path="anonymous-report" element={<AnonymousReport />} />
            <Route path="anonymous-report" element={<AnonymousReport />} />
            <Route path="profile" element={<Profile />} />
            <Route path="constituency" element={<Constituency />} />
            <Route path="constituency/:seatId" element={<RepresentativeProfile />} />
            <Route path="map" element={<MapPage />} />
            <Route path="project-status" element={<ProjectStatus />} />
            <Route path="project-timeline/:id" element={<ProjectTimeline />} />
            <Route path="ai-analyst" element={<CivicAnalyst />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </GoogleMapsProvider>
  );
}

export default App;
