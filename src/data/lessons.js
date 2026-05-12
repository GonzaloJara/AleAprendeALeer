// Returns all lessons with sort_order <= the target lesson's sort_order (cumulative).
export function getLessonsUpTo(lessons, lessonId) {
  const target = lessons.find(l => l.id === lessonId)
  if (!target) return lessons
  return lessons.filter(l => l.sort_order <= target.sort_order)
}
