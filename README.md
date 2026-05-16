# Factory dashboard

### 1. Introduction

**Factory Dashboard** is a lightweight, role-based manufacturing workflow optimization platform designed to digitalize production operations inside a traditional factory ecosystem (such as a furniture or woodworking plant). The system bridges communication gaps across different operational departments by converting physical logs into a continuous digital pipeline. Built completely as a serverless, client-side application, it leverages modern web languages and immediate data synchronization to provide real-time management without requiring expensive or heavy backend architectures.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/8891da7a-fb20-4e4f-b87d-985ec0acd025" />

---

### 2. Core Logic & Architecture

The system works on a sequential data pipeline topology. The output payload of a previous operational tier automatically populates the available input queue or reference registry for the subsequent tier.

* **State Pipeline Logic:** `Supplier Logs Materials` $\rightarrow$ `Designer Reviews Inventory & Attaches Layouts` $\rightarrow$ `Carpenter Fabricates via Layout Reference` $\rightarrow$ `Tester Conducts Inspection` $\rightarrow$ `Salesman Dispatches Passed Stock`.
* **Data Persistence Layer:** Uses the HTML5 Web Storage API (`localStorage`). Distinct arrays (`fo_wood`, `fo_designs`, etc.) act as fast, isolated local data tables that retain history securely across browser closures and system restarts.
* **Dynamic Client-Side Routing:** Custom view switching hides or unhides full screen sections seamlessly, providing high performance transitions without page reloads.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/3db83f85-21d5-47e8-8865-8e2e3a2a9887" />

---

### 3. All Features & Role Portals

#### 🛡️ Administrative Control Deck

* **Facility Metrics Dashboard:** Displays active tracking cards calculating employee attendance counts, aggregate material quantities, and completed inventory.
* **Master System Viewports:** Houses an exhaustive tabbed window displaying separate database matrix logs for every operational sector in the facility.
* **Global Overwrite Flag:** Embedded with a system-wide reset function that purges client cache registries back to initial states.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/8da7f3d9-7abc-42d6-aca4-f361ca2430df" />

#### 🪵 Wood Supplier Desk

* **Material Selection Chips:** Interactive visual chips used to log primary raw lumber variants (Teak, Oak, Pine, Mahogany, Rosewood, etc.).
* **Volumetric Quantity Logging:** Granular entry tracking fields for inputting incoming batch volumes.
* **Invoice Image Capture:** Captures structural reference screenshots of incoming bills or logistics slips.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/367264d0-087f-48d2-9684-a443548997bb" />

#### 📐 Engineering & Design Lab

* **Real-time Stock Auditing:** Integrated reference panel allowing engineering leads to cross-verify structural timber volumes in stock prior to designing blueprints.
* **Schematic Deployment:** File payload module dedicated to attaching exact engineering diagrams or CAD structural specifications onto active production queues.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/e8f45280-90ca-4fad-b834-d8d14bc941be" />

#### 🔨 Carpentry & Fabrication Floor

* **Blueprint Retrieval Core:** Dynamically streams design blueprints and raw material specifics to floor fabricators.
* **Dual-State Stage Monitor:** Supports active work telemetry switching, allowing operators to mark a build phase as *In Progress* or seal it as a *Final Product*.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/d54572e4-9694-4432-ad5a-c7305a488f8b" />

#### 🔬 Quality Assurance & Testing Station

* **Binary Testing Validation:** A gatekeeping registry used to certify finished items via structured pass/fail decision conditions.
* **Defect Visual Registry:** Selecting a "Failed" classification automatically activates a mandatory photo-upload window to capture structural issues visually.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/0c017561-6c56-4ca1-9cf3-0083140e31ad" />

#### 💼 Outgoing Sales & Logistics Desk

* **Certified Stock Pipeline:** Queries and renders products that have cleared testing gates.
* **One-Click Billing Matrix:** Features instantaneous invoice clearing selectors that process outgoing orders and dynamically balance active inventory sheets.

<img width="1920" height="1020" alt="image" src="https://github.com/user-attachments/assets/e2c9d266-5b3f-48c3-bf02-66cd7fc5031a" />

---

### 4. Key Points

* **Zero Server Architecture:** Operates with no cloud dependency, node servers, or external databases.
* **Role-Based Security Mappings:** Leverages local credentials configurations (`CREDS`) to restrict operational permissions based on specified worker roles.
* **Base64 Asset Mocking:** Embeds the HTML5 `FileReader` API to transform loaded image payloads directly into text strings for client-side storage without cloud hosting.
* **Tailwind Utility Theme Engine:** Implements a modern dark-mode industrial layout built via flexible atomic Tailwind UI classes.

<img width="1865" height="396" alt="image" src="https://github.com/user-attachments/assets/f31081d7-a984-4002-93cf-f22b3bb88aa7" />

---

### 5. Advantages & Disadvantages

#### Advantages

* **Instant Local Speeds:** Zero server latency; reads and writes execute immediately through client memory.
* **Zero Upkeep Cost:** Requires no expensive active server instances, hosting licenses, or backend database maintainers.
* **Highly Extensible:** The clean, functional separation of logic in `script.js` makes it easy to add new production roles or fields later.
* **Offline Operational Capacity:** Capable of running smoothly on terminal workstations entirely disconnected from the live internet.

<img width="546" height="560" alt="image" src="https://github.com/user-attachments/assets/d38d87b8-9471-4a97-a116-2c20084a8d23" />

#### Disadvantages

* **Device-Specific Isolation:** Because data is bound directly to the browser's local cache, it cannot sync across separate individual computers natively.
* **Data Vulnerability:** Clearing the browser's storage or cache manual history purges all active manufacturing and operational records permanently.
* **Data Ceiling Limits:** Restricted by typical browser storage limits (usually ~5MB), making it less suitable for managing massive enterprise operations long-term.

---

### 6. Conclusion

**Factory Dashboard** successfully proves that highly optimized, multi-tier industrial production chains can be managed efficiently using lightweight client-side applications. By translating complex, inter-departmental dependencies into a simple, sequential JavaScript data pipeline, the system eliminates administrative friction points entirely. While it faces physical data isolation boundaries inherent to local storage architectures, it serves as an excellent, high-performance prototype for modular workflow orchestration and localized manufacturing control systems.
