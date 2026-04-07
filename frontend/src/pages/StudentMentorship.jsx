import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { studentMentorshipApi } from '../services/api';



export default function StudentMentorship() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Track requested mentor statuses from DB
  const [requestsMap, setRequestsMap] = useState({});

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    try {
      setLoading(true);
      const [mentorsRes, statusRes] = await Promise.all([
        studentMentorshipApi.getRecommendedMentors(),
        studentMentorshipApi.getMyRequests()
      ]);
      
      const fetchedMentors = mentorsRes.data;
      setRequestsMap(statusRes.data || {});
      
      if (fetchedMentors && fetchedMentors.length > 0) {
        setMentors(fetchedMentors);
      } else {
        setMentors([]);
      }
    } catch (err) {
      console.error('Failed to load mentors:', err);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenRequest(mentor) {
    setSelectedMentor(mentor);
    setTopic('');
    setErrorMsg('');
    setSuccessMsg('');
  }

  function handleCloseRequest() {
    setSelectedMentor(null);
    setTopic('');
    setErrorMsg('');
    setSuccessMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg('Topic cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      await studentMentorshipApi.createRequest({
        mentorId: selectedMentor._id,
        topic: topic.trim()
      });

      setSuccessMsg('Mentorship request sent successfully!');
      
      // Update local state to reflect the new pending request
      setRequestsMap(prev => ({ ...prev, [selectedMentor._id]: 'pending' }));
      
      // Close modal after a short delay
      setTimeout(() => {
        handleCloseRequest();
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to send request. It might be a duplicate.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <Navbar title="Find a Mentor" subtitle="Connect with alumni for guidance and support" />

      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <p className="text-slate-500">Loading recommended mentors...</p>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-800 mb-4">🔥 Recommended Mentors for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => {
                const mentorStatus = requestsMap[mentor._id];
              const isRequested = !!mentorStatus;
              
              const statusLabels = {
                pending: 'Request Sent ⏳',
                accepted: 'Accepted ✅',
                rejected: 'Rejected ❌'
              };
              
              const buttonText = isRequested ? statusLabels[mentorStatus] || 'Request Sent' : 'Request Mentorship';
              
              return (
                <div key={mentor._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-slate-800">{mentor.name}</h3>
                      {mentor.similarityScore !== undefined && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {mentor.similarityScore}% Match
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{mentor.email}</p>
                    <div className="mt-3 space-y-1">
                      {mentor.designation && mentor.designation !== 'N/A' && (
                        <p className="text-xs text-slate-600">{mentor.designation}</p>
                      )}
                      {mentor.company && mentor.company !== 'N/A' && (
                        <p className="text-xs font-semibold text-slate-700">{mentor.company}</p>
                      )}
                    </div>

                    {mentor.skills && mentor.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {mentor.skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-full border border-slate-200">
                            {skill}
                          </span>
                        ))}
                        {mentor.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-semibold align-middle mt-1 ml-1">+{mentor.skills.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleOpenRequest(mentor)}
                    disabled={isRequested}
                    className={`mt-6 py-2 rounded-lg text-sm font-semibold transition-colors
                      ${isRequested 
                        ? 'bg-emerald-50 text-emerald-600 cursor-not-allowed border border-emerald-200' 
                        : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm'
                      }`}
                  >
                    {buttonText}
                  </button>
                </div>
              );
              })}
            </div>
          </>
        )}
      </div>

      {/* Request Modal Inline Overlay */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Request Mentorship</h3>
              <button onClick={handleCloseRequest} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                You are requesting mentorship from <strong className="text-slate-800">{selectedMentor.name}</strong>.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100">
                  {successMsg}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Topic / Area of Interest</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="E.g., Career advice in Data Science..."
                  rows="3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={handleCloseRequest}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || successMsg !== ''}
                  className="px-5 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
