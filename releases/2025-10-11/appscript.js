
function getSheet(name, createIdNotExist = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet && createIdNotExist) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(["", ""]); // Header row -> leave it empty now
  }
  return sheet;
}

function getSheetData(name) {
  Logger.log("[getSheetData]: " + name);
  const sheet = getSheet(name);
  if (!sheet) {
    Logger.log("[getSheetData]: " + name + " not found!");
    return ({ success: false, error: "Sheet not found" });
  }
  const data = sheet.getDataRange().getValues();
  Logger.log("[getSheetData]: " + JSON.stringify(data));
  return {
    success: true,
    data: JSON.stringify(data),
  };
}

function generateUniqueId({ id = "" }, index = 0) {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timestamp = now.getTime().toString(36); // base36 timestamp
  return `${datePart}#${id}#${index}#${timestamp}`;
}

/**
 * Return index.html
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Trang HTML gọi API');
}

/**
 * JWT
 */
function getSecretKey() {
  return "sda!@#DADA!@#a9sda";
}

function base64UrlEncode(str) {
  return Utilities.base64EncodeWebSafe(str).replace(/=+$/, "");
}

/**
 * Create JWT token
 * payload: JSON
 */
function createJWT(payload) {
  Logger.log("Create JWT: " + JSON.stringify(payload));

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(`${encodedHeader}.${encodedPayload}`, getSecretKey())
  ).replace(/=+$/, "");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT Token
 * token: string
 */
function verifyJWT(token) {
  try {
    Logger.log("Verify JWT: " + token);
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const unsigned = `${headerB64}.${payloadB64}`;

    const checkSig = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(unsigned, getSecretKey())
    ).replace(/=+$/, "");

    if (sigB64 !== checkSig) {
      throw new Error("Invalid signature");
    }

    const payloadJson = Utilities.newBlob(
      Utilities.base64Decode(payloadB64)
    ).getDataAsString();

    const payload = JSON.parse(payloadJson);

    // Check expiration (if exists)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }

    return payload; // ✅ valid
  } catch (err) {
    Logger.log("JWT verify failed: " + err.message);
    return null;
  }
}

/**
 * JWT middleware function
 */
function jwtMiddleware(tk, fn) {
  const token = tk?.replace("Bearer ", "") || null;

  if (!token) return ({ success: false, error: "Missing token" });

  const payload = verifyJWT(token, getSecretKey());
  if (!payload) return ({ success: false, error: "Invalid or expired token" });

  try {
    return fn(payload);
  } catch (err) {
    return ({ success: false, error: err.message });
  }
}

/**
 * Create tasks
 * Request: { date, projectName, projectId, jiraId, desc, status, remark, startWeekDate }
 */
function createTask({ data, user }) {
  Logger.log('[createTask]: Body: ' + JSON.stringify(data) + " | User: " + JSON.stringify(user));
  if (!user) return ({ success: false, error: "Invalid token" });

  const mapSheet = {};
  const rows = Array.isArray(data) ? data : [data];
  let index = 0;
  for (const row of rows) {
    const sheetName = `R-${row.startWeekDate}`;
    let sheet = mapSheet[sheetName];
    if (!sheet) {
      sheet = getSheet(sheetName, true);
      mapSheet[sheetName] = sheet;
    }
    const newRow = [
      user.id,
      user.name,
      row.project?.name || row.projectName || row.project,
      row.project?.id1 || row.projectId,
      row.date,
      row.jiraId || "",
      row.description || row.desc || "",
      row.status || "",
      row.remark || "",
      new Date(),
      generateUniqueId(user, ++index)
    ];

    sheet.appendRow(newRow);
  }
  return ({ success: true });
}

/**
 * Delete tasks
 * Request: { data: [{ uniId, startWeekDate }] }
 */
function deleteTask({ data, user }) {
  Logger.log('[deleteTask]: Body: ' + JSON.stringify(data) + " | User: " + JSON.stringify(user));
  if (!user) return ({ success: false, error: "Invalid token" });

  const mapSheet = {};
  const rows = Array.isArray(data) ? data : [data];
  for (const row of rows) {
    const sheetName = `R-${row.startWeekDate}`;
    let sheet = mapSheet[sheetName];
    if (!sheet) {
      sheet = getSheet(sheetName, true);
      mapSheet[sheetName] = sheet;
    }

    const rowsToDelete = [];
    const lastRow = sheet.getLastRow();
    const values = sheet.getRange("K1:K" + lastRow).getValues();

    for (let i = 0; i < values.length; i++) {
      const cellValue = values[i][0];
      const pattern = new RegExp('\\b' + row.uniId + '\\b', 'i');
      if (cellValue && pattern.test(cellValue)) {
        rowsToDelete.push(i + 1);
      }
    }

    Logger.log('[deleteTask]: Rows to delete: ' + JSON.stringify(rowsToDelete));

    if (rowsToDelete.length > 0) {
      rowsToDelete.reverse().forEach(function(rowIndex) {
        sheet.deleteRow(rowIndex);
      });
    }
  }

  return ({ success: true });
}


function callAction(data) {
  const { action, body, token } = data;
  Logger.log("New action: " + action + " | Body: " + JSON.stringify(body));
  switch (action) {
    case "CREATE_TASKS": return jwtMiddleware(token, user => createTask({ data: body, user }));
    case "DELETE_TASKS": return jwtMiddleware(token, user => deleteTask({ data: body, user }));
    default: return ({ success: false, error: "Invalid action" });
  }
}

function summaryWeeklyReport(startWeekDate) {
  if (!startWeekDate) {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    startWeekDate = Utilities.formatDate(monday, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  Logger.log("[summaryWeeklyReport] | Week " + startWeekDate);
  const sheetName = `R-${startWeekDate}`;
  const tasks = getSheet(sheetName, true).getDataRange().getValues();
  Logger.log("[summaryWeeklyReport] | Sheet: " + sheetName + " has " + tasks?.length);
  if (!tasks || !tasks.length) {
    return ({ success: false, error: "No data" });
  }

  const projects = getSheet('PROJECTS').getDataRange().getValues();
  Logger.log("[summaryWeeklyReport] | Sheet: PROJECTS has " + projects.length);

  const projectsMap = projects.reduce((acc, project) => {
    const [name, id1, id2, isEnable, isDetault, reportProjectName] = project;
    acc[id1] = { reportProjectName };
    return acc;
  }, {});

  /** { 
    [reportProjectName]: { 
      [status]: {
        [jiraId]: { description }
      }
     } 
    } 
  */

  const taskByProject = {};

  for (const task of tasks) {
    const [id, name, project, projectId, date, jiraId, description, status, remark, createdAt, uniId] = task;
    
    if (!jiraId || !status || !description) {
      continue;
    }

    const projectName = projectsMap[projectId] ? projectsMap[projectId].reportProjectName : projectId;
    if (!taskByProject[projectName]) {
      taskByProject[projectName] = {
        'Done': {},
        'Plan': {},
      };
    }

    const reportStatus = status === 'In Progress' ? 'Plan' : 'Done';
    const isPlan = reportStatus === 'Plan';

    if (isPlan) {
      delete taskByProject[projectName]['Done'][jiraId];
    }
    else {
      delete taskByProject[projectName]['Plan'][jiraId];
    }

    taskByProject[projectName][reportStatus][jiraId] = {
      description: `${jiraId} ${description}`
    }
  }

  const summarySheet = getSheet(`S-${startWeekDate}`, true);
  summarySheet.clear();

  for (const [projectName, tasksByStatus] of Object.entries(taskByProject)) {
    for (const [status, tasksByJiraId] of Object.entries(tasksByStatus)) {
      const tasks = Object.values(tasksByJiraId).map(task => task.description);
      Logger.log("[summaryWeeklyReport] | Append Project " + projectName + " | Status " + status + " | Tasks " + tasks.length);
      if (tasks.length) {
        summarySheet.appendRow([
          projectName,
          status,
          tasks.join("\n")
        ]);
      }
    }
  }
  return ({ success: true });
}

/**
 * Triggered by sheet updated
 */
function onEdit(e) {
  const sheet = e.range.getSheet();
  const name = sheet.getName();
  Logger.log("[onEdit] | Sheet name: " + name);
  const pattern = /^R-\d{4}-\d{2}-\d{2}$/;
  if (pattern.test(name)) {
    summaryWeeklyReport(name.replace("R-", ""));
  }
}

/**
 * Triggered by timer
 */
function summaryWeeklyReportTriggeredByTimer() {
  summaryWeeklyReport();
}

function test_summaryWeeklyReport() {
  console.log(summaryWeeklyReport('2025-11-03'))
  console.log(summaryWeeklyReport())
}

function generateToken() {
  const data = createJWT({
    id: "phiemt.hoang",
    role: "DEV",
    name: "Phiem Tu",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 3600, // expires in 1 year
  }, getSecretKey())
  console.log(data);
}

