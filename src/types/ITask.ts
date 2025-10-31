export interface ITask {
  jiraId: string;
  description: string;
  status: "In Progress" | "Completed" | "To Do";
  type: "Issue" | "Bug" | "Task";
}
