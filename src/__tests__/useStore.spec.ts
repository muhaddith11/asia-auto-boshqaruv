import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '@/store/useStore';

describe('useStore basic behaviors', () => {
  beforeEach(() => {
    // reset mashinalar to default for deterministic tests
    const state = useStore.getState();
    useStore.setState({ mashinalar: state.mashinalar.slice() });
  });

  it('addMashina uppercases and adds a new value', () => {
    const initialLen = useStore.getState().mashinalar.length;
    const val = 'test car xyz';
    useStore.getState().addMashina(val);
    const arr = useStore.getState().mashinalar;
    expect(arr.length).toBeGreaterThan(initialLen);
    expect(arr.includes(val.toUpperCase())).toBe(true);
  });
});
