import { useForm, useFieldArray } from "react-hook-form";
import { useCreateTask } from "./services/tasks/tasks";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskFormSchema } from "./services/tasks/schema";

export default function App() {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      tasks: [
        {
          jiraId: "123",
          description: "",
          status: "In Progress",
          type: "Issue",
        },
      ],
    },
  });

  const { fields, append } = useFieldArray({ control, name: "tasks" });

  const mutation = useCreateTask({
    onSuccess: () => {
      reset();
    },
    onError: () => {
      control.setError("root", {
        message: "❌ Failed to submit",
      });
    },
  });

  const onSubmit = (data: any) =>
    mutation.mutate({
      jiraId: "123",
      description: "",
      status: "In Progress",
      type: "Issue",
    });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Worked Tasks</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-4 gap-4 items-start border rounded-lg p-4 bg-white shadow-sm"
          >
            {/* JIRA ID */}
            <div>
              <input
                type="text"
                placeholder="JIRA ID"
                {...register(`tasks.${index}.jiraId`)}
                className="border rounded p-2 w-full"
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                placeholder="Description"
                rows={2}
                {...register(`tasks.${index}.description`)}
                className={`border rounded p-2 w-full resize-none ${
                  errors.tasks?.[index]?.description ? "border-red-500" : ""
                }`}
              />
              {errors.tasks?.[index]?.description && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.tasks[index].description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <select
                {...register(`tasks.${index}.status`)}
                className="border rounded p-2 w-full"
              >
                <option>In Progress</option>
                <option>Development Done</option>
                <option>Open</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <select
                {...register(`tasks.${index}.type`)}
                className="border rounded p-2 w-full"
              >
                <option>Issue</option>
                <option>Plan</option>
              </select>
            </div>
          </div>
        ))}

        {/* Add + Submit buttons */}
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() =>
              append({
                jiraId: "",
                description: "",
                status: "In Progress",
                type: "Issue",
              })
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Add New
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            {mutation.isPending ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {/* {message && (
        <p className="mt-4 text-center font-medium text-gray-700">{message}</p>
      )} */}
    </div>
  );
}
