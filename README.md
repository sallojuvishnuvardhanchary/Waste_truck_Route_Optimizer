# Smart City Garbage Collection Route Optimization System
### Design and Analysis of Algorithms (DAA) Laboratory Project

A full-stack, algorithmic web application designed for municipal waste management departments to solve the **Travelling Salesperson Problem (TSP)** on city road networks. The system computes the globally optimal, minimum-distance route for a garbage collection vehicle starting from the **Municipal Office (Depot)**, visiting every designated garbage collection point exactly once, and returning to the Municipal Office.

---

## 1. Project Objective & Problem Statement

### Problem Statement
In modern municipal urban wards, solid waste collection vehicles travel hundreds of kilometers daily. Inefficient, unoptimized routes cause excessive fuel consumption, vehicle wear, increased greenhouse gas emissions, and missed collection bins. 

Mathematically, this problem maps to the **Travelling Salesperson Problem (TSP)**, an **NP-hard** combinatorial optimization problem on a weighted, undirected complete graph $G = (V, E)$:
- **Vertices $V$:** Locations. Vertex $v_0$ is the **Municipal Office (Central Depot)**; vertices $v_1, \dots, v_{n-1}$ represent municipal garbage collection points.
- **Edges $E$:** City roads with positive distance weights $d(u, v) > 0$ for $u \neq v$, and $d(u, u) = 0$.
- **Objective:** Find a Hamiltonian Cycle $(v_0, \pi(1), \pi(2), \dots, \pi(n-1), v_0)$ that minimizes the total tour distance:
$$\text{Cost} = d(v_0, \pi(1)) + \sum_{i=1}^{n-2} d(\pi(i), \pi(i+1)) + d(\pi(n-1), v_0)$$

### Core DAA Objectives
1. **Exhaustive Permutation Search (Brute Force):** Enumerate and evaluate all $(n - 1)!$ permutations to find the optimal cycle.
2. **State-Space Tree Optimization (Branch and Bound):** Construct an admissible bounding function to compute lower bounds on partial routes and prune suboptimal branches whenever $\text{Lower Bound} \ge \text{Current Best}$.
3. **Rigorous Comparative Analysis:** Empirically compare total routes considered, leaf routes evaluated, nodes explored, branches pruned, and CPU runtime.
4. **Interactive Graph & Step-by-Step Visualization:** Visually illustrate the graph topology, real-time pruning events, and animated route traversal on an HTML5 canvas.

---

## 2. Technology Stack

- **Frontend:**
  - **React 19** with **Vite 8**
  - **JavaScript (ES Modules)**
  - **Tailwind CSS v4** (Modern municipal dark-themed design)
  - **HTML5 Canvas** (High-DPI rendering, draggable nodes, animated collection truck)
  - **Lucide React** (Crisp vector icons)
  - **Canvas Confetti** (Interactive milestone feedback)
- **Backend:**
  - **Node.js** (v20+)
  - **Express.js** (REST API)
  - **CORS** middleware
- **Architecture:**
  - **Dual Engine Execution:** Full-stack REST API (`http://localhost:5000/api`) with automatic, seamless fallback to client-side in-browser algorithms if running standalone or offline.

---

## 3. Project Structure

```text
smart-garbage-route/
├── backend/
│   ├── algorithms/
│   │   ├── bruteForceTSP.js        # Exhaustive permutation TSP implementation
│   │   └── branchAndBoundTSP.js    # State-space tree TSP with admissible bounding
│   ├── controllers/
│   │   └── routeController.js      # REST API handlers for TSP & comparisons
│   ├── routes/
│   │   └── routeRoutes.js          # Express route definitions
│   ├── utils/
│   │   └── graphGenerator.js       # Matrix validation & random graph generation
│   ├── server.js                   # Express server entrypoint (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── bruteForceTSP.js    # Client-side Brute Force algorithm mirror
│   │   │   └── branchAndBoundTSP.js# Client-side Branch and Bound algorithm mirror
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top bar with status & algorithm selector
│   │   │   ├── Sidebar.jsx         # Responsive sidebar navigation
│   │   │   ├── GraphCanvas.jsx     # Interactive HTML5 Canvas graph visualizer
│   │   │   ├── DistanceMatrixEditor.jsx # Editable symmetric matrix & pairwise inputs
│   │   │   └── QuickStatsCard.jsx  # Reusable metric statistic cards
│   │   ├── data/
│   │   │   └── defaultGraph.js     # Benchmark sample datasets (6, 4, 8 nodes)
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Main overview with metrics & mini canvas
│   │   │   ├── RoutePlanner.jsx    # Graph editor, node add/remove & presets
│   │   │   ├── AlgorithmComparison.jsx # Side-by-side BF vs B&B comparison & charts
│   │   │   ├── GraphVisualizationPage.jsx # Fullscreen canvas with node inspector
│   │   │   ├── StepSimulationPage.jsx # Step-by-step playback with pruning trace
│   │   │   ├── AlgorithmExplanation.jsx # DAA theory notes & Top 10 Viva Voce Q&A
│   │   │   └── ResultsPage.jsx     # Turn-by-turn itinerary & JSON/print export
│   │   ├── services/
│   │   │   └── api.js              # REST client with automatic local fallback
│   │   ├── App.jsx                 # Root React component
│   │   ├── main.jsx                # React DOM entrypoint
│   │   └── index.css               # Tailwind CSS v4 styling & animations
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md                       # Comprehensive project documentation
└── package.json                    # Root package runner script
```

---

## 4. Key Pages & Features

1. **Dashboard:**
   - Real-time project overview, ward locations count, road count, current optimal distance.
   - Live interactive canvas preview with moving garbage collection vehicle.
   - Quick one-click execution of Branch & Bound and Brute Force.
2. **Route Planner:**
   - Add custom locations with bin types (Organic, Recyclable, Commercial, General, Industrial) and waste capacity (kg).
   - Remove points while protecting the Municipal Office depot.
   - Dual-mode distance configuration:
     - **Matrix View:** Symmetric $n \times n$ editable grid with automatic diagonal locking.
     - **Pairwise List View:** Clean list format (`Office ↔ Point A: 4 km`).
   - Preset selector:
     - *Official College Benchmark (6 Nodes)*
     - *Small Ward (4 Nodes)*
     - *Metropolitan District (8 Nodes)*
   - Procedural random graph generator with node slider (4 to 10 nodes).
3. **Algorithm Comparison:**
   - Side-by-side empirical benchmark table comparing:
     - Total Routes Considered
     - Leaf Tours Evaluated
     - Search Nodes Explored
     - Branches Pruned
     - Optimal Distance (both algorithms verified for 100% agreement)
     - Execution Time in milliseconds
     - Time Complexity & Space Complexity
   - Search space compression meters and pruning efficiency gauges.
4. **Graph Visualization:**
   - Fullscreen HTML5 canvas with draggable nodes and zoom/pan grid.
   - Shows Municipal Office (golden HQ badge with pulsing radar ring) and Collection Points.
   - Toggle options: Show all roads, show distance tags, animate vehicle, reset node layout.
   - Interactive Node Inspector: inspect individual node capacities and incident road distances.
5. **Step-by-Step Simulation:**
   - Interactive player with Play, Pause, Next Step, Previous Step, Reset, and Speed Slider (0.15s to 1.5s).
   - Real-time display of:
     - Current Partial Route
     - Candidate Child Node
     - Calculated Lower Bound (km)
     - Current Best Solution known so far
     - Algorithmic Decision badge: `[EXPLORE]`, `[PRUNE]`, `[UPDATE_BEST]`
     - Plain English mathematical explanation of why pruning occurred!
   - Color-coded canvas feedback:
     - Solid Green: Active partial path
     - Cyan: Candidate branch being explored
     - Red Dashed + `✖ PRUNED`: Pruned subtree branch!
6. **DAA Concepts & Viva Voce Guide:**
   - Structured lecture notes explaining Graph modeling, TSP formulation, Permutations, Factorial growth, Admissible Bounding Functions, and Pruning conditions.
   - **Top 10 B.Tech Viva Voce Questions & Answers** with accordion toggles for classroom review.
7. **Optimization Results:**
   - Turn-by-turn collection leg itinerary table with origin, destination, road distance, cumulative distance, bin type, and waste collected.
   - Environmental impact calculator (estimated fuel liters and $\text{CO}_2$ footprint).
   - Export to JSON and Print-ready manifest buttons.

---

## 5. DAA Algorithm Implementations

### Algorithm 1: Brute Force TSP
- **File:** `backend/algorithms/bruteForceTSP.js` & `frontend/src/algorithms/bruteForceTSP.js`
- **Methodology:**
  1. Fixes the Municipal Office (vertex 0) at the start and end of the tour.
  2. Generates all $(n - 1)!$ permutations of collection points $\{1, 2, \dots, n-1\}$ using recursive backtracking swaps.
  3. Computes the exact round-trip distance for each permutation:
     $$\text{dist}(0, p_1) + \sum_{i=1}^{n-2} \text{dist}(p_i, p_{i+1}) + \text{dist}(p_{n-1}, 0)$$
  4. Updates `bestDistance` and `bestRoute` whenever a strictly shorter tour is discovered.
- **Complexity:**
  - **Time Complexity:** $O((n - 1)! \cdot n)$ — $(n-1)!$ permutations, each requiring $O(n)$ operations to sum edge distances.
  - **Space Complexity:** $O(n)$ — recursion call stack depth of $n$.

### Algorithm 2: Branch and Bound TSP
- **File:** `backend/algorithms/branchAndBoundTSP.js` & `frontend/src/algorithms/branchAndBoundTSP.js`
- **Methodology (State-Space Tree with Degree-2 Relaxation Lower Bound):**
  1. Root node represents the vehicle at Municipal Office (vertex 0).
  2. Each branch extends the partial path to an unvisited collection point: $[v_0, v_1, \dots, v_k]$.
  3. **Admissible Bounding Function:**
     Every vertex in a valid Hamiltonian cycle has degree exactly 2 (1 incoming edge and 1 outgoing edge).
     For a partial path of cost `currentCost`:
     - Endpoint $v_k$ must connect to some unvisited vertex: $\min_{u \in U} d(v_k, u)$
     - Start vertex $v_0$ must connect back from some unvisited vertex: $\min_{u \in U} d(u, v_0)$
     - Each unvisited vertex $u \in U$ must connect to 2 valid remaining nodes: $\min_1(u) + \min_2(u)$
     - **Lower Bound Formula:**
       $$\text{Lower Bound} = \text{currentCost} + \left\lceil \frac{\min_{u \in U} d(v_k, u) + \min_{u \in U} d(u, v_0) + \sum_{u \in U} (\min_1(u) + \min_2(u))}{2} \right\rceil$$
  4. **Admissibility Proof:**
     Because any true completion of the tour must select valid incident edges for $v_k, v_0,$ and all $u \in U$, and our formula takes the sum of the absolute minimum available edges divided by 2, $\text{Lower Bound} \le \text{True Completion Cost}$. It never overestimates.
  5. **Pruning Condition:**
     $$\text{If } \text{Lower Bound} \ge \text{currentBestDistance} \implies \textbf{PRUNE BRANCH}$$
     The entire child subtree is discarded immediately without recursive descent.
  6. **Best-First Ordering:**
     Child branches are sorted by ascending lower bound, ensuring promising paths are explored first, rapidly establishing tight upper bounds.
- **Complexity:**
  - **Worst-case Time Complexity:** $O((n - 1)!)$ (theoretical adversarial cases where pruning cannot trigger).
  - **Average-case Time Complexity:** Exponentially smaller than Brute Force; typically cuts out 70% to 95% of state space on metric road graphs.
  - **Space Complexity:** $O(n)$ DFS stack depth.

---

## 6. Official College Benchmark Dataset

The system includes the default 6-node dataset specified in Section 11 of the project guidelines:

### Locations
- **O:** Municipal Office (Depot)
- **A:** Point A
- **B:** Point B
- **C:** Point C
- **D:** Point D
- **E:** Point E

### Distance Matrix (Kilometers)
```text
        O   A   B   C   D   E
O       0   4   7   3   6   5
A       4   0   5   2   4   6
B       7   5   0   6   3   4
C       3   2   6   0   5   7
D       6   4   3   5   0   2
E       5   6   4   7   2   0
```

### Exact Benchmark Results
- **Optimal Travel Distance:** **20 km**
- **Optimal Route:**
  $$\text{Municipal Office} \to \text{Point C} \to \text{Point A} \to \text{Point B} \to \text{Point D} \to \text{Point E} \to \text{Municipal Office}$$
  *(Or the exact reverse tour: Office $\to$ E $\to$ D $\to$ B $\to$ A $\to$ C $\to$ Office, both yielding exactly 20 km)*
- **Leg Breakdown:**
  - Office $\to$ Point C = **3 km**
  - Point C $\to$ Point A = **2 km**
  - Point A $\to$ Point B = **5 km**
  - Point B $\to$ Point D = **3 km**
  - Point D $\to$ Point E = **2 km**
  - Point E $\to$ Municipal Office = **5 km**
  - **Total Distance:** $3 + 2 + 5 + 3 + 2 + 5 = \mathbf{20 \text{ km}}$
- **Performance Comparison on Benchmark:**
  - **Brute Force:** Evaluates all $(6 - 1)! = 5! = \mathbf{120}$ permutations.
  - **Branch & Bound:** Explores only **19** nodes, executes **20** subtree prunings, and achieves the exact same 20 km result!

---

## 7. Installation & Setup Instructions

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Step 1: Clone or Navigate to the Project
```bash
cd Anti_Gravi
```

### Step 2: Install All Dependencies
You can install dependencies for both backend and frontend from the root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

---

## 8. How to Run the Application

### Option A: Run Both Backend and Frontend (Full-Stack Mode)
1. **Start Express Backend (Terminal 1):**
   ```bash
   cd backend
   node server.js
   ```
   *Backend starts at `http://localhost:5000`.*
   *Health Check: `http://localhost:5000/api/health`.*

2. **Start Vite React Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```
   *Frontend starts at `http://localhost:5173`.*

3. Open your browser and navigate to **`http://localhost:5173`**.
   The top navbar will display: `🟢 Express API (5000)`.

### Option B: Standalone / Offline Frontend Mode
If the backend is not running, the frontend automatically falls back to the embedded client-side algorithmic engine with 100% feature parity. The navbar will display: `🟡 Client Engine`.

---

## 9. REST API Endpoints

The backend provides clean, documented REST endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and supported algorithms |
| `GET` | `/api/graph/sample` | Fetches predefined benchmark datasets (4, 6, 8 nodes) |
| `POST` | `/api/graph/generate` | Generates procedural random symmetric city graph |
| `POST` | `/api/route/bruteforce` | Solves TSP using exhaustive permutation search |
| `POST` | `/api/route/branch-bound`| Solves TSP using Branch and Bound with pruning |
| `POST` | `/api/route/compare` | Runs side-by-side comparative benchmark |

### Sample API Request (`POST /api/route/branch-bound`):
```json
{
  "locations": ["Municipal Office", "Point A", "Point B", "Point C", "Point D", "Point E"],
  "distanceMatrix": [
    [0, 4, 7, 3, 6, 5],
    [4, 0, 5, 2, 4, 6],
    [7, 5, 0, 6, 3, 4],
    [3, 2, 6, 0, 5, 7],
    [6, 4, 3, 5, 0, 2],
    [5, 6, 4, 7, 2, 0]
  ],
  "recordSteps": true
}
```

### Sample API Response:
```json
{
  "success": true,
  "data": {
    "algorithm": "Branch and Bound",
    "routeIndices": [0, 3, 1, 2, 4, 5, 0],
    "routeNames": [
      "Municipal Office",
      "Point C",
      "Point A",
      "Point B",
      "Point D",
      "Point E",
      "Municipal Office"
    ],
    "optimalDistance": 20,
    "nodesExplored": 19,
    "branchesPruned": 20,
    "executionTimeMs": 0.45,
    "steps": [...]
  }
}
```

---

## 10. How to Demonstrate During a College Viva / Practical Exam

Here is a step-by-step demonstration walkthrough to impress your external examiner:

1. **Step 1: Introduction (Dashboard)**
   - Open `http://localhost:5173`.
   - Explain the problem: Municipal garbage truck starting at Municipal Office, visiting points A to E once, returning to Office with minimum travel distance (TSP).
   - Point out the 6-node benchmark dataset with optimal distance **20 km**.
   - Show the interactive canvas and the moving collection truck.

2. **Step 2: Algorithm Comparison (The Viva Highlight)**
   - Click **"Algorithm Comparison"** in the sidebar.
   - Show the table: Both Brute Force and Branch & Bound output the **exact same 20 km distance**.
   - Highlight the difference:
     - Brute force evaluated **120 leaf routes**.
     - Branch and Bound explored only **19 nodes** and pruned **20 subtrees**.
   - Explain that pruning cuts down computation without losing optimality.

3. **Step 3: Step-by-Step Simulation (Visual Proof of Pruning)**
   - Click **"Step-by-Step Sim"** in the sidebar.
   - Press **Play** or click **Next Step**.
   - When a red dashed line appears, point out to the examiner:
     *"Sir/Madam, look at Step 6. Here the partial path's Lower Bound is calculated as 22 km. Because our current best route is already 20 km, Lower Bound $\ge$ Current Best. The algorithm immediately PRUNES this branch, saving all child explorations below it!"*

4. **Step 4: Custom Graph & Factorial Explosion (Route Planner)**
   - Click **"Route Planner"**.
   - Select the **8-node Metro District** preset.
   - Note how $(8 - 1)! = 7! = 5,040$ permutations would take much longer in Brute Force, while Branch & Bound prunes aggressively.
   - Edit a distance in the matrix to demonstrate dynamic recalculation.

5. **Step 5: Theoretical Defense (DAA Concepts & Viva)**
   - Click **"DAA Concepts & Viva"** in the sidebar.
   - Show the Examiner the mathematical formulation, degree-2 lower bounding formula, and the Top 10 Viva Voce questions.

---

## 11. Code Locations for Viva Inspection

- **Where is Brute Force implemented?**
  - Backend: `backend/algorithms/bruteForceTSP.js` (lines 48–140)
  - Frontend: `frontend/src/algorithms/bruteForceTSP.js` (lines 14–95)
- **Where is Branch and Bound implemented?**
  - Backend: `backend/algorithms/branchAndBoundTSP.js` (lines 53–220)
  - Frontend: `frontend/src/algorithms/branchAndBoundTSP.js` (lines 12–195)
- **Where is the Bounding Function defined?**
  - Function `calculateLowerBound()` in `backend/algorithms/branchAndBoundTSP.js` (lines 53–102).
- **Where is the Graph Canvas implemented?**
  - `frontend/src/components/GraphCanvas.jsx` (HTML5 canvas with vector drawing and animation loops).

---

## 12. Future Enhancements

1. **Capacity-Constrained Vehicle Routing (CVRP):** Support vehicle payload limits requiring multiple trips back to the Municipal Office when truck capacity is reached.
2. **Multi-Vehicle Fleet Optimization:** Divide large cities among multiple collection trucks using min-max cycle partitioning.
3. **Live GIS OpenStreetMap Integration:** Import real road coordinates from OpenStreetMap via Overpass API for real-world municipal ward deployment.
4. **Time Window Constraints (VRPTW):** Restrict waste pickup during commercial/residential allowed hours.

---

## 13. License & Authorship

- **Course:** Design and Analysis of Algorithms (DAA) Laboratory
- **Degree:** B.Tech in Computer Science & Engineering / Information Technology
- **License:** MIT License
