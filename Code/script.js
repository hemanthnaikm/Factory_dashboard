/* ═══════════════════════════════════════════════════════════════
   FactoryOS – script.js
   All application logic, routing, LocalStorage, and rendering.
═══════════════════════════════════════════════════════════════ */

// ── CREDENTIALS (demo) ─────────────────────────────────────────
const CREDS = {
  admin:         { phone: '1234',    pass: 'abcd' },
  'Wood Supplier':{ phone: '1234',    pass: 'abcd' },
  Designer:       { phone: '1234',  pass: 'abcd' },
  Carpenter:      { phone: '1234',    pass: 'abcd' },
  Tester:         { phone: '1234',    pass: 'abcd' },
  Salesman:       { phone: '1234',   pass: 'abcd' },
};

// ── STATE ──────────────────────────────────────────────────────
let currentEmpRole = '';

// ── LOCAL STORAGE HELPERS ──────────────────────────────────────
const KEYS = { wood:'fo_wood', designs:'fo_designs', carpentry:'fo_carpentry', tests:'fo_tests', sales:'fo_sales', attendance:'fo_attendance' };

function load(k)    { return JSON.parse(localStorage.getItem(KEYS[k]) || '[]'); }
function save(k, v) { localStorage.setItem(KEYS[k], JSON.stringify(v)); }

// ── SCREEN ROUTER ──────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  el.classList.remove('hidden');
}

function goHome() {
  currentEmpRole = '';
  showScreen('screen-role');
}
function showAdminLogin()    { clearErr('admin-login-err'); showScreen('screen-admin-login'); }
function showEmployeeSelect(){ showScreen('screen-emp-select'); }

function showEmpLogin(role) {
  currentEmpRole = role;
  document.getElementById('emp-login-role-label').textContent = role + ' – Login';
  document.getElementById('emp-phone').value = '';
  document.getElementById('emp-pass').value  = '';
  clearErr('emp-login-err');
  showScreen('screen-emp-login');
}

// ── AUTH ───────────────────────────────────────────────────────
function adminLogin() {
  const phone = v('admin-phone'), pass = v('admin-pass');
  if (phone === CREDS.admin.phone && pass === CREDS.admin.pass) {
    markAttendance('Admin');
    renderAdminDash();
    showScreen('screen-admin-dash');
  } else {
    showErr('admin-login-err');
  }
}

function employeeLogin() {
  const phone = v('emp-phone'), pass = v('emp-pass');
  const c = CREDS[currentEmpRole];
  if (c && phone === c.phone && pass === c.pass) {
    markAttendance(currentEmpRole);
    renderEmpDash(currentEmpRole);
    document.getElementById('emp-role-badge').textContent = currentEmpRole;
    showScreen('screen-emp-dash');
  } else {
    showErr('emp-login-err');
  }
}

function markAttendance(role) {
  const today = new Date().toDateString();
  let att = load('attendance');
  const exists = att.find(a => a.role === role && a.date === today);
  if (!exists) {
    att.push({ role, date: today, time: new Date().toLocaleTimeString() });
    save('attendance', att);
  }
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────
function renderAdminDash() {
  const wood      = load('wood');
  const carpentry = load('carpentry');
  const tests     = load('tests');
  const sales     = load('sales');
  const att       = load('attendance');

  const today       = new Date().toDateString();
  const todayAtt    = att.filter(a => a.date === today).length;
  const woodStock   = wood.reduce((s, w) => s + (Number(w.qty) || 0), 0);
  const passedItems = tests.filter(t => t.verdict === 'Pass').length;
  const soldItems   = sales.filter(s => s.sold).length;
  const furniture   = passedItems - soldItems;

  setText('m-wood',       woodStock);
  setText('m-furniture',  Math.max(0, furniture));
  setText('m-attendance', todayAtt);

  renderTable('wood-table',      wood,      woodColumns());
  renderTable('designs-table',   load('designs'),  designColumns());
  renderTable('carpentry-table', carpentry, carpentryColumns());
  renderTable('tests-table',     tests,     testColumns());
  renderTable('sales-table',     sales,     salesColumns());
}

function woodColumns() {
  return {
    headers: ['#', 'Supplier', 'Wood Types', 'Qty (units)', 'Image', 'Submitted'],
    row: (r, i) => `
      <td>${i+1}</td>
      <td>${esc(r.name || 'Wood Supplier')}</td>
      <td>${(r.types||[]).map(t=>`<span class="badge badge-stock">${esc(t)}</span>`).join(' ')}</td>
      <td>${esc(r.qty)}</td>
      <td>${r.img ? `<img src="${r.img}" class="thumb"/>` : '–'}</td>
      <td>${fmtDate(r.ts)}</td>`
  };
}
function designColumns() {
  return {
    headers: ['#', 'Designer', 'File Name', 'Preview', 'Submitted'],
    row: (r, i) => `
      <td>${i+1}</td>
      <td>${esc(r.name || 'Designer')}</td>
      <td>${esc(r.fileName)}</td>
      <td>${r.img ? `<img src="${r.img}" class="thumb"/>` : '📄'}</td>
      <td>${fmtDate(r.ts)}</td>`
  };
}
function carpentryColumns() {
  return {
    headers: ['#', 'Carpenter', 'Status', 'Progress Photo', 'Submitted'],
    row: (r, i) => `
      <td>${i+1}</td>
      <td>${esc(r.name || 'Carpenter')}</td>
      <td>${r.final ? '<span class="badge badge-final">Final Product</span>' : '<span class="badge badge-wip">In Progress</span>'}</td>
      <td>${r.img ? `<img src="${r.img}" class="thumb"/>` : '–'}</td>
      <td>${fmtDate(r.ts)}</td>`
  };
}
function testColumns() {
  return {
    headers: ['#', 'Tester', 'Verdict', 'Damage Photo', 'Submitted'],
    row: (r, i) => `
      <td>${i+1}</td>
      <td>${esc(r.name || 'Tester')}</td>
      <td>${r.verdict === 'Pass' ? '<span class="badge badge-pass">✔ Pass</span>' : '<span class="badge badge-fail">✖ Scrap</span>'}</td>
      <td>${r.img ? `<img src="${r.img}" class="thumb"/>` : '–'}</td>
      <td>${fmtDate(r.ts)}</td>`
  };
}
function salesColumns() {
  return {
    headers: ['#', 'Item', 'Status', 'Bill', 'Sold At'],
    row: (r, i) => `
      <td>${i+1}</td>
      <td>${esc(r.itemName)}</td>
      <td>${r.sold ? '<span class="badge badge-sold">Sold</span>' : '<span class="badge badge-stock">In Stock</span>'}</td>
      <td>${r.billImg ? `<img src="${r.billImg}" class="thumb"/>` : '–'}</td>
      <td>${r.soldAt ? fmtDate(r.soldAt) : '–'}</td>`
  };
}

function renderTable(containerId, data, { headers, row }) {
  const el = document.getElementById(containerId);
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="icon">📭</div>No records yet.</div>`;
    return;
  }
  const ths  = headers.map(h => `<th>${h}</th>`).join('');
  const rows = data.map((r, i) => `<tr>${row(r, i)}</tr>`).join('');
  el.innerHTML = `<div class="overflow-x-auto"><table class="data-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
// Reset everything to zero
function resetAllData() {
  if (confirm("Are you sure? This will wipe all factory records!")) {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    renderAdminDash();
    toast("🧹 All data has been reset.");
  }
}

// Delete a single record
function deleteRecord(key, timestamp) {
  if (confirm("Delete this entry?")) {
    let data = load(key);
    data = data.filter(item => item.ts !== timestamp);
    save(key, data);
    renderAdminDash();
  }
}
function woodColumns() {
  return {
    headers: ['#', 'Supplier', 'Wood Types', 'Qty', 'Image', 'Actions'],
    row: (r, i) => `
      <td>${i+1}</td>
      <td>${esc(r.name)}</td>
      <td>${(r.types||[]).join(', ')}</td>
      <td>${esc(r.qty)}</td>
      <td>${r.img ? `<img src="${r.img}" class="thumb"/>` : '–'}</td>
      <td><button onclick="deleteRecord('wood', ${r.ts})" class="text-red-500">🗑️</button></td>`
  };
}
// ── ADMIN TABS ─────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  event.currentTarget.classList.add('active');
  document.getElementById(`tab-${name}`).classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════
//  EMPLOYEE DASHBOARDS
// ═══════════════════════════════════════════════════════════════
function renderEmpDash(role) {
  const c = document.getElementById('emp-dash-content');
  const map = {
    'Wood Supplier': woodSupplierUI,
    Designer:        designerUI,
    Carpenter:       carpenterUI,
    Tester:          testerUI,
    Salesman:        salesmanUI,
  };
  c.innerHTML = '';
  if (map[role]) map[role](c);
}

/* ── WOOD SUPPLIER ──────────────────────────────────────────── */
function woodSupplierUI(container) {
  const woodTypes = ['Teak', 'Oak', 'Pine', 'Mahogany', 'Walnut', 'Bamboo', 'Cedar'];
  container.innerHTML = `
    <div class="emp-panel">
      <h2>🪵 Wood Supplier – Submit Batch</h2>
      <label class="field-label">Select Wood Types</label>
      <div class="wood-checkboxes" id="wood-chips">
        ${woodTypes.map(t => `
          <label class="wood-chip" id="chip-${t}" onclick="toggleChip('${t}')">
            <input type="checkbox" value="${t}" id="chk-${t}"> ${t}
          </label>`).join('')}
      </div>
      <div class="qty-row">
        <span class="qty-label">Quantity (units):</span>
        <input type="number" min="1" id="wood-qty" class="qty-input" placeholder="0"/>
      </div>
      <div class="mt-4">
        <label class="field-label">Upload Wood Image</label>
        <label class="upload-zone" for="wood-img-in">
          <span style="font-size:1.8rem">📷</span>
          <span>Click to select image</span>
          <input type="file" id="wood-img-in" accept="image/*" onchange="previewImg(this,'wood-preview')"/>
        </label>
        <img id="wood-preview" class="img-preview" alt="preview"/>
      </div>
      <button onclick="submitWood()" class="btn-primary mt-5">Submit Batch</button>
    </div>`;
}

function toggleChip(type) {
  const chip = document.getElementById(`chip-${type}`);
  const chk  = document.getElementById(`chk-${type}`);
  chk.checked = !chk.checked;
  chip.classList.toggle('selected', chk.checked);
}

function submitWood() {
  const types = Array.from(document.querySelectorAll('#wood-chips input:checked')).map(c => c.value);
  const qty   = document.getElementById('wood-qty').value;
  const img   = document.getElementById('wood-preview').src;
  if (!types.length) return toast('Select at least one wood type.');
  if (!qty || qty < 1) return toast('Enter a valid quantity.');
  const rows = load('wood');
  rows.push({ types, qty: parseInt(qty), img: img || '', ts: Date.now(), name: 'Wood Supplier' });
  save('wood', rows);
  toast('✅ Wood batch submitted!');
  renderEmpDash('Wood Supplier');
}
function captureFileName(input, outId) {
  const el = document.getElementById(outId);
  if (el && input.files[0]) el.textContent = '📄 ' + input.files[0].name;
}

function submitDesign() {
  const inp = document.getElementById('design-in');
  const preview = document.getElementById('design-preview');
  
  // Check if a file was actually selected
  if (!inp.files[0]) {
    return toast('❌ Please select a file.');
  }

  const rows = load('designs');
  rows.push({ 
    fileName: inp.files[0].name, 
    img: preview.src, // This connects the previewed image to the database
    ts: Date.now(), 
    name: 'Designer' 
  });
  
  save('designs', rows);
  toast('✅ Blueprint connected to Factory Stock!');
  renderEmpDash('Designer'); // Refresh view
}
/* ── DESIGNER ───────────────────────────────────────────────── */
function designerUI(container) {
  // 1. Connection: Load the wood supplier data
  const woodStock = load('wood');
  
  // 2. Build the Material Table
  let stockTable = `<p class="text-gray-500 text-sm">No wood in stock.</p>`;
  if (woodStock.length > 0) {
    stockTable = `
      <table class="data-table mt-2 mb-6">
        <thead><tr><th>Type</th><th>Qty</th><th>Supplier</th></tr></thead>
        <tbody>
          ${woodStock.map(w => `
            <tr>
              <td>${(w.types || []).join(', ')}</td>
              <td>${w.qty}</td>
              <td>${esc(w.name)}</td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  // 3. Render everything in one innerHTML call
  container.innerHTML = `
    <div class="emp-panel">
      <h2 class="text-amber-400">📐 Designer Portal</h2>
      
      <div class="mb-6">
        <h3 class="field-label">Step 1: Check Available Materials</h3>
        ${stockTable}
      </div>

      <hr class="border-surface-border mb-6">

      <div class="mb-6">
        <h3 class="field-label">Step 2: Upload Blueprint</h3>
        <label class="upload-zone" for="design-in">
          <span style="font-size:1.8rem">🗂️</span>
          <span>Click to select blueprint image</span>
          <input type="file" id="design-in" accept="image/*" 
            onchange="previewImg(this,'design-preview'); captureFileName(this,'design-fname')"/>
        </label>
        
        <img id="design-preview" class="img-preview" alt="preview" style="max-height: 200px; margin-top: 10px;"/>
        <p id="design-fname" class="text-xs text-gray-500 mt-1"></p>
        
        <button onclick="submitDesign()" class="btn-primary mt-5 w-full">
          Confirm & Upload Design
        </button>
      </div>
    </div>`;
}
/* ── CARPENTER ──────────────────────────────────────────────── */
function carpenterUI(container) {
  container.innerHTML = `
    <div class="emp-panel">
      <h2>🔨 Carpenter – Log Progress</h2>
      <label class="field-label">Upload Progress Photo</label>
      <label class="upload-zone" for="carp-img-in">
        <span style="font-size:1.8rem">📸</span>
        <span>Click to select photo</span>
        <input type="file" id="carp-img-in" accept="image/*" onchange="previewImg(this,'carp-preview')"/>
      </label>
      <img id="carp-preview" class="img-preview" alt="preview"/>
      <div class="mt-5">
        <label class="field-label">Is this the Final Product?</label>
        <div class="toggle-group mt-2" id="final-toggle">
          <button class="toggle-btn active-no" id="final-no"  onclick="setFinal(false)">🔄 In Progress</button>
          <button class="toggle-btn" id="final-yes" onclick="setFinal(true)">✅ Final Product</button>
        </div>
      </div>
      <button onclick="submitCarpentry()" class="btn-primary mt-5">Submit Log</button>
    </div>`;
  window._carpFinal = false;
}

function setFinal(val) {
  window._carpFinal = val;
  document.getElementById('final-yes').className = 'toggle-btn' + (val ? ' active-yes' : '');
  document.getElementById('final-no').className  = 'toggle-btn' + (!val ? ' active-no' : '');
}

function submitCarpentry() {
  const inp   = document.getElementById('carp-img-in');
  const img   = document.getElementById('carp-preview').src;
  if (!inp.files[0]) return toast('Please upload a progress photo.');
  const rows = load('carpentry');
  rows.push({ img, final: window._carpFinal, ts: Date.now(), name: 'Carpenter' });
  save('carpentry', rows);

  // If final product, add to sales stock
  if (window._carpFinal) {
    const sales = load('sales');
    sales.push({ itemName: 'Product #' + (sales.length + 1), sold: false, billImg: '', soldAt: null, ts: Date.now() });
    save('sales', sales);
  }
  toast(window._carpFinal ? '✅ Final product added to stock!' : '✅ Progress logged!');
  renderEmpDash('Carpenter');
}
/* ── CARPENTER (Updated) ────────────────────────────────────── */
function carpenterUI(container) {
  const wood = load('wood');
  const designs = load('designs');

  // Create a combined view of requirements
  const requirementsHTML = `
    <div class="mb-6 p-4 bg-[#13131f] rounded-xl border border-[#3a3a5c]">
      <h3 class="text-xs font-bold uppercase text-gray-500 tracking-widest mb-3">Project Requirements</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-amber-400 text-sm font-bold mb-2">🪵 Available Wood</p>
          ${wood.length ? wood.map(w => `<div class="text-xs text-gray-400 border-b border-[#2d2d4a] py-1">${w.qty} units of ${w.types.join(', ')}</div>`).join('') : '<p class="text-xs text-gray-600">No wood assigned.</p>'}
        </div>
        <div>
          <p class="text-blue-400 text-sm font-bold mb-2">📐 Blueprints</p>
          ${designs.length ? designs.map(d => `
            <div class="flex items-center gap-2 mb-2">
              ${d.img ? `<img src="${d.img}" class="w-8 h-8 rounded border border-[#3a3a5c]"/>` : '📄'}
              <span class="text-xs text-gray-400">${d.fileName}</span>
            </div>`).join('') : '<p class="text-xs text-gray-600">No designs uploaded.</p>'}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div class="emp-panel">
      ${requirementsHTML}
      <hr class="border-[#3a3a5c] my-6">
      <h2>🔨 Log Manufacturing Progress</h2>
      <label class="field-label">Upload Progress Photo</label>
      <label class="upload-zone" for="carp-img-in">
        <span style="font-size:1.8rem">📸</span>
        <span>Click to select photo</span>
        <input type="file" id="carp-img-in" accept="image/*" onchange="previewImg(this,'carp-preview')"/>
      </label>
      <img id="carp-preview" class="img-preview" alt="preview"/>
      <div class="mt-5">
        <label class="field-label">Is this the Final Product?</label>
        <div class="toggle-group mt-2" id="final-toggle">
          <button class="toggle-btn active-no" id="final-no"  onclick="setFinal(false)">🔄 In Progress</button>
          <button class="toggle-btn" id="final-yes" onclick="setFinal(true)">✅ Final Product</button>
        </div>
      </div>
      <button onclick="submitCarpentry()" class="btn-primary mt-5">Submit Log</button>
    </div>`;
  window._carpFinal = false;
}

/* ── TESTER ─────────────────────────────────────────────────── */
/* ── TESTER LOGIC (FULL REPLACEMENT) ─────────────────────────── */

function testerUI(container) {
  const carpentryLogs = load('carpentry');
  window._selectedTestStatus = null;
  window._activeTestItem = null; // This will hold the specific product being tested

  let workTable = `<p class="text-gray-500 text-sm italic">No items ready for testing.</p>`;
  
  if (carpentryLogs.length > 0) {
    workTable = `
      <div class="overflow-x-auto">
        <table class="data-table mt-2 mb-4">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${carpentryLogs.map((item, index) => `
              <tr id="row-test-${index}" class="border-b border-[#3a3a5c]">
                <td class="py-2">
                  ${item.img ? `<img src="${item.img}" class="w-10 h-10 rounded object-cover border border-[#3a3a5c]"/>` : '📦'}
                </td>
                <td class="text-xs">
                  ${item.isFinal ? '<span class="text-green-400">Final Product</span>' : '<span class="text-amber-400">In Progress</span>'}
                </td>
                <td>
                  <button onclick="selectItemForTest(${index})" class="bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-bold px-3 py-1 rounded">
                    SELECT
                  </button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  container.innerHTML = `
    <div class="emp-panel animate-fadeIn">
      <h2 class="text-amber-400 mb-2">🔬 Quality Control</h2>
      
      <div class="mb-6">
        <h3 class="field-label">1. Choose a product to test</h3>
        ${workTable}
      </div>

      <div id="test-controls" class="hidden border-t border-[#3a3a5c] pt-6 animate-fadeIn">
        <h3 class="text-white font-bold mb-4" id="testing-header">Testing Selected Item...</h3>
        
        <div class="flex gap-4 mb-6">
           <button id="pass-btn" onclick="setTestStatus('Passed')" class="flex-1 py-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 transition-all">
             <span class="block text-2xl">✅</span>
             <span class="text-xs font-bold uppercase tracking-widest">Pass</span>
           </button>
           
           <button id="fail-btn" onclick="setTestStatus('Failed')" class="flex-1 py-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 transition-all">
             <span class="block text-2xl">❌</span>
             <span class="text-xs font-bold uppercase tracking-widest">Fail</span>
           </button>
        </div>

        <div id="failure-upload-zone" class="hidden mb-6 bg-red-500/5 p-4 rounded-xl border border-red-500/20">
          <label class="field-label text-red-400">📸 Evidence of Defect</label>
          <label class="upload-zone" for="fail-img-in">
            <span class="text-xs text-gray-400">Click to upload photo of the problem</span>
            <input type="file" id="fail-img-in" accept="image/*" onchange="previewImg(this, 'fail-preview')"/>
          </label>
          <img id="fail-preview" class="img-preview mt-3 rounded-lg border border-red-500/20" alt="defect preview"/>
        </div>

        <label class="field-label text-gray-400">Quality Notes</label>
        <textarea id="test-notes" class="w-full bg-[#13131f] border border-[#3a3a5c] rounded-lg p-3 text-sm h-24 mb-4 text-white" placeholder="Describe wood finish, structural integrity, etc."></textarea>
        
        <button onclick="submitTest()" class="btn-primary w-full py-4 font-bold">
          Submit Quality Report
        </button>
      </div>
    </div>`;
}

// Function to select a specific row
window.selectItemForTest = function(index) {
  const logs = load('carpentry');
  window._activeTestItem = logs[index];
  
  // Highlight row visually
  document.querySelectorAll('tr').forEach(tr => tr.style.background = "transparent");
  const selectedRow = document.getElementById(`row-test-${index}`);
  if(selectedRow) selectedRow.style.background = "rgba(245, 158, 11, 0.1)";
  
  // Reveal the hidden controls
  const controls = document.getElementById('test-controls');
  if(controls) controls.classList.remove('hidden');
  
  const header = document.getElementById('testing-header');
  if(header) header.innerText = `Now Testing: Product #${index + 1}`;
  
  toast("Item Selected. Please choose Pass or Fail.");
};

function setTestStatus(status) {
  window._selectedTestStatus = status;
  const pBtn = document.getElementById('pass-btn');
  const fBtn = document.getElementById('fail-btn');
  const fZone = document.getElementById('failure-upload-zone');

  pBtn.className = fBtn.className = "flex-1 py-4 rounded-xl border-2 border-gray-700 bg-gray-800/50 transition-all";
  fZone.classList.add('hidden');

  if (status === 'Passed') {
    pBtn.classList.replace('border-gray-700', 'border-green-500');
    pBtn.classList.add('bg-green-500/10');
  } else {
    fBtn.classList.replace('border-gray-700', 'border-red-500');
    fBtn.classList.add('bg-red-500/10');
    fZone.classList.remove('hidden');
  }
}

function submitTest() {
  const status = window._selectedTestStatus;
  const notes = document.getElementById('test-notes').value;
  const fPrev = document.getElementById('fail-preview');

  if (!window._activeTestItem) return toast("⚠️ Select a product from the list first!");
  if (!status) return toast("⚠️ Select Pass or Fail!");

  let failImg = '';
  if (status === 'Failed') {
    if (!fPrev.src || fPrev.src.includes('index.html')) {
      return toast("⚠️ Please upload a photo of the defect!");
    }
    failImg = fPrev.src;
  }

  const tests = load('tests');
  tests.push({
    ts: Date.now(),
    result: status,
    notes: notes,
    evidence: failImg,
    productTested: window._activeTestItem, // Linked data
    tester: 'Tester'
  });

  save('tests', tests);
  toast(`✅ ${status} Report Submitted!`);
  renderEmpDash('Tester');
}
/* ── SALESMAN ───────────────────────────────────────────────── */
function salesmanUI(container) {
  const sales = load('sales');
  const inStock = sales.filter(s => !s.sold);

  let stockHTML = inStock.length === 0
    ? `<div class="empty-state"><div class="icon">📦</div>No items in stock. Carpenters need to complete products first.</div>`
    : inStock.map((item, i) => `
        <div class="stock-item" id="stock-item-${item.ts}">
          <div>
            <div class="item-name">${esc(item.itemName)}</div>
            <div class="item-sub">Added: ${fmtDate(item.ts)}</div>
          </div>
          <button onclick="initSell(${item.ts})" class="btn-success">💳 Mark as Sold</button>
        </div>`).join('');

  container.innerHTML = `
    <div class="emp-panel" style="max-width:720px">
      <h2>💼 Salesman – In-Stock Inventory</h2>
      <div id="stock-list">${stockHTML}</div>
      <!-- sell modal inline -->
      <div id="sell-modal" class="hidden mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
        <p class="text-sm font-semibold text-amber-400 mb-3">📃 Upload Bill for <span id="sell-item-name"></span></p>
        <label class="upload-zone" for="bill-img-in">
          <span style="font-size:1.6rem">🧾</span>
          <span>Click to upload bill</span>
          <input type="file" id="bill-img-in" accept="image/*" onchange="previewImg(this,'bill-preview')"/>
        </label>
        <img id="bill-preview" class="img-preview" alt="bill preview"/>
        <div class="flex gap-3 mt-4">
          <button onclick="confirmSell()" class="btn-primary">Confirm Sale</button>
          <button onclick="document.getElementById('sell-modal').classList.add('hidden')" class="btn-ghost">Cancel</button>
        </div>
      </div>
    </div>`;
  window._sellTs = null;
}

function initSell(ts) {
  window._sellTs = ts;
  const sales = load('sales');
  const item  = sales.find(s => s.ts === ts);
  if (!item) return;
  document.getElementById('sell-item-name').textContent = item.itemName;
  document.getElementById('sell-modal').classList.remove('hidden');
  document.getElementById('bill-img-in').value = '';
  document.getElementById('bill-preview').classList.remove('visible');
  document.getElementById('bill-preview').src = '';
}

function confirmSell() {
  const inp = document.getElementById('bill-img-in');
  if (!inp || !inp.files[0]) return toast('Please upload the bill before confirming.');
  const billImg = document.getElementById('bill-preview').src;
  const sales   = load('sales');
  const item    = sales.find(s => s.ts === window._sellTs);
  if (!item) return;
  item.sold    = true;
  item.billImg = billImg;
  item.soldAt  = Date.now();
  save('sales', sales);
  toast(`✅ ${item.itemName} marked as sold!`);
  renderEmpDash('Salesman');
}

// ── SHARED HELPERS ─────────────────────────────────────────────
function previewImg(input, previewId) {
  const prev = document.getElementById(previewId);
  if (!prev || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    prev.src = e.target.result;
    prev.classList.add('visible');
  };
  reader.readAsDataURL(input.files[0]);
}

function v(id)          { return document.getElementById(id)?.value?.trim() || ''; }
function setText(id, t) { const el = document.getElementById(id); if (el) el.textContent = t; }
function esc(s)         { if (!s) return '–'; const d = document.createElement('div'); d.appendChild(document.createTextNode(String(s))); return d.innerHTML; }
function fmtDate(ts)    { if (!ts) return '–'; return new Date(ts).toLocaleString(); }
function showErr(id)    { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); }
function clearErr(id)   { const el = document.getElementById(id); if (el) el.classList.add('hidden'); }

let _toastTimer;
function toast(msg) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  clearTimeout(_toastTimer);
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  _toastTimer = setTimeout(() => el.remove(), 3000);
}

// ── INIT ───────────────────────────────────────────────────────
showScreen('screen-role');
