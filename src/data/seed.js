/**
 * Seed data — default state for new users.
 * All arrays are empty. User builds their own stack from scratch.
 */

export const DEFAULT_SETTINGS = {
  currentPrice:     80000,   // overridden by live price fetch
  usdthb:           33.00,   // overridden by live fx fetch
  goalBtc:          1.0,
  currentAge:       30,
  targetAge:        40,
  monthlyDcaUsd:    100,
  annualGrowthRate: 10,
}

export const DCA_ENTRIES      = []
export const DIP_ENTRIES      = []
export const FUTURES_ENTRIES  = []
export const GRID_ENTRIES     = []

export const TRIGGERS = [
  { level:'L1', drop:-0.10, fundSource:'Dip',   thbBudget: 0, notes:'Buy small on -10%'    },
  { level:'L2', drop:-0.20, fundSource:'Dip',   thbBudget: 0, notes:'Buy more on -20%'      },
  { level:'L3', drop:-0.40, fundSource:'Panic', thbBudget: 0, notes:'Start panic buying'    },
  { level:'L4', drop:-0.30, fundSource:'Panic', thbBudget: 0, notes:'All-in panic reserve'  },
]
