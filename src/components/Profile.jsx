import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateUserDetails } from "../redux/auth/authSlice";

const API_BASE = "http://localhost:8080/api/v1/user";

const getErrorText = (error, fallback) => {
  const data = error.response?.data;
  if (typeof data === "string" && data) return data;
  if (data?.message) return data.message;
  return fallback;
};

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Details State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.sub || "");
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState({ type: "", text: "" });

  // Password State
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });

  const authConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsDetailsLoading(true);
    setDetailsMessage({ type: "", text: "" });

    try {
      // id is kept for now; once the backend reads the id from the
      // authenticated user, it is ignored and can be removed.
      const response = await axios.patch(
        `${API_BASE}/update-details`,
        { id: user.userId, name: name.trim(), email: email.trim() },
        authConfig(),
      );

      // Backend returns { name, email, token }; the old token is now stale
      localStorage.setItem("token", response.data.token);
      dispatch(updateUserDetails(response.data));

      setDetailsMessage({
        type: "success",
        text: "Profile details updated successfully!",
      });
    } catch (error) {
      setDetailsMessage({
        type: "error",
        text: getErrorText(
          error,
          "Failed to update details. Please try again.",
        ),
      });
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    setIsPasswordLoading(true);

    try {
      await axios.patch(
        `${API_BASE}/update-password`,
        {
          id: user.userId,
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        },
        authConfig(),
      );

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: getErrorText(error, "Failed to update password."),
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.sub || user.email || "");
    }
  }, [user]);

  const detailsUnchanged =
    name.trim() === (user?.name || "") &&
    email.trim() === (user?.sub || user?.email || "");

  return (
    <div className="min-h-screen bg-gray-950 p-8 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 border-l-4 border-red-600 pl-4">
          Account Settings
        </h1>

        {/* Profile Details Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Profile Details</h2>

          {detailsMessage.text && (
            <div
              className={`p-4 rounded mb-6 ${detailsMessage.type === "success" ? "bg-green-900/30 text-green-400 border border-green-900" : "bg-red-900/30 text-red-400 border border-red-900"}`}
            >
              {detailsMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdateDetails} className="space-y-6">
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isDetailsLoading || detailsUnchanged}
                className="bg-gray-200 text-gray-900 hover:bg-white disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-bold tracking-wide transition-colors"
              >
                {isDetailsLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Change Password</h2>

          {passwordMessage.text && (
            <div
              className={`p-4 rounded mb-6 ${passwordMessage.type === "success" ? "bg-green-900/30 text-green-400 border border-green-900" : "bg-red-900/30 text-red-400 border border-red-900"}`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-2 font-medium">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full bg-gray-800 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  isPasswordLoading ||
                  !passwords.oldPassword ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword
                }
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-bold tracking-wide transition-colors"
              >
                {isPasswordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
