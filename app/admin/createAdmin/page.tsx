"use client";
import { auth } from "@/app/firebase/config";
import createAdminUser from "@/utils/createAdminUser";
import { getErrorMessage } from "@/utils/errorHandler";
import { getUserRole } from "@/utils/getUserRole";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CreateAdminProps {}

const CreateAdmin: React.FC<CreateAdminProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const role = await getUserRole(currentUser.uid); 
        if (role !== "admin") {
          router.push("/admin/access-denied"); // Redirect to an access denied page or home
        } else {
          setIsAdmin(true);
        }
      } else {
        router.push("/admin/access-denied"); // Redirect if no user is signed in
      }
    };
    checkUserRole();
  }, [router]);

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      await createAdminUser({ email, password, confirmPassword });
      setStatus(`Admin user created successfully with email: ${email}`);
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="text-neutral-800">
      <h1>Create Admin User</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button onClick={handleCreateAdmin}>
          {" "}
          {loading ? "Creating..." : "Create Admin"}
        </button>
        {status && <p className="text-green-500">{status}</p>}
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </div>
  );
};

export default CreateAdmin;
