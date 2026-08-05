import { useState } from 'react';
import axios from 'axios';

export default function ContactSupportModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:8080/api/v1/support/tickets', form);
      setSuccess(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Failed to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-md">
      <div className="bg-surface-container-lowest rounded-[16px] shadow-elevated w-full max-w-[480px] overflow-hidden border border-outline-variant animate-in">
        {/* Header */}
        <div className="bg-primary-container px-xl py-lg flex items-center justify-between">
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-on-primary-container text-[24px]">support_agent</span>
            <h2 className="font-headline-md text-headline-md text-on-primary-container">Contact Support</h2>
          </div>
          <button onClick={handleClose} className="text-on-primary-container/60 hover:text-on-primary-container transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className="p-xl flex flex-col items-center text-center gap-md">
            <div className="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-on-tertiary-fixed-variant">check_circle</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Request Submitted!</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Your support ticket has been created successfully. Our admin team will review it and get back to you shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-md px-xl py-sm bg-primary-container text-on-primary-container rounded-[12px] font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-xl flex flex-col gap-md">
            <p className="font-body-md text-body-md text-on-surface-variant mb-sm">
              Having trouble signing in or need help? Submit a support request below.
            </p>

            {error && (
              <div className="p-sm bg-error-container text-on-error-container rounded-lg font-body-md text-body-md">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase" htmlFor="support-name">Your Name</label>
              <input
                id="support-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase" htmlFor="support-email">Email Address</label>
              <input
                id="support-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase" htmlFor="support-subject">Subject</label>
              <select
                id="support-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
              >
                <option value="">Select a topic...</option>
                <option value="Login Issue">Login Issue</option>
                <option value="Account Locked">Account Locked</option>
                <option value="Password Reset">Password Reset</option>
                <option value="System Error">System Error</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs uppercase" htmlFor="support-message">Message</label>
              <textarea
                id="support-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your issue..."
                className="w-full px-md py-sm border border-outline-variant rounded-lg bg-surface font-body-md text-body-md text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-md mt-sm">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-sm border border-outline-variant rounded-[12px] font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-sm bg-secondary text-on-secondary rounded-[12px] font-label-md text-label-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-xs"
              >
                {loading ? 'Submitting...' : 'Submit'}
                {!loading && <span className="material-symbols-outlined text-[16px]">send</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
