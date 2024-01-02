import { ModifierFlags } from './publicTypes';

export const hasModifier = (type: { modifiers: number }, modifier: ModifierFlags) => {
  if (modifier === type.modifiers) {
    return true;
  }
  return !!(type.modifiers & modifier);
}
