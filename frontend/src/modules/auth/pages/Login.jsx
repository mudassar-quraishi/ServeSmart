import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import ContactSupportModal from '../../../components/ContactSupportModal';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(username, password);
      if (role === 'SUPER_ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/order');
      }
    } catch (_err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-background flex items-center justify-center font-body-md text-body-md text-on-surface antialiased p-md md:p-0">
      <main className="w-full max-w-[420px]">
        {/* Brand / Logo Area */}
        <div className="flex flex-col items-center mb-xl">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-md shadow-soft">
            <span className="material-symbols-outlined text-on-primary text-[24px]">restaurant</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">ServeSmart</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Enterprise ERP</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-[12px] p-xl shadow-soft border border-surface-variant">
          <h2 className="font-headline-md text-headline-md mb-md text-on-surface">Sign In</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-xl">Access your restaurant management dashboard.</p>

          {error && (
            <div className="mb-md p-sm bg-error-container text-on-error-container rounded-lg font-body-md text-body-md">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-sm uppercase" htmlFor="username">Username / ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-[20px]">person</span>
                </div>
                <input
                  className="block w-full pl-xl pr-sm py-[10px] bg-surface border border-surface-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
                  id="username"
                  name="username"
                  placeholder="e.g. mgr_smith"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-sm">
                <label className="block font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="password">Password</label>
                <a className="font-label-md text-label-md text-secondary hover:text-secondary-container transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline-variant text-[20px]">lock</span>
                </div>
                <input
                  className="block w-full pl-xl pr-sm py-[10px] bg-surface border border-surface-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-colors"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-sm py-[10px] bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors rounded-[12px] font-label-md text-label-md uppercase flex items-center justify-center gap-sm disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>

        {/* Footer / Support */}
        <div className="mt-lg text-center">
          <p className="font-label-md text-label-md text-outline">
            Need help?{' '}
            <button
              type="button"
              onClick={() => setShowSupport(true)}
              className="text-on-surface-variant hover:text-primary transition-colors underline cursor-pointer"
            >
              Contact Support
            </button>
          </p>
        </div>
      </main>

      <ContactSupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}
