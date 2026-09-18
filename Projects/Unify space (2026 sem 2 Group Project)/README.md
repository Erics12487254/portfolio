# UnifySpace - Real Screen Share Version

Clean partitioned website version with:

- Get Started button that scrolls to the role section
- Plan selection
- Role selection popup
- Role-specific dashboards
- Calendar folder
- Roles folder
- Real browser screen sharing demo
- Cloud storage quotas by plan
- Real browser screen sharing using `navigator.mediaDevices.getDisplayMedia()`
- Camera meeting preview using `navigator.mediaDevices.getUserMedia()`

## Folder structure

- `index.html` - main website page and dashboard
- `html/terms.html` - full Terms & Conditions page
- `css/style.css` - main design, layout, meeting modal, and screen share styling
- `js/script.js` - main dashboard features, camera meeting, and real screen sharing logic
- `calendar/calendar.html` - separate calendar page
- `calendar/calendar.css` - calendar styling
- `calendar/calendar.js` - calendar logic
- `roles/roles.html` - role modal HTML reference
- `roles/roles.css` - role popup and role dashboard styling
- `roles/roles.js` - role selection and role functions
- `images/` - put your images/logo here
- `.vscode/launch.json` - optional VS Code launch config

## How it works

1. Open `index.html` with VS Code Live Server, XAMPP, or another localhost server.
2. Click any plan: Free, Pro, Team, or Enterprise.
3. A popup asks you to select a role.
4. Choose IT, Business, Engineering, or Design.
5. The dashboard opens with role-specific functions.
6. Click **Start Meeting** to open the camera meeting modal.
7. Click **Share Screen** to choose a browser tab, window, or full screen.
8. Click **Stop Sharing** or **End Meeting** to stop the screen stream.

## Important screen sharing note

Real browser screen sharing usually works only on secure origins:

- `localhost`
- VS Code Live Server
- XAMPP local server
- HTTPS website

It may not work correctly if you open the file directly with `file://`.

## Role functions

### IT
- AI Coding Assistant
- Git Push/Pull
- Built-in Repository
- Code Editor

### Business
- Excel Integration
- Flowchart Builder
- Business Model Canvas
- AI Analytics

### Engineering
- AutoCAD Support
- Simulation Tools
- Technical Drawings
- Project Files

### Design
- UI/UX Tools
- Graphics Editor
- Prototype Builder
- Asset Library

## How to run with VS Code Live Server

1. Open the folder in VS Code.
2. Right-click `index.html`.
3. Click **Open with Live Server**.
4. Use Chrome or Edge for best camera and screen sharing support.

## Run with XAMPP

1. Copy the folder into `C:\xampp\htdocs`.
2. Start Apache in XAMPP.
3. Open the local URL in Chrome or Edge.


## Cloud storage quotas

- Free: 15GB
- Pro: 64GB
- Team: 256GB
- Enterprise: 512GB

The dashboard includes a storage meter and checks the selected plan limit when uploading demo files.

- Analytics dashboard available in all plans
- Pie chart for work progress, tasks, meetings, and storage

- Role-based activity history for IT, Business, Engineering, and Design
- Shows who fixed, pushed, edited, uploaded, reviewed, and changed work
