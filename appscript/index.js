const PIN_INDEX = 1;
const ROLE_INDEX = 2;
const NAME_INDEX = 3;

function getSheet(name, createIdNotExist = false) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet && createIdNotExist) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(['', '']); // Header row -> leave it empty now
  }
  return sheet;
}

/**
 * Return index.html
 */
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setTitle('Trang HTML gọi API');
}

/**
 * JWT
 */
function getSecretKey() {
  return 'sda!@#DADA!@#a9sda';
}

function base64UrlEncode(str) {
  return Utilities.base64EncodeWebSafe(str).replace(/=+$/, '');
}

/**
 * Create JWT token
 * payload: JSON
 */
function createJWT(payload) {
  Logger.log('Create JWT: ' + JSON.stringify(payload));

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(`${encodedHeader}.${encodedPayload}`, getSecretKey())
  ).replace(/=+$/, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT Token
 * token: string
 */
function verifyJWT(token) {
  try {
    Logger.log('Verify JWT: ' + token);
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const unsigned = `${headerB64}.${payloadB64}`;

    const checkSig = Utilities.base64EncodeWebSafe(
      Utilities.computeHmacSha256Signature(unsigned, getSecretKey())
    ).replace(/=+$/, '');

    if (sigB64 !== checkSig) {
      throw new Error('Invalid signature');
    }

    const payloadJson = Utilities.newBlob(Utilities.base64Decode(payloadB64)).getDataAsString();

    const payload = JSON.parse(payloadJson);

    // Check expiration (if exists)
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    return payload; // ✅ valid
  } catch (err) {
    Logger.log('JWT verify failed: ' + err.message);
    return null;
  }
}

/**
 * JWT middleware function
 */
function jwtMiddleware(tk, fn) {
  const token = tk?.replace('Bearer ', '') || null;

  if (!token) return { success: false, error: 'Missing token' };

  const payload = verifyJWT(token, getSecretKey());
  if (!payload) return { success: false, error: 'Invalid or expired token' };

  try {
    return fn(payload);
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Create tasks
 * Request: { date, jiraId, desc, status, remark, startWeekDate }
 */
function createTask({ data, user }) {
  Logger.log('[createTask]: Body: ' + JSON.stringify(data) + ' | User: ' + JSON.stringify(user));
  if (!user) return { success: false, error: 'Invalid token' };

  const mapSheet = {};
  let rows = Array.isArray(data) ? data : [data];
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
      row.date,
      row.jiraId || '',
      row.desc || '',
      row.status || '',
      row.remark || '',
      new Date(),
    ];

    sheet.appendRow(newRow);
  }
  return { success: true };
}

/**
 * Get member info from sheet MEMBER
 */
function getMemberInfo({ data, user }) {
  Logger.log('[getMemberInfo]: Body: ' + JSON.stringify(data) + ' | User: ' + JSON.stringify(user));
  if (!user) return { success: false, error: 'Invalid token' };

  const sheet = getSheet('MEMBER');
  const rows = sheet.getDataRange().getValues();
  const member = rows.find(([id]) => id === data.id);

  if (!member) {
    return { success: false };
  } else {
    member[PIN_INDEX] = null; // clear PIN value
    return { success: true, data: member };
  }
}

/**
 * Get member tasks
 * Request: { id, startWeekDate }
 */
function getTasks({ data, user }) {
  Logger.log('[getTasks]: Body: ' + JSON.stringify(data) + ' | User: ' + JSON.stringify(user));
  if (!user) return { success: false, error: 'Invalid token' };

  if (!data.startWeekDate) return { success: false, error: 'Invalid startOfWeek' };

  const sheetName = `R-${data.startWeekDate}`;
  const sheet = getSheet(sheetName);

  if (!sheet) {
    Logger.log('[getTasks]: Sheet not found!');
    return { success: true, data: [] };
  } else {
    const rows = sheet.getDataRange().getValues();
    if (user.role === 'ADMIN' && !data.id) {
      return { success: true, data: rows }; // return all
    }
    const filteredData = rows.filter(([id]) => id === data.id); // filter by id
    return { success: true, data: filteredData };
  }
}

/**
 * Member Login
 * request: { id, pin }
 * response: { success: boolean, token?: string }
 */
function memberLogin(data) {
  Logger.log('[Login]: Body: ' + JSON.stringify(data));
  const sheet = getSheet('MEMBER');
  const rows = sheet.getDataRange().getValues();
  const member = rows.find(([id]) => id === data.id);

  if (!member) {
    return { success: false };
  } else {
    const isSuccess = String(member[PIN_INDEX] ?? '0').trim() === String(data.pin ?? '-1');
    if (isSuccess) {
      const payload = {
        id: data.id,
        role: member[ROLE_INDEX],
        name: member[NAME_INDEX],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 3600, // expires in 1 day
      };
      const token = createJWT(payload);
      return { success: true, token };
    }
    return { success: false };
  }
}

function callAction(data) {
  const { action, body, token } = data;
  Logger.log('New action: ' + action + ' | Body: ' + JSON.stringify(body));
  switch (action) {
    case 'CREATE_TASK':
      return jwtMiddleware(token, (user) => createTask({ data: body, user }));
    case 'GET_MEMBER':
      return jwtMiddleware(token, (user) => getMemberInfo({ data: body, user }));
    case 'GET_TASKS':
      return jwtMiddleware(token, (user) => getTasks({ data: body, user }));
    case 'LOGIN':
      return memberLogin(body);
    default:
      return { success: false, error: 'Invalid action' };
  }
}

function hamServerDuocGoiTuHtml(formData) {
  // Ghi log để xem
  Logger.log('hamServerDuocGoiTuHtml đã nhận dữ liệu từ FORM: ', formData);

  // formData sẽ là một object, ví dụ: { tenNguoiDung: 'Giá trị người dùng nhập' }
  const [ten, token, startWeekDate] = formData.tenNguoiDung.split('||');

  // Xử lý dữ liệu ở đây...

  if (ten == '1') {
    return callAction({
      action: 'LOGIN',
      token: null,
      body: {
        id: 'tan.pham',
        pin: '123456',
      },
    });
  } else if (ten === '2') {
    return callAction({
      action: 'CREATE_TASK',
      token,
      body: {
        date: '2025-11-02',
        jiraId: '123',
        desc: 'desc11111111',
        status: 'In Progress',
        startWeekDate: '2025-11-10',
      },
    });
  } else if (ten === '3') {
    return callAction({
      action: 'GET_MEMBER',
      token,
      body: {
        id: 'tan.pham',
      },
    });
  } else if (ten === '4') {
    return callAction({
      action: 'CREATE_TASK',
      token,
      body: [
        {
          date: '2025-11-02',
          jiraId: '123',
          desc: 'desc11111111',
          status: 'In Progress',
          startWeekDate: '2025-10-27',
        },
        {
          date: '2025-11-03',
          jiraId: '1231231231',
          desc: 'desc11111111',
          status: 'In Progress',
          startWeekDate: '2025-11-10',
        },
      ],
    });
  } else if (ten === '5') {
    return callAction({
      action: 'GET_TASKS',
      token,
      body: {
        id: 'tan.pham',
        startWeekDate: startWeekDate || '2025-10-27',
      },
    });
  } else if (ten === '6') {
    return callAction({
      action: 'GET_TASKS',
      token,
      body: {
        // ADMIN
        startWeekDate: startWeekDate || '2025-10-27',
      },
    });
  }

  // Trả về một chuỗi thông báo thành công cho trang HTML
  return memberLogin({
    id: ten,
    pin: '123456',
  });
}

function test() {
  const data = callAction({
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRhbi5waGFtIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IlRhbiBQaGFtIiwiaWF0IjoxNzYyMDY3ODI2LCJleHAiOjE3NjIxNTQyMjZ9.IB6r_Yw8Y7rzX3R_XI-wPcQwJpw_2M1yJgCsU5nOeVc',
    action: 'GET_TASKS',
    body: {
      // id: "tan.pham",
      startWeekDate: '2025-10-27',
    },
  });
  console.log(data);
}
