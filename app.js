const pages = {
  dashboard: "领导驾驶舱",
  org: "组织人员",
  import: "测评结果导入",
  register: "重点人员台账",
  followup: "随访任务中心",
  crisis: "危机干预闭环",
  service: "心理服务台账",
  report: "AI报告中心",
  audit: "权限审计与备份",
};

const people = [
  { code: "PERSON-1Y-0018", name: "张某", fullName: "张建峰", age: 22, post: "战士", unit: "一营三连", risk: "橙色", source: "测评导入", owner: "李心理师", status: "持续随访", closed: "未闭环", score: 78, dimension: "焦虑/睡眠", raw: "SAS 61 / PSQI 13", review: "待心理师复核", suggestion: "建议 48 小时内访谈，纳入随访任务" },
  { code: "PERSON-2Y-0041", name: "赵某", fullName: "赵明远", age: 24, post: "班长", unit: "二营一连", risk: "红色", source: "骨干上报", owner: "周主任", status: "危机复盘", closed: "未闭环", score: 92, dimension: "抑郁/冲动", raw: "SDS 69 / 危机问项阳性", review: "已复核", suggestion: "已进入危机干预闭环，需双确认复盘" },
  { code: "PERSON-3Y-0022", name: "王某", fullName: "王子昂", age: 20, post: "新兵", unit: "三营二连", risk: "黄色", source: "谈心谈话", owner: "王教员", status: "观察中", closed: "跟踪中", score: 64, dimension: "适应/人际", raw: "适应量表 72", review: "待复核", suggestion: "建议心理骨干持续观察，两周后复测" },
  { code: "PERSON-JG-0007", name: "陈某", fullName: "陈浩然", age: 27, post: "勤务保障", unit: "机关保障队", risk: "橙色", source: "热线记录", owner: "李心理师", status: "复访到期", closed: "未闭环", score: 81, dimension: "压力/睡眠", raw: "PSS 31 / PSQI 14", review: "待复访", suggestion: "建议安排复访并核实近期压力源" },
  { code: "PERSON-1Y-0063", name: "刘某", fullName: "刘宇航", age: 21, post: "战士", unit: "一营一连", risk: "绿色", source: "周期测评", owner: "心理骨干", status: "稳定", closed: "已闭环", score: 32, dimension: "常规筛查", raw: "各维度正常", review: "无需复核", suggestion: "保持常规心理服务触达" },
];

const services = [
  ["个体咨询", "24", "满意度 96%", "本月完成"],
  ["团体辅导", "8", "覆盖 326 人", "计划内"],
  ["心理讲座", "5", "干部骨干专题", "已归档"],
  ["热线支持", "41", "平均响应 8 分钟", "持续开放"],
  ["巡诊服务", "12", "基层连队覆盖", "进行中"],
  ["危机干预", "2", "均已人工复核", "复盘中"],
];

const audits = [
  ["2026-05-27 19:42", "单位领导查看汇总驾驶舱", "允许"],
  ["2026-05-27 19:39", "李心理师确认月度报告草稿", "已留痕"],
  ["2026-05-27 19:30", "管理员导入测评 Excel 原始文件", "已归档"],
  ["2026-05-27 19:18", "王教员填写随访记录", "待复核"],
  ["2026-05-27 18:55", "审计员查看导出记录", "允许"],
];

function tagClass(risk) {
  return { 红色: "red", 橙色: "orange", 黄色: "yellow", 绿色: "green" }[risk] || "blue";
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setPage(page) {
  document.querySelectorAll(".page").forEach((node) => node.classList.remove("active"));
  document.querySelector(`#${page}-page`).classList.add("active");
  document.querySelectorAll(".nav-item").forEach((node) => node.classList.toggle("active", node.dataset.page === page));
  document.querySelector("#page-title").textContent = pages[page];
  const story = document.querySelector("#story-strip");
  story.style.display = page === "dashboard" ? "grid" : "none";
}

function dataShell(title, body, side = "", full = false) {
  return `
    <div class="data-page-shell ${full ? "full-data-shell" : ""}">
      <div>
        <div class="toolbar">
          <div>
            <h3>${title}</h3>
            <p class="system-name">系统保留完整业务字段，敏感详情按权限显示。</p>
          </div>
          <div class="filters">
            <input class="search" placeholder="搜索人员/单位/任务" />
            <select class="select"><option>全部状态</option><option>未闭环</option><option>待复核</option></select>
          </div>
        </div>
        ${body}
      </div>
      ${full ? "" : `<aside class="side-detail">${side}</aside>`}
    </div>
  `;
}

function peopleTable() {
  return `
    <table class="data-table">
      <thead><tr><th>脱敏编码</th><th>单位</th><th>风险等级</th><th>来源</th><th>责任人</th><th>状态</th><th>闭环</th></tr></thead>
      <tbody>
        ${people
          .map(
            (p) => `
          <tr>
            <td>${p.code}</td><td>${p.unit}</td>
            <td><span class="tag ${tagClass(p.risk)}">${p.risk}</span></td>
            <td>${p.source}</td><td>${p.owner}</td><td>${p.status}</td><td>${p.closed}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function assessmentImportTable() {
  return `
    <div class="view-alert">
      <b>当前为心理师授权视图</b>
      <span>领导驾驶舱默认只看连队汇总；心理师/授权人员可追溯到具体个体，所有查看行为写入审计日志。</span>
    </div>
    <table class="data-table assessment-table">
      <thead>
        <tr>
          <th>人员姓名</th><th>脱敏编码</th><th>单位/岗位</th><th>异常维度</th><th>测评分</th><th>风险建议</th><th>复核状态</th><th>处置</th>
        </tr>
      </thead>
      <tbody>
        ${people
          .map(
            (p) => `
          <tr>
            <td><b>${p.fullName}</b><small>${p.age} 岁 · ${p.post}</small></td>
            <td>${p.code}</td>
            <td>${p.unit}</td>
            <td>${p.dimension}<small>${p.raw}</small></td>
            <td><strong>${p.score}</strong></td>
            <td><span class="tag ${tagClass(p.risk)}">${p.risk}</span><small>${p.suggestion}</small></td>
            <td>${p.review}</td>
            <td><button class="ghost-btn small" data-action="review">复核/入台账</button></td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function profileSide() {
  const p = people[1];
  return `
    <div class="profile-head">
      <div class="avatar">${p.name.slice(0, 1)}</div>
      <div><h3>${p.name} · ${p.unit}</h3><p class="system-name">${p.code}</p></div>
    </div>
    <div class="detail-list">
      <div><span>风险等级</span><b>${p.risk} · 人工复核</b></div>
      <div><span>责任人</span><b>${p.owner}</b></div>
      <div><span>当前状态</span><b>${p.status}</b></div>
      <div><span>最近随访</span><b>2026-05-26</b></div>
      <div><span>档案权限</span><b>授权范围内可见</b></div>
      <div><span>同步状态</span><b>本地保存，未上报</b></div>
    </div>
    <button class="primary-btn" style="width:100%;margin-top:18px" data-action="review">发起复核记录</button>
  `;
}

function initPages() {
  document.querySelector("#org-page").innerHTML = dataShell(
    "组织人员管理",
    `
      <div class="workflow-board">
        <div class="stage"><h3>单位层级</h3><div class="record-card"><b>某支队</b><span>机关 / 一营 / 二营 / 三营</span></div><div class="record-card"><b>一营</b><span>一连、二连、三连</span></div><div class="record-card"><b>机关保障队</b><span>干部、文职、勤务保障</span></div></div>
        <div class="stage"><h3>人员导入</h3><div class="record-card"><b>Excel 模板导入</b><span>186 名人员 · 12 个基础字段</span><div class="progress"><i style="--p:100%"></i></div></div><div class="record-card"><b>手工录入</b><span>零星新增、转隶补录、临时服务对象</span><button class="ghost-btn small" data-action="manual-person">新增人员</button></div><div class="record-card"><b>人员状态</b><span>在位、休假、转隶、退出现役</span></div></div>
        <div class="stage"><h3>角色绑定</h3><div class="record-card"><b>单位领导</b><span>汇总态势、导出审批</span></div><div class="record-card"><b>心理师</b><span>授权档案、报告确认</span></div><div class="record-card"><b>心理骨干</b><span>任务对象必要信息</span></div></div>
        <div class="stage"><h3>标准编码</h3><div class="record-card"><b>ORG-LOCAL-001</b><span>单位编码</span></div><div class="record-card"><b>PERSON-单位-序号</b><span>脱敏上报与审计追踪</span></div><div class="record-card manual-preview"><b>手工录入校验</b><span>姓名、单位、岗位、人员状态、联系方式、档案权限</span></div></div>
      </div>
    `,
    "",
    true
  );

  document.querySelector("#import-page").innerHTML = dataShell(
    "测评结果导入",
    `
      <div class="toolbar">
        <div class="filters">
          <button class="primary-btn" data-action="import">模拟导入 Excel</button>
          <button class="ghost-btn" data-action="archive">归档原始文件</button>
          <button class="ghost-btn" data-action="mask">切换领导脱敏视图</button>
        </div>
      </div>
      ${assessmentImportTable()}
    `,
    `<h3>个体识别逻辑</h3><div class="detail-list"><div><span>导入主键</span><b>姓名 + 证件/军号/人员编码</b></div><div><span>展示规则</span><b>领导汇总，心理师看个体</b></div><div><span>问题判断</span><b>异常维度 + 分数阈值</b></div><div><span>最终结论</span><b>人工复核后确认</b></div><div><span>入台账</span><b>一键生成重点对象</b></div><div><span>审计</span><b>查看明细自动留痕</b></div></div>`
  );

  document.querySelector("#register-page").innerHTML = dataShell("重点人员台账", peopleTable(), profileSide());

  document.querySelector("#followup-page").innerHTML = dataShell(
    "随访任务中心",
    `
      <div class="workflow-board">
        <div class="stage"><h3>待派单</h3><div class="record-card"><b>PERSON-3Y-0022</b><span>黄色观察 · 需建立两周随访</span><button class="ghost-btn small" data-action="assign">指派</button></div></div>
        <div class="stage"><h3>执行中</h3><div class="record-card"><b>PERSON-1Y-0018</b><span>橙色关注 · 今日复访</span><div class="progress"><i style="--p:60%"></i></div></div><div class="record-card"><b>PERSON-JG-0007</b><span>热线后续观察 · 明日到期</span><div class="progress"><i style="--p:45%"></i></div></div></div>
        <div class="stage"><h3>待复核</h3><div class="record-card"><b>三营二连随访记录</b><span>心理骨干已提交，等待心理师确认</span></div></div>
        <div class="stage"><h3>已闭环</h3><div class="record-card"><b>PERSON-1Y-0063</b><span>风险等级稳定，转入常规观察</span><div class="progress"><i style="--p:100%"></i></div></div></div>
      </div>
    `,
    "",
    true
  );

  document.querySelector("#crisis-page").innerHTML = dataShell(
    "危机干预闭环",
    `
      <div class="timeline">
        <article><b>事件登记</b><span>2026-05-25 21:18 · 心理骨干发现异常情绪波动并上报。</span></article>
        <article><b>研判复核</b><span>心理师与单位负责人双确认，标记为需专业介入对象。</span></article>
        <article><b>处置记录</b><span>完成现场安抚、专业访谈、家属沟通和后续观察安排。</span></article>
        <article><b>转介/上报</b><span>未上传完整档案，仅形成本地处置链与审批记录。</span></article>
        <article><b>复盘报告</b><span>AI辅助形成过程报告，责任人和心理师人工确认。</span></article>
      </div>
    `,
    `<h3>处置边界</h3><div class="detail-list"><div><span>系统作用</span><b>留痕与提醒</b></div><div><span>风险结论</span><b>人工复核</b></div><div><span>敏感正文</span><b>默认不上报</b></div><div><span>导出</span><b>水印与审计</b></div></div>`
  );

  document.querySelector("#service-page").innerHTML = dataShell(
    "心理服务台账",
    `
      <div class="workflow-board">
        ${services
          .map(
            (s) => `<div class="record-card"><b>${s[0]}</b><span>${s[1]} 次</span><small>${s[2]} · ${s[3]}</small><div class="progress"><i style="--p:${Math.min(100, Number(s[1]) * 4 + 30)}%"></i></div></div>`
          )
          .join("")}
      </div>
    `,
    `<h3>验收材料</h3><div class="detail-list"><div><span>服务完成率</span><b>86%</b></div><div><span>满意度</span><b>96%</b></div><div><span>可导出</span><b>台账 + 月报</b></div><div><span>记录范围</span><b>咨询/巡诊/讲座/团辅</b></div></div>`
  );

  document.querySelector("#report-page").innerHTML = `
    <div class="data-page-shell full-data-shell">
      <div class="toolbar">
        <div><h3>AI辅助报告中心</h3><p class="system-name">推荐接入 Qwen 系列，当前使用本地模板生成。</p></div>
        <div class="filters"><button class="primary-btn" data-action="generate">生成报告草稿</button><button class="ghost-btn" data-action="confirm">人工确认归档</button><button class="ghost-btn" data-action="watermark">带水印导出</button></div>
      </div>
      <div class="report-layout">
        <div class="template-list">
          <div class="template-card active"><b>月度心理服务报告</b><p class="system-name">领导汇报材料</p></div>
          <div class="template-card"><b>危机干预过程报告</b><p class="system-name">双确认后归档</p></div>
          <div class="template-card"><b>重点人员访谈报告</b><p class="system-name">心理师复核</p></div>
          <div class="template-card"><b>巡诊服务总结</b><p class="system-name">验收材料</p></div>
        </div>
        <article class="editor" contenteditable="true">
          <h2>5月基层心理服务月度报告</h2>
          <span class="watermark">AI辅助生成 · 待人工确认</span>
          <p>本月系统共建档 186 人，完成测评筛查 172 人，纳入重点关注台账 18 人，其中红色复核 2 人、橙色关注 6 人、黄色观察 10 人。全部重点对象均已明确责任人和随访周期。</p>
          <p>心理服务方面，累计完成个体咨询、团体辅导、热线支持、巡诊服务等 132 次，服务完成率 86%，满意度 96%。目前仍有 7 项任务未闭环，其中 2 项临近到期，建议优先组织心理师复核。</p>
          <p>系统提示：以上内容仅用于服务保障、汇报整理和闭环管理，不作为自动诊断、处分或人事处理依据。</p>
        </article>
      </div>
    </div>
  `;

  document.querySelector("#audit-page").innerHTML = dataShell(
    "权限审计与备份",
    `
      <div class="audit-list">
        ${audits.map((a) => `<div class="audit-row"><b>${a[0]}</b><span>${a[1]}</span><span class="tag blue">${a[2]}</span></div>`).join("")}
      </div>
    `,
    `<h3>安全能力</h3><div class="detail-list"><div><span>访问</span><b>角色权限</b></div><div><span>查看</span><b>敏感正文授权</b></div><div><span>导出</span><b>水印 + 日志</b></div><div><span>备份</span><b>本地离线包</b></div><div><span>同步</span><b>预留，默认关闭</b></div></div><button class="primary-btn" style="width:100%;margin-top:18px" data-action="backup">生成本地备份包</button>`
  );
}

function initHeatmap() {
  const heatmap = document.querySelector("#heatmap");
  const units = ["机关", "一连", "二连", "三连", "四连", "保障", "勤务", "巡诊", "训练", "后勤", "通信", "卫生", "炊事", "车勤", "新兵", "老兵"];
  heatmap.innerHTML = units
    .map((unit, index) => {
      const levels = ["green", "yellow", "green", "orange", "green", "yellow", "green", "red", "yellow", "green", "green", "orange", "green", "green", "yellow", "green"];
      const values = [3, 8, 4, 12, 2, 7, 3, 16, 9, 2, 4, 11, 2, 3, 7, 4];
      return `<div class="heat-cell level-${levels[index]}"><span>${unit}</span><b>${values[index]}</b></div>`;
    })
    .join("");
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-page]");
    const link = event.target.closest("[data-page-link]");
    const action = event.target.closest("[data-action]");
    if (nav) setPage(nav.dataset.page);
    if (link) setPage(link.dataset.pageLink);
    if (action) {
      const messages = {
        import: "已模拟导入 186 条测评记录，原始 Excel 已归档。",
        archive: "原始文件已进入本地文件库，审计日志已生成。",
        mask: "已切换查看口径：领导查看连队汇总，心理师授权后查看个体明细。",
        "manual-person": "已打开手工录入流程：适用于零星新增、转隶补录和临时服务对象。",
        review: "已创建人工复核记录，等待心理师确认。",
        assign: "随访任务已指派给心理骨干，周期为 14 天。",
        generate: "AI报告草稿已基于模板生成，当前状态为待人工确认。",
        confirm: "报告已人工确认并归档，保留修改痕迹。",
        watermark: "已模拟导出带水印 Word/PDF，并写入导出日志。",
        backup: "本地备份包已生成：BACKUP-LOCAL-20260527。",
      };
      showToast(messages[action.dataset.action] || "操作已完成并写入审计日志。");
    }
  });

  document.querySelector("#export-btn").addEventListener("click", () => {
    showToast("已模拟导出领导汇报材料，导出人、时间和水印均已留痕。");
  });

  document.querySelector("#fullscreen-btn").addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.querySelector("#app").requestFullscreen();
        showToast("已进入全屏模式。");
      } else {
        await document.exitFullscreen();
        showToast("已退出全屏模式。");
      }
    } catch (error) {
      showToast("当前浏览器限制了全屏，请使用 F11 或浏览器菜单进入全屏。");
    }
  });
}

initPages();
initHeatmap();
bindEvents();
