import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import {
  loginOrRegisterUser,
  saveScore,
  getLeaderboard,
  getUserStats,
} from "./services/supabase";

type Question = {
  question: string;
  options: string[];
  answer: number;
  icon: string;
};

type User = {
  id: string;
  username: string;
  avatar_color: string;
};

type LeaderboardEntry = {
  id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  created_at: string;
  users: {
    username: string;
    avatar_color: string;
  } | null;
};

const questions: Question[] = [
  {
    question: "Apa kepanjangan HTML?",
    options: [
      "HyperText Markup Language",
      "HighText Machine Language",
      "HyperTool Multi Language",
      "Home Tool Markup Language",
    ],
    answer: 0,
    icon: "📄",
  },
  {
    question: "CSS digunakan untuk?",
    options: [
      "Mengatur database",
      "Styling halaman web",
      "Membuat server",
      "Menjalankan query",
    ],
    answer: 1,
    icon: "🎨",
  },
  {
    question: "React adalah?",
    options: [
      "Framework backend",
      "Library JavaScript",
      "Database",
      "Bahasa pemrograman",
    ],
    answer: 1,
    icon: "⚛️",
  },
  {
    question: "Vite digunakan untuk?",
    options: ["Database", "Build tool frontend", "Server hosting", "Design UI"],
    answer: 1,
    icon: "⚡",
  },
  {
    question: "Tailwind CSS bersifat?",
    options: [
      "Utility-first CSS",
      "Backend framework",
      "Database system",
      "Language programming",
    ],
    answer: 0,
    icon: "💨",
  },
  {
    question: "JSX digunakan di?",
    options: ["Vue", "React", "Laravel", "Express"],
    answer: 1,
    icon: "🔧",
  },
  {
    question: "useState digunakan untuk?",
    options: ["Routing", "State management", "Database", "Styling"],
    answer: 1,
    icon: "🔄",
  },
  {
    question: "Komponen React bersifat?",
    options: ["Reusable", "Static", "Fixed", "Server only"],
    answer: 0,
    icon: "📦",
  },
  {
    question: "Event handler React contoh?",
    options: ["onClick", "click()", "handle()", "event()"],
    answer: 0,
    icon: "👆",
  },
  {
    question: "Vite lebih cepat karena?",
    options: [
      "Menggunakan bundler lama",
      "ES modules native",
      "Tidak pakai JavaScript",
      "Hanya CSS",
    ],
    answer: 1,
    icon: "🚀",
  },
];

const PARTICLE_COUNT = 30;

function Particles() {
  return (
    <div className="particles-container">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            animationDuration: `${Math.random() * 15 + 10}s`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: Math.random() * 0.5 + 0.1,
          }}
        />
      ))}
    </div>
  );
}

function CircularProgress({
  value,
  size = 180,
  strokeWidth = 12,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const percentage = Math.round(value);

  const getColor = (pct: number) => {
    if (pct >= 80)
      return { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.3)" };
    if (pct >= 60) return { stroke: "#06b6d4", glow: "rgba(6, 182, 212, 0.3)" };
    if (pct >= 40)
      return { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.3)" };
    return { stroke: "#ef4444", glow: "rgba(239, 68, 68, 0.3)" };
  };

  const { stroke, glow } = getColor(percentage);

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-svg">
        <circle
          className="progress-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className="progress-bar"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ stroke, filter: `drop-shadow(0 0 8px ${glow})` }}
        />
      </svg>
      <div className="progress-content">
        <span className="progress-value" style={{ color: stroke }}>
          {percentage}%
        </span>
        <span className="progress-label">Skor</span>
      </div>
    </div>
  );
}

function TimerBar({ seconds, total }: { seconds: number; total: number }) {
  const percentage = (seconds / total) * 100;
  const isWarning = seconds <= 10;
  const isCritical = seconds <= 5;

  return (
    <div className="timer-container">
      <div className="timer-info">
        <svg
          className="timer-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span
          className={`timer-text ${isCritical ? "critical" : isWarning ? "warning" : ""}`}
        >
          {seconds}s
        </span>
      </div>
      <div className="timer-bar-bg">
        <div
          className={`timer-bar-fill ${isCritical ? "critical" : isWarning ? "warning" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function Avatar({
  username,
  color,
  size = 40,
}: {
  username: string;
  color: string;
  size?: number;
}) {
  const initials = username.substring(0, 2).toUpperCase();
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        fontSize: size * 0.35,
      }}
    >
      {initials}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginOrRegisterUser(username);
      onLogin(user as User);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-bg-orb orb-1 animate-pulse-glow" />
      <div className="login-bg-orb orb-2 animate-pulse-glow" />
      <div className="login-bg-orb orb-3 animate-pulse-glow" />

      <div className={`login-content ${isLoaded ? "loaded" : ""}`}>
        <div className="login-brand">
          <div className="login-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="login-title">
            Kui<span className="title-gradient">Singkat</span>
          </h1>
        </div>

        <p className="login-subtitle">Masukkan username untuk mulai ujian</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              className="login-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              disabled={loading}
            />
            <div className="input-glow" />
          </div>

          {error && (
            <div className="login-error">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !username.trim()}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="login-hint">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Tanpa password — username saja sudah cukup</span>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  user,
  onStart,
  onLogout,
}: {
  user: User;
  onStart: () => void;
  onLogout: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<{
    totalAttempts: number;
    bestScore: number;
    avgScore: number;
    totalTime: number;
  } | null>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
    getUserStats(user.id)
      .then((s) => setStats(s))
      .catch(() => {});
  }, [user.id]);

  return (
    <div className="welcome-screen">
      <div className="welcome-bg-orb orb-1 animate-pulse-glow" />
      <div className="welcome-bg-orb orb-2 animate-pulse-glow" />
      <div className="welcome-bg-orb orb-3 animate-pulse-glow" />

      <header className="welcome-header">
        <div className="welcome-brand">
          <div className="brand-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-name">KuiSingkat</span>
        </div>
        <div className="user-menu">
          <Avatar
            username={user.username}
            color={user.avatar_color}
            size={36}
          />
          <span className="user-name">{user.username}</span>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <div className={`welcome-content ${isLoaded ? "loaded" : ""}`}>
        <div className="welcome-greeting">
          <span className="greeting-emoji">👋</span>
          <div>
            <p className="greeting-text">Halo,</p>
            <h2 className="greeting-name">{user.username}!</h2>
          </div>
        </div>

        <p className="welcome-subtitle">
          Siap untuk menguji pengetahuanmu hari ini?
        </p>

        {stats && stats.totalAttempts > 0 && (
          <div className="user-stats-row">
            <div className="mini-stat">
              <span className="mini-stat-value">{stats.totalAttempts}</span>
              <span className="mini-stat-label">Percobaan</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value" style={{ color: "#10b981" }}>
                {stats.bestScore}
              </span>
              <span className="mini-stat-label">Skor Terbaik</span>
            </div>
            <div className="mini-stat">
              <span className="mini-stat-value" style={{ color: "#06b6d4" }}>
                {stats.avgScore}
              </span>
              <span className="mini-stat-label">Rata-rata</span>
            </div>
          </div>
        )}

        <div className="welcome-stats">
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <span className="stat-value">10</span>
            <span className="stat-label">Soal</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <span className="stat-value">30s</span>
            <span className="stat-label">Per Soal</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <span className="stat-value">100</span>
            <span className="stat-label">Skor Max</span>
          </div>
        </div>

        <button className="start-btn" onClick={onStart}>
          <span>Mulai Ujian</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({
  user,
  score,
  total,
  onRestart,
  timeTaken,
}: {
  user: User;
  score: number;
  total: number;
  onRestart: () => void;
  timeTaken: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [saving, setSaving] = useState(true);
  const [saveError, setSaveError] = useState("");
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);

    async function saveAndFetch() {
      try {
        await saveScore(user.id, percentage, total, score, timeTaken);
        const lb = await getLeaderboard(20);
        setLeaderboard(lb);
      } catch (err) {
        setSaveError(
          err instanceof Error ? err.message : "Gagal menyimpan skor",
        );
      } finally {
        setSaving(false);
      }
    }

    saveAndFetch();
  }, [user.id, percentage, total, score, timeTaken]);

  const getMessage = (pct: number) => {
    if (pct === 100)
      return {
        emoji: "🏆",
        text: "Sempurna!",
        sub: "Kamu menguasai semua materi",
      };
    if (pct >= 80)
      return {
        emoji: "🌟",
        text: "Luar Biasa!",
        sub: "Pemahaman yang sangat baik",
      };
    if (pct >= 60)
      return { emoji: "💪", text: "Bagus!", sub: "Terus tingkatkan belajar" };
    if (pct >= 40)
      return {
        emoji: "📚",
        text: "Cukup Baik",
        sub: "Masih perlu belajar lebih",
      };
    return {
      emoji: "🔥",
      text: "Semangat!",
      sub: "Ayo belajar lebih giat lagi",
    };
  };

  const { emoji, text, sub } = getMessage(percentage);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`results-screen ${isLoaded ? "loaded" : ""}`}>
      <div className="results-bg-orb orb-1 animate-pulse-glow" />
      <div className="results-bg-orb orb-2 animate-pulse-glow" />

      <div className="results-card">
        <div className="results-header">
          <div className="result-emoji animate-float">{emoji}</div>
          <h2 className="result-title">{text}</h2>
          <p className="result-subtitle">{sub}</p>
        </div>

        <div className="results-score">
          <CircularProgress value={percentage} />
          <div className="score-details">
            <div className="score-row">
              <span className="score-label">Benar</span>
              <span className="score-value correct">{score}</span>
            </div>
            <div className="score-row">
              <span className="score-label">Salah</span>
              <span className="score-value wrong">{total - score}</span>
            </div>
            <div className="score-row">
              <span className="score-label">Waktu</span>
              <span className="score-value">{formatTime(timeTaken)}</span>
            </div>
          </div>
        </div>

        <div className="leaderboard-section">
          <h3 className="leaderboard-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 21h8m-4-4v4m-6-8h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2z" />
            </svg>
            Leaderboard
            {saving && <span className="saving-indicator">Menyimpan...</span>}
          </h3>

          {saveError && <div className="save-error">{saveError}</div>}

          <div className="leaderboard-list">
            {leaderboard.map((entry, i) => {
              const username = entry.users?.username ?? "Unknown";
              const avatarColor = entry.users?.avatar_color ?? "#7c3aed";
              const entryPercentage = Math.round(
                (entry.score / entry.total_questions) * 100,
              );
              const isCurrentUser = username === user.username;

              return (
                <div
                  key={entry.id}
                  className={`leaderboard-item ${isCurrentUser ? "current-user" : ""}`}
                >
                  <div className="lb-rank">
                    {i === 0
                      ? "🥇"
                      : i === 1
                        ? "🥈"
                        : i === 2
                          ? "🥉"
                          : `#${i + 1}`}
                  </div>
                  <Avatar username={username} color={avatarColor} size={32} />
                  <div className="lb-info">
                    <span className="lb-name">
                      {username}{" "}
                      {isCurrentUser && <span className="lb-you">(kamu)</span>}
                    </span>
                    <span className="lb-meta">
                      {entry.correct_answers}/{entry.total_questions} benar •{" "}
                      {formatTime(entry.time_taken)}
                    </span>
                  </div>
                  <div
                    className="lb-score"
                    style={{
                      color:
                        entryPercentage >= 80
                          ? "#10b981"
                          : entryPercentage >= 60
                            ? "#06b6d4"
                            : entryPercentage >= 40
                              ? "#f59e0b"
                              : "#ef4444",
                    }}
                  >
                    {entryPercentage}%
                  </div>
                </div>
              );
            })}
            {leaderboard.length === 0 && !saving && (
              <div className="lb-empty">Belum ada skor</div>
            )}
          </div>
        </div>

        <button className="restart-btn" onClick={onRestart}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          <span>Ulangi Ujian</span>
        </button>
      </div>
    </div>
  );
}

type Screen = "login" | "welcome" | "quiz" | "results";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [user, setUser] = useState<User | null>(null);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<
    { question: string; selected: number; correct: number }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);

  const handleLogin = useCallback((u: User) => {
    setUser(u);
    setScreen("welcome");
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setScreen("login");
  }, []);

  const handleStart = useCallback(() => {
    setScreen("quiz");
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setStartTime(Date.now());
    setTotalTimeTaken(0);
  }, []);

  const handleRestart = useCallback(() => {
    setScreen("welcome");
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  const handleAnswer = useCallback(
    (index: number) => {
      if (showFeedback) return;

      setSelectedAnswer(index);
      setShowFeedback(true);

      const isCorrect = index === questions[current].answer;

      if (isCorrect) {
        setScore((s) => s + 1);
      }

      setAnswers((prev) => [
        ...prev,
        {
          question: questions[current].question,
          selected: index,
          correct: questions[current].answer,
        },
      ]);

      setTimeout(() => {
        if (current + 1 < questions.length) {
          setCurrent((c) => c + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
          setTimeLeft(30);
        } else {
          setTotalTimeTaken(Math.round((Date.now() - startTime) / 1000));
          setScreen("results");
        }
      }, 1200);
    },
    [current, showFeedback, startTime],
  );

  useEffect(() => {
    if (screen !== "quiz" || showFeedback) return;

    if (timeLeft === 0) {
      handleAnswer(-1);
      return;
    }

    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, screen, showFeedback, handleAnswer]);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (screen !== "quiz" || showFeedback) return;
      const key = parseInt(e.key);
      if (key >= 1 && key <= 4) {
        handleAnswer(key - 1);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [screen, showFeedback, handleAnswer]);

  if (screen === "login")
    return (
      <>
        <Particles />
        <LoginScreen onLogin={handleLogin} />
      </>
    );

  if (screen === "welcome" && user)
    return (
      <>
        <Particles />
        <WelcomeScreen
          user={user}
          onStart={handleStart}
          onLogout={handleLogout}
        />
      </>
    );

  if (screen === "results" && user)
    return (
      <>
        <Particles />
        <ResultsScreen
          user={user}
          score={score}
          total={questions.length}
          onRestart={handleRestart}
          timeTaken={totalTimeTaken}
        />
      </>
    );

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="quiz-screen">
      <Particles />

      <div className="quiz-bg-orb orb-1 animate-pulse-glow" />
      <div className="quiz-bg-orb orb-2 animate-pulse-glow" />

      <div className="quiz-container">
        <header className="quiz-header animate-slide-down">
          <div className="quiz-brand">
            <div className="brand-logo">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-name">ExamSpace</span>
          </div>

          <div className="quiz-progress-info">
            {user && (
              <Avatar
                username={user.username}
                color={user.avatar_color}
                size={32}
              />
            )}
            <span className="question-counter">
              Soal <span className="counter-current">{current + 1}</span> /{" "}
              <span className="counter-total">{questions.length}</span>
            </span>
            <div className="score-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>{score}</span>
            </div>
          </div>
        </header>

        <div className="progress-bar-container">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill animate-gradient"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="question-nav">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`nav-dot ${i === current ? "active" : ""} ${i < current ? "answered" : ""}`}
            >
              {i < current && answers[i]?.selected === answers[i]?.correct && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
              )}
              {i < current && answers[i]?.selected !== answers[i]?.correct && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              )}
            </button>
          ))}
        </div>

        <TimerBar seconds={timeLeft} total={30} />

        <main
          className={`question-card ${showFeedback ? (selectedAnswer === questions[current].answer ? "feedback-correct" : "feedback-wrong") : ""}`}
        >
          <div
            className={`question-header ${showFeedback ? "slide-in" : ""}`}
            key={current}
          >
            <span className="question-icon">{questions[current].icon}</span>
            <h2 className="question-text">{questions[current].question}</h2>
          </div>

          <div className="options-grid">
            {questions[current].options.map((opt, i) => {
              let optionClass = "option-btn";
              if (showFeedback) {
                if (i === questions[current].answer) optionClass += " correct";
                else if (i === selectedAnswer) optionClass += " wrong";
                else optionClass += " disabled";
              }

              return (
                <button
                  key={i}
                  className={optionClass}
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="option-text">{opt}</span>
                  {showFeedback && i === questions[current].answer && (
                    <svg
                      className="option-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  )}
                  {showFeedback &&
                    i === selectedAnswer &&
                    i !== questions[current].answer && (
                      <svg
                        className="option-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6M9 9l6 6" />
                      </svg>
                    )}
                </button>
              );
            })}
          </div>
        </main>

        <footer className="quiz-footer">
          <div className="footer-info">
            <span className="footer-text">
              Gunakan keyboard 1-4 untuk menjawab
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
