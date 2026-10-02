document.documentElement.classList.add("js");

const steps = [
  { name: "发起任务", code: "STEP 01 / INPUT", title: "发起任务", text: "用户可以从活跃告警直接发起，也可以用自然语言描述现象。系统继承告警对象、环境与时间范围，减少重复输入。", label: "Input", screen: "payment-svc P99 延迟异常", detail: "生产环境 · 最近 30 分钟 · 从告警进入诊断" },
  { name: "补齐范围", code: "STEP 02 / SCOPE", title: "补齐范围", text: "当服务、环境、时间窗或影响对象缺失时，系统先追问并允许用户修正，不在错误前提下启动任务。", label: "Context", screen: "等待确认服务、环境与时间窗", detail: "对象 payment-svc · 环境 production · 时间窗待确认" },
  { name: "采集证据", code: "STEP 03 / EVIDENCE", title: "采集证据", text: "Agent 调用指标、日志、拓扑、变更记录和历史案例，形成可追溯的证据集合。", label: "Collecting", screen: "正在调用多项数据源", detail: "指标、日志、拓扑、变更、历史案例" },
  { name: "展示过程", code: "STEP 04 / OBSERVE", title: "展示过程", text: "用户能看到任务状态、工具调用、证据来源、失败原因和剩余步骤，而不是只等待一句结论。", label: "Running", screen: "关联分析中", detail: "状态、数据源、证据与不确定性同步展示" },
  { name: "形成判断", code: "STEP 05 / JUDGE", title: "形成判断", text: "系统区分事实、推断、根因假设和修复建议；证据不足时降低确定性并提示继续追查。", label: "Judgement", screen: "形成根因假设与修复方向", detail: "事实、推断、建议分层展示" },
  { name: "用户决策", code: "STEP 06 / CONTROL", title: "用户决策", text: "高风险动作前，用户查看依据、修改方案、确认或终止。第一阶段 Agent 不直接执行生产操作。", label: "Human control", screen: "等待人工确认", detail: "查看证据 · 修改方案 · 确认或终止" }
];

const plans = {
  a: {
    title: "方案 A：传统仪表盘叠加 AI",
    status: "被排除",
    body: "延续已有使用习惯，学习成本较低；但 Agent 能力分散，用户仍需主动寻找功能，复杂任务无法形成连续上下文。"
  },
  b: {
    title: "方案 B：多个独立智能体入口",
    status: "部分可用",
    body: "任务边界清晰，降低试探成本；但跨任务上下文容易断裂，用户需要重复输入对象、环境、时间窗和历史信息。"
  },
  c: {
    title: "方案 C：任务化入口 + 统一上下文",
    status: "最终采用",
    body: "任务入口清晰，同时保留对象、环境、时间窗、历史对话和证据，兼顾任务边界与上下文连续性。"
  }
};

const tabs = document.querySelector(".step-tabs");
const code = document.querySelector("#stepCode");
const title = document.querySelector("#stepTitle");
const text = document.querySelector("#stepText");
const screenLabel = document.querySelector("#screenLabel");
const screenTitle = document.querySelector("#screenTitle");
const screenText = document.querySelector("#screenText");
const prev = document.querySelector("#prevStep");
const next = document.querySelector("#nextStep");
let activeStep = 0;

function renderStep(index) {
  activeStep = index;
  const step = steps[index];
  [...tabs.children].forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
    tab.setAttribute("aria-selected", String(i === index));
  });
  code.textContent = step.code;
  title.textContent = step.title;
  text.textContent = step.text;
  screenLabel.textContent = step.label;
  screenTitle.textContent = step.screen;
  screenText.textContent = step.detail;
  prev.disabled = index === 0;
  next.disabled = index === steps.length - 1;
}

if (tabs) {
  steps.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.role = "tab";
    button.textContent = `${String(index + 1).padStart(2, "0")} ${step.name}`;
    button.addEventListener("click", () => renderStep(index));
    tabs.appendChild(button);
  });
  prev.addEventListener("click", () => renderStep(Math.max(0, activeStep - 1)));
  next.addEventListener("click", () => renderStep(Math.min(steps.length - 1, activeStep + 1)));
  renderStep(0);
}

const switcher = document.querySelector(".switcher");
const planPanel = document.querySelector("#planPanel");
function renderPlan(key) {
  const plan = plans[key];
  planPanel.innerHTML = `<small>${plan.status}</small><h3>${plan.title}</h3><p>${plan.body}</p>`;
  switcher.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button.dataset.plan === key));
}
if (switcher && planPanel) {
  switcher.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-plan]");
    if (button) renderPlan(button.dataset.plan);
  });
  renderPlan("c");
}

const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector("#site-nav");
if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const open = siteNav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  siteNav.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
}

const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach((el) => revealObserver.observe(el));

const navLinks = [...document.querySelectorAll("#site-nav a")];
const navTargets = new Set(navLinks.map((link) => link.getAttribute("href")?.slice(1)).filter(Boolean));
const sections = [...document.querySelectorAll("main section[id]")].filter((section) => navTargets.has(section.id));
const spy = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    }
  });
}, { rootMargin: "-30% 0px -55%", threshold: 0 });
sections.forEach((section) => spy.observe(section));

const progress = document.querySelector(".progress span");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
