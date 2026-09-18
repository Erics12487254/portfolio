
// Calendar folder JavaScript - connected in index.html
let meetings = JSON.parse(localStorage.getItem("meetings")) || [];
let currentDate = new Date();
let selectedDate = formatDate(new Date());

const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthYear = document.getElementById("calendarMonthYear");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const meetingList = document.getElementById("meetingList");
const meetingTitle = document.getElementById("meetingTitle");
const meetingTime = document.getElementById("meetingTime");
const addMeetingBtn = document.getElementById("addMeetingBtn");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderCalendar() {
  if (!calendarGrid) return;

  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  calendarMonthYear.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("button");
    empty.className = "calendar-day empty-day";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateString = formatDate(date);

    const dayBtn = document.createElement("button");
    dayBtn.className = "calendar-day";
    dayBtn.textContent = day;

    if (dateString === selectedDate) dayBtn.classList.add("selected");
    if (dateString === formatDate(new Date())) dayBtn.classList.add("today");
    if (meetings.some(meeting => meeting.date === dateString)) dayBtn.classList.add("has-meeting");

    dayBtn.addEventListener("click", () => {
      selectedDate = dateString;
      renderCalendar();
      displayMeetings();
    });

    calendarGrid.appendChild(dayBtn);
  }

  displayMeetings();
}

function addMeeting() {
  const title = meetingTitle.value.trim();
  const time = meetingTime.value;

  if (!title || !time) {
    alert("Please enter meeting title and time.");
    return;
  }

  const meeting = {
    id: Date.now(),
    title,
    time,
    date: selectedDate
  };

  meetings.push(meeting);
  saveMeetings();
  if (typeof renderAnalytics === "function") renderAnalytics();

  meetingTitle.value = "";
  meetingTime.value = "";

  renderCalendar();
  alert(`Reminder set: ${title} on ${selectedDate} at ${time}`);
}

function displayMeetings() {
  if (!meetingList) return;

  selectedDateTitle.textContent = `Meetings on ${selectedDate}`;
  meetingList.innerHTML = "";

  const dayMeetings = meetings
    .filter(meeting => meeting.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  if (dayMeetings.length === 0) {
    meetingList.innerHTML = `<p style="color:#64748b; font-size:13px;">No meetings for this date.</p>`;
    return;
  }

  dayMeetings.forEach(meeting => {
    const div = document.createElement("div");
    div.className = "meeting-item";

    div.innerHTML = `
      <strong>${meeting.title}</strong>
      <span>🕒 ${meeting.time}</span>
      <div class="meeting-actions">
        <button class="start-meeting-btn" onclick="startCalendarMeeting(${meeting.id})">Start</button>
        <button class="delete-meeting-btn" onclick="deleteMeeting(${meeting.id})">Delete</button>
      </div>
    `;

    meetingList.appendChild(div);
  });
}

function startCalendarMeeting(id) {
  const meeting = meetings.find(meeting => meeting.id === id);
  if (!meeting) return;

  alert(`Starting meeting: ${meeting.title}`);

  if (typeof openMeeting === "function") {
    openMeeting();
  }
}

function deleteMeeting(id) {
  meetings = meetings.filter(meeting => meeting.id !== id);
  saveMeetings();
  renderCalendar();
  if (typeof renderAnalytics === "function") renderAnalytics();
}

function saveMeetings() {
  localStorage.setItem("meetings", JSON.stringify(meetings));
}

addMeetingBtn?.addEventListener("click", addMeeting);

prevMonthBtn?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn?.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
