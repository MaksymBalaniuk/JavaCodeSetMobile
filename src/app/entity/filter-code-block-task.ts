export interface FilterCodeBlockTask {
  name: string;
  completed: boolean;
  subtasks?: FilterCodeBlockTask[];
}
