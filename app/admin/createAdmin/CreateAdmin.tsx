// components/CreateAdmin.tsx
import createAdminUser from "@/utils/createAdminUser";
import { getErrorMessage } from "@/utils/errorHandler";
import React, { useState } from "react";

const CreateAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleCreateAdmin = async () => {
    try {
      await createAdminUser(email, password);
      setStatus(`Admin user created successfully with email: ${email}`);
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className=" text-neutral-800">
      <h1>Create Admin User</h1>
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
      <button onClick={handleCreateAdmin}>Create Admin</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default CreateAdmin;
