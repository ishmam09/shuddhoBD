import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reports" element={<Reports />} />
            <Route path="assets" element={<AssetData />} />
            <Route path="anonymous-report" element={<AnonymousReport />} />
            <Route path="news" element={<News />} />
            <Route path="profile" element={<Profile />} />
            <Route path="constituency" element={<Constituency />} />
            <Route path="constituency/:seatId" element={<RepresentativeProfile />} />
            <Route path="map" element={<MapPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
