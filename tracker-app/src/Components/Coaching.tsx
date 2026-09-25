import { useState, useEffect } from "react";
import type { exercise, user } from "../Helpers/customTypes";
import { apiGet, apiPost } from "../Helpers/api";

import "../CSS/Coaching.css";
import { FaUserPlus , FaXmark, FaMagnifyingGlass , FaHourglassHalf } from "react-icons/fa6";
import CoachClientcard from "./Elements/CoachClientCard";

type Props = {
  user: user;
  exercises: exercise[]
}


type FoundUser = {
  userId: string;
  nickname: string;
};

export default function Coaching({ user, exercises }: Props) {
  switch (user.userType) {
    case "developer":
      return <TrainerView exercises={exercises}/>;
    case "trainer":
      return <TrainerView exercises={exercises}/>;
    case "member":
      return <div>Coaching features coming soon.</div>;
    default:
      console.warn(`Unhandled userType: ${user.userType}`);
      return null;
  }
}

function TrainerView({ exercises }: { exercises: exercise[] }) {
  const [findClientOpen, setFindClientOpen] = useState(false);
  const [clients, setClients] = useState<user[]>([]);
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
    <div className="Coaching">
      <div className="tr_header">
        <div>Clients</div>

        {error && <div style={{ color: "red" }}>{error}</div>}

        <button onClick={() => setFindClientOpen(!findClientOpen)}>
          {findClientOpen ? <FaXmark/> : <FaUserPlus/>}
        </button>
      </div>

      <div className="tr_client_search">
        {findClientOpen && (
          <FindClientForm
            onAdded={() => {
              setFindClientOpen(false);
              loadClients();
            }}
          />
        )}        
      </div>


      <div className="c_content">
        {loadingClients && <div>Loading...</div>}
        {!loadingClients && clients.length === 0 && <div>No clients yet.</div>}
        {clients.map((client) => (
          <CoachClientcard key={client.userId} client={client} handleRemove={handleRemove} exercises={exercises}/>
        ))}
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
    <div className="tr_cs_input">
      {error && <div style={{ color: "red" }}>{error}</div>}
      Email: <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={handleFind} disabled={searching}>
        {searching ? <FaHourglassHalf /> : <FaMagnifyingGlass/>}
      </button>

      {found && (
        <div>
          Is this your client — <strong>{found.nickname}</strong>?
          <button onClick={handleConfirmAdd}><FaUserPlus/></button>
          <button onClick={() => setFound(null)}><FaXmark/></button>
        </div>
      )}
    </div>
  );
}