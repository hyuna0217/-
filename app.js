const top30Schools = [
  "Princeton", "MIT", "Harvard", "Stanford", "Yale", "UPenn", "Caltech", "Duke", "Brown", "Johns Hopkins",
  "Northwestern", "Columbia", "Cornell", "UChicago", "UC Berkeley", "UCLA", "Rice", "Dartmouth", "Vanderbilt", "Notre Dame",
  "Michigan", "Georgetown", "UNC Chapel Hill", "Carnegie Mellon", "Emory", "Virginia", "WashU", "USC", "NYU", "Tufts"
];

const schoolList = document.getElementById("school-list");
const form = document.getElementById("planner-form");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const timeline = document.getElementById("timeline");

function renderSchools() {
  top30Schools.forEach((school) => {
    const label = document.createElement("label");
    label.className = "school-item";
    label.innerHTML = `<input type="checkbox" value="${school}" /> <span>${school}</span>`;
    schoolList.appendChild(label);
  });
}

function shiftDate(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

function generatePlan({ startDate, deadlineDate, satTarget, toeflTarget, schools }) {
  const deadline = new Date(deadlineDate);
  const start = new Date(startDate);
  const totalDays = Math.ceil((deadline - start) / (1000 * 60 * 60 * 24));

  const milestones = [
    {
      date: shiftDate(deadline, -180),
      title: "SAT/TOEFL 진단 및 학습 루틴 확정",
      detail: `SAT ${satTarget}, TOEFL ${toeflTarget} 목표 기준 주간 계획 시작`,
    },
    {
      date: shiftDate(deadline, -140),
      title: "1차 모의고사 + 약점 분석",
      detail: "점수 갭 기준으로 Reading/Math/Listening 비중 자동 조정",
    },
    {
      date: shiftDate(deadline, -110),
      title: "활동/수상/봉사 기록 정리",
      detail: "Common App 활동 리스트 초안 작성",
    },
    {
      date: shiftDate(deadline, -90),
      title: "에세이 브레인스토밍",
      detail: "Personal Statement 주제 3개 생성 후 1개 확정",
    },
    {
      date: shiftDate(deadline, -70),
      title: "추천서 요청",
      detail: "교사/카운슬러에게 요청 및 제출 일정 리마인드 설정",
    },
    {
      date: shiftDate(deadline, -45),
      title: "시험 최종 응시",
      detail: "점수 리포팅 소요 시간을 고려해 마지막 안전 응시일 확보",
    },
    {
      date: shiftDate(deadline, -30),
      title: "에세이 최종 수정",
      detail: "학교별 supplementary essay 마무리",
    },
    {
      date: shiftDate(deadline, -14),
      title: "서류/포트폴리오 최종 점검",
      detail: "누락 문서와 제출 상태 최종 확인",
    },
    {
      date: deadline,
      title: "원서 제출",
      detail: `${schools.length}개 학교 제출 완료 확인`,
    },
  ].filter((m) => m.date >= start && m.date <= deadline);

  return {
    totalDays,
    milestones,
  };
}

function getSelectedSchools() {
  return [...schoolList.querySelectorAll("input[type='checkbox']:checked")].map((input) => input.value);
}

function persist(values) {
  localStorage.setItem("unipath-plan", JSON.stringify(values));
}

function restore() {
  const raw = localStorage.getItem("unipath-plan");
  if (!raw) return;
  const data = JSON.parse(raw);

  document.getElementById("start-date").value = data.startDate || "";
  document.getElementById("deadline-date").value = data.deadlineDate || "";
  document.getElementById("sat-target").value = data.satTarget || 1450;
  document.getElementById("toefl-target").value = data.toeflTarget || 100;

  if (Array.isArray(data.schools)) {
    const set = new Set(data.schools);
    schoolList.querySelectorAll("input[type='checkbox']").forEach((input) => {
      input.checked = set.has(input.value);
    });
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    startDate: document.getElementById("start-date").value,
    deadlineDate: document.getElementById("deadline-date").value,
    satTarget: Number(document.getElementById("sat-target").value),
    toeflTarget: Number(document.getElementById("toefl-target").value),
    schools: getSelectedSchools(),
  };

  if (payload.schools.length === 0) {
    alert("최소 1개 이상의 학교를 선택해 주세요.");
    return;
  }

  if (new Date(payload.startDate) >= new Date(payload.deadlineDate)) {
    alert("시작일은 마감일보다 빨라야 합니다.");
    return;
  }

  const plan = generatePlan(payload);
  persist(payload);

  summary.innerHTML = `
    <p><strong>선택 학교:</strong> ${payload.schools.join(", ")}</p>
    <p><strong>준비 기간:</strong> ${plan.totalDays}일</p>
    <p class="muted">시간 절약 포인트: 학교별 요구사항 확인, 시험일정 역산, 제출 단계 점검을 하나의 흐름으로 통합</p>
  `;

  timeline.innerHTML = "";
  plan.milestones.forEach((m) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${formatDate(m.date)} — ${m.title}</strong><br/><span class="muted">${m.detail}</span>`;
    timeline.appendChild(item);
  });

  results.hidden = false;
});

renderSchools();
restore();
