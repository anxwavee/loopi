import React, { type CSSProperties, useMemo, useState } from "react";

type ThemeMode = "dark" | "light";
type Tab = "home" | "friends" | "leaderboard" | "profile";
type Accent = "blue" | "green" | "pink" | "purple";
type DayStatus = "done" | "missed" | "today" | "none";
type CalendarView = "Week" | "Month";
type LeaderboardMode = "Monthly" | "Total";
type Category = string;
type TaskStatus = "pending" | "done" | "missed";

type WeekDay = { day: string; date: number };
type Habit = { id: number; title: string; category: Category; streak: number; best: number; total: number; rate: number; progress: number; status: TaskStatus; completedDates: number[]; proof: boolean; proofUploaded: boolean; days: number[]; deadline?: number | null };
type HabitDraft = { title: string; category: Category; customCategory: string; days: number[]; deadline: number | null; customDeadline: string; proof: boolean };
type Friend = { initials: string; name: string; streak: number; done: boolean; habits: string; progress: number };
type LeaderboardItem = { initials: string; name: string; monthly: number; total: number; streak: number; emoji: string };
type HeatmapCell = { id: number; value: number };
type HeatmapMonth = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December";
type HeatmapSelection = "Jan-Mar" | "Apr-Jun" | "Jul-Sep" | "Oct-Dec";
type Colors = ReturnType<typeof makeColors>;
type Styles = Record<string, CSSProperties>;
type AppElement = React.ReactElement;

const accents: Record<Accent, string> = {
  blue: "#2F80FF",
  green: "#00C896",
  pink: "#EC4899",
  purple: "#8B5CF6",
};

const categories: Category[] = ["Health", "Learning", "Wellness", "Mind", "Creative", "New category"];

const weekDays: WeekDay[] = [
  { day: "Mon", date: 22 },
  { day: "Tue", date: 23 },
  { day: "Wed", date: 24 },
  { day: "Thu", date: 25 },
  { day: "Fri", date: 26 },
  { day: "Sat", date: 27 },
  { day: "Sun", date: 28 },
];

const todayDate = 26;
const heatmapQuarters: Record<HeatmapSelection, HeatmapMonth[]> = {
  "Jan-Mar": ["January", "February", "March"],
  "Apr-Jun": ["April", "May", "June"],
  "Jul-Sep": ["July", "August", "September"],
  "Oct-Dec": ["October", "November", "December"],
};

const initialHabits: Habit[] = [
  { id: 1, title: "Morning Exercise", category: "Health", streak: 12, best: 18, total: 87, rate: 94, progress: 0, status: "pending", completedDates: [22], proof: true, proofUploaded: false, days: [22, 24, 26, 28], deadline: 28 },
  { id: 2, title: "Read 40 minutes", category: "Learning", streak: 7, best: 14, total: 42, rate: 86, progress: 1, status: "done", completedDates: [22, 23, 26], proof: false, proofUploaded: false, days: [22, 23, 26] },
  { id: 3, title: "Drink 8 glasses of water", category: "Wellness", streak: 5, best: 10, total: 55, rate: 78, progress: 0.62, status: "pending", completedDates: [23], proof: false, proofUploaded: false, days: [23, 25, 26, 27] },
  { id: 4, title: "Meditate 15 min", category: "Mind", streak: 20, best: 24, total: 91, rate: 96, progress: 0, status: "pending", completedDates: [], proof: false, proofUploaded: false, days: [24, 26, 28] },
  { id: 5, title: "Sketch idea board", category: "Creative", streak: 3, best: 6, total: 16, rate: 72, progress: 0, status: "pending", completedDates: [], proof: true, proofUploaded: false, days: [27], deadline: 30 },
];

const friends: Friend[] = [
  { initials: "SC", name: "Sarah Chen", streak: 15, done: true, habits: "5/5", progress: 1 },
  { initials: "MW", name: "Marcus Webb", streak: 8, done: false, habits: "3/4", progress: 0.75 },
  { initials: "ER", name: "Emma Rodriguez", streak: 22, done: false, habits: "0/6", progress: 0 },
  { initials: "AK", name: "Alex Kim", streak: 5, done: false, habits: "2/3", progress: 0.67 },
  { initials: "JT", name: "Jordan Taylor", streak: 31, done: true, habits: "7/7", progress: 1 },
];

const leaderboard: LeaderboardItem[] = [
  { initials: "SC", name: "Sarah Chen", monthly: 85, total: 1880, streak: 15, emoji: "1" },
  { initials: "MW", name: "Marcus Webb", monthly: 63, total: 1420, streak: 8, emoji: "*" },
  { initials: "ER", name: "Emma Rodriguez", monthly: 60, total: 2640, streak: 22, emoji: "!" },
  { initials: "AK", name: "Alex Kim", monthly: 60, total: 970, streak: 5, emoji: "+" },
  { initials: "JT", name: "Jordan Taylor", monthly: 56, total: 3120, streak: 31, emoji: "#" },
  { initials: "JD", name: "You", monthly: 51, total: 2210, streak: 12, emoji: "me" },
];

const baseHeatmap: HeatmapCell[] = Array.from({ length: 84 }, (_, index) => {
  const pattern = [0, 0.2, 0.55, 0.85, 0.35, 0, 0.7, 1, 0.45, 0.1, 0.65, 0];
  return { id: index, value: pattern[index % pattern.length] };
});

function effectiveStatus(habit: Habit, date: number): TaskStatus {
  if (habit.completedDates.includes(date)) return "done";
  if (date < todayDate && habit.days.includes(date)) return "missed";
  return "pending";
}

function statusForDay(date: number, habits: Habit[]): DayStatus {
  const items = habits.filter((habit) => habit.days.includes(date));
  if (!items.length) return "none";
  if (items.some((habit) => effectiveStatus(habit, date) === "missed")) return "missed";
  if (items.every((habit) => effectiveStatus(habit, date) === "done")) return "done";
  return "today";
}

function profileHeatStatus(month: HeatmapMonth, date: number, habits: Habit[]): DayStatus {
  if (month === "April") {
    if (date > todayDate) return "none";
    const status = statusForDay(date, habits);
    if (status === "done") return "done";
    if (status === "missed") return "missed";
    return "none";
  }
  if (["May", "June", "July", "August", "September", "October", "November", "December"].includes(month)) return "none";
  const seed = month === "January" ? 5 : month === "March" ? 3 : 7;
  if ((date + seed) % 7 === 0 || (date + seed) % 11 === 0) return "missed";
  if ((date + seed) % 2 === 0 || (date + seed) % 5 === 0) return "done";
  return "none";
}

function daysInHeatmapMonth(month: HeatmapMonth): number {
  if (month === "February") return 28;
  if (["April", "June", "September", "November"].includes(month)) return 30;
  return 31;
}

function nearestAvailableDate(date: number): number {
  return date >= todayDate ? date : date + 7;
}

function normalizeDraftDays(days: number[], fallback: number): number[] {
  const source = days.length ? days : [fallback];
  return Array.from(new Set(source.map(nearestAvailableDate))).sort((a, b) => a - b);
}

function runTests(): void {
  console.assert(weekDays.length === 7, "mock calendar week should have 7 days");
  console.assert(statusForDay(24, initialHabits) === "missed", "past pending tasks show missed status");
  console.assert(initialHabits.every((h) => h.progress >= 0 && h.progress <= 1), "habit progress is valid");
  console.assert(baseHeatmap.length === 84, "heatmap has 84 cells");
  console.assert(leaderboard.some((item) => item.name === "You"), "leaderboard includes user");
  console.assert(Object.keys(accents).length === 4, "there should be 4 accent colors");
  console.assert(nearestAvailableDate(22) === 29, "past weekdays should roll to the nearest available date");
}
runTests();

export default function LoopiApp(): AppElement {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<Tab>("home");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [accent, setAccent] = useState<Accent>("green");
  const [calendarView, setCalendarView] = useState<CalendarView>("Week");
  const [leaderMode, setLeaderMode] = useState<LeaderboardMode>("Monthly");
  const [selectedDate, setSelectedDate] = useState(26);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [confettiKey, setConfettiKey] = useState(0);
  const [inviteSent, setInviteSent] = useState(false);
  const [draft, setDraft] = useState<HabitDraft>({ title: "", category: "Health", customCategory: "", days: [26], deadline: null, customDeadline: "", proof: false });

  const colors = useMemo(() => makeColors(theme, accent), [theme, accent]);
  const css = useMemo(() => makeCss(colors), [colors]);

  const dayHabits = habits.filter((habit) => habit.days.includes(selectedDate));
  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? null;
  const completed = dayHabits.filter((h) => effectiveStatus(h, selectedDate) === "done").length;
  const percent = dayHabits.length ? Math.round((completed / dayHabits.length) * 100) : 0;
  const xp = 120 + habits.filter((h) => h.completedDates.includes(todayDate)).length * 35;
  const xpPercent = Math.min(100, Math.round((xp / 260) * 100));

  const intro = [
    ["01", "Build better habits", "Create simple routines that are easy to repeat every day.", "loop"],
    ["02", "Keep your streak alive", "Track consistency with XP, streaks, and visual progress.", "streak"],
    ["03", "Stay accountable", "Follow friends and see who completed today.", "friends"],
    ["04", "See real progress", "Use mock calendars and heatmaps to understand your habit pattern.", "heatmap"],
  ];

  function celebrate(): void {
    setConfettiKey((key) => key + 1);
  }

  function selectDay(date: number): void {
    setSelectedDate(date);
    if (date >= todayDate) setDraft((value) => ({ ...value, days: value.days.includes(date) ? value.days : [date] }));
  }

  function updateHabitStatus(id: number, status: TaskStatus): void {
    setHabits((list) =>
      list.map((habit) => {
        if (habit.id !== id) return habit;
        if (status === "done" && habit.proof && !habit.proofUploaded) return habit;
        const alreadyDone = habit.completedDates.includes(selectedDate);
        const doneNow = status === "done" && !alreadyDone;
        const completedDates = status === "done"
          ? [...habit.completedDates, selectedDate].sort((a, b) => a - b)
          : habit.completedDates.filter((date) => date !== selectedDate);
        if (doneNow) celebrate();
        return {
          ...habit,
          status,
          completedDates,
          progress: status === "done" ? 1 : 0.45,
          streak: Math.max(0, habit.streak + (doneNow ? 1 : alreadyDone && status !== "done" ? -1 : 0)),
          total: Math.max(0, habit.total + (doneNow ? 1 : alreadyDone && status !== "done" ? -1 : 0)),
        };
      }),
    );
  }

  function toggleHabitDone(id: number): void {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;
    if (effectiveStatus(habit, selectedDate) === "done") {
      if (!window.confirm("Are you sure you want to mark this task undone?")) return;
      updateHabitStatus(id, "pending");
      return;
    }
    updateHabitStatus(id, "done");
  }

  function uploadProof(id: number): void {
    setHabits((list) =>
      list.map((habit) => {
        if (habit.id !== id) return habit;
        const canComplete = selectedDate <= todayDate && habit.days.includes(selectedDate);
        const doneNow = canComplete && !habit.completedDates.includes(selectedDate);
        if (doneNow) celebrate();
        return {
          ...habit,
          proofUploaded: true,
          status: canComplete ? "done" : habit.status,
          completedDates: canComplete && !habit.completedDates.includes(selectedDate) ? [...habit.completedDates, selectedDate].sort((a, b) => a - b) : habit.completedDates,
          progress: canComplete ? 1 : habit.progress,
          streak: Math.max(0, habit.streak + (doneNow ? 1 : 0)),
          total: Math.max(0, habit.total + (doneNow ? 1 : 0)),
        };
      }),
    );
  }

  function addHabit(): void {
    const category = draft.category === "New category" ? draft.customCategory.trim() || "Custom" : draft.category;
    const title = draft.title.trim() || `${category} habit`;
    const safeDays = normalizeDraftDays(draft.days, selectedDate);
    const deadline = draft.deadline === -1 ? Number(draft.customDeadline) || null : draft.deadline;
    setHabits((list) => [
      ...list,
      { id: Date.now(), title, category, streak: 0, best: 0, total: 0, rate: 0, progress: 0, status: "pending", completedDates: [], proof: draft.proof, proofUploaded: false, days: safeDays, deadline },
    ]);
    setSelectedDate(safeDays[0]);
    setDraft({ title: "", category: "Health", customCategory: "", days: [nearestAvailableDate(selectedDate)], deadline: null, customDeadline: "", proof: false });
    setAddOpen(false);
  }

  if (!started) {
    const [num, title, text, variant] = intro[step];
    return (
      <div style={css.phone}>
        <main style={css.welcome}>
          <div style={css.brandRow}><div style={css.brandMark}>L</div><b style={css.logo}>loopi</b></div>
          <IntroArt css={css} colors={colors} num={num} variant={variant} />
          <h1 style={css.welcomeTitle}>{title}</h1>
          <p style={css.welcomeText}>{text}</p>
          <div style={css.dots}>{intro.map((_, index) => <span key={index} style={index === step ? css.dotActive : css.dot} />)}</div>
        </main>
        <div style={css.introBottom}>
          <button style={css.primary} onClick={() => (step < intro.length - 1 ? setStep(step + 1) : setStarted(true))}>{step === intro.length - 1 ? "Get Started" : "Continue"}</button>
          <button style={css.ghost} onClick={() => setStarted(true)}>Skip intro</button>
        </div>
      </div>
    );
  }

  if (selectedHabit) {
    const selectedHabitStatus = effectiveStatus(selectedHabit, selectedDate);
    return (
      <div style={css.phone}>
        <Confetti css={css} colors={colors} confettiKey={confettiKey} />
        <main style={css.detailPage}>
          <button style={css.back} onClick={() => setSelectedHabitId(null)}>{"<"}</button>
          <h1 style={css.detailTitle}>{selectedHabit.title}</h1>
          <section style={css.streakHero}>
            <div style={css.heroLine}><span style={css.heroFlame}>*</span><span style={css.heroNumber}>{selectedHabit.streak}</span></div>
            <h2 style={css.heroLabel}>Day Streak</h2>
            <p style={css.heroBest}>Best: {selectedHabit.best} days</p>
          </section>
          <div style={css.detailStats}>
            <section style={css.detailStat}><span style={css.muted}>Total Days</span><b style={css.detailStatNumber}>{selectedHabit.total}</b></section>
            <section style={css.detailStat}><span style={css.muted}>Completion Rate</span><b style={css.detailStatNumber}>{selectedHabit.rate}%</b></section>
          </div>
          {selectedDate > todayDate && <p style={css.proofHint}>You can mark this task done on April {selectedDate}.</p>}
          {selectedHabit.proof && !selectedHabit.proofUploaded && selectedDate <= todayDate && <p style={css.proofHint}>Upload proof before marking this task done.</p>}
          <button disabled={selectedDate > todayDate || (selectedHabit.proof && !selectedHabit.proofUploaded)} style={selectedHabitStatus === "done" ? { ...css.primary, ...css.doneBtn } : selectedDate > todayDate || (selectedHabit.proof && !selectedHabit.proofUploaded) ? { ...css.primary, ...css.disabled } : css.primary} onClick={() => toggleHabitDone(selectedHabit.id)}>{selectedHabitStatus === "done" ? "Done - tap to undo" : "Mark as Complete"}</button>
          <button style={selectedHabit.proofUploaded ? { ...css.upload, ...css.uploaded } : css.upload} onClick={() => uploadProof(selectedHabit.id)}>{selectedHabit.proof ? selectedHabit.proofUploaded ? "Proof Uploaded" : "Upload Proof" : "Photo Proof Optional"}</button>
        </main>
        <BottomTabs tab={tab} setTab={setTab} css={css} colors={colors} />
      </div>
    );
  }

  return (
    <div style={css.phone}>
      <Confetti css={css} colors={colors} confettiKey={confettiKey} />
      <div style={css.app}>
        {tab === "home" && (
          <main style={css.page}>
            <Header label={`April ${selectedDate}`} title="loopi" right={<Avatar initials="JD" css={css} />} css={css} />
            <section style={css.level}>
              <div style={css.levelTop}>
                <div><b style={css.levelTitle}>Level 4</b><p style={css.muted}>{260 - xp} XP to next level</p></div>
                <div style={css.streakBadge}><span style={css.fireDot} /> {Math.max(...habits.map((h) => h.streak))} days</div>
              </div>
              <div style={css.trackLg}><div style={{ ...css.fill, width: `${xpPercent}%` }} /></div>
            </section>
            <CalendarToggle calendarView={calendarView} setCalendarView={setCalendarView} css={css} />
            {calendarView === "Week" ? (
              <MockWeekCalendar css={css} colors={colors} days={weekDays} habits={habits} selectedDate={selectedDate} onSelectDay={selectDay} />
            ) : (
              <MockMonthCalendar css={css} colors={colors} habits={habits} selectedDate={selectedDate} onSelectDay={selectDay} />
            )}
            <div style={css.statusLegend}><Legend color={colors.accent} label="Done" css={css} /><Legend color={colors.warn} label="Missed" css={css} /><Legend color={colors.pending} label="Not done" css={css} /></div>
            <div style={css.sectionHead}><div><h2 style={css.sectionTitle}>Daily Habits</h2><p style={css.smallMuted}>{completed} of {dayHabits.length} completed | {percent}%</p></div><button style={css.add} onClick={() => setAddOpen(true)}>Add</button></div>
            {dayHabits.length ? dayHabits.map((h) => <HabitCard key={h.id} habit={h} selectedDate={selectedDate} css={css} colors={colors} onToggleDone={toggleHabitDone} onUploadProof={uploadProof} onOpen={setSelectedHabitId} />) : <EmptyState css={css} text="No tasks for this day yet." />}
          </main>
        )}
        {tab === "friends" && <FriendsPage css={css} colors={colors} onInvite={() => { setInviteOpen(true); setInviteSent(false); }} />}
        {tab === "leaderboard" && <LeaderboardPage css={css} colors={colors} mode={leaderMode} setMode={setLeaderMode} />}
        {tab === "profile" && <ProfilePage css={css} colors={colors} habits={habits} setSettingsOpen={setSettingsOpen} />}
        <BottomTabs tab={tab} setTab={setTab} css={css} colors={colors} />
        {settingsOpen && <SettingsSheet css={css} colors={colors} theme={theme} accent={accent} calendarView={calendarView} notifications={notifications} setTheme={setTheme} setAccent={setAccent} setCalendarView={setCalendarView} setNotifications={setNotifications} onClose={() => setSettingsOpen(false)} />}
        {addOpen && <AddHabitSheet css={css} draft={draft} setDraft={setDraft} onSave={addHabit} onClose={() => setAddOpen(false)} />}
        {inviteOpen && <InviteSheet css={css} inviteSent={inviteSent} setInviteSent={setInviteSent} onClose={() => setInviteOpen(false)} />}
      </div>
    </div>
  );
}

function FriendsPage({ css, colors, onInvite }: { css: Styles; colors: Colors; onInvite: () => void }): AppElement {
  return <main style={css.page}><Header label="Social" title="Friends" right={<button style={css.circle} onClick={onInvite}>+</button>} css={css} /><section style={css.summary}><Summary emoji="👤" num="4" text="active today" css={css} /><Summary emoji="🔥" num="31" text="best streak" css={css} /><Summary emoji="💚" num="5" text="friends" css={css} /></section>{friends.map((f) => <FriendCard key={f.name} friend={f} css={css} colors={colors} />)}</main>;
}

function IntroArt({ css, colors, num, variant }: { css: Styles; colors: Colors; num: string; variant: string }): AppElement {
  if (variant === "streak") {
    return <div style={{ ...css.illustration, ...css.introStreak }}><span style={css.introFlame}>*</span><section style={css.introStack}><b style={css.heroNumber}>12</b><span style={css.smallMuted}>day streak</span><i style={{ ...css.introLine, width: "82%" }} /><i style={{ ...css.introLine, width: "58%", opacity: 0.58 }} /></section></div>;
  }
  if (variant === "friends") {
    return <div style={{ ...css.illustration, ...css.introFriends }}><span style={css.friendBubble}>SC</span><span style={{ ...css.friendBubble, ...css.friendBubbleBig }}>JD</span><span style={css.friendBubble}>AK</span><b style={css.introPulse}>3 friends checked in</b></div>;
  }
  if (variant === "heatmap") {
    return <div style={{ ...css.illustration, ...css.introHeat }}><div style={css.introDotGrid}>{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ ...css.introDot, background: index % 5 === 0 ? colors.warn : index % 3 === 0 ? colors.accent : colors.track, opacity: index % 4 === 0 ? 0.55 : 1 }} />)}</div></div>;
  }
  return <div style={css.illustration}><div style={css.ring}><span style={css.ringIn}>{num}</span></div><div style={css.bars}>{[36, 58, 78, 48].map((height, index) => <i key={height} style={{ ...css.bar, height, opacity: 0.45 + index * 0.15 }} />)}</div></div>;
}

function LeaderboardPage({ css, colors, mode, setMode }: { css: Styles; colors: Colors; mode: LeaderboardMode; setMode: (mode: LeaderboardMode) => void }): AppElement {
  const rows = [...leaderboard].sort((a, b) => (mode === "Monthly" ? b.monthly - a.monthly : b.total - a.total));
  const meIndex = rows.findIndex((item) => item.name === "You");
  const myScore = rows[meIndex][mode === "Monthly" ? "monthly" : "total"];
  const target = mode === "Monthly" ? 100 : 2000;
  return <main style={css.page}><Header label={mode} title="Leaderboard" right={<div style={css.rankPill}>#{meIndex + 1}</div>} css={css} /><section style={css.statCard}><div style={css.statTop}><div style={css.statBlock}><span style={css.statIcon}>🎯</span><b style={css.big}>{myScore}</b><p style={css.muted}>{mode} Points</p></div><span style={css.vLine} /><div style={css.statBlock}><span style={css.statIcon}>🏆</span><b style={{ ...css.big, color: colors.accent }}>#{meIndex + 1}</b><p style={css.muted}>Current Rank</p></div></div><div style={css.info}><span style={css.smallMuted}>{mode} qualification</span><b style={css.percent}>{myScore}/{target}</b></div><div style={css.track}><div style={{ ...css.fill, width: `${Math.min(100, Math.round((myScore / target) * 100))}%` }} /></div></section><div style={css.segments}><button style={mode === "Monthly" ? css.segmentActive : css.segment} onClick={() => setMode("Monthly")}>Monthly</button><button style={mode === "Total" ? css.segmentActive : css.segment} onClick={() => setMode("Total")}>Total</button></div>{rows.map((item, index) => <LeaderboardRow key={item.name} item={item} index={index} mode={mode} css={css} colors={colors} />)}</main>;
}

function ProfilePage({ css, colors, habits, setSettingsOpen }: { css: Styles; colors: Colors; habits: Habit[]; setSettingsOpen: (open: boolean) => void }): AppElement {
  const [month, setMonth] = useState<HeatmapSelection>("Apr-Jun");
  return <main style={css.page}><Header label="Account" title="Profile" right={<button style={css.settings} onClick={() => setSettingsOpen(true)}>Settings</button>} css={css} /><section style={css.profile}><Avatar initials="JD" css={css} size="lg" /><h2 style={css.profileName}>John Doe</h2><p style={css.muted}>Member for 45 days</p></section><h2 style={css.sectionTitle}>Statistics</h2><div style={css.stats}><SmallStat emoji="🔥" label="Current Streak" value="12" sub="days" css={css} /><SmallStat emoji="🏆" label="Best Streak" value="18" sub="days" css={css} /></div><section style={css.fullStat}><span style={css.statIcon}>✅</span><p style={css.muted}>Total</p><b style={css.medium}>87</b><p style={css.smallMuted}>habits finished</p></section><MonthlyHeatmap css={css} colors={colors} habits={habits} month={month} setMonth={setMonth} /><div style={css.achHead}><h2 style={css.sectionTitle}>Achievements</h2><span style={css.smallMuted}>3/6</span></div><div style={css.achGrid}><Achievement title="First Steps" icon="👟" active css={css} /><Achievement title="Week Warrior" icon="⚔️" active css={css} /><Achievement title="Social" icon="🤝" active css={css} /><Achievement title="Perfect Month" icon="🌕" css={css} /><Achievement title="Overachiever" icon="🚀" css={css} /><Achievement title="Legend" icon="👑" css={css} /></div></main>;
}

function Header({ label, title, right, css }: { label: string; title: string; right: React.ReactNode; css: Styles }): AppElement {
  return <div style={css.header}><div><p style={css.label}>{label}</p><h1 style={css.title}>{title}</h1></div>{right}</div>;
}
function Summary({ emoji, num, text, css }: { emoji: string; num: string; text: string; css: Styles }): AppElement {
  return <div style={css.summaryBox}><span style={css.summaryEmoji}>{emoji}</span><b style={css.summaryNum}>{num}</b><small style={css.summaryText}>{text}</small></div>;
}

function CalendarToggle({ calendarView, setCalendarView, css }: { calendarView: CalendarView; setCalendarView: (view: CalendarView) => void; css: Styles }): AppElement {
  return <div style={css.calendarToggle}><button style={calendarView === "Week" ? css.segmentActive : css.segment} onClick={() => setCalendarView("Week")}>Week</button><button style={calendarView === "Month" ? css.segmentActive : css.segment} onClick={() => setCalendarView("Month")}>Month</button></div>;
}
function dotColor(status: DayStatus, colors: Colors): string {
  if (status === "done") return colors.accent;
  if (status === "missed") return colors.warn;
  if (status === "today") return colors.pending;
  return colors.track;
}
function MockWeekCalendar({ css, colors, days, habits, selectedDate, onSelectDay }: { css: Styles; colors: Colors; days: WeekDay[]; habits: Habit[]; selectedDate: number; onSelectDay: (date: number) => void }): AppElement {
  return <div style={css.week}>{days.map((day) => { const selected = selectedDate === day.date; const status = statusForDay(day.date, habits); return <button key={day.date} onClick={() => onSelectDay(day.date)} style={selected ? { ...css.day, ...css.dayActive } : css.day}><b style={{ color: selected ? colors.white : colors.text }}>{day.date}</b><span style={{ ...css.dayText, color: selected ? colors.white : colors.muted }}>{day.day}</span><i style={{ ...css.dayDot, backgroundColor: dotColor(status, colors) }} /></button>; })}</div>;
}
function MockMonthCalendar({ css, colors, habits, selectedDate, onSelectDay }: { css: Styles; colors: Colors; habits: Habit[]; selectedDate: number; onSelectDay: (date: number) => void }): AppElement {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return <section style={css.month}><div style={css.monthHead}><b>April 2026</b><span style={css.smallMuted}>tap a day</span></div><div style={css.monthGrid}>{days.map((date) => { const selected = date === selectedDate; const status = statusForDay(date, habits); return <button key={date} onClick={() => onSelectDay(date)} style={selected ? { ...css.monthDay, ...css.monthDayActive } : css.monthDay}><span style={{ color: selected ? colors.white : colors.text }}>{date}</span><i style={{ ...css.dayDot, backgroundColor: dotColor(status, colors) }} /></button>; })}</div></section>;
}
function HabitCard({ habit, selectedDate, css, colors, onToggleDone, onUploadProof, onOpen }: { habit: Habit; selectedDate: number; css: Styles; colors: Colors; onToggleDone: (id: number) => void; onUploadProof: (id: number) => void; onOpen: (id: number) => void }): AppElement {
  const status = effectiveStatus(habit, selectedDate);
  const done = status === "done";
  const missed = status === "missed";
  const future = selectedDate > todayDate;
  const proofLocked = habit.proof && !habit.proofUploaded;
  const statusText = missed ? "Missed" : done ? "Done" : future ? `Apr ${selectedDate}` : "";
  return <section style={css.habit} onClick={() => onOpen(habit.id)}><div style={css.habitTop}><div><h3 style={css.habitTitle}>{habit.title}</h3><p style={css.muted}>{habit.category} | {habit.streak} day streak{habit.deadline ? ` | due Apr ${habit.deadline}` : ""}</p></div><span style={done ? css.donePill : missed ? css.missedPill : statusText ? css.futurePill : css.pendingPill}>{statusText}</span></div><div style={css.track}><div style={{ ...css.fill, width: `${done ? 100 : missed ? 0 : habit.progress * 100}%`, backgroundColor: missed ? colors.warn : colors.accent }} /></div>{proofLocked && !future && !missed && <p style={css.proofText}>Upload proof before marking done.</p>}<div style={habit.proof ? css.habitActionsSplit : css.habitActions}>{habit.proof && <button onClick={(event) => { event.stopPropagation(); onUploadProof(habit.id); }} style={habit.proofUploaded ? { ...css.secondary, ...css.uploaded } : css.secondary}>{habit.proofUploaded ? "Proof uploaded" : "Upload proof"}</button>}<button disabled={future || proofLocked || missed} onClick={(event) => { event.stopPropagation(); onToggleDone(habit.id); }} style={future || proofLocked || missed ? { ...css.complete, ...css.disabled } : done ? { ...css.complete, ...css.doneBtn } : css.complete}>{done ? "Done - tap to undo" : "Mark done"}</button></div></section>;
}
function FriendCard({ friend, css, colors }: { friend: Friend; css: Styles; colors: Colors }): AppElement {
  return <section style={css.friend}><Avatar initials={friend.initials} css={css} /><div style={css.friendInfo}><b style={css.friendName}>{friend.name}</b><p style={css.friendMeta}>{friend.streak} day streak | {friend.habits}</p><div style={css.track}><div style={{ ...css.fill, width: `${friend.progress * 100}%`, backgroundColor: friend.done ? colors.accent : colors.warn }} /></div></div><div style={friend.done ? css.statusDone : css.statusPending}><span>{friend.done ? "Done" : "Pending"}</span></div></section>;
}
function LeaderboardRow({ item, index, mode, css, colors }: { item: LeaderboardItem; index: number; mode: LeaderboardMode; css: Styles; colors: Colors }): AppElement {
  const me = item.name === "You";
  const points = mode === "Monthly" ? item.monthly : item.total;
  return <section style={me ? { ...css.rank, ...css.you } : css.rank}><b style={{ ...css.rankNo, color: me ? colors.accent : colors.muted }}>{index + 1}</b><Avatar initials={item.initials} css={css} /><div style={{ flex: 1 }}><b>{item.name}</b><p style={css.smallMuted}>{item.streak} day streak</p></div>{me && <span style={css.youPill}>You</span>}<b style={css.points}>{points}</b></section>;
}
function MonthlyHeatmap({ css, colors, habits, month, setMonth }: { css: Styles; colors: Colors; habits: Habit[]; month: HeatmapSelection; setMonth: (month: HeatmapSelection) => void }): AppElement {
  const visibleMonths = heatmapQuarters[month];
  return <section style={css.monthHeat}><div style={css.heatHead}><div><h2 style={css.sectionTitle}>Monthly Heatmap</h2><p style={css.smallMuted}>{month} 2026</p></div><select style={css.monthSelect} value={month} onChange={(event) => setMonth(event.currentTarget.value as HeatmapSelection)}>{(Object.keys(heatmapQuarters) as HeatmapSelection[]).map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div style={css.statusLegend}><Legend color={colors.accent} label="Done" css={css} /><Legend color={colors.warn} label="Missed" css={css} /><Legend color={colors.track} label="Unmarked" css={css} /></div><div style={css.monthHeatGrid}>{visibleMonths.flatMap((item) => [<span key={`${item}-label`} style={css.heatMonthLabel}>{item.slice(0, 3)}</span>, ...Array.from({ length: daysInHeatmapMonth(item) }, (_, index) => { const date = index + 1; const status = profileHeatStatus(item, date, habits); return <i key={`${item}-${date}`} title={`${item} ${date}: ${status}`} style={{ ...css.monthHeatDot, backgroundColor: dotColor(status, colors), opacity: status === "none" ? 0.42 : 1 }} />; })])}</div></section>;
}
function SettingsSheet(props: { css: Styles; colors: Colors; theme: ThemeMode; accent: Accent; calendarView: CalendarView; notifications: boolean; setTheme: (value: ThemeMode) => void; setAccent: (value: Accent) => void; setCalendarView: (value: CalendarView) => void; setNotifications: (value: boolean) => void; onClose: () => void }): AppElement {
  return <div style={props.css.overlay}><section style={props.css.sheet}><div style={props.css.sheetHead}><h2>Settings</h2><button style={props.css.close} onClick={props.onClose}>×</button></div><Pref css={props.css} label="Theme" value={props.theme} onClick={() => props.setTheme(props.theme === "dark" ? "light" : "dark")} /><div style={props.css.pref}><b>Accent</b><div style={props.css.colors}>{(Object.keys(accents) as Accent[]).map((accentKey) => <button key={accentKey} onClick={() => props.setAccent(accentKey)} style={{ ...props.css.colorDot, backgroundColor: accents[accentKey], outline: props.accent === accentKey ? `3px solid ${props.colors.text}` : "none" }} />)}</div></div><div style={props.css.pref}><b>Notifications</b><button onClick={() => props.setNotifications(!props.notifications)} style={props.notifications ? props.css.toggleOn : props.css.toggleOff}><i style={props.notifications ? props.css.knobOn : props.css.knobOff} /></button></div><Pref css={props.css} label="Calendar" value={props.calendarView} onClick={() => props.setCalendarView(props.calendarView === "Week" ? "Month" : "Week")} /><Pref css={props.css} label="Reminder" value="20:00" /></section></div>;
}
function AddHabitSheet({ css, draft, setDraft, onSave, onClose }: { css: Styles; draft: HabitDraft; setDraft: (value: HabitDraft) => void; onSave: () => void; onClose: () => void }): AppElement {
  function toggleDay(date: number): void {
    const nextDate = nearestAvailableDate(date);
    const days = draft.days.includes(nextDate) ? draft.days.filter((day) => day !== nextDate) : [...draft.days, nextDate].sort((a, b) => a - b);
    setDraft({ ...draft, days });
  }
  const deadlineOptions = [30, 45, 75];
  return <div style={css.overlay}><section style={css.sheet}><div style={css.sheetHead}><h2>New Task</h2><button style={css.close} onClick={onClose}>×</button></div><input style={css.input} value={draft.title} placeholder="Task name" onChange={(event) => setDraft({ ...draft, title: event.currentTarget.value })} /><label style={css.fieldLabel}>Category<select style={css.select} value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.currentTarget.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>{draft.category === "New category" && <input style={css.input} value={draft.customCategory} placeholder="Category name" onChange={(event) => setDraft({ ...draft, customCategory: event.currentTarget.value })} />}<p style={css.fieldLabel}>Days of week</p><div style={css.dayPicker}>{weekDays.map((day) => { const nextDate = nearestAvailableDate(day.date); const active = draft.days.includes(nextDate); return <button key={day.date} style={active ? css.dayChoiceActive : css.dayChoice} onClick={() => toggleDay(day.date)}><b>{day.day}</b></button>; })}</div><label style={css.fieldLabel}>Optional deadline<select style={css.select} value={draft.deadline ?? ""} onChange={(event) => setDraft({ ...draft, deadline: event.currentTarget.value ? Number(event.currentTarget.value) : null })}><option value="">No deadline</option>{deadlineOptions.map((day) => <option key={day} value={day}>Day {day}</option>)}<option value="-1">Custom</option></select></label>{draft.deadline === -1 && <input style={css.input} value={draft.customDeadline} inputMode="numeric" placeholder="Custom" onChange={(event) => setDraft({ ...draft, customDeadline: event.currentTarget.value.replace(/\D/g, "") })} />}<div style={css.pref}><b>Photo proof</b><button onClick={() => setDraft({ ...draft, proof: !draft.proof })} style={draft.proof ? css.toggleOn : css.toggleOff}><i style={draft.proof ? css.knobOn : css.knobOff} /></button></div><button style={css.primary} onClick={onSave}>Add Task</button></section></div>;
}
function InviteSheet({ css, inviteSent, setInviteSent, onClose }: { css: Styles; inviteSent: boolean; setInviteSent: (value: boolean) => void; onClose: () => void }): AppElement {
  return <div style={css.overlay}><section style={css.sheet}><div style={css.sheetHead}><h2>Add Friend</h2><button style={css.close} onClick={onClose}>×</button></div><input style={css.input} placeholder="Name or email" /><div style={css.inviteCard}><b>Invite link</b><p style={css.smallMuted}>loopi.app/invite/JD-284</p></div><button style={inviteSent ? { ...css.primary, ...css.doneBtn } : css.primary} onClick={() => setInviteSent(true)}>{inviteSent ? "Invite Sent" : "Send Invite"}</button></section></div>;
}
function Pref({ css, label, value, onClick }: { css: Styles; label: string; value: string; onClick?: () => void }): AppElement { return <button style={css.pref} onClick={onClick}><b>{label}</b><span style={css.settingValue}>{value}</span></button>; }
function SmallStat({ emoji, label, value, sub, css }: { emoji: string; label: string; value: string; sub: string; css: Styles }): AppElement { return <section style={css.smallStat}><span style={css.statIcon}>{emoji}</span><p style={css.muted}>{label}</p><b style={css.medium}>{value}</b><p style={css.smallMuted}>{sub}</p></section>; }
function Achievement({ title, icon, active, css }: { title: string; icon: string; active?: boolean; css: Styles }): AppElement { return <section style={active ? { ...css.ach, ...css.achActive } : css.ach}><div style={active ? css.badgeActive : css.badge}>{icon}</div><b style={css.achText}>{title}</b></section>; }
function Avatar({ initials, css, size = "sm" }: { initials: string; css: Styles; size?: "sm" | "lg" }): AppElement { return <div style={size === "lg" ? css.avatarLg : css.avatar}>{initials}</div>; }
function Legend({ color, label, css }: { color: string; label: string; css: Styles }): AppElement { return <span style={css.legendItem}><i style={{ ...css.statusDot, backgroundColor: color }} />{label}</span>; }
function EmptyState({ css, text }: { css: Styles; text: string }): AppElement { return <section style={css.empty}><b>{text}</b><p style={css.smallMuted}>Use Add to schedule something here.</p></section>; }
function Confetti({ css, colors, confettiKey }: { css: Styles; colors: Colors; confettiKey: number }): AppElement | null {
  if (!confettiKey) return null;
  const confettiColors = [colors.accent, colors.warn, "#FFD166", "#EF476F", colors.accentSoft];
  return <div key={confettiKey} style={css.confetti}><style>{`@keyframes loopiLeft{0%{transform:translate(-40px,120px) rotate(0);opacity:0}20%{opacity:1}100%{transform:translate(160px,-80px) rotate(220deg);opacity:0}}@keyframes loopiRight{0%{transform:translate(40px,120px) rotate(0);opacity:0}20%{opacity:1}100%{transform:translate(-160px,-80px) rotate(-220deg);opacity:0}}`}</style>{Array.from({ length: 28 }, (_, index) => { const fromLeft = index % 2 === 0; return <span key={index} style={{ ...css.confettiPiece, left: fromLeft ? `${index * 2}%` : `${96 - index * 2}%`, top: `${210 + (index % 5) * 18}px`, background: confettiColors[index % confettiColors.length], animation: `${fromLeft ? "loopiLeft" : "loopiRight"} .9s ease-out forwards`, animationDelay: `${(index % 7) * 0.03}s` }} />; })}</div>;
}
function BottomTabs({ tab, setTab, css, colors }: { tab: Tab; setTab: (tab: Tab) => void; css: Styles; colors: Colors }): AppElement {
  const items: Array<[Tab, AppElement, string]> = [["home", <HomeIcon />, "Home"], ["friends", <FriendsIcon />, "Friends"], ["leaderboard", <RankIcon />, "Rank"], ["profile", <ProfileIcon />, "Profile"]];
  return <nav style={css.tabs}>{items.map(([key, icon, label]) => { const active = tab === key; return <button key={key} onClick={() => setTab(key)} style={active ? { ...css.tab, ...css.tabActive } : css.tab}><span style={{ ...css.svg, color: active ? colors.accent : colors.muted }}>{icon}</span><small style={{ ...css.tabLabel, color: active ? colors.accent : colors.muted }}>{label}</small></button>; })}</nav>;
}
function HomeIcon(): AppElement { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></svg>; }
function FriendsIcon(): AppElement { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.6 3.2-5.5 6.5-5.5s5.7 1.9 6.5 5.5" /><path d="M16 11.5a3 3 0 1 0-.5-5.95" /><path d="M17.5 14.6c2.2.6 3.6 2.4 4 5.4" /></svg>; }
function RankIcon(): AppElement { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16" /><path d="M6 20V10h4v10" /><path d="M10 20V5h4v15" /><path d="M14 20v-8h4v8" /></svg>; }
function ProfileIcon(): AppElement { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4.5 21c1.1-4.2 3.7-6.2 7.5-6.2s6.4 2 7.5 6.2" /></svg>; }

function withAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}

function makeColors(theme: ThemeMode, accent: Accent) {
  const dark = theme === "dark";
  const accentValue = accents[accent];
  return {
    canvas: dark ? "#050505" : "linear-gradient(180deg,#FBFCFE 0%,#F1F5F9 52%,#EAF0F7 100%)",
    bg: dark ? "#050505" : "#F3F6FA",
    card: dark ? "#1A1A1A" : "#FFFFFF",
    card2: dark ? "#202020" : "#FFFFFF",
    habit: dark ? withAlpha(accentValue, "20") : withAlpha(accentValue, "12"),
    habitSoft: dark ? withAlpha(accentValue, "44") : withAlpha(accentValue, "24"),
    accentSoft: dark ? withAlpha(accentValue, "88") : withAlpha(accentValue, "38"),
    accentStrong: dark ? withAlpha(accentValue, "CC") : accentValue,
    text: dark ? "#FFFFFF" : "#101828",
    muted: dark ? "#9B9B9B" : "#475467",
    border: dark ? "#2D2D2D" : "#D8E0EA",
    track: dark ? "#2A2A2A" : "#E5EBF3",
    warn: dark ? "#FF8A00" : "#D86C00",
    pending: dark ? "#71717A" : "#7A8493",
    accent: accentValue,
    white: "#FFFFFF",
    shadow: dark ? "none" : "0 18px 34px rgba(15,23,42,.10), 0 2px 8px rgba(15,23,42,.06)",
    shadowSoft: dark ? "none" : "0 10px 22px rgba(15,23,42,.07)",
    shadowStrong: dark ? "none" : "0 26px 60px rgba(15,23,42,.16), 0 8px 18px rgba(15,23,42,.08)",
    input: dark ? "#1A1A1A" : "#F9FBFD",
  };
}

function makeCss(c: Colors): Styles {
  const btn: CSSProperties = { border: "none", cursor: "pointer", fontFamily: "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" };
  const phoneWidth = 402;
  const phoneHeight = 874;
  return {
    phone: { width: phoneWidth, minHeight: phoneHeight, margin: "0 auto", background: c.canvas, color: c.text, fontFamily: "Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif", overflow: "hidden", position: "relative", boxShadow: c.shadowStrong },
    app: { minHeight: phoneHeight, position: "relative", background: c.canvas },
    page: { padding: "48px 22px 110px", maxHeight: phoneHeight, overflowY: "auto", boxSizing: "border-box" },
    welcome: { minHeight: phoneHeight, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px 150px", boxSizing: "border-box" },
    introBottom: { position: "absolute", left: 24, right: 24, bottom: 28 },
    brandRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36 },
    brandMark: { width: 34, height: 34, borderRadius: 12, background: c.accent, color: c.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, boxShadow: c.shadowSoft },
    logo: { fontSize: 20 }, illustration: { height: 230, borderRadius: 28, background: `linear-gradient(145deg,${c.card2},${c.habit})`, border: `1px solid ${c.border}`, boxShadow: c.shadow, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, marginBottom: 34, overflow: "hidden", position: "relative" },
    ring: { width: 108, height: 108, borderRadius: 60, border: `12px solid ${c.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }, ringIn: { width: 64, height: 64, borderRadius: 32, background: c.card, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }, bars: { display: "flex", alignItems: "flex-end", gap: 8, height: 86 }, bar: { width: 14, borderRadius: 8, background: c.accent, opacity: 0.85 }, introStreak: { background: `radial-gradient(circle at 50% 30%,${c.accentSoft},${c.card2})`, flexDirection: "column", gap: 10 }, introFlame: { fontSize: 52 }, introStack: { width: 154, borderRadius: 22, background: c.card, border: `1px solid ${c.border}`, padding: 18, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, boxShadow: c.shadow }, introLine: { display: "block", height: 8, borderRadius: 999, background: c.accent }, introFriends: { gap: 12 }, friendBubble: { width: 54, height: 54, borderRadius: 27, background: c.card, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }, friendBubbleBig: { width: 78, height: 78, borderRadius: 39, background: c.accent, color: c.white, fontSize: 22 }, introPulse: { position: "absolute", bottom: 28, padding: "8px 12px", borderRadius: 999, background: c.card, border: `1px solid ${c.border}`, color: c.accent, fontWeight: 900, fontSize: 12 }, introHeat: { background: c.card2 }, introDotGrid: { display: "grid", gridTemplateRows: "repeat(6,1fr)", gridAutoFlow: "column", gap: 9 }, introDot: { width: 14, height: 14, borderRadius: 5, display: "block" }, welcomeTitle: { fontSize: 34, fontWeight: 900, textAlign: "center", margin: 0, color: c.text }, welcomeText: { color: c.muted, textAlign: "center", fontSize: 16, lineHeight: "23px", margin: "12px 0 24px" }, dots: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 30 }, dot: { width: 7, height: 7, borderRadius: 7, background: c.track }, dotActive: { width: 22, height: 7, borderRadius: 7, background: c.accent },
    primary: { ...btn, background: c.accent, color: c.white, height: 56, borderRadius: 16, fontWeight: 900, fontSize: 15, width: "100%", marginTop: 14, boxShadow: c.shadow }, ghost: { ...btn, background: "transparent", color: c.muted, height: 44, fontWeight: 800, marginTop: 8, width: "100%" }, header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }, label: { color: c.muted, fontSize: 12, fontWeight: 900, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.7 }, title: { fontSize: 27, fontWeight: 900, margin: 0, color: c.text },
    avatar: { width: 42, height: 42, borderRadius: 21, background: c.input, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, border: `1px solid ${c.border}`, boxShadow: c.shadowSoft }, avatarLg: { width: 84, height: 84, borderRadius: 42, background: c.card, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 25, fontWeight: 900, margin: "0 auto", boxShadow: c.shadow }, circle: { ...btn, width: 44, height: 44, borderRadius: 22, background: c.accent, color: c.white, fontSize: 24, boxShadow: c.shadowSoft }, rankPill: { padding: "10px 14px", borderRadius: 999, background: c.card, border: `1px solid ${c.border}`, color: c.accent, fontWeight: 900, boxShadow: c.shadowSoft },
    level: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 24, padding: 20, marginBottom: 14, boxShadow: c.shadow }, levelTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, levelTitle: { fontSize: 22, fontWeight: 900 }, streakBadge: { display: "flex", alignItems: "center", gap: 7, background: c.bg, border: `1px solid ${c.border}`, padding: "9px 12px", borderRadius: 999, fontWeight: 900, fontSize: 12 }, fireDot: { width: 8, height: 8, borderRadius: 8, background: c.accent, boxShadow: `0 0 12px ${c.accent}` },
    calendarToggle: { display: "grid", gridTemplateColumns: "1fr 1fr", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 4, marginBottom: 14 },
    trackLg: { height: 10, background: c.track, borderRadius: 999, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(15,23,42,.08)" }, track: { height: 6, background: c.track, borderRadius: 99, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(15,23,42,.08)" }, fill: { height: "100%", background: c.accent, borderRadius: 99, transition: "width .22s ease" }, week: { display: "flex", gap: 10, overflowX: "auto", marginBottom: 10, paddingBottom: 4 }, day: { ...btn, flex: "0 0 58px", height: 74, background: c.card, borderRadius: 18, border: `1px solid ${c.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: c.shadowSoft }, dayActive: { background: c.accent, border: `1px solid ${c.accent}`, boxShadow: c.shadow }, dayText: { fontSize: 12, marginTop: 3, fontWeight: 800 }, dayDot: { width: 6, height: 6, borderRadius: 99, display: "block", marginTop: 6 },
    month: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 22, padding: 16, marginBottom: 10, boxShadow: c.shadow }, monthHead: { display: "flex", justifyContent: "space-between", marginBottom: 12 }, monthGrid: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }, monthDay: { ...btn, height: 42, borderRadius: 12, background: "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }, monthDayActive: { background: c.accent },
    statusLegend: { display: "flex", gap: 12, marginBottom: 20 }, legendItem: { display: "flex", alignItems: "center", gap: 5, color: c.muted, fontSize: 11, fontWeight: 800 },
    sectionHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }, sectionTitle: { fontSize: 17, fontWeight: 900, margin: "0 0 8px", color: c.text }, smallMuted: { color: c.muted, fontSize: 11, margin: 0 }, muted: { color: c.muted, fontSize: 13, margin: 0 }, add: { ...btn, background: c.accent, color: c.white, height: 36, padding: "0 16px", borderRadius: 999, fontWeight: 900 },
    habit: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 22, padding: 18, marginBottom: 14, boxShadow: c.shadow }, habitTitle: { margin: "0 0 4px", fontSize: 16, lineHeight: "20px" }, habitTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 15 }, donePill: { minWidth: 58, height: 30, borderRadius: 999, background: c.habit, color: c.accent, border: `1px solid ${c.accent}`, fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }, missedPill: { minWidth: 64, height: 30, borderRadius: 999, background: c.card, color: c.warn, border: `1px solid ${c.warn}`, fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }, futurePill: { minWidth: 74, minHeight: 30, borderRadius: 999, background: c.card, color: c.muted, border: `1px solid ${c.border}`, fontWeight: 900, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 9px", textAlign: "center" }, pendingPill: { minWidth: 0 }, proofText: { color: c.warn, fontSize: 12, fontWeight: 800, margin: "10px 0 0" }, habitActions: { display: "grid", gridTemplateColumns: "1fr", gap: 8, marginTop: 14, alignItems: "center" }, habitActionsSplit: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12, alignItems: "center" }, secondary: { ...btn, height: 44, borderRadius: 14, color: c.text, background: c.bg, border: `1px solid ${c.border}`, fontWeight: 900, fontSize: 11 }, complete: { ...btn, width: "100%", height: 44, borderRadius: 14, color: c.white, background: c.accent, fontWeight: 900, fontSize: 12 }, doneBtn: { background: c.habit, color: c.accent, border: `1px solid ${c.accent}` }, disabled: { opacity: 0.55, cursor: "not-allowed", background: c.track, color: c.muted },
    empty: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 20, padding: 20, textAlign: "center", marginBottom: 14 },
    heat: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 22, padding: 18, marginTop: 4, marginBottom: 18, boxShadow: c.shadow }, heatHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }, legend: { display: "flex", alignItems: "center", gap: 4, color: c.muted, fontSize: 11 }, legendDot: { width: 8, height: 8, borderRadius: 3 }, heatGrid: { display: "grid", gridTemplateColumns: "repeat(12,1fr)", gridAutoRows: 18, gap: 5 }, heatCell: { width: 18, height: 18, borderRadius: 5 }, monthHeat: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 22, padding: 18, marginBottom: 20, boxShadow: c.shadow }, monthSelect: { height: 38, borderRadius: 14, border: `1px solid ${c.border}`, background: c.card, color: c.text, padding: "0 10px", fontWeight: 900, maxWidth: 132 }, monthHeatGrid: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, paddingTop: 4 }, heatMonthLabel: { flex: "0 0 100%", color: c.muted, fontSize: 11, fontWeight: 900, marginTop: 8 }, monthHeatDay: { height: 36, borderRadius: 12, background: c.card, border: `1px solid ${c.border}`, color: c.muted, fontSize: 10, fontWeight: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }, monthHeatDot: { width: 11, height: 11, borderRadius: 4, display: "block", flex: "0 0 auto" },
    detailPage: { padding: "42px 22px 110px", maxHeight: phoneHeight, overflowY: "auto", boxSizing: "border-box" }, back: { ...btn, width: 42, height: 42, borderRadius: 21, color: c.text, background: c.card, border: `1px solid ${c.border}`, fontSize: 22, marginBottom: 18 }, detailTitle: { fontSize: 28, fontWeight: 900, margin: "0 0 18px", lineHeight: "34px", color: c.text }, streakHero: { background: `linear-gradient(160deg,${c.accent},${c.accentStrong})`, color: c.white, borderRadius: 26, padding: 24, textAlign: "center", marginBottom: 18, boxShadow: c.shadow }, heroLine: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }, heroFlame: { fontSize: 34 }, heroNumber: { fontSize: 58, lineHeight: "62px", fontWeight: 900 }, heroLabel: { fontSize: 19, margin: "6px 0 2px", color: c.white }, heroBest: { margin: 0, opacity: 0.86 }, detailStats: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, detailStat: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 18, padding: 16, boxShadow: c.shadow }, detailStatNumber: { display: "block", fontSize: 26, marginTop: 6 }, proofHint: { color: c.warn, fontSize: 12, fontWeight: 800, margin: "12px 0 0", textAlign: "center" }, upload: { ...btn, width: "100%", height: 52, borderRadius: 16, background: c.card, border: `1px solid ${c.border}`, color: c.text, fontWeight: 900, marginTop: 12 }, uploaded: { border: `1px solid ${c.accent}`, background: c.habit, color: c.accent },
    summary: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }, summaryBox: { minHeight: 104, background: c.card2, border: `1px solid ${c.border}`, borderRadius: 18, padding: "14px 10px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 5, textAlign: "center", boxShadow: c.shadow, boxSizing: "border-box" }, summaryEmoji: { display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, lineHeight: "28px" }, summaryNum: { fontSize: 20, lineHeight: "22px" }, summaryText: { color: c.muted, fontSize: 11, lineHeight: "14px" },
    statCard: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: c.shadow }, statTop: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "stretch", gap: 14, marginBottom: 18 }, statBlock: { minHeight: 112, background: c.card, border: `1px solid ${c.border}`, borderRadius: 18, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, textAlign: "center", boxSizing: "border-box" }, statIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 26, lineHeight: "30px", marginBottom: 6 }, big: { display: "block", fontSize: 30, lineHeight: "34px", fontWeight: 900 }, vLine: { width: 1, minHeight: 84, background: c.border, alignSelf: "center" }, info: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, percent: { color: c.accent, fontSize: 12 }, segments: { display: "grid", gridTemplateColumns: "1fr 1fr", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 4, marginBottom: 14 }, segment: { ...btn, height: 38, borderRadius: 12, background: "transparent", color: c.muted, fontWeight: 900 }, segmentActive: { ...btn, height: 38, borderRadius: 12, background: c.accent, color: c.white, fontWeight: 900 },
    settings: { ...btn, height: 38, padding: "0 14px", borderRadius: 999, background: c.card, border: `1px solid ${c.border}`, color: c.text, fontWeight: 900 }, profile: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 24, padding: 22, textAlign: "center", marginBottom: 20, boxShadow: c.shadow }, profileName: { margin: "14px 0 4px", fontSize: 20, color: c.text }, stats: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }, smallStat: { minHeight: 126, background: c.card2, border: `1px solid ${c.border}`, borderRadius: 20, padding: 14, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: c.shadow, boxSizing: "border-box" }, fullStat: { background: c.card2, border: `1px solid ${c.border}`, borderRadius: 20, padding: 18, textAlign: "center", marginBottom: 20, boxShadow: c.shadow }, medium: { display: "block", fontSize: 30, fontWeight: 900, marginTop: 4 }, achHead: { display: "flex", justifyContent: "space-between", alignItems: "center" }, achGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }, ach: { minHeight: 104, background: c.card2, border: `1px solid ${c.border}`, borderRadius: 18, padding: 8, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: c.shadow }, achActive: { border: `1px solid ${c.accent}`, background: c.habit }, badge: { width: 36, height: 36, borderRadius: 18, background: "transparent", color: c.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24 }, badgeActive: { width: 36, height: 36, borderRadius: 18, background: c.accent, color: c.white, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22 }, achText: { fontSize: 11, lineHeight: "14px", opacity: 0.85 },
    friend: { display: "flex", alignItems: "center", gap: 12, background: c.card2, border: `1px solid ${c.border}`, borderRadius: 20, padding: "16px 14px", marginBottom: 12, boxShadow: c.shadow }, friendInfo: { flex: 1, minWidth: 0, paddingRight: 6 }, friendName: { display: "block", lineHeight: "19px", marginBottom: 3 }, friendMeta: { color: c.muted, fontSize: 11, lineHeight: "15px", margin: "0 0 7px" }, status: { minWidth: 58, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, color: c.muted, fontSize: 11, fontWeight: 900 }, statusDone: { minWidth: 64, height: 30, borderRadius: 999, background: c.habit, color: c.accent, border: `1px solid ${c.accent}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }, statusPending: { minWidth: 70, height: 30, borderRadius: 999, background: c.card, color: c.warn, border: `1px solid ${c.warn}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900 }, statusDot: { width: 9, height: 9, borderRadius: 9 }, rank: { display: "flex", alignItems: "center", gap: 10, background: c.card2, border: `1px solid ${c.border}`, borderRadius: 18, padding: 13, marginBottom: 10, boxShadow: c.shadow }, you: { border: `1px solid ${c.accent}`, background: c.habit }, rankNo: { width: 20, textAlign: "center" }, lbEmoji: { minWidth: 22, textAlign: "center", fontSize: 13, color: c.accent, fontWeight: 900 }, youPill: { padding: "5px 8px", borderRadius: 999, background: c.accent, color: c.white, fontSize: 10, fontWeight: 900 }, points: { color: c.accent, minWidth: 44, textAlign: "right" },
    overlay: { position: "absolute", inset: 0, background: "rgba(0,0,0,.48)", display: "flex", alignItems: "flex-end", zIndex: 10 }, sheet: { width: "100%", maxHeight: 620, overflowY: "auto", background: c.card2, borderTop: `1px solid ${c.border}`, borderRadius: "26px 26px 0 0", padding: "18px 18px 26px", boxSizing: "border-box", boxShadow: "0 -18px 40px rgba(0,0,0,.22)" }, sheetHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, color: c.text }, close: { ...btn, width: 38, height: 38, borderRadius: 19, background: c.bg, color: c.text, fontSize: 24 }, pref: { ...btn, width: "100%", minHeight: 50, background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "0 12px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, color: c.text, textAlign: "left", boxSizing: "border-box" }, settingValue: { color: c.muted, fontSize: 12, fontWeight: 900, maxWidth: 96, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "right" }, colors: { display: "flex", gap: 8, flexShrink: 0 }, colorDot: { ...btn, width: 26, height: 26, borderRadius: 13 }, toggleOn: { ...btn, width: 50, height: 30, borderRadius: 999, background: c.accent, padding: 3, flexShrink: 0 }, toggleOff: { ...btn, width: 50, height: 30, borderRadius: 999, background: c.track, padding: 3, flexShrink: 0 }, knobOn: { display: "block", width: 24, height: 24, borderRadius: 12, background: c.white, marginLeft: 20 }, knobOff: { display: "block", width: 24, height: 24, borderRadius: 12, background: c.white },
    input: { width: "100%", height: 50, borderRadius: 16, border: `1px solid ${c.border}`, background: c.input, color: c.text, padding: "0 14px", boxSizing: "border-box", marginBottom: 12, fontFamily: "inherit", boxShadow: "inset 0 1px 2px rgba(15,23,42,.05)" }, formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }, fieldLabel: { color: c.muted, fontSize: 11, fontWeight: 900, display: "block", margin: "0 0 10px" }, select: { width: "100%", height: 44, marginTop: 6, borderRadius: 14, border: `1px solid ${c.border}`, background: c.input, color: c.text, padding: "0 10px", boxSizing: "border-box" }, dayPicker: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, margin: "8px 0 14px" }, dayChoice: { ...btn, height: 46, borderRadius: 13, background: c.card, border: `1px solid ${c.border}`, color: c.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, boxShadow: c.shadowSoft }, dayChoiceActive: { ...btn, height: 46, borderRadius: 13, background: c.accent, border: `1px solid ${c.accent}`, color: c.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, boxShadow: c.shadowSoft }, dayChoiceDisabled: { ...btn, height: 46, borderRadius: 13, background: c.track, border: `1px solid ${c.border}`, color: c.muted, opacity: 0.45, cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }, inviteCard: { background: c.habit, border: `1px solid ${c.border}`, borderRadius: 16, padding: 14, marginBottom: 4 },
    confetti: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 11, overflow: "hidden" }, confettiPiece: { position: "absolute", width: 8, height: 14, borderRadius: 3, opacity: 0 },
    tabs: { position: "absolute", left: 16, right: 16, bottom: 18, height: 72, background: c.card2, border: `1px solid ${c.border}`, borderRadius: 24, display: "grid", gridTemplateColumns: "repeat(4,1fr)", alignItems: "center", padding: 6, boxSizing: "border-box", boxShadow: c.shadow }, tab: { ...btn, height: 58, borderRadius: 18, background: "transparent", color: c.muted, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, fontWeight: 900 }, tabActive: { background: c.habit }, svg: { width: 22, height: 22, display: "flex" }, tabLabel: { display: "block", fontSize: 10 },
  };
}
