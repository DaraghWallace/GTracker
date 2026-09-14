import { useState, useEffect } from "react";
import type { session, user } from "../Helpers/customTypes";
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
      return <TrainerView />;
    case "member":
      return <MemberView user={user} />;
    case "developer":
      return <TrainerView />;
    default:
      console.warn(`Unhandled userType: ${user.userType}`);
      return null;
  }
}

// ---------------- Trainer ----------------

function TrainerView() {
  const [findClientOpen, setFindClientOpen] = useState(false);
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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
      if (selectedClientId === clientId) setSelectedClientId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <button onClick={() => setFindClientOpen(!findClientOpen)}>
        {findClientOpen ? "x" : "+"} Add Client
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
              <button onClick={() => setSelectedClientId(c.userId)}>Log Session</button>
              <button onClick={() => handleRemove(c.userId)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={() => setCreateSessionOpen(!createSessionOpen)}>
        {createSessionOpen ? "x" : "+"} Create Session Plan
      </button>
      {createSessionOpen && (
        <CreateSessionForm
          clients={clients}
          selectedClientId={selectedClientId}
          onSelectClient={setSelectedClientId}
          onCreated={() => setCreateSessionOpen(false)}
        />
      )}
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

type ExerciseRow = {
  exercise: string;
  sets: string;
  toFailure: boolean;
};

function CreateSessionForm({
  clients,
  selectedClientId,
  onSelectClient,
  onCreated,
}: {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
  onCreated: () => void;
}) {
  const [focus, setFocus] = useState("");
  const [exercises, setExercises] = useState<ExerciseRow[]>([
    { exercise: "", sets: "", toFailure: false },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateExercise(index: number, field: keyof ExerciseRow, value: string | boolean) {
    setExercises((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addExerciseRow() {
    setExercises((prev) => [...prev, { exercise: "", sets: "", toFailure: false }]);
  }

  async function handleSubmit() {
    setError(null);
    if (!selectedClientId) {
      setError("Select a client first");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/sessions/for-client", {
        traineeId: selectedClientId,
        focus,
        exercises,
      });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div>
        Client:
        <select value={selectedClientId ?? ""} onChange={(e) => onSelectClient(e.target.value)}>
          <option value="" disabled>Select a client</option>
          {clients.map((c) => (
            <option key={c.userId} value={c.userId}>{c.nickname}</option>
          ))}
        </select>
      </div>

      Focus: <input value={focus} onChange={(e) => setFocus(e.target.value)} />

      {exercises.map((row, i) => (
        <div key={i}>
          Exercise: <input value={row.exercise} onChange={(e) => updateExercise(i, "exercise", e.target.value)} />
          Sets: <input value={row.sets} onChange={(e) => updateExercise(i, "sets", e.target.value)} />
          To Failure?: <input type="checkbox" checked={row.toFailure} onChange={(e) => updateExercise(i, "toFailure", e.target.checked)} />
        </div>
      ))}
      <button onClick={addExerciseRow}>+ Add Exercise</button>

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Saving..." : "Save Session"}
      </button>
    </div>
  );
}

// ---------------- Member ----------------

function MemberView({ user }: { user: user }) {
  const [coachNickname, setCoachNickname] = useState<string | null>(null);
  const [sessions, setSessions] = useState<session[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const profile = await apiGet(`/users/${user.userId}`);
        if (profile.currentTrainerId) {
          const trainer = await apiGet(`/users/${profile.currentTrainerId}`);
          setCoachNickname(trainer.nickname);
        }
        const sessionData = await apiGet("/sessions");
        setSessions(sessionData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>Coach: {coachNickname ?? "No coach assigned"}</div>
      <div>
        <h3>Sessions</h3>
        {sessions.length === 0 && <div>No sessions logged yet.</div>}
        <ul>
          {sessions.map((s) => (
            <li key={s.sessionId}>{s.date} — {s.focus ?? "Session"}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
