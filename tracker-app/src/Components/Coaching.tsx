import { useState, useEffect } from "react";
import type { user } from "../Helpers/customTypes";
import { apiGet, apiPost } from "../Helpers/api";

type Props = {
  user: user;
}

type Client = {
  userId: string;
  nickname: string;
};

type FoundUser = {
  userId: string;
  nickname: string;
};

export default function Coaching({ user }: Props) {
  switch (user.userType) {
    case "trainer":
    case "developer":
      return <TrainerView />;
    case "member":
      return <div>Coaching features coming soon.</div>;
    default:
      console.warn(`Unhandled userType: ${user.userType}`);
      return null;
  }
}

function TrainerView() {
  const [findClientOpen, setFindClientOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadClients() {
    setLoadingClients(true);
    try {
      const data = await apiGet("/coaching/clients");
      setClients(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingClients(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleRemove(clientId: string) {
    try {
      await apiPost("/coaching/remove-client", { clientId });
      setClients((prev) => prev.filter((c) => c.userId !== clientId));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <button onClick={() => setFindClientOpen(!findClientOpen)}>
        {findClientOpen ? "x" : "+"}
      </button>
      {findClientOpen && (
        <FindClientForm
          onAdded={() => {
            setFindClientOpen(false);
            loadClients();
          }}
        />
      )}

      <div>
        <h3>Clients</h3>
        {loadingClients && <div>Loading...</div>}
        {!loadingClients && clients.length === 0 && <div>No clients yet.</div>}
        <ul>
          {clients.map((c) => (
            <li key={c.userId}>
              {c.nickname}
              <button onClick={() => handleRemove(c.userId)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FindClientForm({ onAdded }: { onAdded: () => void }) {
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<FoundUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFind() {
    setError(null);
    setFound(null);
    if (!email) return;
    setSearching(true);
    try {
      const result = await apiGet(`/coaching/find-user?email=${encodeURIComponent(email)}`);
      setFound(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSearching(false);
    }
  }

  async function handleConfirmAdd() {
    if (!found) return;
    try {
      await apiPost("/coaching/add-client", { clientId: found.userId });
      onAdded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      Email: <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleFind} disabled={searching}>
        {searching ? "..." : "?"}
      </button>

      {found && (
        <div>
          Is this your client — <strong>{found.nickname}</strong>?
          <button onClick={handleConfirmAdd}>Confirm & Add</button>
          <button onClick={() => setFound(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}