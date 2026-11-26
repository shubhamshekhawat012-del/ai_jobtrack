import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingScreen from './components/LoadingScreen'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Applications from './pages/Applications'
import SavedJobs from './pages/SavedJobs'
import Resume from './pages/Resume'
import ResumeAnalyzer from './pages/ResumeAnalyzer'
import JobMatch from './pages/JobMatch'
import CoverLetter from './pages/CoverLetter'
import InterviewPrep from './pages/InterviewPrep'
import CareerAdvisor from './pages/CareerAdvisor'
import LearningRoadmap from './pages/LearningRoadmap'
import Profile from './pages/Profile'
import './App.css'

function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingScreen />

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/resumes" element={<Resume />} />
          <Route path="/ai/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/ai/job-match" element={<JobMatch />} />
          <Route path="/ai/cover-letter" element={<CoverLetter />} />
          <Route path="/ai/interview-prep" element={<InterviewPrep />} />
          <Route path="/ai/career-advisor" element={<CareerAdvisor />} />
          <Route path="/ai/learning-roadmap" element={<LearningRoadmap />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
