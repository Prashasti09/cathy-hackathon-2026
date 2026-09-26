// Owner: Anmol (code-by-anmol) - logic & integration
// Everything about statuses and operation types, in one place.

export const STATUS_LABELS = {
  draft: 'Draft',
  waiting: 'Waiting',
  ready: 'Ready',
  done: 'Done',
  canceled: 'Canceled',
};

// The status bar shown on each form (from the mockup).
export const STATUS_FLOW = {
  IN: ['draft', 'ready', 'done'],
  OUT: ['draft', 'waiting', 'ready', 'done'],
  INT: ['draft', 'ready', 'done'],
  ADJ: ['draft', 'ready', 'done'],
};

// Kanban columns, in order.
export const KANBAN_COLUMNS = ['draft', 'waiting', 'ready', 'done', 'canceled'];

export const isOpen = (status) => ['draft', 'waiting', 'ready'].includes(status);

// Per-type settings used by the shared list and form screens.
export const OPERATION_TYPES = {
  IN: {
    title: 'Receipts',
    single: 'Receipt',
    path: '/operations/receipts',
    contactLabel: 'Receive from',
    needsFrom: false,
    needsTo: true,
    toLabel: 'Receive into',
  },
  OUT: {
    title: 'Delivery',
    single: 'Delivery',
    path: '/operations/deliveries',
    contactLabel: 'Customer',
    needsFrom: true,
    needsTo: false,
    fromLabel: 'Deliver from',
    hasAddress: true,
  },
  INT: {
    title: 'Internal transfers',
    single: 'Transfer',
    path: '/operations/transfers',
    contactLabel: 'Note',
    needsFrom: true,
    needsTo: true,
    fromLabel: 'From location',
    toLabel: 'To location',
  },
  ADJ: {
    title: 'Adjustments',
    single: 'Adjustment',
    path: '/operations/adjustments',
    contactLabel: 'Reason',
    needsFrom: false,
    needsTo: true,
    toLabel: 'Location counted',
    quantityLabel: 'Counted quantity',
  },
};
