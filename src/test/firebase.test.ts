import { describe, it, expect } from 'vitest';
import { auth, db, storage } from '../config/firebase.config';

describe('Firebase Configuration', () => {
  it('should initialize Firebase Auth', () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBeDefined();
  });

  it('should initialize Firestore', () => {
    expect(db).toBeDefined();
    expect(db.app).toBeDefined();
  });

  it('should initialize Firebase Storage', () => {
    expect(storage).toBeDefined();
    expect(storage.app).toBeDefined();
  });

  it('should have correct project configuration', () => {
    expect(auth.app.options.projectId).toBe('realestaterider-9c3ee');
  });
});
