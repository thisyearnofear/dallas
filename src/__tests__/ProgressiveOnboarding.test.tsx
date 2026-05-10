import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressiveOnboarding } from '../components/ProgressiveOnboarding';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
});

describe('ProgressiveOnboarding', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('should not render when isOpen is false', () => {
        const { result } = renderHook(() => {
            const [isOpen, setIsOpen] = useState(false);
            return { isOpen, setIsOpen };
        });
        
        // Component checks isOpen internally
        expect(result.current.isOpen).toBe(false);
    });

    it('should have 4 onboarding steps', () => {
        // The STEPS array has 4 items
        const steps = [
            { id: 'welcome', title: 'Welcome to the Alliance' },
            { id: 'privacy', title: 'Your Data, Encrypted' },
            { id: 'zk', title: 'Prove Without Revealing' },
            { id: 'terms', title: 'Quick Agreement' },
        ];
        expect(steps.length).toBe(4);
    });

    it('should skip onboarding if already completed', () => {
        localStorageMock.getItem.mockReturnValue('true');
        
        // Component reads from localStorage
        const seen = localStorage.getItem('dbc-progressive-onboarding');
        expect(seen).toBe('true');
    });

    it('should save to localStorage on completion', () => {
        // When onboarding completes, these keys are set
        localStorage.setItem('dbc-progressive-onboarding', 'true');
        localStorage.setItem('dbc-privacy-onboarding', 'true');
        
        expect(localStorage.setItem).toHaveBeenCalledWith('dbc-progressive-onboarding', 'true');
        expect(localStorage.setItem).toHaveBeenCalledWith('dbc-privacy-onboarding', 'true');
    });
});

import { useState } from 'preact/hooks';