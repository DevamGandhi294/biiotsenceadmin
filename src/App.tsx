import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Companies from './pages/Companies';
import CompanyUsers from './pages/CompanyUsers';
import Machines from './pages/Machines';
import MachineHistory from './pages/MachineHistory';
import DeviceDataPage from './pages/DeviceData';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Companies />} />
          <Route path="/companies/:companyCode/users" element={<CompanyUsers />} />
          <Route path="/machines" element={<Machines />} />
          <Route path="/machine-history" element={<MachineHistory />} />
          {/* <Route path="/machine-history/:machineId" element={<MachineHistory />} /> */}
          <Route path="/devices" element={<DeviceDataPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;