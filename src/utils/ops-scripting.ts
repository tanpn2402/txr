import dayjs from 'dayjs';

import type { ITask } from '@/services/tasks/schema';

const TOTAL_EFFORT = 100;

const calcEffort = (tasks: ITask[]) => {
  const grouped = tasks.reduce<Record<string, ITask[]>>((acc, task) => {
    acc[task.date] = acc[task.date] || [];
    acc[task.date].push(task);
    return acc;
  }, {});

  const result = Object.entries(grouped).flatMap(([, group]) => {
    const perTaskEffort = Math.floor(TOTAL_EFFORT / group.length / 10) * 10;
    const total = perTaskEffort * group.length;
    let remainder = TOTAL_EFFORT - total;

    // Distribute the remainder in chunks of 10
    return group.map((task) => {
      const extra = remainder > 0 ? 10 : 0;
      remainder -= extra;
      return {
        ...task,
        effort: perTaskEffort + extra,
      };
    });
  });

  return result;
};

export const getOpsScript = (_tasks: ITask[]) => {
  const tasks = calcEffort(_tasks);
  const scripts: string[] = [];

  const groupedTasks = tasks.reduce<Record<string, typeof tasks>>((acc, task) => {
    if (!acc[task.date]) {
      acc[task.date] = [];
    }
    acc[task.date].push(task);
    return acc;
  }, {});

  for (const [date, tasks] of Object.entries(groupedTasks)) {
    const dateStr = dayjs(date).format('DD-MMM-YYYY');
    scripts.push(`
(() => {
  let el = document.evaluate(
    "//span[contains(., '${dateStr}')]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;`);
    scripts.push(`  const tr = el.closest('tr');`);
    scripts.push(`  const btnAddProjectRole = tr.querySelector('a.btnAddProjectRole');`);

    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index];
      scripts.push(`  setTimeout(() => {`);
      scripts.push(`    btnAddProjectRole.click();`);
      scripts.push(`    const nextTr = tr.nextElementSibling;`);
      scripts.push(
        `    const projectRoleContainer = nextTr.querySelectorAll('div[class="AttendanceProjectRoleContainer"]')[${index}];`
      );
      scripts.push(`    const select = projectRoleContainer.querySelector('select');`);
      scripts.push(`    const projectOptionId = 'a296a466-bf0c-433e-9e71-b13f003206b3';`);
      scripts.push(`    select.value = projectOptionId;`);
      scripts.push(`    const hiddenInput = select.nextElementSibling;`);
      scripts.push(`    hiddenInput.value = projectOptionId;`);
      scripts.push(
        `    projectRoleContainer.querySelector('input[placeholder="Effort Rate"]').value = ${task.effort};`
      );
      scripts.push(
        `    projectRoleContainer.querySelector('input[placeholder="Remark"]').value = '${task.jiraId} ${task.description}';`
      );
      scripts.push(`  }, ${index * 100});`);
    }
    scripts.push(`}).call();`);
  }

  return scripts.join('\n');
};
