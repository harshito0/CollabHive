import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, User, Briefcase, MapPin, Code2, Sparkles } from 'lucide-react';
import { db, auth } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../layout/ToastContainer';
import './ProfileSetup.css';

const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'Java', 'Machine Learning', 'UI/UX Design',
  'Flutter', 'Vue.js', 'Django', 'PostgreSQL', 'MongoDB', 'Docker',
  'Kubernetes', 'Data Science', 'Next.js', 'TypeScript', 'GraphQL', 'AWS'
];

const INTEREST_OPTIONS = [
  'Web Development', 'AI / ML', 'Hackathons', 'Open Source', 'EdTech', 
  'FinTech', 'Web3 / Blockchain', 'Mobile Apps', 'Game Dev', 'Competitive Programming'
];

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User },
  { id: 2, title: 'Profession', icon: Briefcase },
  { id: 3, title: 'Skills', icon: Code2 },
  { id: 4, title: 'Interests', icon: Sparkles },
];

export function ProfileSetup({ isOpen, onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    profession: '',
    year: '',
    college: '',
    location: '',
    skills: [],
    interests: [],
    availability: '',
    github: '',
    linkedin: '',
  });

  if (!isOpen) return null;

  const update = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const toggleSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleInterest = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleFinish = async () => {
    // Basic validation for production readiness
    if (!profile.name.trim() || !profile.profession || profile.skills.length === 0) {
      toast.error('Please provide your name, profession, and at least one skill.');
      setCurrentStep(1); // Redirect to start if basic info is missing
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const finalProfile = {
        ...profile,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        collabScore: 50, // Starting score
        isProfileComplete: true,
        createdAt: serverTimestamp(),
        lastSynced: new Date().toISOString(),
        stats: {
          tasksCompleted: 0,
          hoursCollaborated: 0,
          projectsJoined: 0
        }
      };
      
      await setDoc(userRef, finalProfile);
      toast.success("Your developer profile is live! 🚀");
      onComplete(finalProfile);
    } catch (err) {
      console.error('Profile Save Error:', err);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal glass-panel animation-fade-in">

        {/* Step Progress Bar */}
        <div className="step-bar">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className={`step-node ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}>
                <div className="step-icon-box">
                  {currentStep > step.id ? <Check size={16} /> : <step.icon size={16} />}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`step-line ${currentStep > step.id ? 'active' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="step-content animation-fade-in">
            <h2 className="step-title">Tell us about yourself</h2>
            <p className="text-muted mb-6">This helps teammates find and connect with you.</p>
            
            <div className="form-group">
              <label>Your Full Name *</label>
              <input className="form-input" placeholder="e.g. Harshit Singh" value={profile.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <div className="icon-input">
                <MapPin size={16} className="input-icon" />
                <input className="form-input" placeholder="e.g. Lucknow, India" value={profile.location} onChange={e => update('location', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Short Bio</label>
              <textarea className="form-input" rows={3} placeholder="A few words about yourself, your goals, or what you're working on..." value={profile.bio} onChange={e => update('bio', e.target.value)} />
            </div>
          </div>
        )}

        {/* STEP 2: Profession */}
        {currentStep === 2 && (
          <div className="step-content animation-fade-in">
            <h2 className="step-title">Your professional background</h2>
            <p className="text-muted mb-6">Tell us about your role and studies.</p>
            
            <div className="form-group">
              <label>Profession / Role *</label>
              <select className="form-input" value={profile.profession} onChange={e => update('profession', e.target.value)}>
                <option value="">Select your role...</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>Full Stack Developer</option>
                <option>UI/UX Designer</option>
                <option>Data Scientist / AI Engineer</option>
                <option>Mobile Developer</option>
                <option>DevOps Engineer</option>
                <option>Student (Other)</option>
              </select>
            </div>
            <div className="form-group">
              <label>College / University</label>
              <input className="form-input" placeholder="e.g. IIT Kanpur" value={profile.college} onChange={e => update('college', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Current Year of Study</label>
              <select className="form-input" value={profile.year} onChange={e => update('year', e.target.value)}>
                <option value="">Select year...</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Postgraduate</option>
                <option>Working Professional</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>GitHub<span className="text-muted"> (optional)</span></label>
                <input className="form-input" placeholder="github.com/yourname" value={profile.github} onChange={e => update('github', e.target.value)} />
              </div>
              <div className="form-group">
                <label>LinkedIn<span className="text-muted"> (optional)</span></label>
                <input className="form-input" placeholder="linkedin.com/in/yourname" value={profile.linkedin} onChange={e => update('linkedin', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Skills */}
        {currentStep === 3 && (
          <div className="step-content animation-fade-in">
            <h2 className="step-title">What are your skills?</h2>
            <p className="text-muted mb-6">Select all that apply. This helps us match you with the right team.</p>
            <div className="tags-grid">
              {SKILL_OPTIONS.map(skill => (
                <button
                  key={skill}
                  type="button"
                  className={`tag-toggle ${profile.skills.includes(skill) ? 'selected' : ''}`}
                  onClick={() => toggleSkill(skill)}
                >
                  {profile.skills.includes(skill) && <Check size={12} />}
                  {skill}
                </button>
              ))}
            </div>
            <div className="form-group mt-6">
              <label>Weekly Availability</label>
              <select className="form-input" value={profile.availability} onChange={e => update('availability', e.target.value)}>
                <option value="">How many hours per week?</option>
                <option>Less than 5 hrs/week</option>
                <option>5–10 hrs/week</option>
                <option>10–20 hrs/week</option>
                <option>20+ hrs/week (Full-time)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: Interests */}
        {currentStep === 4 && (
          <div className="step-content animation-fade-in">
            <h2 className="step-title">What excites you? 🚀</h2>
            <p className="text-muted mb-6">Your interests power the AI recommendation engine and team matchmaking.</p>
            <div className="tags-grid">
              {INTEREST_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  className={`tag-toggle interest ${profile.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {profile.interests.includes(interest) && <Check size={12} />}
                  {interest}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="step-nav flex-between mt-8">
          <button
            className="btn-secondary flex-center gap-2"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {currentStep < 4 ? (
            <button
              className="btn-primary flex-center gap-2"
              onClick={() => setCurrentStep(prev => prev + 1)}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn-primary flex-center gap-2"
              onClick={handleFinish}
              disabled={!profile.name.trim() || loading}
            >
              <Check size={16} /> {loading ? 'Saving...' : 'Complete Profile!'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
