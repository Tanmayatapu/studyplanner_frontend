const priorityAccentMap = {
  high: "bg-rose-500/15 text-rose-300",
  medium: "bg-amber-500/15 text-amber-300",
  low: "bg-blue-500/15 text-blue-300",
};

export function decorateSubject(subject, progress = {}) {
  const examDate = new Date(subject.examDate);
  const topicsTotal = progress.totalTopics || 0;
  const topicsDone = progress.completedTopics || 0;
  const progressValue = typeof progress.progress === "number"
    ? progress.progress
    : topicsTotal === 0
      ? 0
      : Math.round((topicsDone / topicsTotal) * 100);

  return {
    ...subject,
    code: subject.name.slice(0, 1).toUpperCase(),
    accent: priorityAccentMap[subject.priority] || priorityAccentMap.medium,
    examIn: Math.max(0, Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24))),
    topicsTotal,
    topicsDone,
    progress: progressValue,
    pendingTopics: Math.max(0, topicsTotal - topicsDone),
    preferredStudySlotLabel: formatStudySlot(subject.preferredStudySlot),
  };
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatStudySlot(value) {
  if (!value) return "Not set";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
