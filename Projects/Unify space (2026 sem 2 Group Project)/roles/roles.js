// ================= ROLE SELECTION MODULE =================
// Flow: choose plan -> select role -> open dashboard with role-specific tools.

let pendingPlan = "Free";
let preferredRole = null;
let activeRoleName = null;

const roleModal = document.getElementById("roleModal");
const selectedPlanText = document.getElementById("selectedPlanText");
const closeRoleModalBtn = document.getElementById("closeRoleModalBtn");
const roleTools = document.getElementById("roleTools");
const rolePlanLabel = document.getElementById("rolePlanLabel");
const roleDashboardTitle = document.getElementById("roleDashboardTitle");
const roleDashboardDescription = document.getElementById("roleDashboardDescription");
const roleFunctionPanel = document.getElementById("roleFunctionPanel");

const roleData = {
  IT: {
    icon: "💻",
    title: "IT Dashboard",
    description: "Developer tools for coding, Git, repositories, and technical work.",
    tools: [
      {
        id: "ai-coding",
        name: "AI Coding Assistant",
        info: "Generate code, explain errors, and suggest fixes.",
        render: () => `
          <h4>🤖 AI Coding Assistant</h4>
          <p>Describe what you want to build, then generate real starter code.</p>

          <label>Choose code type</label>
          <select id="codeLanguageSelect">
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="javascript">JavaScript</option>
          </select>

          <textarea id="codeAssistantInput" placeholder="Example: Make a meeting calendar, login form, navbar, button, modal, or task list..."></textarea>

          <button class="role-tool-action" data-role-action="generate-code">Generate Code</button>
          <button class="role-tool-action secondary" data-role-action="copy-generated-code">Copy Code</button>

          <div class="role-result-box code-result" id="roleActionResult">
            <span>Waiting for your code request...</span>
          </div>
        `
      },
      {
        id: "git",
        name: "Git Push/Pull",
        info: "Simulate pushing and pulling project code.",
        render: () => `
          <h4>🔁 Git Push/Pull</h4>
          <p>Use this to simulate team code syncing.</p>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>Current branch</strong><p>main</p></div>
            <div class="role-mini-card"><strong>Status</strong><p>3 modified files</p></div>
          </div>
          <button class="role-tool-action" data-role-action="git-pull">Pull Latest</button>
          <button class="role-tool-action" data-role-action="git-push">Push Changes</button>
          <div class="role-result-box" id="roleActionResult">Git ready.</div>
        `
      },
      {
        id: "repository",
        name: "Built-in Repository",
        info: "Store project source code inside the platform.",
        render: () => `
          <h4>📁 Built-in Repository</h4>
          <p>Project files stored inside the workspace.</p>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>index.html</strong><p>Main website page</p></div>
            <div class="role-mini-card"><strong>css/style.css</strong><p>Main website design</p></div>
            <div class="role-mini-card"><strong>js/script.js</strong><p>Main dashboard logic</p></div>
            <div class="role-mini-card"><strong>calendar/calendar.js</strong><p>Meeting calendar logic</p></div>
            <div class="role-mini-card"><strong>roles/roles.js</strong><p>Role dashboard logic</p></div>
            <div class="role-mini-card"><strong>roles/roles.css</strong><p>Role dashboard design</p></div>
          </div>
        `
      },
      {
        id: "code-editor",
        name: "Code Editor",
        info: "Edit HTML, CSS, and JavaScript files.",
        render: () => `
          <h4>🧑‍💻 Code Editor</h4>
          <p>This is a simple demo editor for frontend code.</p>
          <select id="editorFileSelect">
            <option>index.html</option>
            <option>style.css</option>
            <option>script.js</option>
            <option>roles.js</option>
          </select>
          <textarea id="demoCodeEditor">function helloTeam() {\n  console.log("Welcome to UnifySpace");\n}</textarea>
          <button class="role-tool-action" data-role-action="save-code">Save Code</button>
          <div class="role-result-box" id="roleActionResult">No changes saved yet.</div>
        `
      }
    ]
  },

  Business: {
    icon: "📊",
    title: "Business Dashboard",
    description: "Business tools for planning, analytics, Excel, and strategy.",
    tools: [
      {
        id: "excel",
        name: "Excel Integration",
        info: "Work with spreadsheets and business data.",
        render: () => `
          <h4>📊 Excel Integration</h4>
          <p>Simple spreadsheet-style business data.</p>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>Revenue</strong><input value="$12,500"></div>
            <div class="role-mini-card"><strong>Cost</strong><input value="$5,200"></div>
            <div class="role-mini-card"><strong>Users</strong><input value="1,240"></div>
            <div class="role-mini-card"><strong>Conversion</strong><input value="8.4%"></div>
          </div>
          <button class="role-tool-action" data-role-action="calculate-business">Calculate Summary</button>
          <div class="role-result-box" id="roleActionResult">Spreadsheet ready.</div>
        `
      },
      {
        id: "flowchart",
        name: "Flowchart Builder",
        info: "Create business process diagrams.",
        render: () => `
          <h4>🔄 Flowchart Builder</h4>
          <p>Example business process:</p>
          <button class="role-tool-action" data-role-action="update-flowchart">Update Flowchart</button>
          <div class="role-flow">
            <span>Customer</span><span>→</span><span>Order</span><span>→</span><span>Payment</span><span>→</span><span>Delivery</span><span>→</span><span>Feedback</span>
          </div>
        `
      },
      {
        id: "bmc",
        name: "Business Model Canvas",
        info: "Plan customer segments, value proposition, revenue, and costs.",
        render: () => `
          <h4>🧩 Business Model Canvas</h4>
          <p>All 9 business blocks are ready for planning.</p>
          <button class="role-tool-action" data-role-action="update-bmc">Save Canvas Update</button>
          <div class="role-bmc-grid">
            <div><strong>Customer Segments</strong><br>Students, teams, startups</div>
            <div><strong>Value Proposition</strong><br>All tools in one platform</div>
            <div><strong>Channels</strong><br>Website, app, partners</div>
            <div><strong>Customer Relationships</strong><br>Support, AI help, community</div>
            <div><strong>Revenue Streams</strong><br>Free, Pro, Team, Enterprise</div>
            <div><strong>Key Resources</strong><br>AI, cloud, integrations</div>
            <div><strong>Key Activities</strong><br>Messaging, meetings, files</div>
            <div><strong>Key Partners</strong><br>Zoom, Microsoft, GitHub</div>
            <div><strong>Cost Structure</strong><br>Cloud, support, development</div>
          </div>
        `
      },
      {
        id: "analytics",
        name: "AI Analytics",
        info: "Analyze business performance and suggest improvements.",
        render: () => `
          <h4>🤖 AI Analytics</h4>
          <p>AI summary of current platform performance with a pie chart showing work progress.</p>
          <div class="role-analytics-preview">
            <div class="role-analytics-pie" aria-label="Analytics pie chart"></div>
            <div class="role-analytics-legend">
              <div><span class="role-legend-dot done"></span>55% Completed</div>
              <div><span class="role-legend-dot progress"></span>25% In Progress</div>
              <div><span class="role-legend-dot pending"></span>20% Pending</div>
            </div>
          </div>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>Most active plan</strong><p>Pro Plan</p></div>
            <div class="role-mini-card"><strong>Best customer value</strong><p>Team Plan users</p></div>
            <div class="role-mini-card"><strong>Risk</strong><p>Free users may need upgrade reason</p></div>
            <div class="role-mini-card"><strong>Suggestion</strong><p>Add more AI features to Pro</p></div>
          </div>
        `
      }
    ]
  },

  Engineering: {
    icon: "🏗️",
    title: "Engineering Dashboard",
    description: "Engineering tools for CAD, simulation, technical drawings, and project files.",
    tools: [
      {
        id: "autocad",
        name: "AutoCAD Support",
        info: "Upload and manage CAD design files.",
        render: () => `
          <h4>📐 AutoCAD Support</h4>
          <p>Upload CAD files such as DWG/DXF in the full version. This demo stores the file name only.</p>
          <input type="file" id="cadFileInput">
          <button class="role-tool-action" data-role-action="upload-cad">Add CAD File</button>
          <div class="role-result-box" id="roleActionResult">No CAD file selected.</div>
        `
      },
      {
        id: "simulation",
        name: "Simulation Tools",
        info: "Run simple engineering simulations.",
        render: () => `
          <h4>⚙️ Simulation Tools</h4>
          <p>Run a demo load/stress simulation.</p>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>Load</strong><input value="250 kg"></div>
            <div class="role-mini-card"><strong>Material</strong><input value="Steel"></div>
          </div>
          <button class="role-tool-action" data-role-action="run-simulation">Run Simulation</button>
          <div class="role-result-box" id="roleActionResult">Simulation waiting.</div>
        `
      },
      {
        id: "drawings",
        name: "Technical Drawings",
        info: "Manage blueprints and diagrams.",
        render: () => `
          <h4>📝 Technical Drawings</h4>
          <p>Drawing board preview:</p>
          <button class="role-tool-action" data-role-action="review-drawing">Review Drawing</button>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>Floor_Plan_A.dwg</strong><p>Updated today</p></div>
            <div class="role-mini-card"><strong>Machine_Part_02.dxf</strong><p>Reviewed</p></div>
            <div class="role-mini-card"><strong>Bridge_Load_Test.pdf</strong><p>Pending approval</p></div>
            <div class="role-mini-card"><strong>Electrical_Diagram.png</strong><p>Draft</p></div>
          </div>
        `
      },
      {
        id: "engineering-files",
        name: "Project Files",
        info: "Store engineering documents and reports.",
        render: () => `
          <h4>📁 Engineering Project Files</h4>
          <button class="role-tool-action" data-role-action="review-engineering-files">Review Files</button>
          <ul>
            <li>engineering_report.pdf</li>
            <li>simulation_result.xlsx</li>
            <li>technical_drawing.dwg</li>
            <li>materials_list.docx</li>
          </ul>
        `
      }
    ]
  },

  Design: {
    icon: "🎨",
    title: "Design Dashboard",
    description: "Design tools for UI/UX, graphics, prototyping, and creative assets.",
    tools: [
      {
        id: "uiux",
        name: "UI/UX Tools",
        info: "Design app screens and user interfaces.",
        render: () => `
          <h4>🖥️ UI/UX Tools</h4>
          <p>Screen design preview:</p>
          <button class="role-tool-action" data-role-action="edit-ui-screen">Save UI Edit</button>
          <div class="role-phone-preview">
            <div class="role-screen"><strong>Login</strong><br><br>Logo<br>Input<br>Button</div>
            <div class="role-screen"><strong>Dashboard</strong><br><br>Sidebar<br>Cards<br>Chat</div>
            <div class="role-screen"><strong>Calendar</strong><br><br>Month<br>Events<br>Reminder</div>
          </div>
        `
      },
      {
        id: "graphics",
        name: "Graphics Editor",
        info: "Create logos, banners, and visual assets.",
        render: () => `
          <h4>🖌️ Graphics Editor</h4>
          <p>Create brand assets for the platform.</p>
          <input value="UnifySpace Logo">
          <button class="role-tool-action" data-role-action="create-graphic">Create Graphic</button>
          <div class="role-result-box" id="roleActionResult">Graphic editor ready.</div>
        `
      },
      {
        id: "prototype",
        name: "Prototype Builder",
        info: "Create clickable app prototypes.",
        render: () => `
          <h4>🧭 Prototype Builder</h4>
          <p>Example clickable flow:</p>
          <div class="role-flow">
            <span>Home</span><span>→</span><span>Choose Plan</span><span>→</span><span>Select Role</span><span>→</span><span>Dashboard</span>
          </div>
          <button class="role-tool-action" data-role-action="test-prototype">Test Prototype</button>
          <div class="role-result-box" id="roleActionResult">Prototype ready.</div>
        `
      },
      {
        id: "assets",
        name: "Asset Library",
        info: "Store icons, images, fonts, and components.",
        render: () => `
          <h4>🗂️ Asset Library</h4>
          <button class="role-tool-action" data-role-action="upload-design-asset">Add Asset</button>
          <div class="role-mini-grid">
            <div class="role-mini-card"><strong>Icons</strong><p>42 assets</p></div>
            <div class="role-mini-card"><strong>Images</strong><p>18 images</p></div>
            <div class="role-mini-card"><strong>Fonts</strong><p>3 styles</p></div>
            <div class="role-mini-card"><strong>UI Components</strong><p>26 components</p></div>
          </div>
        `
      }
    ]
  }
};

const roleActivityHistory = {
  IT: [
    { user: "Min Thu", action: "Fixed login button alignment", type: "Fix", time: "Today 9:15 AM" },
    { user: "David", action: "Pulled latest calendar changes from main branch", type: "Git Pull", time: "Today 9:28 AM" },
    { user: "Min Thu", action: "Pushed screen sharing feature to repository", type: "Git Push", time: "Today 10:05 AM" },
    { user: "AI Coding Assistant", action: "Suggested JavaScript fix for meeting modal", type: "AI Help", time: "Today 10:20 AM" }
  ],
  Business: [
    { user: "Aye Chan", action: "Updated pricing plan comparison", type: "Business Edit", time: "Today 9:10 AM" },
    { user: "Nora", action: "Added customer value notes to Business Model Canvas", type: "Canvas Edit", time: "Today 9:45 AM" },
    { user: "Aye Chan", action: "Calculated revenue and cost summary", type: "Analytics", time: "Today 10:00 AM" },
    { user: "Team", action: "Reviewed flowchart from customer order to feedback", type: "Review", time: "Today 10:30 AM" }
  ],
  Engineering: [
    { user: "David", action: "Uploaded Bridge_Load_Test.pdf", type: "File Upload", time: "Today 8:50 AM" },
    { user: "Engineer Team", action: "Edited Machine_Part_02.dxf technical drawing", type: "Drawing Edit", time: "Today 9:35 AM" },
    { user: "David", action: "Ran steel load simulation", type: "Simulation", time: "Today 10:15 AM" },
    { user: "Project Lead", action: "Reviewed engineering materials list", type: "Review", time: "Today 10:40 AM" }
  ],
  Design: [
    { user: "Nora", action: "Edited dashboard card spacing", type: "UI Edit", time: "Today 9:05 AM" },
    { user: "Aye Chan", action: "Commented on prototype navigation flow", type: "Prototype Review", time: "Today 9:42 AM" },
    { user: "Nora", action: "Updated UnifySpace logo/banner asset", type: "Graphic Edit", time: "Today 10:12 AM" },
    { user: "Design Team", action: "Added calendar screen to prototype", type: "Prototype Edit", time: "Today 10:35 AM" }
  ]
};

function renderRoleHistory(roleName) {
  const list = document.getElementById("roleHistoryList");
  const title = document.getElementById("roleHistoryTitle");
  if (!list || !title) return;

  title.textContent = `${roleName} Activity History`;
  const history = roleActivityHistory[roleName] || [];

  list.innerHTML = history.map(item => `
    <div class="role-history-item">
      <div class="role-history-top">
        <strong>${item.user}</strong>
        <span>${item.time}</span>
      </div>
      <p>${item.action}</p>
      <small>${item.type}</small>
    </div>
  `).join("");
}

function addRoleHistory(roleName, user, action, type) {
  if (!roleName || !roleActivityHistory[roleName]) return;

  roleActivityHistory[roleName].unshift({
    user,
    action,
    type,
    time: "Just now"
  });

  renderRoleHistory(roleName);
}


function showRoleModal(plan) {
  pendingPlan = plan || "Free";
  if (selectedPlanText) {
    selectedPlanText.textContent = `${pendingPlan} Plan selected. Please choose your role to open the correct dashboard tools.`;
  }
  document.querySelectorAll(".role-select-btn").forEach(btn => {
    btn.classList.toggle("preferred", preferredRole && btn.dataset.role === preferredRole);
  });
  roleModal?.classList.add("active");
}

function openRoleDashboard(roleName) {
  const role = roleData[roleName];
  if (!role) return;

  activeRoleName = roleName;
  roleModal?.classList.remove("active");

  if (typeof openApp === "function") {
    openApp(pendingPlan);
  }

  if (rolePlanLabel) rolePlanLabel.textContent = `${pendingPlan} Plan • ${roleName} Role`;
  if (roleDashboardTitle) roleDashboardTitle.textContent = `${role.icon} ${role.title}`;
  if (roleDashboardDescription) roleDashboardDescription.textContent = role.description;

  renderRoleTools(roleName);

  if (typeof addMessage === "function") {
    addMessage("System", "Now", `${pendingPlan} Plan selected. ${roleName} role dashboard loaded.`);
  }
}

function renderRoleTools(roleName) {
  const role = roleData[roleName];
  if (!roleTools || !roleFunctionPanel || !role) return;

  roleTools.innerHTML = "";
  roleFunctionPanel.innerHTML = `
    <div class="role-function-grid"></div>
    <div class="role-history-panel">
      <div class="role-history-header">
        <div>
          <h4 id="roleHistoryTitle">Activity History</h4>
          <p>Track who changed, fixed, pushed, edited, uploaded, or reviewed work.</p>
        </div>
        <span class="role-history-live">Live Log</span>
      </div>
      <div class="role-history-list" id="roleHistoryList"></div>
    </div>
  `;

  const grid = roleFunctionPanel.querySelector(".role-function-grid");

  role.tools.forEach(tool => {
    const sideBtn = document.createElement("button");
    sideBtn.className = "tool-btn role-side-tool";
    sideBtn.textContent = tool.name;
    sideBtn.dataset.tool = tool.id;
    roleTools.appendChild(sideBtn);

    const card = document.createElement("button");
    card.className = "role-function-card";
    card.dataset.tool = tool.id;
    card.innerHTML = `
      <strong>${tool.name}</strong>
      <span>${tool.info}</span>
    `;
    grid.appendChild(card);
  });

  renderRoleHistory(roleName);
}

function showRoleTool(toolId) {
  if (!activeRoleName) return;
  const role = roleData[activeRoleName];
  const tool = role.tools.find(item => item.id === toolId);
  if (!tool || !roleFunctionPanel) return;

  document.querySelectorAll(".role-side-tool, .role-function-card").forEach(el => {
    el.classList.toggle("active", el.dataset.tool === toolId);
  });

  let output = document.getElementById("roleToolOutput");
  if (!output) {
    output = document.createElement("div");
    output.id = "roleToolOutput";
    output.className = "role-tool-output";
    roleFunctionPanel.appendChild(output);
  }

  output.innerHTML = tool.render();

  if (typeof addMessage === "function") {
    addMessage("Tool", "Now", `${tool.name} opened in the ${activeRoleName} dashboard.`);
  }
}

function setRoleResult(message) {
  const result = document.getElementById("roleActionResult");
  if (result) result.textContent = message;
  if (typeof addMessage === "function") addMessage("Tool", "Now", message);
}

function setGeneratedCodeResult(language, code) {
  const result = document.getElementById("roleActionResult");
  if (!result) return;

  result.innerHTML = `
    <strong>Generated ${language.toUpperCase()} Code</strong>
    <pre><code id="generatedCodeBlock"></code></pre>
  `;

  result.querySelector("#generatedCodeBlock").textContent = code;

  if (typeof addMessage === "function") {
    addMessage("AI Code", "Now", `Generated ${language.toUpperCase()} starter code.`);
  }
}

function generateStarterCode(prompt, language) {
  const text = prompt.toLowerCase();

  if (text.includes("calendar") || text.includes("meeting")) {
    if (language === "html") {
      return `<section class="calendar-app">
  <h2>Meeting Calendar</h2>

  <input type="date" id="meetingDate">
  <input type="time" id="meetingTime">
  <input type="text" id="meetingTitle" placeholder="Meeting title">
  <button id="addMeetingBtn">Add Meeting</button>

  <h3>Saved Meetings</h3>
  <div id="meetingList"></div>
</section>`;
    }

    if (language === "css") {
      return `.calendar-app {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
}

.calendar-app input,
.calendar-app button {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
}

.calendar-app button {
  background: #4f46e5;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.meeting-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  margin-top: 10px;
}`;
    }

    return `const meetings = JSON.parse(localStorage.getItem("meetings")) || [];

function saveMeetings() {
  localStorage.setItem("meetings", JSON.stringify(meetings));
}

function addMeeting() {
  const date = document.getElementById("meetingDate").value;
  const time = document.getElementById("meetingTime").value;
  const title = document.getElementById("meetingTitle").value.trim();

  if (!date || !time || !title) {
    alert("Please fill in date, time, and title.");
    return;
  }

  meetings.push({ id: Date.now(), date, time, title });
  saveMeetings();
  displayMeetings();
}

function displayMeetings() {
  const meetingList = document.getElementById("meetingList");
  meetingList.innerHTML = "";

  meetings.forEach(meeting => {
    meetingList.innerHTML +=
      '<div class="meeting-item">' +
      '<strong>' + meeting.title + '</strong><br>' +
      meeting.date + ' at ' + meeting.time +
      '</div>';
  });
}

document.getElementById("addMeetingBtn").addEventListener("click", addMeeting);
displayMeetings();`;
  }

  if (text.includes("login") || text.includes("sign in")) {
    if (language === "html") {
      return `<form class="login-card" id="loginForm">
  <h2>Login</h2>
  <input type="email" id="email" placeholder="Email">
  <input type="password" id="password" placeholder="Password">
  <button type="submit">Sign In</button>
  <p id="loginMessage"></p>
</form>`;
    }

    if (language === "css") {
      return `.login-card {
  max-width: 360px;
  margin: 40px auto;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
}

.login-card input,
.login-card button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
}

.login-card button {
  background: #4f46e5;
  color: white;
  font-weight: 800;
}`;
    }

    return `document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");

  if (!email || !password) {
    message.textContent = "Please enter email and password.";
    return;
  }

  message.textContent = "Login successful.";
});`;
  }

  if (text.includes("navbar") || text.includes("navigation")) {
    if (language === "html") {
      return `<header class="navbar">
  <a href="#" class="logo">UnifySpace</a>
  <nav>
    <a href="#features">Features</a>
    <a href="#roles">Roles</a>
    <a href="#pricing">Pricing</a>
  </nav>
  <button>Open App</button>
</header>`;
    }

    if (language === "css") {
      return `.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.navbar nav {
  display: flex;
  gap: 22px;
}

.navbar a {
  color: #334155;
  text-decoration: none;
  font-weight: 800;
}`;
    }

    return `document.querySelectorAll(".navbar a").forEach(link => {
  link.addEventListener("click", event => {
    console.log("Navigating to:", event.target.getAttribute("href"));
  });
});`;
  }

  if (text.includes("task") || text.includes("todo")) {
    if (language === "html") {
      return `<section class="task-app">
  <input id="taskInput" placeholder="Enter a task">
  <button id="addTaskBtn">Add Task</button>
  <div id="taskList"></div>
</section>`;
    }

    if (language === "css") {
      return `.task-app {
  background: white;
  border-radius: 18px;
  padding: 18px;
}

.task-item {
  padding: 10px;
  margin-top: 8px;
  background: #f8fafc;
  border-radius: 12px;
}`;
    }

    return `const tasks = [];

function addTask() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();

  if (!task) return;

  tasks.push(task);
  input.value = "";
  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = tasks.map(task => '<div class="task-item">' + task + '</div>').join("");
}

document.getElementById("addTaskBtn").addEventListener("click", addTask);`;
  }

  if (language === "html") {
    return `<section class="card">
  <h2>Your Feature Title</h2>
  <p>Write a short description here.</p>
  <button id="featureBtn">Click Me</button>
</section>`;
  }

  if (language === "css") {
    return `.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
}

.card button {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
}`;
  }

  return `const button = document.getElementById("featureBtn");

button.addEventListener("click", function() {
  alert("Feature button clicked!");
});`;
}

// Plan buttons: choose plan first, then role popup.
document.querySelectorAll(".plan-btn").forEach(btn => {
  btn.addEventListener("click", () => showRoleModal(btn.dataset.plan));
});

// Optional: clicking a role preview card on the landing page scrolls to pricing.
document.querySelectorAll(".role-preview-card").forEach(card => {
  card.addEventListener("click", () => {
    preferredRole = card.dataset.rolePreview;
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  });
});

// Role modal select buttons.
document.querySelectorAll(".role-select-btn").forEach(btn => {
  btn.addEventListener("click", () => openRoleDashboard(btn.dataset.role));
});

closeRoleModalBtn?.addEventListener("click", () => {
  roleModal?.classList.remove("active");
});

roleModal?.addEventListener("click", event => {
  if (event.target === roleModal) roleModal.classList.remove("active");
});

// Role tool click handling.
document.addEventListener("click", event => {
  const toolButton = event.target.closest("[data-tool]");
  if (toolButton) {
    showRoleTool(toolButton.dataset.tool);
    return;
  }

  const action = event.target.closest("[data-role-action]")?.dataset.roleAction;
  if (!action) return;

  if (action === "generate-code") {
    const question = document.getElementById("codeAssistantInput")?.value.trim();
    const language = document.getElementById("codeLanguageSelect")?.value || "javascript";

    if (!question) {
      setRoleResult("Please describe what code you want first.");
      return;
    }

    const code = generateStarterCode(question, language);
    setGeneratedCodeResult(language, code);
    addRoleHistory("IT", "AI Coding Assistant", `Generated ${language.toUpperCase()} starter code for: ${question}`, "AI Code");
  }

  if (action === "copy-generated-code") {
    const code = document.getElementById("generatedCodeBlock")?.textContent || "";
    if (!code) {
      setRoleResult("Generate code first, then copy it.");
      return;
    }

    navigator.clipboard?.writeText(code)
      .then(() => {
        setRoleResult("Generated code copied to clipboard.");
        addRoleHistory("IT", "Min Thu", "Copied generated code from AI assistant", "Code Copy");
      })
      .catch(() => setRoleResult("Copy failed. You can still select and copy the code manually."));
  }

  if (action === "git-pull") {
    setRoleResult("Git Pull completed: latest changes from the team were downloaded successfully.");
    addRoleHistory("IT", "David", "Pulled latest changes from main branch", "Git Pull");
  }

  if (action === "git-push") {
    setRoleResult("Git Push completed: your changes were uploaded to the project repository.");
    addRoleHistory("IT", "Min Thu", "Pushed updated code to project repository", "Git Push");
  }

  if (action === "save-code") {
    const file = document.getElementById("editorFileSelect")?.value || "file";
    setRoleResult(`${file} saved successfully in the demo editor.`);
    addRoleHistory("IT", "Min Thu", `Fixed and saved ${file} in the demo editor`, "Code Fix");
  }

  if (action === "calculate-business") {
    setRoleResult("Business Summary: Revenue is higher than cost, so the demo company is profitable.");
    addRoleHistory("Business", "Aye Chan", "Calculated revenue, cost, users, and conversion summary", "Analytics");
  }

  if (action === "upload-cad") {
    const fileInput = document.getElementById("cadFileInput");
    const fileName = fileInput?.files?.[0]?.name || "demo_design.dwg";
    setRoleResult(`${fileName} added to the engineering CAD workspace.`);
    addRoleHistory("Engineering", "David", `Uploaded ${fileName} to the CAD workspace`, "CAD Upload");
  }

  if (action === "run-simulation") {
    setRoleResult("Simulation completed: stress level is normal and design performance is acceptable.");
    addRoleHistory("Engineering", "Engineering Team", "Ran load/stress simulation and saved result", "Simulation");
  }

  if (action === "create-graphic") {
    setRoleResult("Graphic created: new logo/banner asset saved to the design library.");
    addRoleHistory("Design", "Nora", "Created new logo/banner asset in graphics editor", "Graphic Edit");
  }

  if (action === "test-prototype") {
    setRoleResult("Prototype test completed: Home → Plan → Role → Dashboard flow works correctly.");
    addRoleHistory("Design", "Design Team", "Tested prototype flow from Home to Dashboard", "Prototype Test");
  }

  if (action === "update-flowchart") {
    setRoleResult("Flowchart updated: Customer → Order → Payment → Delivery → Feedback.");
    addRoleHistory("Business", "Aye Chan", "Updated customer order flowchart", "Flowchart Edit");
  }

  if (action === "update-bmc") {
    setRoleResult("Business Model Canvas saved successfully.");
    addRoleHistory("Business", "Nora", "Edited Business Model Canvas value proposition and revenue blocks", "Canvas Edit");
  }

  if (action === "review-drawing") {
    setRoleResult("Technical drawing reviewed and marked as ready for approval.");
    addRoleHistory("Engineering", "Engineer Team", "Reviewed Machine_Part_02.dxf technical drawing", "Drawing Review");
  }

  if (action === "review-engineering-files") {
    setRoleResult("Engineering project files reviewed successfully.");
    addRoleHistory("Engineering", "Project Lead", "Reviewed engineering reports, materials list, and simulation results", "File Review");
  }

  if (action === "edit-ui-screen") {
    setRoleResult("UI screen edit saved successfully.");
    addRoleHistory("Design", "Nora", "Edited dashboard UI screen layout and spacing", "UI Edit");
  }

  if (action === "upload-design-asset") {
    setRoleResult("Design asset added to the asset library.");
    addRoleHistory("Design", "Design Team", "Added new icon/image asset to the library", "Asset Upload");
  }

});
