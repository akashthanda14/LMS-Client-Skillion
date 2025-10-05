'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeProfile } from '@/services/authService';
import { setToken, setUser } from '@/utils/tokenStorage';
import { validatePassword, validateUsername } from '@/utils/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function CompleteProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';

  // Form state - Required fields
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form state - Optional fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      router.push('/register');
    }
  }, [userId, router]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error || 'Invalid password';
    }

    // Validate optional fields if provided
    if (username) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        errors.username = usernameValidation.error || 'Invalid username';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare profile data
      const profileData = {
        userId,
        name: name.trim(),
        password,
        ...(username && { username: username.trim().toLowerCase() }),
        ...(fullName && { fullName: fullName.trim() }),
        ...(country && { country: country.trim() }),
        ...(state && { state: state.trim() }),
        ...(zip && { zip: zip.trim() }),
      };

      const response = await completeProfile(profileData);

      // Store token and user data
      setToken(response.token);
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setIsLoading(false);

      if (err.success === false) {
        // Handle specific errors
        if (err.message?.includes('Username') && err.message?.includes('taken')) {
          setFieldErrors({ username: 'Username is already taken' });
        } else if (err.message?.includes('Password')) {
          setFieldErrors({ password: err.message });
        } else {
          setError(err.message || 'Failed to complete profile. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    }
  };

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { level: string; color: string } => {
    if (pwd.length === 0) return { level: '', color: '' };
    if (pwd.length < 8) return { level: 'Weak', color: 'text-red-500' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { level: 'Weak', color: 'text-red-500' };
    if (strength <= 4) return { level: 'Medium', color: 'text-yellow-500' };
    return { level: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (!userId) {
    return null; // Will redirect
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Just a few more details to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Required Information</h3>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                  className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={fieldErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {password && (
                  <p className={`text-sm ${passwordStrength.color}`}>
                    Password Strength: {passwordStrength.level}
                  </p>
                )}
                {fieldErrors.password && (
                  <p className="text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Optional Fields Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Optional Information</h3>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={(e) => setUsername(e.target.value.toLowerCase())}
                  disabled={isLoading}
                  className={fieldErrors.username ? 'border-red-500' : ''}
                />
                <p className="text-xs text-gray-500">Minimum 3 characters (lowercase)</p>
                {fieldErrors.username && (
                  <p className="text-sm text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Michael Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* State */}
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="Punjab"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input
                  id="zip"
                  type="text"
                  placeholder="144001"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* General Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !name.trim() || password.length < 8}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Completing Profile...
                </span>
              ) : (
                'Complete Profile & Continue'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
