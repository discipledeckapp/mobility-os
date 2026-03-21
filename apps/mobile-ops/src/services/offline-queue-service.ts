import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { RecordRemittanceInput } from '../api';
import { OFFLINE_ACTION_TYPE, STORAGE_KEYS } from '../constants';
import {
  cancelDriverAssignment,
  completeDriverAssignment,
  startDriverAssignment,
} from './assignment-service';
import { submitRemittance } from './remittance-service';

type OfflineAction =
  | {
      id: string;
      type: typeof OFFLINE_ACTION_TYPE.assignmentStart;
      payload: { assignmentId: string };
      createdAt: string;
    }
  | {
      id: string;
      type: typeof OFFLINE_ACTION_TYPE.assignmentComplete;
      payload: { assignmentId: string; notes?: string };
      createdAt: string;
    }
  | {
      id: string;
      type: typeof OFFLINE_ACTION_TYPE.assignmentCancel;
      payload: { assignmentId: string; notes?: string };
      createdAt: string;
    }
  | {
      id: string;
      type: typeof OFFLINE_ACTION_TYPE.remittanceRecord;
      payload: RecordRemittanceInput;
      createdAt: string;
    };

async function readQueue(): Promise<OfflineAction[]> {
  const serialized = await AsyncStorage.getItem(STORAGE_KEYS.actionQueue);
  if (!serialized) {
    return [];
  }

  try {
    const parsed = JSON.parse(serialized) as OfflineAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: OfflineAction[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.actionQueue, JSON.stringify(queue));
}

export async function getQueuedActions() {
  return readQueue();
}

export async function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>) {
  const queue = await readQueue();
  const nextAction: OfflineAction = {
    ...action,
    id: `${action.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  } as OfflineAction;
  queue.push(nextAction);
  await writeQueue(queue);
  return nextAction;
}

async function executeAction(action: OfflineAction) {
  switch (action.type) {
    case OFFLINE_ACTION_TYPE.assignmentStart:
      return startDriverAssignment(action.payload.assignmentId);
    case OFFLINE_ACTION_TYPE.assignmentComplete:
      return completeDriverAssignment(action.payload.assignmentId, action.payload.notes);
    case OFFLINE_ACTION_TYPE.assignmentCancel:
      return cancelDriverAssignment(action.payload.assignmentId, action.payload.notes);
    case OFFLINE_ACTION_TYPE.remittanceRecord:
      return submitRemittance(action.payload);
    default:
      return null;
  }
}

export async function flushOfflineQueue() {
  const queue = await readQueue();
  if (!queue.length) {
    return { processed: 0, remaining: 0 };
  }

  const remaining: OfflineAction[] = [];
  let processed = 0;

  for (const action of queue) {
    try {
      await executeAction(action);
      processed += 1;
    } catch {
      remaining.push(action);
    }
  }

  await writeQueue(remaining);
  return {
    processed,
    remaining: remaining.length,
  };
}

export function subscribeToNetworkReconnect(onReconnect: () => Promise<void> | void) {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      void onReconnect();
    }
  });
}
