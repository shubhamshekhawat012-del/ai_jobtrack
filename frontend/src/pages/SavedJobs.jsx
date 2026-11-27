import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import JobCard from '../components/JobCard'
import EmptyState from '../components/EmptyState'
import { Bookmark, Briefcase } from 'lucide-react'

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([])
  const [jobsMap, setJobsMap] = useState({})
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    fetchSaved()
  }, [])

  const fetchSaved = async () => {
    try {
      setLoading(true)

      const [savedRes, jobsRes] = await Promise.all([
        api.get('/saved-jobs/'),
        api.get('/jobs/'),
      ])

      setSavedJobs(savedRes.data || [])

      const jMap = {}

      ;(jobsRes.data || []).forEach((j) => {
        jMap[j.id] = j
      })

      setJobsMap(jMap)
    } catch (err) {
      console.error('Failed to load saved jobs', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`)

      setSavedJobs((prev) =>
        prev.filter((item) => item.job_id !== jobId)
      )
    } catch (err) {
      console.error('Failed to remove bookmark', err)
    }
  }

  const savedList = savedJobs
    .map((s) => jobsMap[s.job_id])
    .filter(Boolean)

  return (
    <div className="page-container animate-fade-in saved-jobs-page">

      {/* Page Header */}
      <div className="page-header saved-jobs-header">
        <div>
          <h1>Saved Opportunities</h1>

          <p>
            Bookmarked positions you are targeting or researching
            for future application.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (

        <div className="saved-jobs-grid">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="card skeleton saved-jobs-skeleton"
            />
          ))}
        </div>

      ) : savedList.length > 0 ? (

        /* Saved Jobs Grid */
        <div className="saved-jobs-grid">
          {savedList.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSaved={true}
              onUnsave={handleUnsave}
            />
          ))}
        </div>

      ) : (

        /* Empty State */
        <EmptyState
          icon={Bookmark}
          title="No bookmarked jobs yet"
          description="Browse open roles and click the bookmark icon to save jobs for later application or AI analysis."
          action={
            <button
              onClick={() => navigate('/jobs')}
              className="btn btn-primary btn-sm"
            >
              <Briefcase size={16} />
              <span>Browse Jobs</span>
            </button>
          }
        />

      )}

    </div>
  )
}