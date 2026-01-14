import { Stream, Subject, Topic } from "../types";

// Helper for manual weightage assignment
// t(id, name, type, importance)
const t = (id: string, name: string, type: 'primary' | 'secondary', importance: number): Topic => ({
  id,
  name,
  type,
  importance,
  progress: { lecture: false, revision: false, pyq: false, pyqFailed: false }
});

// Helper for simulated data (kept for fallback)
const createTopic = (id: string, name: string): Topic => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isPrimary = hash % 3 !== 0; 
  const importance = isPrimary ? 70 + (hash % 30) : 30 + (hash % 40);

  return {
    id,
    name,
    type: isPrimary ? 'primary' : 'secondary',
    importance: importance,
    progress: { lecture: false, revision: false, pyq: false, pyqFailed: false }
  };
};

export const SYLLABUS_DATA: Record<string, Subject[]> = {
  [Stream.CS]: [
    {
      id: 'cs-math',
      name: 'Engineering Mathematics',
      chapters: [
        {
          id: 'cs-dm',
          name: 'Discrete Mathematics',
          topics: [
            t('cs-dm-1', 'Propositional Logic', 'primary', 90),
            t('cs-dm-2', 'First-order Logic', 'secondary', 60),
            t('cs-dm-3', 'Sets, Relations & Functions', 'primary', 80),
            t('cs-dm-4', 'Partial Orders & Lattices', 'secondary', 50),
            t('cs-dm-5', 'Groups & Monoids', 'secondary', 40),
            t('cs-dm-6', 'Graph Theory (Connectivity, Matching, Coloring)', 'primary', 95),
            t('cs-dm-7', 'Combinatorics (Counting, Recurrence)', 'primary', 85)
          ]
        },
        {
          id: 'cs-la',
          name: 'Linear Algebra',
          topics: [
            t('cs-la-1', 'Matrices & Determinants', 'primary', 70),
            t('cs-la-2', 'Systems of Linear Equations', 'primary', 90),
            t('cs-la-3', 'Eigenvalues & Eigenvectors', 'primary', 95),
            t('cs-la-4', 'LU Decomposition', 'secondary', 45)
          ]
        },
        {
          id: 'cs-calc',
          name: 'Calculus',
          topics: [
            t('cs-calc-1', 'Limits, Continuity & Differentiability', 'primary', 80),
            t('cs-calc-2', 'Maxima & Minima', 'primary', 85),
            t('cs-calc-3', 'Mean Value Theorem', 'secondary', 50),
            t('cs-calc-4', 'Integration (Definite/Indefinite)', 'secondary', 40)
          ]
        },
        {
          id: 'cs-prob',
          name: 'Probability & Statistics',
          topics: [
            t('cs-prob-1', 'Conditional Probability & Bayes Theorem', 'primary', 90),
            t('cs-prob-2', 'Random Variables & Distributions', 'primary', 85),
            t('cs-prob-3', 'Mean, Median, Mode & SD', 'primary', 70)
          ]
        }
      ]
    },
    {
      id: 'cs-systems',
      name: 'Computer Systems',
      chapters: [
        {
          id: 'cs-dl',
          name: 'Digital Logic',
          topics: [
            t('cs-dl-1', 'Boolean Algebra & Minimization', 'primary', 80),
            t('cs-dl-2', 'Combinational Circuits', 'primary', 85),
            t('cs-dl-3', 'Sequential Circuits', 'primary', 90),
            t('cs-dl-4', 'Number Representations & Arithmetic', 'primary', 75)
          ]
        },
        {
          id: 'cs-coa',
          name: 'Computer Organization',
          topics: [
            t('cs-coa-1', 'Machine Instructions & Addressing Modes', 'primary', 85),
            t('cs-coa-2', 'ALU, Datapath & Control Unit', 'secondary', 60),
            t('cs-coa-3', 'Instruction Pipelining & Hazards', 'primary', 95),
            t('cs-coa-4', 'Cache Memory & Hierarchy', 'primary', 95),
            t('cs-coa-5', 'I/O Interface (Interrupts/DMA)', 'secondary', 50)
          ]
        },
        {
          id: 'cs-os',
          name: 'Operating Systems',
          topics: [
            t('cs-os-1', 'Processes, Threads & System Calls', 'primary', 80),
            t('cs-os-2', 'CPU Scheduling', 'primary', 85),
            t('cs-os-3', 'Concurrency, Synchronization & Deadlock', 'primary', 95),
            t('cs-os-4', 'Memory Management & Virtual Memory', 'primary', 95),
            t('cs-os-5', 'File Systems & Disk Scheduling', 'secondary', 65)
          ]
        },
        {
          id: 'cs-cn',
          name: 'Computer Networks',
          topics: [
            t('cs-cn-1', 'OSI, TCP/IP & Layering', 'secondary', 60),
            t('cs-cn-2', 'Data Link Layer (Framing, Error Control, MAC)', 'primary', 75),
            t('cs-cn-3', 'Network Layer (Routing, IPv4, CIDR, Fragmentation)', 'primary', 95),
            t('cs-cn-4', 'Transport Layer (TCP, UDP, Congestion Control)', 'primary', 90),
            t('cs-cn-5', 'Application Layer (DNS, HTTP, SMTP)', 'secondary', 65)
          ]
        }
      ]
    },
    {
      id: 'cs-software',
      name: 'Software & Algorithms',
      chapters: [
        {
          id: 'cs-pds',
          name: 'Programming & Data Structures',
          topics: [
            t('cs-pds-1', 'C Programming & Recursion', 'primary', 90),
            t('cs-pds-2', 'Arrays, Stacks & Queues', 'primary', 70),
            t('cs-pds-3', 'Linked Lists', 'primary', 75),
            t('cs-pds-4', 'Trees, BST & Binary Heaps', 'primary', 90),
            t('cs-pds-5', 'Graphs', 'primary', 85)
          ]
        },
        {
          id: 'cs-algo',
          name: 'Algorithms',
          topics: [
            t('cs-algo-1', 'Asymptotic Analysis', 'primary', 85),
            t('cs-algo-2', 'Sorting & Searching', 'primary', 75),
            t('cs-algo-3', 'Hashing', 'primary', 70),
            t('cs-algo-4', 'Algorithm Design (Greedy, DP, Divide & Conquer)', 'primary', 95),
            t('cs-algo-5', 'Graph Algorithms (Shortest Path, MST, Traversal)', 'primary', 90)
          ]
        },
        {
          id: 'cs-toc',
          name: 'Theory of Computation',
          topics: [
            t('cs-toc-1', 'Regular Expressions & Finite Automata', 'primary', 90),
            t('cs-toc-2', 'Context-free Grammars & PDA', 'primary', 85),
            t('cs-toc-3', 'Turing Machines & Undecidability', 'secondary', 60),
            t('cs-toc-4', 'Closure Properties & Pumping Lemma', 'secondary', 70)
          ]
        },
        {
          id: 'cs-cd',
          name: 'Compiler Design',
          topics: [
            t('cs-cd-1', 'Lexical Analysis', 'secondary', 60),
            t('cs-cd-2', 'Parsing (LL, LR, SLR, LALR)', 'primary', 90),
            t('cs-cd-3', 'Syntax Directed Translation', 'primary', 75),
            t('cs-cd-4', 'Intermediate Code & Data Flow Analysis', 'secondary', 55)
          ]
        },
        {
          id: 'cs-db',
          name: 'Databases',
          topics: [
            t('cs-db-1', 'ER Model & Relational Model', 'primary', 80),
            t('cs-db-2', 'Relational Algebra & Tuple Calculus', 'secondary', 65),
            t('cs-db-3', 'SQL', 'primary', 90),
            t('cs-db-4', 'Normalization (NF, FD)', 'primary', 95),
            t('cs-db-5', 'Transactions & Concurrency Control', 'primary', 90),
            t('cs-db-6', 'File Organization & Indexing (B/B+ Trees)', 'primary', 85)
          ]
        }
      ]
    }
  ],
  [Stream.ECE]: [
    {
      id: 'ec-math',
      name: 'Engineering Mathematics',
      chapters: [
        {
          id: 'ec-la',
          name: 'Linear Algebra',
          topics: [
            t('ec-la-1', 'Vector Space, Basis, Linear Dependence', 'primary', 85),
            t('ec-la-2', 'Eigenvalues & Eigenvectors', 'primary', 95),
            t('ec-la-3', 'Rank & Solution of Linear Equations', 'primary', 90)
          ]
        },
        {
          id: 'ec-calc',
          name: 'Calculus',
          topics: [
            t('ec-calc-1', 'Mean Value Theorems & Partial Derivatives', 'secondary', 60),
            t('ec-calc-2', 'Maxima & Minima', 'primary', 85),
            t('ec-calc-3', 'Multiple Integrals (Line, Surface, Volume)', 'secondary', 70),
            t('ec-calc-4', 'Vector Analysis (Gradient, Divergence, Curl)', 'primary', 80)
          ]
        },
        {
          id: 'ec-de',
          name: 'Differential Equations',
          topics: [
            t('ec-de-1', 'First Order Linear/Non-linear DE', 'primary', 85),
            t('ec-de-2', 'Higher Order Linear DE', 'primary', 85),
            t('ec-de-3', 'Partial Differential Equations', 'secondary', 50)
          ]
        },
        {
          id: 'ec-prob',
          name: 'Probability & Statistics',
          topics: [
            t('ec-prob-1', 'Mean, Median, Mode & SD', 'secondary', 60),
            t('ec-prob-2', 'Distributions (Binomial, Poisson, Normal)', 'primary', 90),
            t('ec-prob-3', 'Joint & Conditional Probability', 'primary', 95)
          ]
        }
      ]
    },
    {
      id: 'ec-networks',
      name: 'Networks, Signals & Systems',
      chapters: [
        {
          id: 'ec-ckt',
          name: 'Circuit Analysis',
          topics: [
            t('ec-ckt-1', 'KCL, KVL & Network Theorems', 'primary', 95),
            t('ec-ckt-2', 'Transient Analysis (RL, RC, RLC)', 'primary', 90),
            t('ec-ckt-3', 'Sinusoidal Steady State & Resonance', 'primary', 85),
            t('ec-ckt-4', 'Two-port Networks', 'secondary', 65)
          ]
        },
        {
          id: 'ec-sig',
          name: 'Signals & Systems',
          topics: [
            t('ec-sig-1', 'LTI Systems & Convolution', 'primary', 95),
            t('ec-sig-2', 'Fourier Series & Transform', 'primary', 90),
            t('ec-sig-3', 'Sampling Theorem', 'primary', 90),
            t('ec-sig-4', 'Laplace & Z-Transform', 'primary', 95)
          ]
        }
      ]
    },
    {
      id: 'ec-electronics',
      name: 'Electronic Devices & Circuits',
      chapters: [
        {
          id: 'ec-dev',
          name: 'Electronic Devices',
          topics: [
            t('ec-dev-1', 'Carrier Transport & Semiconductor Physics', 'primary', 85),
            t('ec-dev-2', 'PN Junctions & Diodes', 'primary', 90),
            t('ec-dev-3', 'BJT & MOSFET Physics', 'primary', 95)
          ]
        },
        {
          id: 'ec-analog',
          name: 'Analog Circuits',
          topics: [
            t('ec-ana-1', 'Diode Circuits (Clippers, Clampers)', 'primary', 80),
            t('ec-ana-2', 'BJT & MOSFET Amplifiers', 'primary', 90),
            t('ec-ana-3', 'Op-Amps & Applications', 'primary', 95),
            t('ec-ana-4', 'Oscillators & Filters', 'secondary', 60)
          ]
        },
        {
          id: 'ec-digital',
          name: 'Digital Circuits',
          topics: [
            t('ec-dig-1', 'Combinational Circuits', 'primary', 85),
            t('ec-dig-2', 'Sequential Circuits', 'primary', 90),
            t('ec-dig-3', 'Data Converters (ADC/DAC)', 'primary', 80),
            t('ec-dig-4', 'Semiconductor Memories', 'secondary', 50)
          ]
        }
      ]
    },
    {
      id: 'ec-special',
      name: 'Control, Comm & EM',
      chapters: [
        {
          id: 'ec-ctrl',
          name: 'Control Systems',
          topics: [
            t('ec-ctrl-1', 'Time & Frequency Response', 'primary', 90),
            t('ec-ctrl-2', 'Stability Analysis (Routh, Nyquist, Bode)', 'primary', 95),
            t('ec-ctrl-3', 'State Space Analysis', 'primary', 85)
          ]
        },
        {
          id: 'ec-comm',
          name: 'Communications',
          topics: [
            t('ec-comm-1', 'Analog Communication (AM/FM)', 'secondary', 70),
            t('ec-comm-2', 'Digital Communication (PCM, PSK, QAM)', 'primary', 95),
            t('ec-comm-3', 'Information Theory & Error Control', 'secondary', 60)
          ]
        },
        {
          id: 'ec-em',
          name: 'Electromagnetics',
          topics: [
            t('ec-em-1', 'Maxwells Equations & Plane Waves', 'primary', 80),
            t('ec-em-2', 'Transmission Lines', 'primary', 90),
            t('ec-em-3', 'Waveguides & Antennas', 'secondary', 60)
          ]
        }
      ]
    }
  ],
  [Stream.EE]: [
    {
      id: 'ee-math',
      name: 'Engineering Mathematics',
      chapters: [
        {
          id: 'ee-la',
          name: 'Linear Algebra',
          topics: [
            t('ee-la-1', 'Matrix Algebra & Systems of Equations', 'primary', 90),
            t('ee-la-2', 'Eigenvalues & Eigenvectors', 'primary', 95)
          ]
        },
        {
          id: 'ee-calc',
          name: 'Calculus & DE',
          topics: [
            t('ee-calc-1', 'Calculus (Mean Value, Partial Deriv)', 'secondary', 60),
            t('ee-calc-2', 'Differential Equations', 'primary', 85),
            t('ee-calc-3', 'Complex Variables', 'primary', 80)
          ]
        }
      ]
    },
    {
      id: 'ee-core-1',
      name: 'Circuits & Fields',
      chapters: [
        {
          id: 'ee-ckt',
          name: 'Electric Circuits',
          topics: [
            t('ee-ckt-1', 'KCL, KVL & Network Theorems', 'primary', 95),
            t('ee-ckt-2', 'Transient Analysis', 'primary', 90),
            t('ee-ckt-3', 'Sinusoidal Steady State & Resonance', 'primary', 85),
            t('ee-ckt-4', 'Three-phase Circuits', 'secondary', 70)
          ]
        },
        {
          id: 'ee-em',
          name: 'Electromagnetic Fields',
          topics: [
            t('ee-em-1', 'Coulombs Law, Gauss Law & Maxwells', 'primary', 80),
            t('ee-em-2', 'Inductance, Capacitance & Magnetic Circuits', 'primary', 85)
          ]
        }
      ]
    },
    {
      id: 'ee-systems',
      name: 'Signals & Systems',
      chapters: [
        {
          id: 'ee-sig',
          name: 'Signals & Systems',
          topics: [
            t('ee-sig-1', 'LTI Systems', 'primary', 90),
            t('ee-sig-2', 'Fourier, Laplace & Z-Transforms', 'primary', 95),
            t('ee-sig-3', 'Sampling Theorem', 'primary', 85)
          ]
        },
        {
          id: 'ee-ctrl',
          name: 'Control Systems',
          topics: [
            t('ee-ctrl-1', 'Modeling & Transfer Functions', 'secondary', 60),
            t('ee-ctrl-2', 'Stability Analysis (Root Locus, Bode)', 'primary', 95),
            t('ee-ctrl-3', 'Compensators (Lead, Lag)', 'secondary', 50)
          ]
        }
      ]
    },
    {
      id: 'ee-core-2',
      name: 'Electrical Core',
      chapters: [
        {
          id: 'ee-mach',
          name: 'Electrical Machines',
          topics: [
            t('ee-mach-1', 'Transformers (Single & Three Phase)', 'primary', 95),
            t('ee-mach-2', 'DC Machines', 'primary', 85),
            t('ee-mach-3', 'Induction Machines', 'primary', 95),
            t('ee-mach-4', 'Synchronous Machines', 'primary', 90)
          ]
        },
        {
          id: 'ee-power',
          name: 'Power Systems',
          topics: [
            t('ee-power-1', 'Transmission & Distribution', 'primary', 85),
            t('ee-power-2', 'Fault Analysis & Protection', 'primary', 90),
            t('ee-power-3', 'Load Flow & Stability', 'primary', 90)
          ]
        },
        {
          id: 'ee-pe',
          name: 'Power Electronics',
          topics: [
            t('ee-pe-1', 'Converters (Buck, Boost, Buck-Boost)', 'primary', 95),
            t('ee-pe-2', 'Inverters & Rectifiers', 'primary', 90),
            t('ee-pe-3', 'Power Semiconductor Devices', 'secondary', 70)
          ]
        }
      ]
    },
    {
      id: 'ee-electronics',
      name: 'Electronics',
      chapters: [
        {
          id: 'ee-ana',
          name: 'Analog & Digital',
          topics: [
            t('ee-ana-1', 'Op-Amps & Applications', 'primary', 90),
            t('ee-ana-2', 'Diode Circuits & Amplifiers', 'primary', 80),
            t('ee-ana-3', 'Logic Circuits & Data Converters', 'secondary', 70)
          ]
        },
        {
          id: 'ee-meas',
          name: 'Measurements',
          topics: [
            t('ee-meas-1', 'Bridges & Potentiometers', 'secondary', 60),
            t('ee-meas-2', 'Instrument Transformers', 'secondary', 50),
            t('ee-meas-3', 'Error Analysis & Oscilloscopes', 'secondary', 40)
          ]
        }
      ]
    }
  ],
  [Stream.IN]: [
    {
      id: 'in-math',
      name: 'Engineering Mathematics',
      chapters: [
        {
          id: 'in-math-1',
          name: 'Linear Algebra & Calculus',
          topics: [
            t('in-m-1', 'Matrix Algebra & Eigenvalues', 'primary', 85),
            t('in-m-2', 'Calculus & Differential Equations', 'primary', 80)
          ]
        },
        {
          id: 'in-math-2',
          name: 'Complex Variables & Prob',
          topics: [
            t('in-m-3', 'Complex Variables', 'secondary', 60),
            t('in-m-4', 'Probability & Statistics', 'primary', 75),
            t('in-m-5', 'Numerical Methods', 'primary', 80)
          ]
        }
      ]
    },
    {
      id: 'in-core-elec',
      name: 'Core Electronics',
      chapters: [
        {
          id: 'in-ckt',
          name: 'Circuits & Machines',
          topics: [
            t('in-ckt-1', 'Circuit Analysis & Theorems', 'primary', 90),
            t('in-ckt-2', 'AC Circuits & Resonance', 'primary', 85),
            t('in-ckt-3', 'Transformers & Induction Machines', 'secondary', 60)
          ]
        },
        {
          id: 'in-sig',
          name: 'Signals & Control',
          topics: [
            t('in-sig-1', 'Signals, Systems & Transforms', 'primary', 85),
            t('in-sig-2', 'Control Systems (Stability, Compensation)', 'primary', 90),
            t('in-sig-3', 'Process Control Elements', 'secondary', 50)
          ]
        },
        {
          id: 'in-electronics',
          name: 'Analog & Digital',
          topics: [
            t('in-elec-1', 'Op-Amps & Signal Conditioning', 'primary', 95),
            t('in-elec-2', 'Digital Logic & Microprocessors', 'primary', 80),
            t('in-elec-3', 'A/D & D/A Converters', 'primary', 85)
          ]
        }
      ]
    },
    {
      id: 'in-core-inst',
      name: 'Instrumentation',
      chapters: [
        {
          id: 'in-meas',
          name: 'Measurements',
          topics: [
            t('in-meas-1', 'Error Analysis & Standards', 'primary', 80),
            t('in-meas-2', 'Bridges (R, L, C)', 'primary', 85),
            t('in-meas-3', 'Electronic Measuring Instruments', 'secondary', 60)
          ]
        },
        {
          id: 'in-sens',
          name: 'Sensors & Industrial Inst',
          topics: [
            t('in-sens-1', 'Transducers (Resistive, Cap, Ind)', 'primary', 95),
            t('in-sens-2', 'Piezoelectric & Optical Sensors', 'primary', 90),
            t('in-sens-3', 'Flow, Temp & Pressure Measurement', 'primary', 95)
          ]
        },
        {
          id: 'in-opt',
          name: 'Comm & Optical',
          topics: [
            t('in-opt-1', 'Analog & Digital Communication', 'secondary', 60),
            t('in-opt-2', 'Optical Sources, Detectors & Fiber', 'primary', 85)
          ]
        }
      ]
    }
  ],
  [Stream.CE]: [
    {
      id: 'ce-math',
      name: 'Engineering Mathematics',
      chapters: [
        {
          id: 'ce-math-1',
          name: 'Linear Algebra & Calculus',
          topics: [
            t('ce-m1-1', 'Linear Algebra (Matrices, Eigenvalues)', 'primary', 85),
            t('ce-m1-2', 'Calculus (Limits, Continuity, Partial Derivatives)', 'primary', 85),
            t('ce-m1-3', 'Vector Calculus (Gradient, Divergence, Curl)', 'secondary', 65)
          ]
        },
        {
          id: 'ce-math-2',
          name: 'ODE, PDE & Probability',
          topics: [
            t('ce-m2-1', 'Ordinary Differential Equations', 'primary', 80),
            t('ce-m2-2', 'Partial Differential Equations', 'secondary', 60),
            t('ce-m2-3', 'Probability & Statistics', 'primary', 90),
            t('ce-m2-4', 'Numerical Methods', 'primary', 75)
          ]
        }
      ]
    },
    {
      id: 'ce-struct',
      name: 'Structural Engineering',
      chapters: [
        {
          id: 'ce-sm',
          name: 'Mechanics',
          topics: [
            t('ce-sm-1', 'Engineering Mechanics', 'secondary', 60),
            t('ce-sm-2', 'Solid Mechanics (Stress, Strain, Bending)', 'primary', 90),
            t('ce-sm-3', 'Structural Analysis (Trusses, Arches, Matrix Method)', 'primary', 85)
          ]
        },
        {
          id: 'ce-design',
          name: 'Structural Design',
          topics: [
            t('ce-des-1', 'Concrete Structures (RCC)', 'primary', 85),
            t('ce-des-2', 'Steel Structures', 'secondary', 60),
            t('ce-des-3', 'Construction Materials & Management', 'secondary', 50)
          ]
        }
      ]
    },
    {
      id: 'ce-geo',
      name: 'Geotechnical Engineering',
      chapters: [
        {
          id: 'ce-soil',
          name: 'Soil Mechanics',
          topics: [
            t('ce-geo-1', 'Soil Properties & Classification', 'primary', 90),
            t('ce-geo-2', 'Permeability, Seepage & Consolidation', 'primary', 95),
            t('ce-geo-3', 'Shear Strength', 'primary', 95)
          ]
        },
        {
          id: 'ce-found',
          name: 'Foundation Engineering',
          topics: [
            t('ce-found-1', 'Sub-surface Investigations', 'secondary', 50),
            t('ce-found-2', 'Earth Pressure & Retaining Walls', 'primary', 85),
            t('ce-found-3', 'Shallow & Deep Foundations', 'primary', 90)
          ]
        }
      ]
    },
    {
      id: 'ce-water',
      name: 'Water Resources',
      chapters: [
        {
          id: 'ce-fluid',
          name: 'Fluid Mechanics & Hydraulics',
          topics: [
            t('ce-fm-1', 'Fluid Properties & Kinematics', 'secondary', 70),
            t('ce-fm-2', 'Dynamics & Pipe Flow', 'primary', 85),
            t('ce-fm-3', 'Open Channel Flow (Hydraulics)', 'primary', 90)
          ]
        },
        {
          id: 'ce-hydro',
          name: 'Hydrology & Irrigation',
          topics: [
            t('ce-hyd-1', 'Hydrology (Hydrographs, Groundwater)', 'primary', 85),
            t('ce-hyd-2', 'Irrigation (Water Requirement, Canals)', 'secondary', 60)
          ]
        }
      ]
    },
    {
      id: 'ce-env',
      name: 'Environmental Engineering',
      chapters: [
        {
          id: 'ce-env-1',
          name: 'Water & Wastewater',
          topics: [
            t('ce-env-1', 'Water Quality & Treatment', 'primary', 90),
            t('ce-env-2', 'Wastewater Treatment (Activated Sludge)', 'primary', 95),
            t('ce-env-3', 'Air Pollution & Noise', 'secondary', 55),
            t('ce-env-4', 'Solid Waste Management', 'secondary', 50)
          ]
        }
      ]
    },
    {
      id: 'ce-transpo',
      name: 'Transportation & Geomatics',
      chapters: [
        {
          id: 'ce-highway',
          name: 'Transportation',
          topics: [
            t('ce-tr-1', 'Highway Geometric Design', 'primary', 90),
            t('ce-tr-2', 'Pavement Design (Flexible/Rigid)', 'primary', 85),
            t('ce-tr-3', 'Traffic Engineering', 'primary', 85)
          ]
        },
        {
          id: 'ce-survey',
          name: 'Geomatics',
          topics: [
            t('ce-sur-1', 'Surveying (Leveling, Theodolite)', 'primary', 80),
            t('ce-sur-2', 'Photogrammetry & Remote Sensing', 'secondary', 50)
          ]
        }
      ]
    }
  ],
  [Stream.ME]: [
    {
      id: 'me-math',
      name: 'Engineering Mathematics',
      chapters: [
        {
          id: 'me-math-1',
          name: 'Linear Algebra & Calculus',
          topics: [
            t('me-m-1', 'Linear Algebra (Matrices, Eigenvalues)', 'primary', 85),
            t('me-m-2', 'Calculus (Gradient, Divergence, Curl)', 'primary', 85)
          ]
        },
        {
          id: 'me-math-2',
          name: 'DE, Complex & Probability',
          topics: [
            t('me-m-3', 'Differential Equations', 'primary', 85),
            t('me-m-4', 'Complex Variables', 'secondary', 60),
            t('me-m-5', 'Probability & Statistics', 'primary', 80),
            t('me-m-6', 'Numerical Methods', 'primary', 75)
          ]
        }
      ]
    },
    {
      id: 'me-applied',
      name: 'Applied Mechanics & Design',
      chapters: [
        {
          id: 'me-mech',
          name: 'Mechanics & Strength',
          topics: [
            t('me-am-1', 'Engineering Mechanics (Friction, Trusses)', 'primary', 70),
            t('me-am-2', 'Mechanics of Materials (Stress, Deflection)', 'primary', 95)
          ]
        },
        {
          id: 'me-tom',
          name: 'Theory of Machines',
          topics: [
            t('me-tom-1', 'Kinematics & Dynamics (Gears, Cams)', 'primary', 90),
            t('me-tom-2', 'Vibrations', 'primary', 95),
            t('me-tom-3', 'Machine Design (Gears, Bearings, Joints)', 'secondary', 65)
          ]
        }
      ]
    },
    {
      id: 'me-thermal',
      name: 'Fluid & Thermal Sciences',
      chapters: [
        {
          id: 'me-fluids',
          name: 'Fluid Mechanics',
          topics: [
            t('me-fm-1', 'Fluid Properties & Kinematics', 'secondary', 70),
            t('me-fm-2', 'Fluid Dynamics & Pipe Flow', 'primary', 90),
            t('me-fm-3', 'Boundary Layer & Turbomachinery', 'secondary', 60)
          ]
        },
        {
          id: 'me-thermo',
          name: 'Thermodynamics & Heat',
          topics: [
            t('me-th-1', 'Thermodynamics (Laws, Properties)', 'primary', 95),
            t('me-th-2', 'Power Engineering (Rankine, Brayton)', 'primary', 85),
            t('me-th-3', 'IC Engines & RAC', 'secondary', 65),
            t('me-th-4', 'Heat Transfer (Conduction, Convection, Radiation)', 'primary', 90)
          ]
        }
      ]
    },
    {
      id: 'me-manuf',
      name: 'Materials & Manufacturing',
      chapters: [
        {
          id: 'me-mat',
          name: 'Materials & Production',
          topics: [
            t('me-mp-1', 'Engineering Materials', 'secondary', 50),
            t('me-mp-2', 'Casting, Forming & Joining', 'primary', 85),
            t('me-mp-3', 'Machining & Machine Tools', 'primary', 95),
            t('me-mp-4', 'Metrology & Inspection', 'secondary', 55)
          ]
        },
        {
          id: 'me-ind',
          name: 'Industrial Engineering',
          topics: [
            t('me-ie-1', 'Production Planning & Control', 'primary', 85),
            t('me-ie-2', 'Inventory Control', 'primary', 80),
            t('me-ie-3', 'Operations Research (LPP, Simplex)', 'primary', 90)
          ]
        }
      ]
    }
  ],
  [Stream.DA]: [
    {
      id: 'da-math',
      name: 'Mathematical Foundations',
      chapters: [
        {
          id: 'da-prob',
          name: 'Probability & Statistics',
          topics: [
            t('da-p-1', 'Probability Axioms & Random Variables', 'primary', 95),
            t('da-p-2', 'Distributions & Central Limit Theorem', 'primary', 95),
            t('da-p-3', 'Hypothesis Testing (z, t, chi-square)', 'primary', 90)
          ]
        },
        {
          id: 'da-la',
          name: 'Linear Algebra',
          topics: [
            t('da-la-1', 'Vector Spaces & Subspaces', 'primary', 90),
            t('da-la-2', 'Matrices & Eigenvalues', 'primary', 95),
            t('da-la-3', 'Matrix Decompositions (LU, SVD)', 'primary', 85)
          ]
        },
        {
          id: 'da-calc',
          name: 'Calculus & Optimization',
          topics: [
            t('da-calc-1', 'Calculus (Limits, Maxima, Minima)', 'secondary', 70),
            t('da-calc-2', 'Optimization (Single Variable)', 'primary', 85)
          ]
        }
      ]
    },
    {
      id: 'da-comput',
      name: 'Computing & Data',
      chapters: [
        {
          id: 'da-pds',
          name: 'Programming & DS',
          topics: [
            t('da-pds-1', 'Python Programming', 'primary', 85),
            t('da-pds-2', 'Data Structures (Trees, Graphs)', 'primary', 90),
            t('da-pds-3', 'Algorithms (Sorting, Searching, Greedy, DP)', 'primary', 95)
          ]
        },
        {
          id: 'da-db',
          name: 'Databases',
          topics: [
            t('da-db-1', 'ER Model & SQL', 'primary', 80),
            t('da-db-2', 'Relational Algebra & Normalization', 'primary', 85),
            t('da-db-3', 'Data Warehousing', 'secondary', 60)
          ]
        }
      ]
    },
    {
      id: 'da-ai',
      name: 'AI & Machine Learning',
      chapters: [
        {
          id: 'da-ml',
          name: 'Machine Learning',
          topics: [
            t('da-ml-1', 'Supervised Learning (Regression, Classification)', 'primary', 95),
            t('da-ml-2', 'Unsupervised Learning (Clustering, PCA)', 'primary', 90),
            t('da-ml-3', 'Neural Networks', 'primary', 90),
            t('da-ml-4', 'Model Evaluation (Cross-validation, Bias-Variance)', 'primary', 95)
          ]
        },
        {
          id: 'da-art',
          name: 'Artificial Intelligence',
          topics: [
            t('da-ai-1', 'Search Algorithms (A*, BFS, DFS)', 'primary', 85),
            t('da-ai-2', 'Logic & Reasoning', 'secondary', 70),
            t('da-ai-3', 'Inference Under Uncertainty', 'secondary', 75)
          ]
        }
      ]
    }
  ]
};
