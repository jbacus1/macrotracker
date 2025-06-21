# ⚙️ Cursor Development Rules – Offline Macro Tracker

- 🤔 **Always Ask First**
  - Before implementing a new feature, ask clarifying questions about the desired behavior, user experience, and necessity.
  - Never assume feature complexity — default to the simplest viable version unless told otherwise.

- 🌒 **Dark Mode First**
  - All UI should look clean and readable in dark mode by default.
  - Support system theme switching gracefully.

- 🧹 **Keep It Simple**
  - Avoid feature creep — prefer fewer buttons, screens, and toggles.
  - Any new addition should serve a clear daily-use need.
  - Favor clean, minimal UI and minimal user input steps.

- 💾 **Data Philosophy**
  - Store only what’s necessary — minimize saved data to reduce sync, clutter, and confusion.
  - Long-term data (for charts, summaries) should be compact and date-based.
  - Discard transient data (like entry logs) when no longer useful.

- 🧪 **Dev Process**
  - Test in Expo Go as a first-class use case — all features must function smoothly there.
  - Use Expo tools for builds, and ensure sideloading via AltStore remains smooth and valid.

- ⚠️ **User Experience**
  - Avoid disruptive alerts, confirmations, or toasts unless there's an error or unexpected behavior.
  - All inputs should be robust against empty or malformed input without punishing the user.

- 🧱 **Scalability Mindset**
  - Design components and state in a way that could be easily extended to support:
    - Editing and deleting entries
    - Summarizing historical data
    - Charting or analytics views

- 🧭 **Navigation**
  - Keep all navigation within the existing tab structure unless a strong user-facing case justifies adding screens or modals.

- 🧘 **Zero-Distraction Interface**
  - Every change should prioritize reducing user friction and cognitive load.
