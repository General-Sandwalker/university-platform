import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Phone, MapPin, Calendar, Shield, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0 w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {user?.status}
              </span>
            </div>
            <p className="text-gray-600">CIN: {user?.cin}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-gray-900">{user?.email}</p>
            </div>
          </div>
          {user?.phoneNumber && (
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{user.phoneNumber}</p>
              </div>
            </div>
          )}
          {user?.address && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{user.address}</p>
              </div>
            </div>
          )}
          {user?.dateOfBirth && (
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                <p className="text-gray-900">{format(new Date(user.dateOfBirth), 'PPP')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Details */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Details</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Account Status</p>
                <p className="text-gray-900 capitalize">{user?.status}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Verification</p>
                <p className="text-gray-900">
                  {user?.isEmailVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Member Since</p>
                <p className="text-gray-900">
                  {user?.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Information - Only for Department Heads */}
      {user?.role === 'department_head' && user?.department && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Department Information</h2>
          <div className="flex items-start space-x-3">
            <Building2 className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-gray-900 font-semibold">{user.department.name}</p>
              {user.department.code && (
                <p className="text-sm text-gray-600 mt-1">Code: {user.department.code}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
