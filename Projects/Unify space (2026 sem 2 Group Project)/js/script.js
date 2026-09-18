const termsModal = document.getElementById("termsModal");
    const accessDenied = document.getElementById("accessDenied");
    const agreeTermsBtn = document.getElementById("agreeTermsBtn");
    const denyTermsBtn = document.getElementById("denyTermsBtn");

    agreeTermsBtn?.addEventListener("click", () => {
      termsModal.style.display = "none";
    });

    denyTermsBtn?.addEventListener("click", () => {
      termsModal.style.display = "none";
      accessDenied.style.display = "grid";
    });

    const landingPage = document.getElementById("landingPage");
    const appScreen = document.getElementById("appScreen");
    const currentPlan = document.getElementById("currentPlan");
    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");
    const channelTitle = document.getElementById("channelTitle");
    const channelDescription = document.getElementById("channelDescription");
    const aiBox = document.getElementById("aiBox");
    const meetingModal = document.getElementById("meetingModal");
    const cameraVideo = document.getElementById("cameraVideo");
    const videoBox = document.getElementById("videoBox");
    const screenShareVideo = document.getElementById("screenShareVideo");
    const screenShareBox = document.getElementById("screenShareBox");
    const meetingStatus = document.getElementById("meetingStatus");
    const startScreenShareBtn = document.getElementById("startScreenShareBtn");
    const stopScreenShareBtn = document.getElementById("stopScreenShareBtn");
    let cameraStream = null;
    let screenStream = null;

    const channelData = {
      general: {
        title: "# general",
        description: "Team communication, updates, and discussion.",
        messages: [
          ["Aye", "Today 9:00 AM", "Welcome everyone. Please share your project updates here."],
          ["Min", "Today 9:05 AM", "I finished the communication tool homepage and pricing section."],
          ["Nora", "Today 9:08 AM", "I uploaded the design prototype and logo ideas."],
          ["AI", "Today 9:10 AM", "Summary: Team is preparing homepage, design files, and presentation."],
        ]
      },
      announcements: {
        title: "# announcements",
        description: "Important team announcements.",
        messages: [
          ["Admin", "Yesterday", "Presentation rehearsal is scheduled for Friday."],
          ["Admin", "Today", "Please check your assigned tasks before the meeting."],
        ]
      },
      "it-team": {
        title: "# it-team",
        description: "Developer communication and technical updates.",
        messages: [
          ["Min", "Today", "I am working on the login page and chat JavaScript."],
          ["David", "Today", "We should add Firebase later for real database storage."],
        ]
      },
      business: {
        title: "# business",
        description: "Business model, pricing, and planning. Available in Team and Enterprise plans.",
        messages: [
          ["Aye", "Today", "Free plan is for basic chat. Pro plan includes AI and more storage."],
          ["Nora", "Today", "We can present competitors as future integration partners."],
        ]
      },
      design: {
        title: "# design",
        description: "UI, prototype, graphics, and brand discussion. Available in Team and Enterprise plans.",
        messages: [
          ["Nora", "Today", "The design should be clean, simple, and similar to modern collaboration apps."],
          ["Aye", "Today", "Please keep the interface easy for students and teams."],
        ]
      },
      admin: {
        title: "# admin-security",
        description: "Enterprise security, admin controls, and access logs.",
        messages: [
          ["Security Bot", "Today", "Role-based access control is enabled."],
          ["Admin", "Today", "Enterprise analytics and audit logs are available."],
        ]
      }
    };

    let activeChannel = "general";
    let selectedPlan = "Free";

    const analyticsModal = document.getElementById("analyticsModal");
    const closeAnalyticsBtn = document.getElementById("closeAnalyticsBtn");

    const storageLimits = {
      Free: 15,
      Pro: 64,
      Team: 256,
      Enterprise: 512
    };

    const storageUsed = {
      Free: 5.8,
      Pro: 18.4,
      Team: 92.6,
      Enterprise: 188.2
    };

    const planRules = {
      Free: {
        notice: "Free Plan: basic chat, basic calls, 15GB cloud storage, small team spaces, and analytics dashboard access.",
        features: ["Basic messaging", "Basic calls", "15GB cloud storage", "Small team spaces", "Analytics dashboard"]
      },
      Pro: {
        notice: "Pro Plan: includes Free features plus AI summaries, 64GB cloud storage, full communication tools, and analytics dashboard access.",
        features: ["64GB cloud storage", "AI summaries", "Full communication", "Basic integrations", "Analytics dashboard"]
      },
      Team: {
        notice: "Team Plan: includes Pro features plus 256GB cloud storage, project spaces, business/design channels, advanced history, and analytics dashboard access.",
        features: ["256GB cloud storage", "Project spaces", "Advanced history", "Team dashboard", "Analytics dashboard"]
      },
      Enterprise: {
        notice: "Enterprise Plan: includes all features plus 512GB cloud storage, security center, admin controls, advanced analytics, and custom integrations.",
        features: ["512GB cloud storage", "Advanced security", "Custom integrations", "Priority support", "Analytics dashboard"]
      }
    };

    function planLevel(plan) {
      return { Free: 1, Pro: 2, Team: 3, Enterprise: 4 }[plan] || 1;
    }

    function getAnalyticsStats() {
      const taskCards = Array.from(document.querySelectorAll("#taskList .task-card"));
      const totalTasks = taskCards.length;
      const completedTasks = taskCards.filter(card => card.querySelector('input[type="checkbox"]')?.checked).length;
      const remainingTasks = Math.max(totalTasks - completedTasks, 0);
      const inProgressTasks = remainingTasks > 0 ? Math.max(1, Math.round(remainingTasks * 0.5)) : 0;
      const notStartedTasks = Math.max(remainingTasks - inProgressTasks, 0);

      const completedPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const inProgressPercent = totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
      const notStartedPercent = Math.max(0, 100 - completedPercent - inProgressPercent);

      const today = typeof formatDate === "function" ? formatDate(new Date()) : null;
      const scheduledMeetings = Array.isArray(meetings) ? (today ? meetings.filter(meeting => meeting.date === today).length : meetings.length) : 0;
      const storageLimit = storageLimits[selectedPlan] || storageLimits.Free;
      const storageCurrent = storageUsed[selectedPlan] || 0;
      const storagePercent = storageLimit ? Math.round((storageCurrent / storageLimit) * 100) : 0;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        notStartedTasks,
        completedPercent,
        inProgressPercent,
        notStartedPercent,
        scheduledMeetings,
        storageLimit,
        storageCurrent,
        storagePercent
      };
    }

    function renderAnalytics() {
      if (!analyticsModal) return;

      const stats = getAnalyticsStats();
      const pieChart = document.getElementById("analyticsPieChart");
      const legend = document.getElementById("analyticsLegend");
      const workDone = document.getElementById("analyticsWorkDone");
      const taskSummary = document.getElementById("analyticsTaskSummary");
      const meetingSummary = document.getElementById("analyticsMeetingSummary");
      const storageSummary = document.getElementById("analyticsStorageSummary");
      const insights = document.getElementById("analyticsInsights");

      if (pieChart) {
        pieChart.style.background = `conic-gradient(#4f46e5 0 ${stats.completedPercent}%, #22c55e ${stats.completedPercent}% ${stats.completedPercent + stats.inProgressPercent}%, #f59e0b ${stats.completedPercent + stats.inProgressPercent}% 100%)`;
      }

      if (legend) {
        legend.innerHTML = `
          <div class="legend-item"><span class="legend-dot done"></span><strong>${stats.completedPercent}%</strong><small>Completed</small></div>
          <div class="legend-item"><span class="legend-dot progress"></span><strong>${stats.inProgressPercent}%</strong><small>In Progress</small></div>
          <div class="legend-item"><span class="legend-dot pending"></span><strong>${stats.notStartedPercent}%</strong><small>Pending</small></div>
        `;
      }

      if (workDone) workDone.textContent = `${stats.completedPercent}%`;
      if (taskSummary) taskSummary.textContent = `${stats.completedTasks} / ${stats.totalTasks}`;
      if (meetingSummary) meetingSummary.textContent = `${stats.scheduledMeetings}`;
      if (storageSummary) storageSummary.textContent = `${stats.storageCurrent.toFixed(1)}GB / ${stats.storageLimit}GB`;

      if (insights) {
        insights.innerHTML = `
          <div class="analytics-insight-card"><strong>Plan</strong><span>${selectedPlan}</span></div>
          <div class="analytics-insight-card"><strong>Completed Tasks</strong><span>${stats.completedTasks} task(s)</span></div>
          <div class="analytics-insight-card"><strong>In Progress</strong><span>${stats.inProgressTasks} task(s)</span></div>
          <div class="analytics-insight-card"><strong>Pending</strong><span>${stats.notStartedTasks} task(s)</span></div>
          <div class="analytics-insight-card"><strong>Meetings Today</strong><span>${stats.scheduledMeetings}</span></div>
          <div class="analytics-insight-card"><strong>Storage Usage</strong><span>${stats.storagePercent}% used</span></div>
        `;
      }
    }

    function openAnalyticsModal() {
      renderAnalytics();
      analyticsModal?.classList.add("active");
    }

    function closeAnalyticsModal() {
      analyticsModal?.classList.remove("active");
    }

    function updateStoragePanel(plan) {
      const limit = storageLimits[plan] || storageLimits.Free;
      const used = storageUsed[plan] || 0;
      const percent = Math.min((used / limit) * 100, 100);

      const storagePlanName = document.getElementById("storagePlanName");
      const storageLimitText = document.getElementById("storageLimitText");
      const storageUsedText = document.getElementById("storageUsedText");
      const storageFill = document.getElementById("storageFill");

      if (storagePlanName) storagePlanName.textContent = `${plan} Cloud Storage`;
      if (storageLimitText) storageLimitText.textContent = `${limit}GB limit`;
      if (storageUsedText) storageUsedText.textContent = `${used.toFixed(1)}GB used of ${limit}GB`;
      if (storageFill) storageFill.style.width = `${percent}%`;
    }

    function updatePlanAccess(plan) {
      selectedPlan = plan;
      const level = planLevel(plan);
      const notice = document.getElementById("planNotice");
      const featurePanel = document.getElementById("planFeaturePanel");
      const rules = planRules[plan];

      notice.textContent = rules.notice;
      featurePanel.innerHTML = `<strong>${plan} Plan Features</strong><ul>${rules.features.map(item => `<li>${item}</li>`).join("")}</ul>`;
      updateStoragePanel(plan);

      document.querySelectorAll(".plan-pro").forEach(el => el.classList.toggle("locked", level < 2));
      document.querySelectorAll(".plan-team").forEach(el => el.classList.toggle("locked", level < 3));
      document.querySelectorAll(".plan-enterprise").forEach(el => el.classList.toggle("locked", level < 4));
    }

    function openApp(plan = "Free") {
      currentPlan.textContent = plan + " Plan";

      // Show ONLY the dashboard and hide the landing page.
      // We use both class and style so it still works even if the browser caches old CSS.
      landingPage.classList.add("hidden");
      landingPage.style.display = "none";

      appScreen.classList.remove("hidden");
      appScreen.style.display = "block";

      activeChannel = "general";
      document.querySelectorAll(".channel-btn").forEach(b => b.classList.remove("active"));
      document.querySelector('[data-channel="general"]').classList.add("active");
      updatePlanAccess(plan);
      loadChannel(activeChannel);
      renderAnalytics();
      window.scrollTo(0, 0);
    }

    // Plan buttons are handled by roles/roles.js.
    // Flow: choose plan -> select role -> open the role dashboard.

    document.getElementById("backHomeBtn").addEventListener("click", () => {
      appScreen.classList.add("hidden");
      appScreen.style.display = "none";

      landingPage.classList.remove("hidden");
      landingPage.style.display = "block";
      window.scrollTo(0, 0);
    });

    function loadChannel(channelName) {
      const channel = channelData[channelName];
      channelTitle.textContent = channel.title;
      channelDescription.textContent = channel.description;
      messages.innerHTML = "";
      channel.messages.forEach(msg => addMessage(msg[0], msg[1], msg[2], false));
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(name, time, text, save = true) {
      const div = document.createElement("div");
      div.className = "message";
      div.innerHTML = `
        <div class="avatar">${name.charAt(0)}</div>
        <div class="message-body">
          <div class="message-top"><strong>${name}</strong><span>${time}</span></div>
          <div class="message-text"></div>
        </div>
      `;
      div.querySelector(".message-text").textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;

      if (save) {
        channelData[activeChannel].messages.push([name, "Now", text]);
      }
      renderAnalytics();
    }

    function sendMessage() {
      const text = messageInput.value.trim();
      if (!text) return;
      addMessage("You", "Now", text);
      messageInput.value = "";

      setTimeout(() => {
        addMessage("AI", "Now", "Thanks. I noted this update for the team summary.");
      }, 500);
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keydown", e => {
      if (e.key === "Enter") sendMessage();
    });

    document.querySelectorAll(".channel-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("locked")) {
          alert("This channel is not included in your current plan.");
          return;
        }
        document.querySelectorAll(".channel-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeChannel = btn.dataset.channel;
        loadChannel(activeChannel);
      });
    });

    document.getElementById("aiSummaryBtn").addEventListener("click", () => {
      if (planLevel(selectedPlan) < 2) {
        alert("AI Summary is available in Pro, Team, and Enterprise plans.");
        return;
      }
      aiBox.innerHTML = `
        <strong>🤖 AI Summary</strong>
        Current channel: ${channelData[activeChannel].title}<br><br>
        Main updates: team is discussing project progress, files, design, tasks, and communication features.<br><br>
        Suggested next task: prepare presentation slides and test the chat demo.
      `;
      addMessage("AI", "Now", "I generated a project summary and suggested the next task.");
    });

    function isScreenCaptureSupported() {
      return Boolean(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
    }

    async function startCamera() {
      if (cameraStream) return;

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        meetingStatus.textContent = "Camera is not supported in this browser. Try Chrome or Edge.";
        return;
      }

      try {
        meetingStatus.textContent = "Starting camera... Please allow camera permission.";
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        cameraVideo.srcObject = cameraStream;
        videoBox.classList.add("camera-on");
        meetingStatus.textContent = "Camera is on. Click Share Screen to show your real screen preview.";
      } catch (error) {
        meetingStatus.textContent = "Camera was blocked or not found. You can still try screen sharing.";
      }
    }

    async function openMeeting(options = {}) {
      meetingModal.classList.add("active");

      // Browser screen sharing must start directly from a user click.
      // So if the user clicked "Share Screen", start it immediately instead of waiting for camera permission first.
      if (options.startScreenShare) {
        await startScreenShare();
        return;
      }

      await startCamera();
    }

    async function startScreenShare() {
      meetingModal.classList.add("active");

      if (!isScreenCaptureSupported()) {
        meetingStatus.textContent = "Screen sharing is not supported here. Use Chrome or Edge with Live Server, localhost, or HTTPS.";
        return;
      }

      try {
        meetingStatus.textContent = "Choose a tab, window, or entire screen to share.";
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        screenShareVideo.srcObject = screenStream;
        screenShareBox.classList.add("screen-on");
        startScreenShareBtn.classList.add("hidden");
        stopScreenShareBtn.classList.remove("hidden");
        meetingStatus.textContent = "Screen sharing is active. Your selected screen is shown in the meeting preview.";

        const [screenTrack] = screenStream.getVideoTracks();
        if (screenTrack) {
          screenTrack.addEventListener("ended", stopScreenShare);
        }

        if (typeof addMessage === "function") {
          addMessage("System", "Now", "Screen sharing started.");
        }
      } catch (error) {
        meetingStatus.textContent = "Screen sharing was cancelled or blocked by the browser.";
      }
    }

    function stopScreenShare() {
      const wasSharing = Boolean(screenStream);

      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
      }

      screenShareVideo.srcObject = null;
      screenShareBox.classList.remove("screen-on");
      startScreenShareBtn.classList.remove("hidden");
      stopScreenShareBtn.classList.add("hidden");
      meetingStatus.textContent = "Screen sharing stopped. You can share again or end the meeting.";

      if (wasSharing && typeof addMessage === "function") {
        addMessage("System", "Now", "Screen sharing stopped.");
      }
    }

    function closeMeeting() {
      meetingModal.classList.remove("active");
      videoBox.classList.remove("camera-on");
      meetingStatus.textContent = "Start a meeting, then click Share Screen and choose a tab, window, or entire screen.";

      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
      }
      cameraVideo.srcObject = null;
      stopScreenShare();
    }

    document.getElementById("meetingBtn").addEventListener("click", () => openMeeting());
    document.getElementById("meetingBtn2").addEventListener("click", () => openMeeting());
    document.getElementById("screenShareBtn").addEventListener("click", () => openMeeting({ startScreenShare: true }));
    document.getElementById("screenShareBtn2").addEventListener("click", () => openMeeting({ startScreenShare: true }));
    startScreenShareBtn.addEventListener("click", startScreenShare);
    stopScreenShareBtn.addEventListener("click", stopScreenShare);
    document.getElementById("closeMeetingBtn").addEventListener("click", closeMeeting);

    document.getElementById("notifyBtn").addEventListener("click", () => {
      alert("Notification: You have a new team update!");
    });

    document.getElementById("uploadBtn").addEventListener("click", () => {
      const limit = storageLimits[selectedPlan] || storageLimits.Free;
      const currentUsed = storageUsed[selectedPlan] || 0;
      const fileName = prompt("Enter a demo file name to share:", "Project_File.pdf");
      if (!fileName) return;

      const sizeInput = prompt(`Enter demo file size in GB. ${selectedPlan} plan has ${limit}GB total storage:`, "1.0");
      const fileSize = Number.parseFloat(sizeInput);
      if (!Number.isFinite(fileSize) || fileSize <= 0) {
        alert("Please enter a valid file size greater than 0GB.");
        return;
      }

      if (currentUsed + fileSize > limit) {
        const remaining = Math.max(limit - currentUsed, 0).toFixed(1);
        alert(`${selectedPlan} Plan storage limit reached. You only have ${remaining}GB remaining out of ${limit}GB.`);
        return;
      }

      storageUsed[selectedPlan] = currentUsed + fileSize;
      updateStoragePanel(selectedPlan);
      renderAnalytics();

      const fileList = document.getElementById("fileList");
      const div = document.createElement("div");
      div.className = "file-card";
      div.innerHTML = `<strong></strong><span>${fileSize.toFixed(1)}GB • Uploaded just now</span>`;
      div.querySelector("strong").textContent = fileName;
      fileList.prepend(div);
      addMessage("You", "Now", `Uploaded file: ${fileName} (${fileSize.toFixed(1)}GB)`);
    });

    document.getElementById("addTaskBtn").addEventListener("click", () => {
      if (planLevel(selectedPlan) < 3 && document.querySelectorAll("#taskList .task-card").length >= 3) {
        alert("More task tracking is available in the Team and Enterprise plans.");
        return;
      }
      const task = prompt("Enter new task:", "Review communication tool demo");
      if (!task) return;
      const label = document.createElement("label");
      label.className = "task-card";
      label.innerHTML = `<input type="checkbox" /> ${task}<span>New</span>`;
      document.getElementById("taskList").prepend(label);
      renderAnalytics();
    });

    document.getElementById("taskList").addEventListener("change", e => {
      if (e.target.type === "checkbox") {
        e.target.closest(".task-card").classList.toggle("done", e.target.checked);
        renderAnalytics();
      }
    });

    document.getElementById("securityBtn").addEventListener("click", () => {
      if (planLevel(selectedPlan) < 4) {
        alert("Security Center is only available in the Enterprise plan.");
        return;
      }
      alert("Security Center: role access, encryption status, and audit logs are enabled.");
    });

    document.getElementById("analyticsBtn").addEventListener("click", openAnalyticsModal);
    closeAnalyticsBtn?.addEventListener("click", closeAnalyticsModal);
    analyticsModal?.addEventListener("click", e => {
      if (e.target === analyticsModal) closeAnalyticsModal();
    });

    document.getElementById("searchInput").addEventListener("input", e => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll(".member-card, .file-card").forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(query) ? "block" : "none";
      });
    });
