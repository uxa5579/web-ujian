import { supabase } from "../lib/supabase";

const AVATAR_COLORS = [
  "#7c3aed", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

export async function loginOrRegisterUser(username: string) {
  const cleanUsername = username.trim();

  if (cleanUsername.length < 2) {
    throw new Error("Username minimal 2 karakter");
  }

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("id, username, avatar_color")
    .eq("username", cleanUsername)
    .maybeSingle();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    if (fetchError.message.includes("relation") || fetchError.message.includes("does not exist")) {
      throw new Error("Tabel database belum dibuat. Jalankan schema.sql di Supabase SQL Editor.");
    }
    throw new Error(fetchError.message);
  }

  if (existing) {
    return existing;
  }

  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert([{ username: cleanUsername, avatar_color: avatarColor }] as never[])
    .select("id, username, avatar_color")
    .single();

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    if (insertError.message.includes("duplicate")) {
      throw new Error("Username sudah digunakan");
    }
    if (insertError.message.includes("relation") || insertError.message.includes("does not exist")) {
      throw new Error("Tabel database belum dibuat. Jalankan schema.sql di Supabase SQL Editor.");
    }
    throw new Error(insertError.message);
  }

  return newUser;
}

export async function saveScore(userId: string, score: number, totalQuestions: number, correctAnswers: number, timeTaken: number) {
  const { data, error } = await supabase
    .from("scores")
    .insert([{
      user_id: userId,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_taken: timeTaken,
    }] as never[])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from("scores")
    .select(`
      id,
      score,
      total_questions,
      correct_answers,
      time_taken,
      created_at,
      users (
        username,
        avatar_color
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as unknown as {
    id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    time_taken: number;
    created_at: string;
    users: { username: string; avatar_color: string } | null;
  }[]) ?? [];
}

export async function getUserBestScore(userId: string) {
  const { data, error } = await supabase
    .from("scores")
    .select("score, total_questions, correct_answers, time_taken, created_at")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .from("scores")
    .select("score, correct_answers, time_taken")
    .eq("user_id", userId);

  if (error) throw error;

  const scores = data as unknown as { score: number; correct_answers: number; time_taken: number }[];

  if (!scores || scores.length === 0) {
    return { totalAttempts: 0, bestScore: 0, avgScore: 0, totalTime: 0 };
  }

  const totalAttempts = scores.length;
  const bestScore = Math.max(...scores.map((s) => s.score));
  const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalAttempts);
  const totalTime = scores.reduce((sum, s) => sum + (s.time_taken ?? 0), 0);

  return { totalAttempts, bestScore, avgScore, totalTime };
}
